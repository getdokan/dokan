import { Locator, Page } from '@playwright/test';
import { toPath } from '@utils/helpers';

// ============================================
// TEST DATA — namespaced with the "ARPT" area prefix.
// ============================================
// The admin Reports page (Dokan Pro 5.0.0+ React admin dashboard) is a TABBED
// reports surface mounted at admin.php?page=dokan-dashboard#/reports via the
// `dokan-admin-dashboard-routes` filter (path '/reports'). It is ADMIN-only and
// READ-only: every report row / chart is computed server-side from the orders
// already in the marketplace. To guarantee at least one commission/earning row
// this folder seeds — over REST, never the vendor/customer UI — a vendor store +
// a product + a customer + ONE completed order (apiUtils.createOrderWithStatus,
// 'wc-completed', admin auth).
//
// The page has TWO tab levels, BOTH rendered as role=tab:
//   - Top-level HeaderCard buttons (role="tab"): "Reports" (the active default,
//     the overview/charts panel), "All Logs" (commission-log DataViews table),
//     "Admin Earnings" (earnings DataViews table + summary cards).
//   - Inside the "Reports" overview, an AdminTab (WP TabPanel -> role=tab) with
//     the sub-tabs "By Month" (by-day), "By Year" (by-year), "By Vendor"
//     (by-vendor). These sub-tabs only exist while the "Reports" card is active;
//     switching to All Logs / Admin Earnings unmounts them.
// So the five named tabs from the brief — All Logs, Admin Earnings, By Month,
// By Year, By Vendor — are all role=tab.
//
// REST endpoints each panel fires (verified against the React source):
//   - Reports overview  -> GET /dokan/v1/admin/report-stats/summary  (ReportStats)
//                          GET /dokan/v1/admin/report-stats/overview  (ReportsSalesChart, D3 chart)
//   - All Logs          -> GET /dokan/v1/admin/report-logs           (AllLogs DataViews)
//   - Admin Earnings    -> GET /dokan/v1/admin/report-earnings       (AdminEarnings DataViews)
//                          GET /dokan/v1/admin/report-earnings/summary (EarningStats cards)
// (The brief mentioned report/summary + report/overview; the new dashboard's
// actual paths are the report-stats/* + report-logs + report-earnings ones above,
// which is what these tests assert.)
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
} as const;

// ============================================
// SELECTORS — verified against
// dokan-pro/src/admin/reports/components/reports/index.tsx (ReportsAdmin),
// ReportsOverview.tsx + ReportsSalesChart.tsx (overview + D3 chart),
// logs/AllLogs.tsx + earnings/AdminEarnings.tsx (AdminDataViews tables),
// HeaderCard.tsx (role="tab" cards) and dokan-lite AdminHeader.tsx (the h1
// "Reports") / AdminTab.tsx (WP TabPanel -> role=tab sub-tabs).
// ============================================
export const adminReportsSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    // The reports panel wrapper class (index.tsx outer div).
    panel: '.dokan-reports-admin',
    table: 'table',
    dataRow: 'table tbody tr',
    // The D3 chart renders an <svg> inside the ReportsSalesChart card.
    chartSvg: 'svg',
    // DataViews empty state (AllLogs "No logs found" / AdminEarnings "No earnings found").
    emptyState: 'text=/no logs found|no earnings found|no data found|no items|no results/i',
    // A panel-level red error box (the {error} branches in each panel).
    errorBox: '.text-red-600',
    // PHP fatal markers.
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
} as const;

// ============================================
// PAGE OBJECT — admin Reports (Dokan Pro 5.0.0+ React admin dashboard).
// Surface: wp-admin/admin.php?page=dokan-dashboard#/reports (HashRouter).
// NOTE: admin-facing — the vendor announcement modal does NOT appear in wp-admin,
// so this page object deliberately does NOT register the closeAnnouncementModal
// handler.
// ============================================
export class AdminReportsPage {
    readonly page: Page;
    readonly url = toPath('wp-admin/admin.php?page=dokan-dashboard#/reports');

    constructor(page: Page) {
        this.page = page;
    }

    // ---- Locators ----
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

    // ---- Navigation / readiness ----
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

    // ---- Tabs ----
    /** True when a tab with the given label is present (role=tab). isVisible() does
     * NOT wait, so we waitFor() (the gotcha: a snapshot would race the mount). */
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

    // ---- Reads ----
    async getRowCount(): Promise<number> {
        return await this.rows.count();
    }

    async isEmptyStateVisible(): Promise<boolean> {
        return await this.emptyState.isVisible({ timeout: 5000 }).catch(() => false);
    }

    /** Wait until either >=1 DataViews row OR the empty-state has painted (a table
     * tab is "ready" in either state). */
    async waitForTableSettled(timeoutMs = 20000): Promise<void> {
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

    // ---- Authorization (non-admin) ----
    /** True when the admin Reports UI is NOT reachable for the current user. */
    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const headingVisible = await this.heading.isVisible({ timeout: 2000 }).catch(() => false);
        return !rootVisible && !headingVisible;
    }
}
