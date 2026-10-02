import { Page, expect, test } from '@utils/test';
import { VendorProductSubscriptionPage, ApiUtils, data, payloads } from './vendorProductSubscriptionPage';
import path from 'path';

import { toPath } from '@utils/helpers';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

test.describe('Product subscriptions test', () => {
    let admin: VendorProductSubscriptionPage;
    let vendor: VendorProductSubscriptionPage;
    let customer: VendorProductSubscriptionPage;
    let aPage: Page, vPage: Page, cPage: Page;
    let apiUtils: ApiUtils;
    const subscriptionId: string = '1';

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new VendorProductSubscriptionPage(aPage);
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new VendorProductSubscriptionPage(vPage);
        const customerContext = await browser.newContext({ storageState: c1 });
        cPage = await customerContext.newPage();
        customer = new VendorProductSubscriptionPage(cPage);
        apiUtils = new ApiUtils(null);
        await apiUtils.createProduct(payloads.createSimpleSubscriptionProduct(), payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.productSubscription, payloads.adminAuth);
        await aPage?.close();
        await vPage?.close();
        await cPage?.close();
        await apiUtils?.dispose();
    });

    test('admin can enable product subscription module', { tag: ['@pro', '@admin'] }, async () => { await admin.enableProductSubscriptionModule(); });
    test('vendor can view user subscriptions menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorUserSubscriptionsRenderProperly(); });
    test.skip('vendor can view product subscription details', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.filterProductSubscriptions('by-customer', data.customer.username); });
    test.skip('vendor can filter user subscriptions by customer', { tag: ['@pro', '@vendor'] }, async () => { await vendor.filterProductSubscriptions('by-customer', data.customer.username); });
    test.skip('vendor can filter user subscriptions by date', { tag: ['@pro', '@vendor'] }, async () => { await vendor.filterProductSubscriptions('by-date', data.date.previousDate); });
    test.skip('vendor can view user subscription', { tag: ['@pro', '@vendor'] }, async () => { await vendor.viewProductSubscription(data.customer.username); });
    test.skip('customer can view product subscription details', { tag: ['@pro', '@exploratory', '@customer'] }, async () => { await customer.customerViewProductSubscription(subscriptionId); });
    test.skip('customer can cancel subscription', { tag: ['@pro', '@customer'] }, async () => { await customer.cancelProductSubscription(subscriptionId); });
    test.skip('customer can reactivate subscription', { tag: ['@pro', '@customer'] }, async () => { await customer.reactivateProductSubscription(subscriptionId); });
    test.skip('customer can change address of subscription', { tag: ['@pro', '@customer'] }, async () => { await customer.changeAddressOfProductSubscription(subscriptionId, data.customer.customerInfo.shipping); });
    test.skip('customer can change payment of subscription', { tag: ['@pro', '@customer'] }, async () => { await customer.changePaymentOfProductSubscription(subscriptionId); });
    test.skip('customer can renew subscription', { tag: ['@pro', '@customer'] }, async () => { await customer.renewProductSubscription(subscriptionId); });
    test.skip('customer can buy product subscription', { tag: ['@pro', '@customer'] }, async () => { await customer.buyProductSubscription(data.predefined.simpleSubscription.product1); });

    test('admin can disable product subscription module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.productSubscription, payloads.adminAuth);
        await admin.disableProductSubscriptionModule();
    });
});

// ============================================
// LEGACY-URL SMOKES (mislabelled "React" — see NEW-UI-MIGRATION-CHECKLIST.md)
// ============================================
// These navigate the LEGACY product-subscription page
// (`dashboard/user-subscription/`), not the React SPA, so they carry no
// `@new-ui` tag. Real React coverage of `#/user-subscription` lives in
// `vendor-product-subscription/newUserSubscription.spec.ts`. Until 2026-08-14
// this block pointed at `dashboard/subscription/` — the vendor-PACK surface,
// i.e. the other spec's page (handoff item D5).

test.describe('Vendor Product Subscription (React) Tests @pro', () => {
    test('Test Case 1 - Vendor subscription page renders', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/user-subscription/`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Admin subscription dashboard renders', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`wp-admin/admin.php?page=dokan_vendor_subscription`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator(".notice-error, body.error-page").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });
});

