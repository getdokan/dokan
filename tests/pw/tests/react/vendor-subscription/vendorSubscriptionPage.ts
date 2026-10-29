import { test, type Locator, type Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';
import { DataViewsTable } from '../_shared/dataViewsTable';

/** React vendor Subscription (Pro): /dashboard/new/#/subscription and #/subscription/orders. */
export class VendorSubscriptionPage {
    readonly orders: DataViewsTable;

    constructor(readonly page: Page) {
        this.orders = new DataViewsTable(page, '/dokan/v1/vendor-subscription/orders');
        // Known bug (baseline/FINDINGS.md #3): SubscriptionPacks reads the admin-owned pack through the vendor
        // products endpoint, gets 403, and leaves the rejection unhandled. Pinned by #S10; drop this once fixed.
        test.info().annotations.push({ type: 'known-js-error', description: 'Object' });
    }

    async goto(): Promise<void> {
        await closeAnnouncementModal(this.page);
        const loaded = this.page.waitForResponse(r => /\/dokan\/v1\/vendor-subscription\/packages/.test(decodeURIComponent(r.url())));
        await this.page.goto('dashboard/new/#/subscription');
        await loaded;
    }

    /** Orders through the Subscription Orders tab (the only entry point that works; see gotoOrdersRoute). */
    async gotoOrders(): Promise<void> {
        await this.goto();
        const loaded = this.page.waitForResponse(r => /\/dokan\/v1\/vendor-subscription\/orders\/\d+/.test(decodeURIComponent(r.url())));
        await this.page.getByText('Subscription Orders', { exact: true }).click();
        await loaded;
        await this.orders.settled();
    }

    /** The standalone #/subscription/orders route (menu deep link). */
    async gotoOrdersRoute(): Promise<void> {
        await closeAnnouncementModal(this.page);
        await this.page.goto('dashboard/new/#/subscription/orders');
    }

    get current(): Locator {
        // Card > header > title, so the card is two levels up from the title.
        return this.page.getByText('Current Subscription', { exact: true }).locator('xpath=../..');
    }

    /** The pricing card of one pack: the innermost block holding both its title and its buy/switch button. */
    packCard(title: string): Locator {
        return this.page
            .locator('div')
            .filter({ hasText: title })
            .filter({ has: this.page.getByText(/^(Buy Now|Switch Pack|Your Pack|Start Free Trial)$/) })
            .last();
    }

    /** Cancel through the confirm modal; resolves with the update response. */
    async cancel() {
        const updated = this.page.waitForResponse(r => r.request().method() !== 'GET' && /\/vendor-subscription\/update\//.test(decodeURIComponent(r.url())));
        await this.current.getByRole('button', { name: 'Cancel', exact: true }).click();
        await this.page.getByRole('button', { name: 'Yes, Cancel' }).click();
        return updated;
    }
}
