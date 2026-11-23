import { Locator, Page } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import { REACT_ROOT, ROW_ACTIONS_BTN, PHP_FATAL, DATA_ROW_ANY, DATA_ROW_SETTLED, SKELETON_ANY, DATAVIEWS_EMPTY, actionMenuItem as dvActionMenuItem, waitForRootReady as dvWaitForRootReady, hasNoPhpFatal as dvHasNoPhpFatal } from '@utils/dataViews';

// ============================================
// SELECTORS — the vendor React "User Subscription" surface (Dokan Pro, module
// vsp / vendor-subscription-product). Surface: /dashboard/new/#/user-subscription.
//   dokan-pro/modules/vendor-subscription-product/src/components/SubscriptionList.tsx
// A DataViews list with search={false} (NO search box). Columns: Subscription
// (#id, clickable → /user-subscription/:id), Item, Status (DokanBadge), Total,
// Start, Next Payment, End. Single row action "View" → the detail route. Funnel
// filters: "Filter by Registered Customer" (react-select) and "Filter by Date"
// (WpDatePicker). Fetch GET /dokan/v1/product-subscriptions. The subscription
// RECORD has no dokan create-REST — seed via WC core POST /wc/v3/subscriptions
// with _dokan_vendor_id meta. Self-contained per NEW_UI_HOUSE_STYLE.md §1.
// ============================================
export const newUserSubscriptionSelectors = {
    reactRoot: REACT_ROOT,
    dataRow: DATA_ROW_ANY,
    settledRow: DATA_ROW_SETTLED,
    skeleton: SKELETON_ANY,
    columnHeader: 'table thead th, [role="columnheader"]',
    rowActionsBtn: ROW_ACTIONS_BTN,
    actionMenuItem: dvActionMenuItem,
    emptyState: DATAVIEWS_EMPTY,
    // The Subscription cell renders a clickable "#<id>" strong.dokan-link.
    subscriptionLink: 'strong.dokan-link, a.dokan-link, [role="button"]',
    phpFatal: PHP_FATAL,

    // REST endpoint (version-agnostic).
    listRest: /dokan\/v[0-9]+\/product-subscriptions(\?|$|&)/i,
} as const;

// ============================================
// PAGE OBJECT — new React vendor "User Subscription" (Dokan Pro).
// ============================================
export class NewUserSubscriptionPage {
    readonly page: Page;
    readonly url = toPath('dashboard/new/#/user-subscription');

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Locators ----
    get columnHeaders(): Locator {
        return this.page.locator(newUserSubscriptionSelectors.columnHeader);
    }
    get settledRows(): Locator {
        return this.page.locator(newUserSubscriptionSelectors.settledRow);
    }
    get skeletons(): Locator {
        return this.page.locator(newUserSubscriptionSelectors.skeleton);
    }

    rowsWithText(text: string): Locator {
        return this.page.locator(newUserSubscriptionSelectors.dataRow).filter({ hasText: text });
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

    /** Settle: skeleton gone AND (>=1 settled row OR empty state OR column headers). */
    async waitForSettle(timeoutMs = 15000): Promise<void> {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            if ((await this.skeletons.count()) === 0) {
                if ((await this.settledRows.count()) > 0) return;
                if (
                    await this.page
                        .getByText(newUserSubscriptionSelectors.emptyState)
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
            .getByText(newUserSubscriptionSelectors.emptyState)
            .first()
            .isVisible({ timeout: 5000 })
            .catch(() => false);
    }
    async settledRowCount(): Promise<number> {
        return await this.settledRows.count();
    }

    /** Open a subscription's detail by clicking its #id link in the matching row. */
    async openDetail(idText: string): Promise<void> {
        const row = this.rowsWithText(idText).first();
        await row.waitFor({ state: 'visible', timeout: 15000 });
        const link = row.locator(newUserSubscriptionSelectors.subscriptionLink).first();
        await Promise.all([this.page.waitForURL(/#\/user-subscription\/\d+/, { timeout: 15000 }).catch(() => undefined), link.click()]);
        await this.page.waitForLoadState('domcontentloaded');
    }
}
