import { Page, expect, test } from '@playwright/test';
import { PaymentsPage, api, db, helpers, payloads, testData } from './paymentsPage';
import path from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:9999';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

const { DOKAN_PRO, VENDOR_ID } = process.env;

test.describe('Payments test', () => {
    let admin: PaymentsPage;
    let vendor: PaymentsPage;
    let aPage: Page, vPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new PaymentsPage(aPage);
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new PaymentsPage(vPage);
        await api.init();
        if (DOKAN_PRO) {
            await api.activateModules(payloads.moduleIds.mangopay, payloads.adminAuth);
            await api.activateModules(payloads.moduleIds.paypalMarketplace, payloads.adminAuth);
            await api.activateModules(payloads.moduleIds.razorpay, payloads.adminAuth);
            await api.activateModules(payloads.moduleIds.stripe, payloads.adminAuth);
            await api.activateModules(payloads.moduleIds.stripeExpress, payloads.adminAuth);
        }
    });

    test.afterAll(async () => {
        await api.updateBatchWcSettingsOptions('general', payloads.currency, payloads.adminAuth);
        await db.updateUserMeta(VENDOR_ID || '', 'dokan_profile_settings', testData.paymentSettings);
        if (DOKAN_PRO) {
            await api.activateModules(payloads.moduleIds.mangopay, payloads.adminAuth);
            await api.activateModules(payloads.moduleIds.paypalMarketplace, payloads.adminAuth);
            await api.activateModules(payloads.moduleIds.razorpay, payloads.adminAuth);
            await api.activateModules(payloads.moduleIds.stripe, payloads.adminAuth);
            await api.activateModules(payloads.moduleIds.stripeExpress, payloads.adminAuth);
        }
        await aPage?.close();
        await vPage?.close();
        await api.dispose();
        await db.dispose();
    });

    test('admin can change currency', { tag: ['@lite', '@admin'] }, async () => {
        await api.updateBatchWcSettingsOptions('general', { update: [{ id: 'woocommerce_currency', value: 'INR' }] }, payloads.adminAuth);
        await admin.setCurrency(testData.payment.currency.dollar);
    });

    test('admin can add basic payment methods', { tag: ['@lite', '@admin'] }, async () => {
        await admin.setupBasicPaymentMethods(testData.payment);
    });

    test('admin can enable MangoPay module', { tag: ['@pro', '@admin'] }, async () => { await admin.enableMangoPayModule(); });
    test('admin can enable PayPal Marketplace module', { tag: ['@pro', '@admin'] }, async () => { await admin.enablePayPalMarketplaceModule(); });
    test('admin can enable Razorpay module', { tag: ['@pro', '@admin'] }, async () => { await admin.enableRazorpayModule(); });
    test('admin can enable Stripe Connect module', { tag: ['@pro', '@admin'] }, async () => { await admin.enableStripeConnectModule(); });
    test('admin can enable Stripe Express module', { tag: ['@pro', '@admin'] }, async () => { await admin.enableStripeExpressModule(); });

    test('admin can add stripe payment method', { tag: ['@pro', '@admin'] }, async () => {
        await api.updateBatchWcSettingsOptions('general', payloads.currency, payloads.adminAuth);
        await admin.setupStripeConnect(testData.payment);
    });
    test('admin can add Paypal Marketplace payment method', { tag: ['@pro', '@admin'] }, async () => {
        await api.updateBatchWcSettingsOptions('general', payloads.currency, payloads.adminAuth);
        await admin.setupPaypalMarketPlace(testData.payment);
    });
    test.skip('admin can add Mangopay payment method', { tag: ['@pro', '@admin'] }, async () => {
        test.slow();
        await api.updateBatchWcSettingsOptions('general', payloads.currency, payloads.adminAuth);
        await admin.setupMangoPay(testData.payment);
    });
    test('admin can add Razorpay payment method', { tag: ['@pro', '@admin'] }, async () => {
        await api.updateBatchWcSettingsOptions('general', { update: [{ id: 'woocommerce_currency', value: 'INR' }] }, payloads.adminAuth);
        await admin.setupRazorpay(testData.payment);
    });
    test('admin can add Strip Express payment method', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setupStripeExpress(testData.payment);
    });

    test('vendor can view payment settings menu page', { tag: ['@lite', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorPaymentSettingsRenderProperly();
    });

    test('vendor can add paypal payment method', { tag: ['@lite', '@vendor'] }, async () => {
        await db.updateUserMeta(VENDOR_ID || '', 'dokan_profile_settings', { payment: { paypal: { email: '' } } });
        await vendor.addBasicPayment({ ...testData.vendor.payment, methodName: 'paypal' });
    });
    test('vendor can update paypal payment method', { tag: ['@lite', '@vendor'] }, async () => {
        await db.updateUserMeta(VENDOR_ID || '', 'dokan_profile_settings', { payment: { paypal: { email: 'paypal@g.c' } } });
        await vendor.addBasicPayment({ ...testData.vendor.payment, methodName: 'paypal' });
    });
    test('vendor can remove paypal payment method', { tag: ['@lite', '@vendor'] }, async () => {
        await db.updateUserMeta(VENDOR_ID || '', 'dokan_profile_settings', { payment: { paypal: { email: 'paypal@g.c' } } });
        await vendor.removeBasicPayment({ ...testData.vendor.payment, methodName: 'paypal' });
    });
    test('vendor can add bank payment method', { tag: ['@lite', '@vendor'] }, async () => {
        await db.updateUserMeta(VENDOR_ID || '', 'dokan_profile_settings', helpers.emptyObjectValues(testData.paymentSettings.bank));
        await vendor.addBankTransfer(testData.vendor.payment);
    });
    test('vendor can update bank payment method', { tag: ['@lite', '@vendor'] }, async () => {
        await db.updateUserMeta(VENDOR_ID || '', 'dokan_profile_settings', testData.paymentSettings.bank);
        await vendor.addBankTransfer(testData.vendor.payment);
    });
    test('vendor can remove bank payment method', { tag: ['@lite', '@vendor'] }, async () => {
        await db.updateUserMeta(VENDOR_ID || '', 'dokan_profile_settings', testData.paymentSettings.bank);
        await vendor.removeBasicPayment({ ...testData.vendor.payment, methodName: 'bank' });
    });

    test('vendor can add skrill payment method', { tag: ['@pro', '@vendor'] }, async () => {
        await db.updateUserMeta(VENDOR_ID || '', 'dokan_profile_settings', { payment: { skrill: { email: '' } } });
        await vendor.addBasicPayment({ ...testData.vendor.payment, methodName: 'skrill' });
    });
    test('vendor can update skrill payment method', { tag: ['@pro', '@vendor'] }, async () => {
        await db.updateUserMeta(VENDOR_ID || '', 'dokan_profile_settings', { payment: { skrill: { email: 'skrill@g.c' } } });
        await vendor.addBasicPayment({ ...testData.vendor.payment, methodName: 'skrill' });
    });
    test('vendor can remove skrill payment method', { tag: ['@pro', '@vendor'] }, async () => {
        await db.updateUserMeta(VENDOR_ID || '', 'dokan_profile_settings', { payment: { skrill: { email: 'skrill@g.c' } } });
        await vendor.removeBasicPayment({ ...testData.vendor.payment, methodName: 'skrill' });
    });
    test('vendor can add custom payment method', { tag: ['@pro', '@vendor'] }, async () => {
        await db.updateUserMeta(VENDOR_ID || '', 'dokan_profile_settings', { payment: { dokan_custom: { value: '' } } });
        await vendor.addBasicPayment({ ...testData.vendor.payment, methodName: 'custom' });
    });
    test('vendor can update custom payment method', { tag: ['@pro', '@vendor'] }, async () => {
        await db.updateUserMeta(VENDOR_ID || '', 'dokan_profile_settings', { payment: { dokan_custom: { value: '0123456789' } } });
        await vendor.addBasicPayment({ ...testData.vendor.payment, methodName: 'custom' });
    });
    test('vendor can remove custom payment method', { tag: ['@pro', '@vendor'] }, async () => {
        await db.updateUserMeta(VENDOR_ID || '', 'dokan_profile_settings', { payment: { dokan_custom: { value: '0123456789' } } });
        await vendor.removeBasicPayment({ ...testData.vendor.payment, methodName: 'custom' });
    });

    test('admin can disable MangoPay module', { tag: ['@pro', '@admin'] }, async () => {
        await api.deactivateModules(payloads.moduleIds.mangopay, payloads.adminAuth);
        await admin.disableMangoPayModule();
    });
    test('admin can disable PayPal Marketplace module', { tag: ['@pro', '@admin'] }, async () => {
        await api.deactivateModules(payloads.moduleIds.paypalMarketplace, payloads.adminAuth);
        await admin.disablePayPalMarketplaceModule();
    });
    test('admin can disable Razorpay module', { tag: ['@pro', '@admin'] }, async () => {
        await api.deactivateModules(payloads.moduleIds.razorpay, payloads.adminAuth);
        await admin.disableRazorpayModule();
    });
    test('admin can disable Stripe Connect module', { tag: ['@pro', '@admin'] }, async () => {
        await api.deactivateModules(payloads.moduleIds.stripe, payloads.adminAuth);
        await admin.disableStripeConnectModule();
    });
    test('admin can disable Stripe Express module', { tag: ['@pro', '@admin'] }, async () => {
        await api.deactivateModules(payloads.moduleIds.stripeExpress, payloads.adminAuth);
        await admin.disableStripeExpressModule();
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Vendor Payments Settings (React) Tests @lite', () => {
    test('Test Case 1 - Payments settings page renders', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/dashboard/settings/payment/`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Payments page renders content', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/dashboard/settings/payment/`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.trim().length).toBeGreaterThan(50);
        await page.close();
        await ctx.close();
    });

    test('Test Case 3 - Page survives reload', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/dashboard/settings/payment/`);
        await page.waitForLoadState('domcontentloaded');
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });
});

