import { test, Page } from '@playwright/test';
import { ReportsPage, VendorReportsPage, ApiUtils, data, payloads } from './vendorReportsAdminPage';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const { PRODUCT_ID } = process.env;

test.describe.skip('Reports test', () => {
    let admin: ReportsPage;
    let vendor: VendorReportsPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;
    let orderId: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new ReportsPage(aPage);
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new VendorReportsPage(vPage);
        apiUtils = new ApiUtils(null);
        [, , orderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID, payloads.createOrder, data.order.orderStatus.completed, payloads.vendorAuth);
    });

    test.afterAll(async () => { await aPage?.close(); await vPage?.close(); await apiUtils.dispose(); });

    test('admin can view reports menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => { await admin.adminReportsRenderProperly(); });
    test('admin can view all Logs menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => { await admin.adminAllLogsRenderProperly(); });
    test('admin can search all logs', { tag: ['@pro', '@admin'] }, async () => { await admin.searchAllLogs(orderId); });
    test('admin can export all logs', { tag: ['@pro', '@admin'] }, async () => { await admin.exportAllLogs(); });
    test('admin can filter all logs by store name', { tag: ['@pro', '@admin'] }, async () => { await admin.filterAllLogs(data.predefined.vendorStores.vendor1, 'by-store'); });
    test('admin can filter all logs by order status', { tag: ['@pro', '@admin'] }, async () => { await admin.filterAllLogs('completed', 'by-status'); });
    test('vendor can view reports menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorReportsRenderProperly(); });
    test('vendor can export statement', { tag: ['@pro', '@vendor'] }, async () => { await vendor.exportStatement(); });
});
