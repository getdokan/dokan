import { test, request, Page } from '@playwright/test';
import { AdminDashboardPage } from '@pages/adminDashboardPage';
import { VendorDashboardPage } from '@pages/vendorDashboardPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { selector } from '@pages/selectors';

test.describe('Dashboard test', () => {
    let admin: AdminDashboardPage;
    let vendor: VendorDashboardPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new AdminDashboardPage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new VendorDashboardPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());

        // Set WooCommerce analytics to disabled for vendor dashboard tests
        await dbUtils.setOptionValue('woocommerce_analytics_enabled', 'no', false);
    });

    test.afterAll(async () => {
        await aPage.close();
        await vPage.close();
        await apiUtils.dispose();
    });

    // admin

    test('admin can view Dokan dashboard', { tag: ['@lite', '@exploratory', '@admin'] }, async () => {
        await admin.adminDashboardRenderProperly();
    });

    test('admin can evaluate dashboard at a glance values', { tag: ['@lite', '@admin', '@serial'] }, async () => {
        const summary = await apiUtils.getAdminReportSummary(payloads.adminAuth);
        await admin.dokanAtAGlanceValueAccuracy(summary);
    });

    test('admin can add Dokan news subscriber', { tag: ['@lite', '@admin'] }, async () => {
        await admin.addDokanNewsSubscriber(data.user.userDetails);
    });

    //vendor

    test('vendor can view vendor dashboard', { tag: ['@lite', '@exploratory', '@vendor'] }, async () => {
        const vendorDashboard = selector.vendor.vDashboard;
        
        await test.step('Navigate to vendor dashboard', async () => {
            await vendor.goIfNotThere(data.subUrls.frontend.vDashboard.dashboard);
        });
        
        await test.step('Verify at a glance elements are visible', async () => {
            await vendor.multipleElementVisible(vendorDashboard.atAGlance);
        });

        await test.step('Verify graph elements are visible', async () => {
            await vendor.multipleElementVisible(vendorDashboard.graph);
        });

        await test.step('Verify orders elements are visible', async () => {
            await vendor.multipleElementVisible(vendorDashboard.orders);
        });

        await test.step('Verify products elements are visible', async () => {
            await vendor.multipleElementVisible(vendorDashboard.products);
        });

        await test.step('Verify pro features if available', async () => {
            const { DOKAN_PRO } = process.env;
            if (DOKAN_PRO) {
                await test.step('Verify profile progress elements are visible', async () => {
                    await vendor.multipleElementVisible(vendorDashboard.profileProgress);
                });

                await test.step('Verify reviews elements are visible', async () => {
                    await vendor.multipleElementVisible(vendorDashboard.reviews);
                });

                await test.step('Verify announcement elements are visible', async () => {
                    await vendor.multipleElementVisible(vendorDashboard.announcement);
                });
            }
        });
    });

    test('vendor can view vendor dashboard menus', { tag: ['@lite', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorDashboardMenusRenderProperly();
    });
});
