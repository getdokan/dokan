import { Page, expect, test } from '@utils/test';
import { SettingsPage, dbData, dbUtils, data } from './settingsPage';
import path from 'path';

import { toPath } from '@utils/helpers';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');

test.describe('Settings test', () => {
    let admin: SettingsPage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new SettingsPage(aPage);
    });

    test.afterAll(async () => {
        await aPage?.close();
    });

    test('admin can view settings menu page', { tag: ['@lite', '@exploratory', '@admin'] }, async () => { await admin.dokanSettingsRenderProperly(); });
    test('admin can scroll to top on settings', { tag: ['@lite', '@admin'] }, async () => { await admin.scrollToTopSettings(); });
    test('admin can search settings', { tag: ['@lite', '@admin'] }, async () => { await admin.searchSettings('Selling Options'); });
    test.skip('admin can set Dokan general settings', { tag: ['@lite', '@admin'] }, async () => { await admin.setDokanGeneralSettings(data.dokanSettings.general); });
    test.skip('admin can set Dokan selling settings', { tag: ['@lite', '@admin'] }, async () => { await admin.setDokanSellingSettings(data.dokanSettings.selling); });
    test('admin can set Dokan withdraw settings', { tag: ['@lite', '@admin'] }, async () => { await admin.setDokanWithdrawSettings(data.dokanSettings.withdraw); });
    test('admin can set Dokan reverse withdraw settings', { tag: ['@lite', '@admin'] }, async () => { await admin.setDokanReverseWithdrawSettings(data.dokanSettings.reverseWithdraw); });
    test('admin can set Dokan page settings', { tag: ['@lite', '@admin'] }, async () => { await admin.setPageSettings(data.dokanSettings.page); });
    test('admin can set Dokan appearance settings', { tag: ['@lite', '@admin'] }, async () => { await admin.setDokanAppearanceSettings(data.dokanSettings.appearance); });
    test('admin can set Dokan menu manager settings', { tag: ['@pro', '@admin'] }, async () => { await admin.setDokanMenuManagerSettings(data.dokanSettings.menuManager.menus); });

    test('admin can set Dokan privacy policy settings', { tag: ['@lite', '@admin'] }, async () => {
        const privacyPolicySettings = await dbUtils.getOptionValue(dbData.dokan.optionName.privacyPolicy);
        await admin.setDokanPrivacyPolicySettings({ ...data.dokanSettings.privacyPolicy, privacyPage: privacyPolicySettings.privacyPage });
    });

    test('admin can set Dokan colors settings', { tag: ['@pro', '@admin'] }, async () => { await admin.setDokanColorSettings(data.dokanSettings.colors.predefinedPalette.tree); });
    test('admin can set Dokan live search settings', { tag: ['@pro', '@admin'] }, async () => { await admin.setDokanLiveSearchSettings(data.dokanSettings.liveSearch); });
    test('admin can set Dokan store support settings', { tag: ['@pro', '@admin'] }, async () => { await admin.setDokanStoreSupportSettings(data.dokanSettings.storeSupport); });
    test('admin can set Dokan vendor verification settings', { tag: ['@pro', '@admin'] }, async () => { await admin.setDokanVendorVerificationSettings(data.dokanSettings.vendorVerification); });
    test('admin can set Dokan verification sms gateways settings', { tag: ['@pro', '@admin'] }, async () => { await admin.setDokanSMSVerificationGatewaysSettings(data.dokanSettings.verificationSmsGateway); });

    test('admin can set Dokan email verification settings', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setDokanEmailVerificationSettings(data.dokanSettings.emailVerification);
        await dbUtils.setOptionValue(dbData.dokan.optionName.emailVerification, dbData.dokan.emailVerificationSettings);
    });

    test('admin can set Dokan social api settings', { tag: ['@pro', '@admin'] }, async () => { await admin.setDokanSocialApiSettings(data.dokanSettings.socialApi); });
    test('admin can set Dokan shipping status settings', { tag: ['@pro', '@admin'] }, async () => { await admin.setDokanShippingStatusSettings(data.dokanSettings.shippingStatus); });
    test('admin can set Dokan quote settings', { tag: ['@pro', '@admin'] }, async () => { await admin.setDokanQuoteSettings(data.dokanSettings.quote); });
    test('admin can set Dokan live chat settings', { tag: ['@pro', '@admin'] }, async () => { await admin.setDokanLiveChatSettings(data.dokanSettings.liveChat); });
    test('admin can set Dokan rma settings', { tag: ['@pro', '@admin'] }, async () => { await admin.setDokanRmaSettings(data.dokanSettings.rma); });
    test('admin can set Dokan wholesale settings', { tag: ['@pro', '@admin'] }, async () => { await admin.setDokanWholesaleSettings(data.dokanSettings.wholesale); });
    test('admin can set Dokan eu compliance settings', { tag: ['@pro', '@admin'] }, async () => { await admin.setDokanEuComplianceSettings(data.dokanSettings.euCompliance); });
    test('admin can set Dokan delivery time settings', { tag: ['@pro', '@admin'] }, async () => { await admin.setDokanDeliveryTimeSettings(data.dokanSettings.deliveryTime); });
    test('admin can set Dokan product advertising settings', { tag: ['@pro', '@admin'] }, async () => { await admin.setDokanProductAdvertisingSettings(data.dokanSettings.productAdvertising); });
    test('admin can set Dokan geolocation settings', { tag: ['@pro', '@admin'] }, async () => { await admin.setDokanGeolocationSettings(data.dokanSettings.geolocation); });
    test('admin can set Dokan product report abuse settings', { tag: ['@pro', '@admin'] }, async () => { await admin.setDokanProductReportAbuseSettings(data.dokanSettings.productReportAbuse); });
    test('admin can set Dokan SPMV settings', { tag: ['@pro', '@admin'] }, async () => { await admin.setDokanSpmvSettings(data.dokanSettings.spmv); });
    test('admin can set Dokan Printful settings', { tag: ['@pro', '@admin'] }, async () => { await admin.setDokanPrintfulSettings(data.dokanSettings.printful); });

    test('admin can set Dokan vendor subscription settings', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setDokanVendorSubscriptionSettings(data.dokanSettings.vendorSubscription);
        await dbUtils.setOptionValue(dbData.dokan.optionName.vendorSubscription, dbData.dokan.vendorSubscriptionSettings);
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Admin Settings (React) Tests @lite', () => {
    test('Test Case 1 - Settings page mounts', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`wp-admin/admin.php?page=dokan#/settings`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        const fatal = await page.locator(".notice-error, body.error-page").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Settings page shows section headings', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`wp-admin/admin.php?page=dokan#/settings`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(4000);
        // Settings page renders various section headings (General, Selling, Withdraw etc.)
        const headings = page.locator("h1, h2, h3").filter({ hasText: /general|settings|selling|withdraw|appearance/i });
        await expect(headings.first()).toBeVisible({ timeout: 10000 });
        await page.close();
        await ctx.close();
    });

    test('Test Case 3 - Settings page survives reload', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`wp-admin/admin.php?page=dokan#/settings`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
        const fatal = await page.locator(".notice-error, body.error-page").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });
});

