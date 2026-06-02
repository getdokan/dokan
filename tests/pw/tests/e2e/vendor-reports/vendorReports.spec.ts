import { Page, expect, test } from '@utils/test';
import { VendorReportsPage, ApiUtils } from './vendorReportsPage';
import path from 'path';

import { toPath } from '@utils/helpers';

const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

test.describe('Vendor Reports test', () => {
    let vendor: VendorReportsPage;
    let vPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new VendorReportsPage(vPage);
        apiUtils = new ApiUtils(null);
    });

    test.afterAll(async () => { await vPage?.close(); await apiUtils.dispose(); });

    test.skip('vendor can view reports dashboard page', { tag: ['@lite', '@exploratory', '@vendor'] }, async () => { await vendor.vendorReportsRenderProperly(); });
    test('vendor can navigate to analytics products page', { tag: ['@lite', '@vendor'] }, async () => { await vendor.navigateToAnalyticsPage('products'); });
    test('vendor can navigate to analytics revenue page', { tag: ['@lite', '@vendor'] }, async () => { await vendor.navigateToAnalyticsPage('revenue'); });
    test('vendor can navigate to analytics orders page', { tag: ['@lite', '@vendor'] }, async () => { await vendor.navigateToAnalyticsPage('orders'); });
    test('vendor can navigate to analytics variations page', { tag: ['@lite', '@vendor'] }, async () => { await vendor.navigateToAnalyticsPage('variations'); });
    test('vendor can navigate to analytics categories page', { tag: ['@lite', '@vendor'] }, async () => { await vendor.navigateToAnalyticsPage('categories'); });
    test('vendor can navigate to analytics coupons page', { tag: ['@lite', '@vendor'] }, async () => { await vendor.navigateToAnalyticsPage('coupons'); });
    test('vendor can navigate to analytics taxes page', { tag: ['@lite', '@vendor'] }, async () => { await vendor.navigateToAnalyticsPage('taxes'); });
    test('vendor can navigate to analytics stock page', { tag: ['@lite', '@vendor'] }, async () => { await vendor.navigateToAnalyticsPage('stock'); });
    test('vendor can navigate to analytics customers page', { tag: ['@lite', '@vendor'] }, async () => { await vendor.navigateToAnalyticsPage('customers'); });
    test('vendor can navigate to analytics downloads page', { tag: ['@lite', '@vendor'] }, async () => { await vendor.navigateToAnalyticsPage('downloads'); });
    test('vendor can use date range picker on products analytics', { tag: ['@lite', '@vendor'] }, async () => { await vendor.testDateRangeFilter('products'); });
    test('vendor can use date range picker on revenue analytics', { tag: ['@lite', '@vendor'] }, async () => { await vendor.testDateRangeFilter('revenue'); });
    test('vendor can use date range picker on orders analytics', { tag: ['@lite', '@vendor'] }, async () => { await vendor.testDateRangeFilter('orders'); });
    test('vendor can view overview report', { tag: ['@lite', '@vendor'] }, async () => { await vendor.navigateToTraditionalReportMenu('overview'); });
    test('vendor can view sales by day report', { tag: ['@lite', '@vendor'] }, async () => { await vendor.navigateToTraditionalReportMenu('salesByDay'); });
    test('vendor can view top selling report', { tag: ['@lite', '@vendor'] }, async () => { await vendor.navigateToTraditionalReportMenu('topSelling'); });
    test('vendor can view top earning report', { tag: ['@lite', '@vendor'] }, async () => { await vendor.navigateToTraditionalReportMenu('topEarning'); });
    test('vendor can view statement report', { tag: ['@lite', '@vendor'] }, async () => { await vendor.navigateToTraditionalReportMenu('statement'); });
    test('vendor can view charts on revenue analytics', { tag: ['@lite', '@vendor'] }, async () => { await vendor.verifyChartsDisplay('revenue'); });
    test('vendor can view charts on products analytics', { tag: ['@lite', '@vendor'] }, async () => { await vendor.verifyChartsDisplay('products'); });
    test('vendor can view charts on orders analytics', { tag: ['@lite', '@vendor'] }, async () => { await vendor.verifyChartsDisplay('orders'); });
    test('vendor can view top selling products table', { tag: ['@lite', '@vendor'] }, async () => { await vendor.verifyTopSellingTable(); });
    test('vendor can view top earning products table', { tag: ['@lite', '@vendor'] }, async () => { await vendor.verifyTopEarningTable(); });
    test('vendor can view statement table', { tag: ['@lite', '@vendor'] }, async () => { await vendor.verifyStatementTable(); });
    test('vendor can export statement', { tag: ['@lite', '@vendor'] }, async () => { await vendor.exportStatement(); });
    test('vendor can export products report', { tag: ['@lite', '@vendor'] }, async () => { await vendor.exportAnalyticsReport('products'); });
    test('vendor can export revenue report', { tag: ['@lite', '@vendor'] }, async () => { await vendor.exportAnalyticsReport('revenue'); });
    test('vendor can export orders report', { tag: ['@lite', '@vendor'] }, async () => { await vendor.exportAnalyticsReport('orders'); });
    test('vendor can verify analytics data accuracy for products', { tag: ['@lite', '@vendor'] }, async () => { await vendor.validateAnalyticsData('products'); });
    test('vendor can verify analytics data accuracy for revenue', { tag: ['@lite', '@vendor'] }, async () => { await vendor.validateAnalyticsData('revenue'); });
    test('vendor can verify analytics data accuracy for orders', { tag: ['@lite', '@vendor'] }, async () => { await vendor.validateAnalyticsData('orders'); });
    test('vendor can filter products analytics by product name', { tag: ['@lite', '@vendor'] }, async () => { await vendor.testProductFilter('products'); });
    test('vendor can filter revenue analytics by product category', { tag: ['@lite', '@vendor'] }, async () => { await vendor.testCategoryFilter('revenue'); });
    test('vendor can filter orders analytics by order status', { tag: ['@lite', '@vendor'] }, async () => { await vendor.testOrderStatusFilter('orders'); });
    test('vendor reports pages load within acceptable time', { tag: ['@lite', '@performance', '@vendor'] }, async () => { await vendor.testPageLoadPerformance(); });
    test.skip('vendor reports are responsive on mobile devices', { tag: ['@lite', '@responsive', '@vendor'] }, async () => { await vendor.testMobileResponsiveness(); });
    test.skip('vendor reports are responsive on tablet devices', { tag: ['@lite', '@responsive', '@vendor'] }, async () => { await vendor.testTabletResponsiveness(); });
    test('vendor sees appropriate message when no data available', { tag: ['@lite', '@vendor'] }, async () => { await vendor.testNoDataMessage(); });
    test('vendor handles analytics page errors gracefully', { tag: ['@lite', '@vendor'] }, async () => { await vendor.testErrorHandling(); });
    test('vendor reports data matches API responses', { tag: ['@lite', '@integration', '@vendor'] }, async () => { await vendor.validateReportsWithAPI(apiUtils); });
    test.skip('vendor reports pages are accessible', { tag: ['@lite', '@accessibility', '@vendor'] }, async () => { await vendor.testAccessibility(); });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Vendor Reports (React) Tests @pro', () => {
    test('Test Case 1 - Reports page renders', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/reports/`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Reports page renders content', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/reports/`));
        await page.waitForLoadState('domcontentloaded');
        await expect
            .poll(async () => (await page.locator('body').innerText()).trim().length, {
                timeout: 30_000,
                intervals: [500, 1000, 2000, 3000],
            })
            .toBeGreaterThan(50);
        await page.close();
        await ctx.close();
    });

    test('Test Case 3 - Reports page survives reload', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/reports/`));
        await page.waitForLoadState('domcontentloaded');
        // /dashboard/reports/ may client-side redirect to the new dashboard shortly after
        // DOMContentLoaded; that redirect aborts an in-flight reload with net::ERR_ABORTED.
        // Tolerate the abort and wait for whatever URL the page settles on.
        await page.reload({ waitUntil: 'domcontentloaded' }).catch((err: Error) => {
            if (!/ERR_ABORTED|frame was detached/i.test(err.message)) throw err;
        });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });
});

