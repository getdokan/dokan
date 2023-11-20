import { test, Page } from '@playwright/test';
import { ReportsPage } from '@pages/reportsPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

const { PRODUCT_ID } = global as any;

test.describe('Reports test', () => {
    let admin: ReportsPage;
    let aPage: Page;
    let apiUtils: ApiUtils;
    let orderId: string;

    test.beforeAll(async ({ browser, request }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new ReportsPage(aPage);
        apiUtils = new ApiUtils(request);
        [, , orderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID, payloads.createOrder, data.order.orderStatus.completed, payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await aPage.close();
    });

    // reports

    test('admin reports menu page is rendering properly @pro @explo', async () => {
        await admin.adminReportsRenderProperly();
    });

    // all logs

    test('admin All Logs menu page is rendering properly @pro @explo', async () => {
        await admin.adminAllLogsRenderProperly();
    });

    test('admin can search all logs @pro', async () => {
        await admin.searchAllLogs(orderId);
    });

    test('admin can export all logs @pro', async () => {
        // await admin.exportAllLogs(orderId);
        await admin.exportAllLogs();
    });

    test('admin can filter all logs by store name @pro', async () => {
        await admin.filterAllLogsByStore(data.predefined.vendorStores.vendor1);
    });

    test('admin can filter all logs by order status @pro', async () => {
        await admin.filterAllLogsByStatus('completed');
    });
});
