import { test, request, Page } from '@playwright/test';
import { VendorProductSubscriptionPage } from '@pages/vendorProductSubscriptionPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe('Product subscriptions test', () => {
    let vendor: VendorProductSubscriptionPage;
    let customer: VendorProductSubscriptionPage;
    let vPage: Page, cPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new VendorProductSubscriptionPage(vPage);

        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new VendorProductSubscriptionPage(cPage);

        apiUtils = new ApiUtils(await request.newContext());
        const [, productId, productName] = await apiUtils.createProduct(payloads.createSimpleSubscriptionProduct(), payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await vPage.close();
        await cPage.close();
        await apiUtils.dispose();
    });

    test('vendor user subscriptions menu page is rendering properly @pro @explo', async () => {
        await vendor.vendorUserSubscriptionsRenderProperly();
    });

    // test.skip('vendor can view product subscription details @pro @explo', async ( ) => {
    // 	await vendor.filterProductSubscriptions('by-customer', data.customer.username);
    // });

    // test.skip('vendor can filter user subscriptions by customer @pro', async ( ) => {
    // 	await vendor.filterProductSubscriptions('by-customer', data.customer.username);
    // });

    // test.skip('vendor can filter user subscriptions by date @pro', async ( ) => {
    // 	await vendor.filterProductSubscriptions('by-date', data.date.previousDate);
    // });

    // test.skip('vendor can view user subscription @pro', async ( ) => {
    // await vendor.viewProductSubscription(data.customer.username);
    // });

    // test('customer can view product subscription details @pro @explo', async ( ) => {
    // 	await customer.customerViewProductSubscription('2328');
    // });

    // test('customer can cancel subscription @pro', async ( ) => {
    // 	await customer.cancelProductSubscription('2328');
    // });

    // test('customer can reactivate subscription @pro', async ( ) => {
    // 	await customer.reactivateProductSubscription('2328');
    // });

    // test('customer can change address of subscription @pro', async ( ) => {
    // 	await customer.changeAddressOfProductSubscription('2328', data.customer.customerInfo.shipping);
    // });

    // test('customer can change payment of subscription @pro', async ( ) => {
    // 	await customer.changePaymentOfProductSubscription('2328');
    // });

    // test('customer can renew subscription @pro', async ( ) => {
    // 	await customer.renewProductSubscription('2328');
    // });

    // test('customer can buy product subscription @pro', async ( ) => {
    // await customer.buyProductSubscription(data.predefined.simpleSubscription.product1);
    // });
});
