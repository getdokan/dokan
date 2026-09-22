import { Locator, Page } from '@playwright/test';
import { toPath } from '@utils/helpers';
import { DATA_ROW, waitForDataViewsSettle } from './adminDataViews';
import { actionMenuItemByName } from '@utils/dataViews';

// Admin-only Subscriptions DataViews list. Page is gated behind the "Enable
// Vendor Subscription" setting (dokan_product_subscription.enable_pricing === 'on').
export const adminSubscriptionsData = {
    heading: /^Subscriptions?$/,
    columns: ['Vendor', 'Subscription Pack', 'Type', 'Start Date', 'End Date', 'Order', 'Status'],
    filterFields: ['Vendor', 'Subscription Pack'],
    optionName: 'dokan_product_subscription',
    rest: { subscription: '/dokan/v1/subscription' },
} as const;

export const adminSubscriptionsSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    dataRow: DATA_ROW,
    rowActionsBtn: "button[aria-label='Actions']",
    emptyState: 'text=/no data found|no subscription|no items|no results/i',
    notFound: "text=/page can't be found|page cannot be found|404/i",
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
} as const;

export class AdminSubscriptionsPage {
    readonly page: Page;
    readonly url = toPath('wp-admin/admin.php?page=dokan-dashboard#/subscriptions');

    constructor(page: Page) {
        this.page = page;
    }

    get reactRoot(): Locator {
        return this.page.locator(adminSubscriptionsSelectors.reactRoot).first();
    }
    get rows(): Locator {
        return this.page.locator(adminSubscriptionsSelectors.dataRow);
    }
    get emptyState(): Locator {
        return this.page.locator(adminSubscriptionsSelectors.emptyState).first();
    }
    get notFound(): Locator {
        return this.page.locator(adminSubscriptionsSelectors.notFound).first();
    }
    get heading(): Locator {
        return this.page.getByRole('heading', { name: adminSubscriptionsData.heading }).first();
    }
    get allTab(): Locator {
        return this.page.getByRole('tab', { name: /^All/ }).first();
    }
    columnHeader(name: RegExp | string): Locator {
        return this.page.getByRole('columnheader', { name }).first();
    }
    rowByVendor(storeName: string): Locator {
        return this.rows.filter({ hasText: new RegExp(escapeRegExp(storeName), 'i') }).first();
    }

    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
        await waitForDataViewsSettle(this.page);
    }

    async waitForReady(timeoutMs = 30000): Promise<void> {
        await this.reactRoot.waitFor({ state: 'visible', timeout: timeoutMs });
        const start = Date.now();
        while (Date.now() - start < 15000) {
            if ((await this.rows.count()) > 0) return;
            if ((await this.emptyState.count()) > 0) return;
            if ((await this.notFound.count()) > 0) return;
            await this.page.waitForTimeout(250);
        }
    }

    async reload(): Promise<void> {
        await this.page.reload();
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
        await waitForDataViewsSettle(this.page);
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page
            .locator(adminSubscriptionsSelectors.phpFatal)
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);
        return !fatal;
    }

    async isNotFoundVisible(): Promise<boolean> {
        return await this.notFound.isVisible({ timeout: 5000 }).catch(() => false);
    }

    async getRowCount(): Promise<number> {
        return await this.rows.count();
    }
    async isEmptyStateVisible(): Promise<boolean> {
        return await this.emptyState.isVisible({ timeout: 5000 }).catch(() => false);
    }
    async isAllTabSelected(): Promise<boolean> {
        await this.allTab.waitFor({ state: 'visible', timeout: 10000 });
        return (await this.allTab.getAttribute('aria-selected')) === 'true';
    }
    async hasRow(storeName: string): Promise<boolean> {
        return (await this.rowByVendor(storeName).count()) > 0;
    }
    async statusOfRow(storeName: string): Promise<string> {
        const row = this.rowByVendor(storeName);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        const text = await row.innerText();
        if (/Cancelled/i.test(text)) return 'Cancelled';
        if (/Active/i.test(text)) return 'Active';
        return '';
    }

    async openFilter(): Promise<void> {
        const f = this.page.getByRole('button', { name: 'Filter', exact: true }).first();
        await f.waitFor({ state: 'visible', timeout: 10000 });
        await f.click();
        await this.page.waitForTimeout(800);
    }
    async openFilterFieldNames(): Promise<string[]> {
        await this.openFilter();
        const names = await this.page.evaluate(() => {
            const vis = (e: Element) => e.getClientRects().length > 0;
            const txt = (e: Element) => (e.textContent || '').trim().replace(/\s+/g, ' ');
            const pops = Array.from(document.querySelectorAll('[data-radix-popper-content-wrapper],.components-popover,[class*="popover"]')).filter(vis);
            const list = pops.flatMap(p => Array.from(p.querySelectorAll('button,[role="menuitem"],[role="option"],label')).filter(vis).map(txt));
            return [...new Set(list)].filter(t => t && t.length < 30 && !/^add filter$|^reset$|^filter$|^×$/i.test(t));
        });
        await this.page.keyboard.press('Escape').catch(() => undefined);
        return names;
    }

    async openRowActionMenuFor(storeName: string): Promise<void> {
        const row = this.rowByVendor(storeName);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        const btn = row.locator(adminSubscriptionsSelectors.rowActionsBtn).first();
        await btn.scrollIntoViewIfNeeded().catch(() => undefined);
        await btn.click();
    }
    async actionMenuItemVisible(label: RegExp): Promise<boolean> {
        return await actionMenuItemByName(this.page, label)
            .first()
            .isVisible({ timeout: 5000 })
            .catch(() => false);
    }
    async clickActionMenuItem(label: RegExp): Promise<void> {
        const item = actionMenuItemByName(this.page, label).first();
        await item.waitFor({ state: 'visible', timeout: 10000 });
        await item.click();
    }

    // Cancel opens a DokanModal (role="dialog"), not the inline alertdialog.
    get cancelModal(): Locator {
        return this.page
            .getByRole('dialog')
            .filter({ hasText: /Cancel Subscription|cancel.*period|Immediately/i })
            .first();
    }
    async cancelModalVisible(): Promise<boolean> {
        return await this.cancelModal.isVisible({ timeout: 8000 }).catch(() => false);
    }
    async dismissCancelModal(): Promise<void> {
        await this.page.keyboard.press('Escape').catch(() => undefined);
        await this.page.waitForTimeout(400);
    }

    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const headingVisible = await this.heading.isVisible({ timeout: 2000 }).catch(() => false);
        return !rootVisible && !headingVisible;
    }
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
