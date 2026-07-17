import { Locator, Page } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import { REACT_ROOT, SEARCH_INPUT, PHP_FATAL, DATA_ROW_ANY, DATA_ROW_SETTLED, SKELETON_ANY, PHP_FATAL as FATAL, waitForRootReady as dvWaitForRootReady, hasNoPhpFatal as dvHasNoPhpFatal, fillDataViewsSearch } from '@utils/dataViews';

// ============================================
// SELECTORS — the vendor React product list Advertise column (Dokan Pro, module
// product_advertising / dir product-adv). Surface: /dashboard/new/#/products.
//   dokan-pro/modules/product-adv/src/vendor-dashboard/AdvertiseButton.tsx
// The module injects an "Advertise" column whose cell is a role=button span with a
// megaphone + "Promote" (purple when advertisable; grey with an "Expires on:"
// tooltip + tabIndex=-1 when already advertised). Clicking a NON-published product's
// Promote opens an error DokanModal (product_not_published) BEFORE any AJAX — a
// client-side guard that works regardless of the localized-nonce state. Clicking a
// published product's Promote fires AJAX dokan_get_advertisement_status (which may
// 400 on the new dashboard — see the module bug note). Paid checkout is owned by
// stripe-express. Self-contained per NEW_UI_HOUSE_STYLE.md §1.
// ============================================
export const newProductAdvertisingSelectors = {
    reactRoot: REACT_ROOT,
    dataRow: DATA_ROW_ANY,
    settledRow: DATA_ROW_SETTLED,
    skeleton: SKELETON_ANY,
    columnHeader: 'table thead th, [role="columnheader"]',
    searchInput: SEARCH_INPUT,
    promoteControl: 'text=/^Promote$/',
    // Error DokanModal (product_not_published).
    errorModal: 'div[role="dialog"]',
    errorModalConfirm: 'button:has-text("OK")',
    // Confirm (advertise) DokanModal.
    advertiseModalTitle: 'text=/Advertise Product/i',
    phpFatal: FATAL ?? PHP_FATAL,

    // REST/AJAX (version-agnostic).
    productsRest: /dokan\/v[0-9]+\/products(\?|$|&)/i,
    advStatusAjax: /admin-ajax\.php/i,
} as const;

// ============================================
// PAGE OBJECT — new React vendor product list Advertise column (Dokan Pro).
// ============================================
export class NewProductAdvertisingPage {
    readonly page: Page;
    readonly url = toPath('dashboard/new/#/products');

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Locators ----
    get columnHeaders(): Locator {
        return this.page.locator(newProductAdvertisingSelectors.columnHeader);
    }
    get settledRows(): Locator {
        return this.page.locator(newProductAdvertisingSelectors.settledRow);
    }
    get skeletons(): Locator {
        return this.page.locator(newProductAdvertisingSelectors.skeleton);
    }
    get promoteControls(): Locator {
        return this.page.getByText(/^Promote$/);
    }

    rowsWithText(text: string): Locator {
        return this.page.locator(newProductAdvertisingSelectors.dataRow).filter({ hasText: text });
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

    async waitForSettle(timeoutMs = 15000): Promise<void> {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            if ((await this.skeletons.count()) === 0) {
                if ((await this.settledRows.count()) > 0) return;
                if ((await this.columnHeaders.count()) > 0) return;
            }
            await this.page.waitForTimeout(250);
        }
    }

    async search(query: string): Promise<void> {
        const refetch = this.page.waitForResponse(r => newProductAdvertisingSelectors.productsRest.test(r.url()) && decodeURIComponent(r.url()).includes(`search=${query}`) && r.request().method() === 'GET', { timeout: 15000 }).catch(() => undefined);
        await fillDataViewsSearch(this.page, query, { selector: newProductAdvertisingSelectors.searchInput, debounceMs: 800 });
        await refetch;
        await this.waitForSettle();
    }

    // ---- Reads ----
    async hasColumn(name: RegExp): Promise<boolean> {
        return (await this.columnHeaders.allInnerTexts()).map(t => t.trim()).some(t => name.test(t));
    }

    async promoteControlCount(): Promise<number> {
        return await this.promoteControls.count();
    }

    /** The "Promote" control within the row matching text (if the Advertise column shows). */
    promoteInRow(text: string): Locator {
        return this.rowsWithText(text)
            .first()
            .getByText(/^Promote$/)
            .first();
    }

    /**
     * Live-probe whether the Promote button has its localized nonce global. Returns
     * the value of window.dokan_purchase_advertisement (or null). Used to document
     * the new-dashboard localized-global bug without asserting on a broken flow.
     */
    async purchaseAdvertisementGlobal(): Promise<unknown> {
        return await this.page.evaluate(() => (window as unknown as { dokan_purchase_advertisement?: unknown }).dokan_purchase_advertisement ?? null).catch(() => null);
    }

    /** Click the Promote control in a row and report whether an error modal opened. */
    async clickPromoteExpectingErrorModal(text: string): Promise<boolean> {
        const control = this.promoteInRow(text);
        await control.waitFor({ state: 'visible', timeout: 10000 });
        await control.click();
        await this.page.waitForTimeout(1200);
        const modal = this.page
            .locator(newProductAdvertisingSelectors.errorModal)
            .filter({ hasText: /published|advertise/i })
            .first();
        return await modal.isVisible({ timeout: 6000 }).catch(() => false);
    }
}
