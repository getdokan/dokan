import { test, Page } from '@playwright/test';
import { SettingsPage } from 'pages/settingsPage';
import { dbData } from 'utils/dbData';
import { dbUtils } from 'utils/dbUtils';
import { data } from 'utils/testData';

test.describe('Settings test', () => {
    let settingsPage: SettingsPage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        settingsPage = new SettingsPage(aPage);
    });

    test.afterAll(async () => {
        await aPage.close();
    });

    test('dokan settings menu page is rendering properly @lite @explo', async () => {
        await settingsPage.dokanSettingsRenderProperly();
    });

    test('admin can scroll to top on settings @lite', async () => {
        await settingsPage.scrollToTopSettings();
    });

    test('admin can search settings @lite', async () => {
        await settingsPage.searchSettings('Selling Options');
    });

    // dokan settings

    test('admin can set dokan general settings @lite', async () => {
        await settingsPage.setDokanGeneralSettings(data.dokanSettings.general);
    });

    test('admin can set dokan selling settings @lite', async () => {
        await settingsPage.setDokanSellingSettings(data.dokanSettings.selling);
    });

    test('admin can set dokan withdraw settings @lite', async () => {
        await settingsPage.setDokanWithdrawSettings(data.dokanSettings.withdraw);
    });

    test('admin can set dokan reverse withdraw settings @lite', async () => {
        await settingsPage.setDokanReverseWithdrawSettings(data.dokanSettings.reverseWithdraw);
    });

    test('admin can set dokan page settings @lite', async () => {
        await settingsPage.setPageSettings(data.dokanSettings.page);
    });

    test('admin can set dokan appearance settings @lite', async () => {
        await settingsPage.setDokanAppearanceSettings(data.dokanSettings.appearance);
    });

    test('admin can set dokan privacy policy settings @lite', async () => {
        await settingsPage.setDokanPrivacyPolicySettings(data.dokanSettings.privacyPolicy);
    });

    test('admin can set dokan color settings @pro', async () => {
        await settingsPage.setDokanColorSettings(data.dokanSettings.colors);
    });

    test('admin can set dokan live search settings @pro', async () => {
        await settingsPage.setDokanLiveSearchSettings(data.dokanSettings.liveSearch);
    });

    test('admin can set dokan store support settings @pro', async () => {
        await settingsPage.setDokanStoreSupportSettings(data.dokanSettings.storeSupport);
    });

    test('admin can set dokan email verification settings @pro', async () => {
        await settingsPage.setDokanEmailVerificationSettings(data.dokanSettings.emailVerification);
        // reset  settings
        await dbUtils.setDokanSettings(dbData.dokan.optionName.emailVerification, dbData.dokan.emailVerificationSettings);
    });

    test('admin can set dokan shipping status settings @pro', async () => {
        await settingsPage.setDokanShippingStatusSettings(data.dokanSettings.shippingStatus);
    });

    test('admin can set dokan quote settings @pro', async () => {
        await settingsPage.setDokanQuoteSettings(data.dokanSettings.quote);
    });

    test('admin can set dokan rma settings @pro', async () => {
        await settingsPage.setDokanRmaSettings(data.dokanSettings.rma);
    });

    test('admin can set dokan wholesale settings @pro', async () => {
        await settingsPage.setDokanWholesaleSettings(data.dokanSettings.wholesale);
    });

    test('admin can set dokan eu compliance settings @pro', async () => {
        await settingsPage.setDokanEuComplianceSettings(data.dokanSettings.euCompliance);
    });

    test('admin can set dokan delivery time settings @pro', async () => {
        await settingsPage.setDokanDeliveryTimeSettings(data.dokanSettings.deliveryTime);
    });

    test('admin can set dokan product advertising settings @pro', async () => {
        await settingsPage.setDokanProductAdvertisingSettings(data.dokanSettings.productAdvertising);
    });

    test('admin can set dokan geolocation settings @pro', async () => {
        await settingsPage.setDokanGeolocationSettings(data.dokanSettings.geolocation);
    });

    test('admin can set dokan product report abuse settings @pro', async () => {
        await settingsPage.setDokanProductReportAbuseSettings(data.dokanSettings.productReportAbuse);
    });

    test('admin can set dokan spmv settings @pro', async () => {
        await settingsPage.setDokanSpmvSettings(data.dokanSettings.spmv);
    });

    test('admin can set dokan vendor subscription settings @pro', async () => {
        await settingsPage.setDokanVendorSubscriptionSettings(data.dokanSettings.vendorSubscription);
        await dbUtils.setDokanSettings(dbData.dokan.optionName.vendorSubscription, dbData.dokan.vendorSubscriptionSettings);
    });
});
