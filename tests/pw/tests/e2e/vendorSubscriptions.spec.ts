import { test, request, Page } from '@playwright/test';
import { VendorSubscriptionsPage } from '@pages/vendorSubscriptionsPage';
import { VendorPage } from '@pages/vendorPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';

test.slow();
test.describe('Vendor subscription test', () => {
    test.skip(true,' need to update create dokan subscription product')
    let admin: VendorSubscriptionsPage;
    let vendor: VendorSubscriptionsPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;
    let subscriptionPackId: string;
    let subscriptionPack: string;
    let storeName: string;

    async function createDokanSubscriptionProduct(productPayload: any, commissionPayload: any): Promise<[string, string]> {
        const [, productId, productName] = await apiUtils.createProduct(productPayload, payloads.adminAuth);
        await dbUtils.updateProductType(productId);
        await apiUtils.saveCommissionToSubscriptionProduct(productId, commissionPayload, payloads.adminAuth);
        return [productId, productName];
    }

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new VendorSubscriptionsPage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new VendorSubscriptionsPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());

        [subscriptionPackId, subscriptionPack] = await createDokanSubscriptionProduct(payloads.createDokanSubscriptionProduct(), payloads.saveVendorSubscriptionProductCommission);
        [, storeName] = await apiUtils.assignSubscriptionToVendor(subscriptionPackId);
    });

    test.afterAll(async () => {
        await aPage.close();
        await vPage.close();
        await apiUtils.dispose();
    });

    // admin

    // todo: add dokan subscription settings tests
    // todo: add dokan subscription product tests

    test('admin can view subscriptions menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await admin.subscriptionsRenderProperly();
    });

    test('admin can filter subscribed vendors by vendor', { tag: ['@pro', '@admin'] }, async () => {
        await admin.filterSubscribedVendors(storeName, 'by-vendor');
    });

    test('admin can filter subscribed vendors by subscription pack', { tag: ['@pro', '@admin'] }, async () => {
        await admin.filterSubscribedVendors(subscriptionPack, 'by-pack');
    });

    test('admin can cancel subscription (immediately)', { tag: ['@pro', '@admin'] }, async () => {
        const [, storeName] = await apiUtils.assignSubscriptionToVendor(subscriptionPackId);
        await admin.cancelSubscription(storeName, 'immediately');
    });

    test('admin can cancel subscription (end of the current period)', { tag: ['@pro', '@admin'] }, async () => {
        const [, storeName] = await apiUtils.assignSubscriptionToVendor(subscriptionPackId);
        await admin.cancelSubscription(storeName, 'end-of-period');
    });

    test('admin can perform bulk action on subscribed vendors', { tag: ['@pro', '@admin'] }, async () => {
        const [, storeName] = await apiUtils.assignSubscriptionToVendor(subscriptionPackId);
        await admin.subscriptionsBulkAction('cancel', storeName);
    });

    test('admin can assign non recurring subscription pack to vendor', { tag: ['@pro', '@admin'] }, async () => {
        const [, sellerId] = await apiUtils.createStore(payloads.createStore(), payloads.adminAuth, true);
        await admin.assignSubscriptionPack(sellerId, subscriptionPack);
    });

    //vendor

    test('vendor can view subscriptions menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorSubscriptionsRenderProperly();
    });

    test('vendor can buy non recurring subscription pack (on registration)', { tag: ['@pro', '@vendor'] }, async ({ page }) => {
        const vendor = new VendorPage(page);
        await vendor.vendorRegister({ ...data.vendor.vendorInfo, vendorSubscriptionPack: subscriptionPack }, { ...data.vendorSetupWizard, choice: false });
    });

    test('vendor can buy non recurring subscription pack (on subscription page)', { tag: ['@pro', '@vendor'] }, async ({ page }) => {
        const [, sellerId, , vendorName] = await apiUtils.createStore(payloads.createStore(), payloads.adminAuth, true);
        await dbUtils.createUserMeta(sellerId, 'dokan_vendor_seen_setup_wizard', '1'); // to avoid setup wizard trigger

        const vendor = new VendorSubscriptionsPage(page);
        const orderId = await vendor.buySubscription(vendorName, subscriptionPack);
        await apiUtils.updateOrderStatus(orderId, data.order.orderStatus.completed, payloads.adminAuth);
        await vendor.assertSubscription(subscriptionPack);
    });

    test('vendor can switch subscription', { tag: ['@pro', '@vendor'] }, async ({ page }) => {
        const [, subscriptionPack2] = await createDokanSubscriptionProduct(payloads.createDokanSubscriptionProduct(), { ...payloads.saveVendorSubscriptionProductCommission, commission: { fixed: { percentage: '15', flat: '15' } } });
        const [sellerId, , vendorName] = await apiUtils.assignSubscriptionToVendor(subscriptionPackId);
        await dbUtils.createUserMeta(sellerId, 'dokan_vendor_seen_setup_wizard', '1'); // to avoid setup wizard trigger

        const vendor = new VendorSubscriptionsPage(page);
        const orderId = await vendor.buySubscription(vendorName, subscriptionPack2, true);
        await apiUtils.updateOrderStatus(orderId, data.order.orderStatus.completed, payloads.adminAuth);
        await vendor.assertSubscription(subscriptionPack2);
    });

    test('vendor can cancel subscription', { tag: ['@pro', '@vendor'] }, async ({ page }) => {
        const [, , vendorName] = await apiUtils.assignSubscriptionToVendor(subscriptionPackId);

        const vendor = new VendorSubscriptionsPage(page);
        await vendor.vendorCancelSubscription(vendorName);
    });
});
