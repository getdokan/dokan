import { test, Page } from '@playwright/test';
import { SettingsPage } from '@pages/settingsPage';
import { dbData } from '@utils/dbData';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';

test.describe('Settings test', () => {
    let admin: SettingsPage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new SettingsPage(aPage);
    });

    test.afterAll(async () => {
        await aPage.close();
    });

    test('admin can view settings menu page', { tag: ['@lite', '@exploratory', '@admin'] }, async () => {
        await admin.dokanSettingsRenderProperly();
    });

    test('admin can scroll to top on settings', { tag: ['@lite', '@admin'] }, async () => {
        await admin.scrollToTopSettings();
    });

    test('admin can search settings', { tag: ['@lite', '@admin'] }, async () => {
        await admin.searchSettings('Selling Options');
    });

    // Dokan settings

    test('admin can set Dokan general settings', { tag: ['@lite', '@admin'] }, async () => {
        await admin.setDokanGeneralSettings(data.dokanSettings.general);
    });

    test('admin can set Dokan selling settings', { tag: ['@lite', '@admin'] }, async () => {
        await admin.setDokanSellingSettings(data.dokanSettings.selling);
    });

    test('admin can set Dokan withdraw settings', { tag: ['@lite', '@admin'] }, async () => {
        await admin.setDokanWithdrawSettings(data.dokanSettings.withdraw);
    });

    test('admin can set Dokan reverse withdraw settings', { tag: ['@lite', '@admin'] }, async () => {
        await admin.setDokanReverseWithdrawSettings(data.dokanSettings.reverseWithdraw);
    });

    test('admin can set Dokan page settings', { tag: ['@lite', '@admin'] }, async () => {
        await admin.setPageSettings(data.dokanSettings.page);
    });

    test('admin can set Dokan appearance settings', { tag: ['@lite', '@admin'] }, async () => {
        await admin.setDokanAppearanceSettings(data.dokanSettings.appearance);
    });

    test('admin can set Dokan privacy policy settings', { tag: ['@lite', '@admin'] }, async () => {
        const privacyPolicySettings = await dbUtils.getDokanSettings(dbData.dokan.optionName.privacyPolicy);
        await admin.setDokanPrivacyPolicySettings({ ...data.dokanSettings.privacyPolicy, privacyPage: privacyPolicySettings.privacyPage });
    });

    test('admin can set Dokan color settings', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setDokanColorSettings(data.dokanSettings.colors);
    });

    test('admin can set Dokan live search settings', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setDokanLiveSearchSettings(data.dokanSettings.liveSearch);
    });

    test('admin can set Dokan store support settings', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setDokanStoreSupportSettings(data.dokanSettings.storeSupport);
    });

    test('admin can set Dokan email verification settings', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setDokanEmailVerificationSettings(data.dokanSettings.emailVerification);
        // reset  settings
        await dbUtils.setDokanSettings(dbData.dokan.optionName.emailVerification, dbData.dokan.emailVerificationSettings);
    });

    test('admin can set Dokan shipping status settings', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setDokanShippingStatusSettings(data.dokanSettings.shippingStatus);
    });

    test('admin can set Dokan quote settings', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setDokanQuoteSettings(data.dokanSettings.quote);
    });

    test('admin can set Dokan rma settings', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setDokanRmaSettings(data.dokanSettings.rma);
    });

    test('admin can set Dokan wholesale settings', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setDokanWholesaleSettings(data.dokanSettings.wholesale);
    });

    test('admin can set Dokan eu compliance settings', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setDokanEuComplianceSettings(data.dokanSettings.euCompliance);
    });

    test('admin can set Dokan delivery time settings', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setDokanDeliveryTimeSettings(data.dokanSettings.deliveryTime);
    });

    test('admin can set Dokan product advertising settings', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setDokanProductAdvertisingSettings(data.dokanSettings.productAdvertising);
    });

    test('admin can set Dokan geolocation settings', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setDokanGeolocationSettings(data.dokanSettings.geolocation);
    });

    test('admin can set Dokan product report abuse settings', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setDokanProductReportAbuseSettings(data.dokanSettings.productReportAbuse);
    });

    test('admin can set Dokan SPMV settings', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setDokanSpmvSettings(data.dokanSettings.spmv);
    });

    test('admin can set Dokan vendor subscription settings', { tag: ['@pro', '@admin'] }, async () => {
        await admin.setDokanVendorSubscriptionSettings(data.dokanSettings.vendorSubscription);
        await dbUtils.setDokanSettings(dbData.dokan.optionName.vendorSubscription, dbData.dokan.vendorSubscriptionSettings);
    });
});
