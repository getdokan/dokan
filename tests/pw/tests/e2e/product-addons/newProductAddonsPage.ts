import { Locator, Page } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import {
    REACT_ROOT,
    ROW_ACTIONS_BTN,
    SEARCH_INPUT,
    PHP_FATAL,
    DATA_ROW_ANY,
    DATA_ROW_SETTLED,
    SKELETON_ANY,
    DATAVIEWS_EMPTY,
    actionMenuItem as dvActionMenuItem,
    waitForRootReady as dvWaitForRootReady,
    hasNoPhpFatal as dvHasNoPhpFatal,
    fillDataViewsSearch,
    clearDataViewsSearch,
    dataViewsConfirm,
} from '@utils/dataViews';

// ============================================
// SELECTORS — the vendor React "Product Addons" global-list surface (Dokan Pro,
// module product_addon). Surface: /dashboard/new/#/settings/product-addon.
//   dokan-pro/modules/product-addon/src/js/vendor-dashboard/components/AddonList.tsx
// A DataViews list (NO status tabs). Columns: Name (link to legacy ?edit=),
// Priority, Product Categories, Number of Fields. Search is CLIENT-SIDE (filters
// loaded rows by name) — use the fixed-debounce fallback, not a REST gate. The
// Delete row action fires DELETE /dokan/v1/vendor/product-addons/{id} DIRECTLY
// with NO confirm modal (do NOT wait for a role=alertdialog). The create / edit /
// import / export forms are LEGACY (settingsUrl?add=1 / ?edit=) → scoped out; the
// "Create New Addon" header link is asserted as an attribute only.
// NOTE (verified live): the Delete row action DOES open a plugin-ui alertdialog
// confirm (buttons Cancel / Delete) before the DELETE fires — confirm it.
// Self-contained per NEW_UI_HOUSE_STYLE.md §1.
// ============================================
export const newProductAddonsSelectors = {
    reactRoot: REACT_ROOT,
    dataRow: DATA_ROW_ANY,
    settledRow: DATA_ROW_SETTLED,
    skeleton: SKELETON_ANY,
    columnHeader: 'table thead th, [role="columnheader"]',
    searchInput: SEARCH_INPUT,
    rowActionsBtn: ROW_ACTIONS_BTN,
    actionMenuItem: dvActionMenuItem,
    emptyState: DATAVIEWS_EMPTY,
    createNewAddonLink: 'a:has-text("Create New Addon"), a:has-text("Create New Add-on")',
    phpFatal: PHP_FATAL,

    // REST endpoints (version-agnostic).
    listRest: /dokan\/v[0-9]+\/vendor\/product-addons(\?|$|&)/i,
    deleteRest: /dokan\/v[0-9]+\/vendor\/product-addons\/\d+\b/i,
} as const;

// ============================================
// PAGE OBJECT — new React vendor "Product Addons" global list (Dokan Pro).
// ============================================
export class NewProductAddonsPage {
    readonly page: Page;
    readonly url = toPath('dashboard/new/#/settings/product-addon');

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Locators ----
    get columnHeaders(): Locator {
        return this.page.locator(newProductAddonsSelectors.columnHeader);
    }
    get settledRows(): Locator {
        return this.page.locator(newProductAddonsSelectors.settledRow);
    }
    get skeletons(): Locator {
        return this.page.locator(newProductAddonsSelectors.skeleton);
    }

    rowsWithText(text: string): Locator {
        return this.page.locator(newProductAddonsSelectors.dataRow).filter({ hasText: text });
    }

    // ---- Navigation ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await dvWaitForRootReady(this.page);
        await this.waitForSettle();
    }

    async hasNoPhpFatal(): Promise<boolean> {
        return await dvHasNoPhpFatal(this.page);
    }

    /** Settle: skeleton gone AND (>=1 settled row OR empty state OR the column headers). */
    async waitForSettle(timeoutMs = 15000): Promise<void> {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            if ((await this.skeletons.count()) === 0) {
                if ((await this.settledRows.count()) > 0) return;
                if (
                    await this.page
                        .getByText(newProductAddonsSelectors.emptyState)
                        .first()
                        .isVisible()
                        .catch(() => false)
                )
                    return;
                if ((await this.columnHeaders.count()) > 0) return;
            }
            await this.page.waitForTimeout(250);
        }
    }

    // ---- Reads ----
    async columnHeaderTexts(): Promise<string[]> {
        return (await this.columnHeaders.allInnerTexts()).map(t => t.trim());
    }

    async hasColumn(name: RegExp): Promise<boolean> {
        return (await this.columnHeaderTexts()).some(t => name.test(t));
    }

    async rowVisible(text: string): Promise<boolean> {
        return await this.rowsWithText(text)
            .first()
            .isVisible({ timeout: 10000 })
            .catch(() => false);
    }

    async emptyStateVisible(): Promise<boolean> {
        return await this.page
            .getByText(newProductAddonsSelectors.emptyState)
            .first()
            .isVisible({ timeout: 5000 })
            .catch(() => false);
    }

    async createNewAddonHref(): Promise<string> {
        const link = this.page.locator(newProductAddonsSelectors.createNewAddonLink).first();
        return (await link.getAttribute('href').catch(() => '')) ?? '';
    }

    // ---- Search (client-side; fixed debounce) ----
    async search(query: string): Promise<void> {
        await fillDataViewsSearch(this.page, query, { selector: newProductAddonsSelectors.searchInput, debounceMs: 800 });
        await this.waitForSettle();
    }

    async clearSearch(): Promise<void> {
        await clearDataViewsSearch(this.page, { selector: newProductAddonsSelectors.searchInput, debounceMs: 600 });
        await this.waitForSettle();
    }

    // ---- Delete (row action → plugin-ui alertdialog confirm → DELETE) ----
    async deleteAddon(text: string): Promise<void> {
        const row = this.rowsWithText(text).first();
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await row.locator("button[aria-label='Actions']").first().click();
        const item = this.page.locator(newProductAddonsSelectors.actionMenuItem('Delete')).first();
        await item.waitFor({ state: 'visible', timeout: 8000 });
        await item.click();
        // Destructive → plugin-ui alertdialog confirm (Cancel / Delete). Confirm the
        // non-Cancel button and gate the DELETE mutation.
        const dialog = dataViewsConfirm(this.page);
        await dialog.waitFor({ state: 'visible', timeout: 8000 });
        const confirm = dialog
            .getByRole('button')
            .filter({ hasNotText: /^Cancel$/ })
            .last();
        await Promise.all([this.page.waitForResponse(r => newProductAddonsSelectors.deleteRest.test(r.url()) && r.request().method() === 'DELETE', { timeout: 15000 }).catch(() => undefined), confirm.click()]);
        await this.page.waitForTimeout(1000);
        await this.waitForSettle();
    }
}
