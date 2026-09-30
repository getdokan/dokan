import { Locator, Page } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import { REACT_ROOT, PHP_FATAL, SKELETON_ANY, waitForRootReady as dvWaitForRootReady, hasNoPhpFatal as dvHasNoPhpFatal } from '@utils/dataViews';

// ============================================
// SELECTORS — the vendor React "Subscription" (vendor subscription packs) surface
// (Dokan Pro, module product_subscription / dir subscription). Routes:
//   /dashboard/new/#/subscription        → CARD surface (App.tsx): a "Current
//                                          Subscription" card + a "Subscription
//                                          Packages" PricingCard grid. NOT DataViews.
//   /dashboard/new/#/subscription/orders → Subscription Orders DataViews list.
// Current Subscription empty copy: "You don't have an active subscription.";
// packages empty copy: "No subscription pack found.". Cancelling an active pack
// opens a DokanModal ("Cancel Subscription" → "Yes, Cancel") → PUT
// /dokan/v1/vendor-subscription/update/{vendorId}. Packages come from GET
// /dokan/v1/vendor-subscription/packages. Buying/switching a pack is storefront
// checkout → scoped out. Self-contained per NEW_UI_HOUSE_STYLE.md §1.
// ============================================
export const newSubscriptionSelectors = {
    reactRoot: REACT_ROOT,
    skeleton: SKELETON_ANY,
    currentSubscriptionTitle: 'text=/Current Subscription/i',
    packagesTitle: 'text=/Subscription Packages/i',
    noActiveSubscription: "text=/You don't have an active subscription/i",
    noPackFound: 'text=/No subscription pack found/i',
    cancelButton: 'button:has-text("Cancel")',
    cancelModalTitle: 'text=/Cancel Subscription/i',
    cancelModalConfirm: 'button:has-text("Yes, Cancel")',
    // Orders list.
    ordersTable: 'table tbody tr, [role="row"]',
    columnHeader: 'table thead th, [role="columnheader"]',
    emptyState: 'text=/no data found/i',
    phpFatal: PHP_FATAL,

    // REST endpoints (version-agnostic).
    packagesRest: /dokan\/v[0-9]+\/vendor-subscription\/packages\b/i,
    vendorSubRest: /dokan\/v[0-9]+\/vendor-subscription\/vendor\/\d+/i,
    updateRest: /dokan\/v[0-9]+\/vendor-subscription\/update\/\d+/i,
    ordersRest: /dokan\/v[0-9]+\/vendor-subscription\/orders\//i,
} as const;

// ============================================
// PAGE OBJECT — new React vendor "Subscription" packs (Dokan Pro).
// ============================================
export class NewSubscriptionPage {
    readonly page: Page;
    readonly url = toPath('dashboard/new/#/subscription');
    readonly ordersUrl = toPath('dashboard/new/#/subscription/orders');

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Locators ----
    get currentSubscriptionTitle(): Locator {
        return this.page.locator(newSubscriptionSelectors.currentSubscriptionTitle).first();
    }
    get packagesTitle(): Locator {
        return this.page.locator(newSubscriptionSelectors.packagesTitle).first();
    }
    get columnHeaders(): Locator {
        return this.page.locator(newSubscriptionSelectors.columnHeader);
    }
    get skeletons(): Locator {
        return this.page.locator(newSubscriptionSelectors.skeleton);
    }

    // ---- Navigation ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await dvWaitForRootReady(this.page);
        await this.waitForCards();
    }

    async gotoOrders(): Promise<void> {
        await this.page.goto(this.ordersUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await dvWaitForRootReady(this.page);
        await this.page.waitForTimeout(1200);
    }

    async hasNoPhpFatal(): Promise<boolean> {
        return await dvHasNoPhpFatal(this.page);
    }

    /** Ready when the skeleton is gone AND a card title (Current Subscription / Packages) shows. */
    async waitForCards(timeoutMs = 30000): Promise<void> {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            if ((await this.skeletons.count()) === 0) {
                const cur = await this.currentSubscriptionTitle.isVisible().catch(() => false);
                const pkg = await this.packagesTitle.isVisible().catch(() => false);
                if (cur || pkg) return;
            }
            await this.page.waitForTimeout(250);
        }
    }

    // ---- Reads ----
    async cardsVisible(): Promise<boolean> {
        const cur = await this.currentSubscriptionTitle.isVisible({ timeout: 10000 }).catch(() => false);
        const pkg = await this.packagesTitle.isVisible({ timeout: 10000 }).catch(() => false);
        return cur || pkg;
    }

    async noActiveSubscriptionVisible(): Promise<boolean> {
        return await this.page
            .locator(newSubscriptionSelectors.noActiveSubscription)
            .first()
            .isVisible({ timeout: 8000 })
            .catch(() => false);
    }

    async packVisible(name: string): Promise<boolean> {
        return await this.page
            .getByText(name, { exact: false })
            .first()
            .isVisible({ timeout: 10000 })
            .catch(() => false);
    }

    async columnHeaderTexts(): Promise<string[]> {
        return (await this.columnHeaders.allInnerTexts()).map(t => t.trim());
    }

    async ordersSurfaceRendered(): Promise<boolean> {
        const hasHeaders = (await this.columnHeaders.count()) > 0;
        const empty = await this.page
            .locator(newSubscriptionSelectors.emptyState)
            .first()
            .isVisible({ timeout: 8000 })
            .catch(() => false);
        return hasHeaders || empty;
    }
}
