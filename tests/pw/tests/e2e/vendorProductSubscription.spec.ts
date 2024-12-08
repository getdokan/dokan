import { test, request, Page } from '@playwright/test';
import { VendorProductSubscriptionPage } from '@pages/vendorProductSubscriptionPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe('Product subscriptions test', () => {
    let admin: VendorProductSubscriptionPage;
    let vendor: VendorProductSubscriptionPage;
    let customer: VendorProductSubscriptionPage;
    let aPage: Page, vPage: Page, cPage: Page;
    let apiUtils: ApiUtils;
    let subscriptionId: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new VendorProductSubscriptionPage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new VendorProductSubscriptionPage(vPage);

        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new VendorProductSubscriptionPage(cPage);

        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.createProduct(payloads.createSimpleSubscriptionProduct(), payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.productSubscription, payloads.adminAuth);
        await vPage.close();
        await cPage.close();
        await apiUtils.dispose();
    });

    // admin

    test('admin can enable product subscription module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enableProductSubscriptionModule();
    });

    //vendor

    test('vendor can view user subscriptions menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorUserSubscriptionsRenderProperly();
    });

    test.skip('vendor can view product subscription details', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.filterProductSubscriptions('by-customer', data.customer.username);
    });

    test.skip('vendor can filter user subscriptions by customer', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.filterProductSubscriptions('by-customer', data.customer.username);
    });

    test.skip('vendor can filter user subscriptions by date', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.filterProductSubscriptions('by-date', data.date.previousDate);
    });

    test.skip('vendor can view user subscription', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.viewProductSubscription(data.customer.username); // todo:  not implemented yet
    });

    // customer

    test.skip('customer can view product subscription details', { tag: ['@pro', '@exploratory', '@customer'] }, async () => {
        await customer.customerViewProductSubscription(subscriptionId);
    });

    test.skip('customer can cancel subscription', { tag: ['@pro', '@customer'] }, async () => {
        await customer.cancelProductSubscription(subscriptionId);
    });

    test.skip('customer can reactivate subscription', { tag: ['@pro', '@customer'] }, async () => {
        await customer.reactivateProductSubscription(subscriptionId);
    });

    test.skip('customer can change address of subscription', { tag: ['@pro', '@customer'] }, async () => {
        await customer.changeAddressOfProductSubscription(subscriptionId, data.customer.customerInfo.shipping);
    });

    test.skip('customer can change payment of subscription', { tag: ['@pro', '@customer'] }, async () => {
        await customer.changePaymentOfProductSubscription(subscriptionId);
    });

    test.skip('customer can renew subscription', { tag: ['@pro', '@customer'] }, async () => {
        await customer.renewProductSubscription(subscriptionId);
    });

    test.skip('customer can buy product subscription', { tag: ['@pro', '@customer'] }, async () => {
        await customer.buyProductSubscription(data.predefined.simpleSubscription.product1);
    });

    test('admin can disable product subscription module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.productSubscription, payloads.adminAuth);
        await admin.disableProductSubscriptionModule();
    });
});
