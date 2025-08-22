import { test, request, Page } from '@playwright/test';
import { VendorReportsPage } from '@pages/vendorReportsPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';

test.describe('Vendor Reports test', () => {
    let vendor: VendorReportsPage;
    let vPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new VendorReportsPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await vPage.close();
        await apiUtils.dispose();
    });

    // Main Reports Dashboard Tests
    test('vendor can view reports dashboard page', { tag: ['@lite', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorReportsRenderProperly();
    });

    // Analytics Navigation Tests
    test('vendor can navigate to analytics products page', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.navigateToAnalyticsPage('products');
    });

    test('vendor can navigate to analytics revenue page', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.navigateToAnalyticsPage('revenue');
    });

    test('vendor can navigate to analytics orders page', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.navigateToAnalyticsPage('orders');
    });

    test('vendor can navigate to analytics variations page', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.navigateToAnalyticsPage('variations');
    });

    test('vendor can navigate to analytics categories page', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.navigateToAnalyticsPage('categories');
    });

    test('vendor can navigate to analytics coupons page', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.navigateToAnalyticsPage('coupons');
    });

    test('vendor can navigate to analytics taxes page', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.navigateToAnalyticsPage('taxes');
    });

    test('vendor can navigate to analytics stock page', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.navigateToAnalyticsPage('stock');
    });

    test('vendor can navigate to analytics customers page', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.navigateToAnalyticsPage('customers');
    });

    test('vendor can navigate to analytics downloads page', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.navigateToAnalyticsPage('downloads');
    });

    // Date Range Filter Tests
    test('vendor can use date range picker on products analytics', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.testDateRangeFilter('products');
    });

    test('vendor can use date range picker on revenue analytics', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.testDateRangeFilter('revenue');
    });

    test('vendor can use date range picker on orders analytics', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.testDateRangeFilter('orders');
    });

    // Traditional Reports Menu Tests
    test('vendor can view overview report', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.navigateToTraditionalReportMenu('overview');
    });

    test('vendor can view sales by day report', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.navigateToTraditionalReportMenu('salesByDay');
    });

    test('vendor can view top selling report', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.navigateToTraditionalReportMenu('topSelling');
    });

    test('vendor can view top earning report', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.navigateToTraditionalReportMenu('topEarning');
    });

    test('vendor can view statement report', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.navigateToTraditionalReportMenu('statement');
    });

    // Chart and Data Display Tests
    test('vendor can view charts on revenue analytics', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.verifyChartsDisplay('revenue');
    });

    test('vendor can view charts on products analytics', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.verifyChartsDisplay('products');
    });

    test('vendor can view charts on orders analytics', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.verifyChartsDisplay('orders');
    });

    // Table Display Tests
    test('vendor can view top selling products table', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.verifyTopSellingTable();
    });

    test('vendor can view top earning products table', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.verifyTopEarningTable();
    });

    test('vendor can view statement table', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.verifyStatementTable();
    });

    // Export Functionality Tests
    test('vendor can export statement', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.exportStatement();
    });

    test('vendor can export products report', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.exportAnalyticsReport('products');
    });

    test('vendor can export revenue report', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.exportAnalyticsReport('revenue');
    });

    test('vendor can export orders report', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.exportAnalyticsReport('orders');
    });

    // Data Validation Tests
    test('vendor can verify analytics data accuracy for products', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.validateAnalyticsData('products');
    });

    test('vendor can verify analytics data accuracy for revenue', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.validateAnalyticsData('revenue');
    });

    test('vendor can verify analytics data accuracy for orders', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.validateAnalyticsData('orders');
    });

    // Filter and Search Tests
    test('vendor can filter products analytics by product name', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.testProductFilter('products');
    });

    test('vendor can filter revenue analytics by product category', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.testCategoryFilter('revenue');
    });

    test('vendor can filter orders analytics by order status', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.testOrderStatusFilter('orders');
    });

    // Performance and Loading Tests
    test('vendor reports pages load within acceptable time', { tag: ['@lite', '@performance', '@vendor'] }, async () => {
        await vendor.testPageLoadPerformance();
    });

    // Responsive Design Tests
    test('vendor reports are responsive on mobile devices', { tag: ['@lite', '@responsive', '@vendor'] }, async () => {
        await vendor.testMobileResponsiveness();
    });

    test('vendor reports are responsive on tablet devices', { tag: ['@lite', '@responsive', '@vendor'] }, async () => {
        await vendor.testTabletResponsiveness();
    });

    // Error Handling Tests
    test('vendor sees appropriate message when no data available', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.testNoDataMessage();
    });

    test('vendor handles analytics page errors gracefully', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.testErrorHandling();
    });

    // Integration Tests
    test('vendor reports data matches API responses', { tag: ['@lite', '@integration', '@vendor'] }, async () => {
        await vendor.validateReportsWithAPI(apiUtils);
    });

    // Accessibility Tests
    test('vendor reports pages are accessible', { tag: ['@lite', '@accessibility', '@vendor'] }, async () => {
        await vendor.testAccessibility();
    });
});
