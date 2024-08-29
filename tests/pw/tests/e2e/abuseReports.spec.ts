import { test, request, Page } from '@playwright/test';
import { AbuseReportsPage } from '@pages/abuseReportsPage';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';

const { PRODUCT_ID, VENDOR_ID, CUSTOMER_ID } = process.env;

test.describe('Abuse report test', () => {
    let admin: AbuseReportsPage;
    let customer: AbuseReportsPage;
    let aPage: Page, cPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new AbuseReportsPage(aPage);

        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new AbuseReportsPage(cPage);

        apiUtils = new ApiUtils(await request.newContext());
        await dbUtils.createAbuseReport(dbData.dokan.createAbuseReport, PRODUCT_ID, VENDOR_ID, CUSTOMER_ID);
    });

    test.afterAll(async () => {
        await aPage.close();
        await cPage.close();
        await apiUtils.dispose();
    });

    // admin

    test('admin can view abuse reports menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await admin.adminAbuseReportRenderProperly();
    });

    test('admin can view abuse report details', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await admin.abuseReportDetails();
    });

    test('admin can filter abuse reports by abuse reason', { tag: ['@pro', '@admin'] }, async () => {
        await admin.filterAbuseReports('This content is spam', 'by-reason');
    });

    test('admin can filter abuse reports by product', { tag: ['@pro', '@admin'] }, async () => {
        await admin.filterAbuseReports(data.predefined.simpleProduct.product1.name, 'by-product');
    });

    test('admin can filter abuse reports by vendor', { tag: ['@pro', '@admin'] }, async () => {
        await admin.filterAbuseReports(data.predefined.vendorStores.vendor1, 'by-vendor');
    });

    test('admin can perform bulk action on abuse reports', { tag: ['@pro', '@admin', '@serial'] }, async () => {
        await admin.abuseReportBulkAction('delete');
    });

    // customer

    test('customer can report product', { tag: ['@pro', '@customer'] }, async () => {
        await customer.reportProduct(data.predefined.simpleProduct.product1.name, data.product.report);
    });

    test('guest customer can report product', { tag: ['@pro', '@guest'] }, async ({ page }) => {
        const guest = new AbuseReportsPage(page);
        await guest.reportProduct(data.predefined.simpleProduct.product1.name, data.product.report);
    });

    test('guest customer need to log-in to report product', { tag: ['@pro', '@guest'] }, async ({ page }) => {
        const guest = new AbuseReportsPage(page);
        await dbUtils.updateOptionValue(dbData.dokan.optionName.productReportAbuse, { reported_by_logged_in_users_only: 'on' });
        await guest.reportProduct(data.predefined.simpleProduct.product1.name, data.product.report, true);
        await dbUtils.updateOptionValue(dbData.dokan.optionName.productReportAbuse, { reported_by_logged_in_users_only: 'off' });
    });
});
