import { Page, expect, test } from '@utils/test';
import { VendorSubscriptionsPage, VendorPage, ApiUtils, data, payloads, dbUtils, dbData } from './vendorSubscriptionsPage';
import path from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:9999';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

test.describe('Vendor subscription test', () => {
    test.skip(true, ' need to update create dokan subscription product');
    test.slow();
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
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new VendorSubscriptionsPage(aPage);
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new VendorSubscriptionsPage(vPage);
        apiUtils = new ApiUtils(null);
        [subscriptionPackId, subscriptionPack] = await createDokanSubscriptionProduct(payloads.createDokanSubscriptionProduct(), payloads.saveVendorSubscriptionProductCommission);
        [, storeName] = await apiUtils.assignSubscriptionToVendor(subscriptionPackId);
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.vendorSubscription, payloads.adminAuth);
        await aPage?.close();
        await vPage?.close();
        await apiUtils?.dispose();
    });

    test('admin can enable vendor subscription module', { tag: ['@pro', '@admin'] }, async () => {
        await dbUtils.setOptionValue(dbData.dokan.optionName.vendorSubscription, { ...dbData.dokan.vendorSubscriptionSettings, enable_pricing: 'on' });
        await admin.enableVendorSubscriptionModule();
        await dbUtils.setOptionValue(dbData.dokan.optionName.vendorSubscription, { ...dbData.dokan.vendorSubscriptionSettings, enable_pricing: 'off' });
    });
    test('admin can view subscriptions menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => { await admin.subscriptionsRenderProperly(); });
    test('admin can filter subscribed vendors by vendor', { tag: ['@pro', '@admin'] }, async () => { await admin.filterSubscribedVendors(storeName, 'by-vendor'); });
    test('admin can filter subscribed vendors by subscription pack', { tag: ['@pro', '@admin'] }, async () => { await admin.filterSubscribedVendors(subscriptionPack, 'by-pack'); });
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
    test('vendor can view subscriptions menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorSubscriptionsRenderProperly(); });
    test('vendor can buy non recurring subscription pack (on registration)', { tag: ['@pro', '@vendor'] }, async ({ page }) => {
        const vendor = new VendorPage(page);
        await vendor.vendorRegister({ ...data.vendor.vendorInfo, vendorSubscriptionPack: subscriptionPack }, { ...data.vendorSetupWizard, choice: false });
    });
    test('vendor can buy non recurring subscription pack (on subscription page)', { tag: ['@pro', '@vendor'] }, async ({ page }) => {
        const [, sellerId, , vendorName] = await apiUtils.createStore(payloads.createStore(), payloads.adminAuth, true);
        await dbUtils.setUserMeta(sellerId, 'dokan_vendor_seen_setup_wizard', '1');
        const vendor = new VendorSubscriptionsPage(page);
        const orderId = await vendor.buySubscription(vendorName, subscriptionPack);
        await apiUtils.updateOrderStatus(orderId, data.order.orderStatus.completed, payloads.adminAuth);
        await vendor.assertSubscription(subscriptionPack);
    });
    test('vendor can switch subscription', { tag: ['@pro', '@vendor'] }, async ({ page }) => {
        const [, subscriptionPack2] = await createDokanSubscriptionProduct(payloads.createDokanSubscriptionProduct(), { ...payloads.saveVendorSubscriptionProductCommission, commission: { fixed: { percentage: '15', flat: '15' } } });
        const [sellerId, , vendorName] = await apiUtils.assignSubscriptionToVendor(subscriptionPackId);
        await dbUtils.setUserMeta(sellerId, 'dokan_vendor_seen_setup_wizard', '1');
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
    test('admin can disable vendor subscription module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.vendorSubscription, payloads.adminAuth);
        await admin.disableVendorSubscriptionModule();
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Vendor Subscriptions (React) Tests @pro', () => {
    test('Test Case 1 - Page renders without fatal', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/dashboard/user-subscription/`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Page renders content', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/dashboard/user-subscription/`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.trim().length).toBeGreaterThan(50);
        await page.close();
        await ctx.close();
    });
});

