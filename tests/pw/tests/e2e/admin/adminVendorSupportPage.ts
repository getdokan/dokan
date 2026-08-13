import { Locator, Page } from '@playwright/test';
import { toPath } from '@utils/helpers';
import { confirmDataViewsAction, dataViewsConfirm, waitForDataViewsSettle, DATA_ROW } from './adminDataViews';
import { actionMenuItemByName } from '@utils/dataViews';

// Admin-only Vendor Support DataViews list. Test data namespaced with "AVS".
export const adminVendorSupportData = {
    vendor: { storeName: 'AVS Support Vendor', userLogin: 'avs_support_vendor', email: 'avs_support_vendor@example.test' },
    ticket: { subject: 'AVS Listed Ticket', message: 'AVS ticket body — please assist with my store payouts.' },

    heading: 'Vendor Support',
    tabLabels: ['All', 'Active', 'Closed'],
    columns: ['Ticket Id', 'Vendor', 'Subject', 'Status', 'Date'],
    filterFields: ['Vendor', 'Date Range'],
    rest: { tickets: '/dokan/v1/vendor-support/tickets' },
} as const;

export const adminVendorSupportSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    dataRow: DATA_ROW,
    search: 'input[placeholder="Search"]',
    rowActionsBtn: "button[aria-label='Actions']",
    emptyState: 'text=/no data found|no tickets|no items|no results/i',
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
} as const;

export class AdminVendorSupportPage {
    readonly page: Page;
    readonly url = toPath('wp-admin/admin.php?page=dokan-dashboard#/vendor-support');

    constructor(page: Page) {
        this.page = page;
    }

    get reactRoot(): Locator {
        return this.page.locator(adminVendorSupportSelectors.reactRoot).first();
    }
    get rows(): Locator {
        return this.page.locator(adminVendorSupportSelectors.dataRow);
    }
    get searchBox(): Locator {
        return this.page.locator(adminVendorSupportSelectors.search).first();
    }
    get emptyState(): Locator {
        return this.page.locator(adminVendorSupportSelectors.emptyState).first();
    }
    get heading(): Locator {
        return this.page.getByRole('heading', { name: adminVendorSupportData.heading }).first();
    }

    tab(name: RegExp): Locator {
        return this.page.getByRole('tab', { name }).first();
    }
    columnHeader(name: RegExp | string): Locator {
        return this.page.getByRole('columnheader', { name }).first();
    }
    rowBySubject(subject: string): Locator {
        return this.rows.filter({ hasText: new RegExp(escapeRegExp(subject), 'i') }).first();
    }

    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
        await waitForDataViewsSettle(this.page);
    }

    /** Ready when the React root is visible AND either ≥1 row OR the empty-state painted. */
    async waitForReady(timeoutMs = 30000): Promise<void> {
        await this.reactRoot.waitFor({ state: 'visible', timeout: timeoutMs });
        const start = Date.now();
        while (Date.now() - start < 15000) {
            if ((await this.rows.count()) > 0) return;
            if ((await this.emptyState.count()) > 0) return;
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
            .locator(adminVendorSupportSelectors.phpFatal)
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);
        return !fatal;
    }

    async getRowCount(): Promise<number> {
        return await this.rows.count();
    }
    async isEmptyStateVisible(): Promise<boolean> {
        return await this.emptyState.isVisible({ timeout: 5000 }).catch(() => false);
    }
    async isTabSelected(name: RegExp): Promise<boolean> {
        const tab = this.tab(name);
        await tab.waitFor({ state: 'visible', timeout: 10000 });
        return (await tab.getAttribute('aria-selected')) === 'true';
    }
    async hasRow(subject: string): Promise<boolean> {
        return (await this.rowBySubject(subject).count()) > 0;
    }

    async clickTab(name: RegExp): Promise<void> {
        const tab = this.tab(name);
        await tab.waitFor({ state: 'visible', timeout: 10000 });
        await tab.scrollIntoViewIfNeeded().catch(() => undefined);
        await tab.click();
        await waitForDataViewsSettle(this.page);
    }

    async search(term: string): Promise<void> {
        await this.searchBox.waitFor({ state: 'visible', timeout: 10000 });
        await this.searchBox.fill(term);
        await waitForDataViewsSettle(this.page, { debounceMs: 600 });
    }
    async clearSearch(): Promise<void> {
        await this.searchBox.fill('');
        await waitForDataViewsSettle(this.page, { debounceMs: 600 });
    }

    async openFilter(): Promise<void> {
        const f = this.page.getByRole('button', { name: 'Filter', exact: true }).first();
        await f.waitFor({ state: 'visible', timeout: 10000 });
        await f.click();
        await this.page.waitForTimeout(800);
    }
    /** Field labels the open Filter popover offers (portaled radix popover). */
    async openFilterFieldNames(): Promise<string[]> {
        await this.openFilter();
        const names = await this.page.evaluate(() => {
            const vis = (e: Element) => e.getClientRects().length > 0;
            const txt = (e: Element) => (e.textContent || '').trim().replace(/\s+/g, ' ');
            const pops = Array.from(document.querySelectorAll('[data-radix-popper-content-wrapper],.components-popover,[class*="popover"]')).filter(vis);
            const cand = pops.flatMap(p => Array.from(p.querySelectorAll('button,[role="menuitem"],[role="option"],label')).filter(vis).map(txt));
            return [...new Set(cand)].filter(t => t && t.length < 28 && !/^add filter$|^reset$|^filter$|^×$/i.test(t));
        });
        await this.page.keyboard.press('Escape').catch(() => undefined);
        return names;
    }

    async openRowActionMenuFor(subject: string): Promise<void> {
        const row = this.rowBySubject(subject);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        const btn = row.locator(adminVendorSupportSelectors.rowActionsBtn).first();
        await btn.scrollIntoViewIfNeeded().catch(() => undefined);
        await btn.click();
    }
    async openFirstRowActionMenu(): Promise<void> {
        const row = this.rows.first();
        await row.waitFor({ state: 'visible', timeout: 10000 });
        await row.locator(adminVendorSupportSelectors.rowActionsBtn).first().click();
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
    /** True when the inline confirm (role="alertdialog") is open. */
    async confirmDialogVisible(): Promise<boolean> {
        return await dataViewsConfirm(this.page)
            .isVisible({ timeout: 8000 })
            .catch(() => false);
    }
    /** Confirm the inline action (clicks the primary, non-Cancel button). */
    async confirmAction(): Promise<void> {
        await confirmDataViewsAction(this.page);
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
