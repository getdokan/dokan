import { test, request, Page } from '@playwright/test';
import { ReverseWithdrawsPage } from '@pages/reverseWithdrawsPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';

test.describe('Reverse withdraw test', () => {
    let admin: ReverseWithdrawsPage;
    let vendor: ReverseWithdrawsPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;
    let productId: string;
    let productName: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new ReverseWithdrawsPage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendor2Auth);
        vPage = await vendorContext.newPage();
        vendor = new ReverseWithdrawsPage(vPage);

        await dbUtils.setDokanSettings(dbData.dokan.optionName.reverseWithdraw, dbData.dokan.reverseWithdrawSettings);

        apiUtils = new ApiUtils(await request.newContext());

        [, productId, productName] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendor2Auth);
        const [, , orderId] = await apiUtils.createOrderWithStatus(productId, payloads.createOrderCod, data.order.orderStatus.processing, payloads.vendor2Auth);
        await apiUtils.updateOrderStatus(orderId, data.order.orderStatus.completed, payloads.vendor2Auth);
    });

    test.afterAll(async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.reverseWithdraw, { ...dbData.dokan.reverseWithdrawSettings, enabled: 'off' });
        await aPage.close();
        await vPage.close();
        await apiUtils.dispose();
    });

    test('dokan admin reverse withdraw menu page is rendering properly @lite @exp @a', async () => {
        await admin.adminReverseWithdrawRenderProperly();
    });

    test('filter reverse withdraws by store @lite @a', async () => {
        await admin.filterReverseWithdraws(data.predefined.vendorStores.vendor2);
    });

    test('admin can crete reverse withdraws @lite @a', async () => {
        await admin.addReverseWithdrawal({ ...data.reverseWithdraw, store: data.predefined.vendorStores.vendor2, product: productName });
    });

    // vendor

    test('vendor reverse withdrawal menu page is rendering properly @lite @exp @v', async () => {
        await vendor.vendorReverseWithdrawalRenderProperly();
    });

    test('vendor can view reverse withdrawal notice @lite @exp @v', async () => {
        await vendor.vendorViewReverseWithdrawalNotice();
    });

    test('vendor can view reverse withdrawal announcement @pro @exp @v', async () => {
        await vendor.vendorViewReverseWithdrawalAnnouncement();
    });

    test('vendor can filter reverse withdrawals @lite @v', async () => {
        await vendor.vendorFilterReverseWithdrawals(data.date.dateRange);
    });

    test('vendor can pay reverse pay balance @lite @v', async () => {
        const orderId = await vendor.vendorPayReversePayBalance();
        await apiUtils.updateOrderStatus(orderId, data.order.orderStatus.completed, payloads.adminAuth);
    });

    // todo: vendor cant withdraw when reverse withdrawal rule applied
    // todo: add to cart button removed when reverse withdrawal rule applied
});
