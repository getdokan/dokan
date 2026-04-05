import { test, Page } from '@playwright/test';
import { ReverseWithdrawsPage, ApiUtils, data, dbData, dbUtils, helpers, payloads } from './reverseWithdrawsPage';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');

test.describe('Reverse withdraw test', () => {
    let admin: ReverseWithdrawsPage;
    let vendor: ReverseWithdrawsPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;
    let productId: string;
    let productName: string;
    let sellerId: string;
    let storeName: string;
    let vendorName: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new ReverseWithdrawsPage(aPage);
        apiUtils = new ApiUtils(null);

        [, sellerId, storeName, vendorName] = await apiUtils.createStore(payloads.createStore(), payloads.adminAuth, true);

        const vendorContext = await browser.newContext(data.header.userAuth(vendorName));
        vPage = await vendorContext.newPage();
        vendor = new ReverseWithdrawsPage(vPage);

        [, productId, productName] = await apiUtils.createProduct(payloads.createProduct(), payloads.userAuth(vendorName));
        const [, , orderId] = await apiUtils.createOrderWithStatus(productId, payloads.createOrderCod, data.order.orderStatus.processing, payloads.userAuth(vendorName));
        await apiUtils.updateOrderStatus(orderId, data.order.orderStatus.completed, payloads.userAuth(vendorName));

        await dbUtils.setUserMeta(sellerId, '_dokan_reverse_withdrawal_failed_actions', dbData.testData.dokan.reverseWithdrawalFailedActions, true);
    });

    test.afterAll(async () => {
        await aPage?.close();
        await vPage?.close();
        await apiUtils.dispose();
    });

    test('admin can view reverse withdrawal menu page', { tag: ['@lite', '@exploratory', '@admin'] }, async () => { await admin.adminReverseWithdrawRenderProperly(); });
    test.skip('admin can filter reverse withdrawal by store', { tag: ['@lite', '@admin'] }, async () => { await admin.filterReverseWithdraws(storeName); });
    test.skip('admin can clear reverse withdrawal filters', { tag: ['@lite', '@admin'] }, async () => { await admin.clearFilterReverseWithdraws(storeName); });

    test('admin can add reverse withdrawal', { tag: ['@lite', '@admin'] }, async () => {
        await admin.addReverseWithdrawal({ ...data.reverseWithdraw, store: storeName, product: productName });
    });

    test('vendor can view reverse withdrawal menu page', { tag: ['@lite', '@exploratory', '@vendor'] }, async () => { await vendor.vendorReverseWithdrawalRenderProperly(); });

    test('vendor can view reverse withdrawal notice (In grace period)', { tag: ['@lite', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorViewReverseWithdrawalNotice('grace-period');
        await dbUtils.setUserMeta(sellerId, '_dokan_reverse_withdrawal_threshold_exceeded_date', helpers.previousDate(), true);
    });

    test('vendor can view reverse withdrawal notice (after grace period)', { tag: ['@lite', '@exploratory', '@vendor'] }, async () => { await vendor.vendorViewReverseWithdrawalNotice('after-grace-period'); });
    test('vendor can view reverse withdrawal announcement', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorViewReverseWithdrawalAnnouncement(); });
    test('vendor can filter reverse withdrawals by date', { tag: ['@lite', '@vendor'] }, async () => { await vendor.vendorFilterReverseWithdrawals(data.date.dateRange); });
    test('vendor status is inactive when reverse withdrawal rule applied', { tag: ['@lite', '@vendor'] }, async () => { await vendor.vendorCantWithdraw(); });
    test('vendor withdraw menu is hidden when reverse withdrawal rule applied', { tag: ['@lite', '@vendor'] }, async () => { await vendor.vendorCantWithdraw(); });

    test('vendor products in catalog mode when reverse withdrawal rule applied', { tag: ['@lite', '@vendor'] }, async () => {
        await dbUtils.updateUserMeta(sellerId, '_dokan_reverse_withdrawal_failed_actions', { status_inactive: '' }, true);
        await admin.vendorProductsInCatalogMode(vendorName);
    });

    test('vendor can pay reverse withdrawal balance', { tag: ['@lite', '@vendor'] }, async () => {
        const orderId = await vendor.vendorPayReversePayBalance();
        await apiUtils.updateOrderStatus(orderId, data.order.orderStatus.completed, payloads.adminAuth);
    });
});
