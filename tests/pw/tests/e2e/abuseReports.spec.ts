import { test, Page } from '@playwright/test';
import { AbuseReportsPage } from 'pages/abuseReportsPage';
import { ApiUtils } from 'utils/apiUtils';
import { dbUtils } from 'utils/dbUtils';
import { data } from 'utils/testData';
import { dbData } from 'utils/dbData';
import { payloads } from 'utils/payloads';

const { VENDOR_ID, CUSTOMER_ID } = process.env;

test.describe('Abuse report test', () => {
    let admin: AbuseReportsPage;
    let customer: AbuseReportsPage;
    let guest: AbuseReportsPage;
    let aPage: Page, cPage: Page, uPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser, request }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new AbuseReportsPage(aPage);

        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new AbuseReportsPage(cPage);

        const guestContext = await browser.newContext(data.auth.noAuth);
        uPage = await guestContext.newPage();
        guest = new AbuseReportsPage(uPage);

        apiUtils = new ApiUtils(request);
        const productId = await apiUtils.getProductId(data.predefined.simpleProduct.product1.name, payloads.vendorAuth);
        await dbUtils.createAbuseReport(dbData.dokan.createAbuseReport, productId, VENDOR_ID, CUSTOMER_ID);
    });

    test.afterAll(async () => {
        await aPage.close();
        await cPage.close();
        await uPage.close();
    });

    test('dokan abuse report menu page is rendering properly @pro @explo', async () => {
        await admin.adminAbuseReportRenderProperly();
    });

    test('admin can view abuse report details @pro @explo', async () => {
        await admin.abuseReportDetails();
    });

    test('admin can filter abuse reports by abuse reason @pro', async () => {
        await admin.filterAbuseReports('This content is spam', 'by-reason');
    });

    test('admin can filter abuse reports by product @pro', async () => {
        await admin.filterAbuseReports(data.predefined.simpleProduct.product1.name, 'by-product');
    });

    test('admin can filter abuse reports by vendor @pro', async () => {
        await admin.filterAbuseReports(data.predefined.vendorStores.vendor1, 'by-vendor');
    });

    test('admin can perform abuse report bulk action @pro', async () => {
        await admin.abuseReportBulkAction('delete');
    });

    // customer

    test('customer can report product @pro', async () => {
        await customer.reportProduct(data.predefined.simpleProduct.product1.name, data.product.report);
    });

    test('guest customer can report product @pro', async () => {
        await guest.reportProduct(data.predefined.simpleProduct.product1.name, data.product.report);
    });

    test('only logged-in customer can report product @pro', async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.productReportAbuse, { ...dbData.dokan.productReportAbuseSettings, reported_by_logged_in_users_only: 'on' });
        await guest.reportProduct(data.predefined.simpleProduct.product1.name, data.product.report);
    });
});
