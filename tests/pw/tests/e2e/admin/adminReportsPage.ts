import { Locator, Page } from '@playwright/test';
import { toPath } from '@utils/helpers';
import { DATA_ROW, SKELETON } from './adminDataViews';

export const adminReportsData = {
    // The vendor store every seeded order targets (idempotent + re-runnable).
    vendor: { storeName: 'ARPT Reports Vendor', userLogin: 'arpt_reports_vendor', email: 'arpt_reports_vendor@example.test' },
    // The customer that places the seeded completed order (idempotent).
    customer: { username: 'arpt_reports_customer', email: 'arpt_reports_customer@example.test' },
    // The product the completed order buys.
    product: { name: 'ARPT Reports Product' },

    // The h1 the AdminHeader renders for this route.
    heading: 'Reports',

    // Top-level HeaderCard tabs (role=tab). "Reports" is the default-active card.
    topTabs: { overview: 'Reports', allLogs: 'All Logs', adminEarnings: 'Admin Earnings' },
    // AdminTab sub-tabs inside the "Reports" overview (role=tab).
    breakdownTabs: { byMonth: 'By Month', byYear: 'By Year', byVendor: 'By Vendor' },

    // The five role=tab labels the brief enumerates, in the documented order.
    allTabLabels: ['All Logs', 'Admin Earnings', 'By Month', 'By Year', 'By Vendor'],

    // REST endpoints (path fragments) each tab fires.
    rest: {
        statsSummary: '/dokan/v1/admin/report-stats/summary',
        statsOverview: '/dokan/v1/admin/report-stats/overview',
        logs: '/dokan/v1/admin/report-logs',
        earnings: '/dokan/v1/admin/report-earnings',
        earningsSummary: '/dokan/v1/admin/report-earnings/summary',
    },

    // Neither table has a standalone search box — free-text search is the "Order Search" filter field.
    allLogs: {
        // The fields the "Filter" toolbar button exposes for All Logs.
        filterFields: ['Vendor', 'Order Status', 'Date Range', 'Order Search'],
        // Export downloads a CSV named report-logs_<YYYY-MM-DD>.csv.
        exportFilename: /report-logs.*\.csv$/i,
    },
    adminEarnings: {
        filterFields: ['Earning Type', 'Vendor', 'Date Range', 'Order Search'],
        // Export downloads a CSV named earning-reports_<YYYY-MM-DD>.csv.
        exportFilename: /earning-reports.*\.csv$/i,
    },
} as const;

export const adminReportsSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    panel: '.dokan-reports-admin',
    table: 'table',
    // Real (non-skeleton) DataViews rows.
    dataRow: DATA_ROW,
    // The D3 chart renders an <svg> inside the ReportsSalesChart card.
    chartSvg: 'svg',
    emptyState: 'text=/no logs found|no earnings found|no data found|no items|no results/i',
    // A panel-level red error box (the {error} branches in each panel).
    errorBox: '.text-red-600',
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
} as const;

// PAGE OBJECT — admin Reports. Surface: admin.php?page=dokan-dashboard#/reports.
// Admin-facing, so it deliberately does NOT register closeAnnouncementModal (the
// vendor announcement modal never appears in wp-admin).
export class AdminReportsPage {
    readonly page: Page;
    readonly url = toPath('wp-admin/admin.php?page=dokan-dashboard#/reports');

    constructor(page: Page) {
        this.page = page;
    }

    get reactRoot(): Locator {
        return this.page.locator(adminReportsSelectors.reactRoot).first();
    }
    get heading(): Locator {
        return this.page.getByRole('heading', { name: adminReportsData.heading }).first();
    }
    get rows(): Locator {
        return this.page.locator(adminReportsSelectors.dataRow);
    }
    get table(): Locator {
        return this.page.locator(adminReportsSelectors.table).first();
    }
    get chart(): Locator {
        // Scope to the React root so WP-admin chrome SVGs never match.
        return this.reactRoot.locator(adminReportsSelectors.chartSvg).first();
    }
    get emptyState(): Locator {
        return this.page.locator(adminReportsSelectors.emptyState).first();
    }

    /** Any role=tab (HeaderCard top tabs OR AdminTab sub-tabs) by its visible label. */
    tab(name: string): Locator {
        return this.page.getByRole('tab', { name, exact: true }).first();
    }

    /** A DataViews column header by visible label. */
    columnHeader(name: RegExp | string): Locator {
        return this.page.getByRole('columnheader', { name }).first();
    }

    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    /** Ready when the React root + the "Reports" heading have painted. */
    async waitForReady(timeoutMs = 30000): Promise<void> {
        await this.reactRoot.waitFor({ state: 'visible', timeout: timeoutMs });
        await this.heading.waitFor({ state: 'visible', timeout: timeoutMs });
    }

    async reload(): Promise<void> {
        await this.page.reload();
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page
            .locator(adminReportsSelectors.phpFatal)
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);
        return !fatal;
    }

    /** True when a tab with the given label is present (role=tab). isVisible() does
     * NOT wait, so we waitFor() to avoid racing the mount. */
    async isTabVisible(name: string): Promise<boolean> {
        try {
            await this.tab(name).waitFor({ state: 'visible', timeout: 10000 });
            return true;
        } catch {
            return false;
        }
    }

    /** Click a tab (top HeaderCard or AdminTab sub-tab) and let its panel settle. */
    async clickTab(name: string): Promise<void> {
        const tab = this.tab(name);
        await tab.waitFor({ state: 'visible', timeout: 10000 });
        await tab.scrollIntoViewIfNeeded().catch(() => undefined);
        await tab.click();
        await this.page.waitForTimeout(900); // panel swap + REST refetch + repaint.
    }

    /** Click a tab AND capture the matching report REST request that fires.
     * Returns the request URL so a test can assert the endpoint. The Promise.all
     * arms the waiter BEFORE the click so an instant fetch is not missed. */
    async clickTabAndCaptureRequest(name: string, pathFragment: string): Promise<string> {
        const tab = this.tab(name);
        await tab.waitFor({ state: 'visible', timeout: 10000 });
        await tab.scrollIntoViewIfNeeded().catch(() => undefined);
        const [req] = await Promise.all([this.page.waitForRequest(r => r.url().includes(pathFragment) && r.method() === 'GET', { timeout: 15000 }), tab.click()]);
        await this.page.waitForTimeout(700);
        return req.url();
    }

    async getRowCount(): Promise<number> {
        return await this.rows.count();
    }

    async isEmptyStateVisible(): Promise<boolean> {
        return await this.emptyState.isVisible({ timeout: 5000 }).catch(() => false);
    }

    /** Wait until either >=1 DataViews row OR the empty-state has painted (a table
     * tab is "ready" in either state). */
    async waitForTableSettled(timeoutMs = 20000): Promise<void> {
        // Wait out the loading skeleton so its rows aren't read as fresh data.
        await this.page.locator(SKELETON).first().waitFor({ state: 'hidden', timeout: timeoutMs }).catch(() => undefined);
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            if ((await this.rows.count()) > 0) return;
            if (await this.emptyState.isVisible().catch(() => false)) return;
            await this.page.waitForTimeout(250);
        }
    }

    /** True once the D3 chart <svg> has painted in the overview panel. */
    async isChartVisible(timeoutMs = 15000): Promise<boolean> {
        try {
            await this.chart.waitFor({ state: 'visible', timeout: timeoutMs });
            return true;
        } catch {
            return false;
        }
    }

    /** Open the DataViews "Filter" toolbar button (the active table panel's). */
    async openFilter(): Promise<void> {
        const f = this.page.getByRole('button', { name: 'Filter', exact: true }).first();
        await f.waitFor({ state: 'visible', timeout: 10000 });
        await f.click();
        await this.page.waitForTimeout(800); // portaled filter popover paints.
    }

    /** The field labels the open Filter popover offers (Vendor / Date Range / …).
     * The popover is portaled (radix), so we read it from the live DOM rather than
     * a single scoped locator. Call after openFilter(). */
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

    /** Apply an "Order Status" value via the Filter and return the refetch URL. */
    async applyOrderStatusFilter(optionLabel: string, requestFragment: string): Promise<string> {
        const control = this.page.locator('.react-select__control').first();
        // Reuse the control if already showing; otherwise open Filter → Order Status.
        if (!(await control.isVisible().catch(() => false))) {
            await this.openFilter();
            await this.page.getByRole('button', { name: 'Order Status', exact: true }).first().click();
            await control.waitFor({ state: 'visible', timeout: 10000 });
        }
        const [req] = await Promise.all([
            this.page.waitForRequest(r => r.url().includes(requestFragment) && r.url().includes('order_status'), { timeout: 15000 }),
            (async () => {
                await control.click();
                await this.page.locator('.react-select__option').filter({ hasText: new RegExp(`^${optionLabel}$`, 'i') }).first().click();
            })(),
        ]);
        await this.waitForTableSettled();
        return req.url();
    }

    /** True when every visible data row's text matches the given status pattern. */
    async everyRowMatchesStatus(status: RegExp): Promise<boolean> {
        const count = await this.rows.count();
        if (count === 0) return false;
        for (let i = 0; i < count; i++) {
            const text = (await this.rows.nth(i).innerText()).trim();
            if (!status.test(text)) return false;
        }
        return true;
    }

    /** Click the "Export" toolbar button and return the downloaded file's
     * suggested filename (or null if no download fired within the timeout). The
     * download waiter is armed BEFORE the click so a fast export is not missed. */
    async exportDownloadFilename(timeoutMs = 15000): Promise<string | null> {
        const exportBtn = this.page.getByRole('button', { name: /^Export$/ }).first();
        await exportBtn.waitFor({ state: 'visible', timeout: 10000 });
        const [download] = await Promise.all([this.page.waitForEvent('download', { timeout: timeoutMs }).catch(() => null), exportBtn.click()]);
        return download ? download.suggestedFilename() : null;
    }

    /** True when the admin Reports UI is NOT reachable for the current user. */
    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const headingVisible = await this.heading.isVisible({ timeout: 2000 }).catch(() => false);
        return !rootVisible && !headingVisible;
    }
}
