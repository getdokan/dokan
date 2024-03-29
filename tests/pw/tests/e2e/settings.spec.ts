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

    test('dokan settings menu page is rendering properly @lite @exp @a', async () => {
        await admin.dokanSettingsRenderProperly();
    });

    test('admin can scroll to top on settings @lite @a', async () => {
        await admin.scrollToTopSettings();
    });

    test('admin can search settings @lite @a', async () => {
        await admin.searchSettings('Selling Options');
    });

    // dokan settings

    test('admin can set dokan general settings @lite @a', async () => {
        await admin.setDokanGeneralSettings(data.dokanSettings.general);
    });

    test('admin can set dokan selling settings @lite @a', async () => {
        await admin.setDokanSellingSettings(data.dokanSettings.selling);
    });

    test('admin can set dokan withdraw settings @lite @a', async () => {
        await admin.setDokanWithdrawSettings(data.dokanSettings.withdraw);
    });

    test('admin can set dokan reverse withdraw settings @lite @a', async () => {
        await admin.setDokanReverseWithdrawSettings(data.dokanSettings.reverseWithdraw);
    });

    test('admin can set dokan page settings @lite @a', async () => {
        await admin.setPageSettings(data.dokanSettings.page);
    });

    test('admin can set dokan appearance settings @lite @a', async () => {
        await admin.setDokanAppearanceSettings(data.dokanSettings.appearance);
    });

    test('admin can set dokan privacy policy settings @lite @a', async () => {
        const privacyPolicySettings = await dbUtils.getDokanSettings(dbData.dokan.optionName.privacyPolicy);
        await admin.setDokanPrivacyPolicySettings({ ...data.dokanSettings.privacyPolicy, privacyPage: privacyPolicySettings.privacyPage });
    });

    test('admin can set dokan color settings @pro @a', async () => {
        await admin.setDokanColorSettings(data.dokanSettings.colors);
    });

    test('admin can set dokan live search settings @pro @a', async () => {
        await admin.setDokanLiveSearchSettings(data.dokanSettings.liveSearch);
    });

    test('admin can set dokan store support settings @pro @a', async () => {
        await admin.setDokanStoreSupportSettings(data.dokanSettings.storeSupport);
    });

    test('admin can set dokan email verification settings @pro @a', async () => {
        await admin.setDokanEmailVerificationSettings(data.dokanSettings.emailVerification);
        // reset  settings
        await dbUtils.setDokanSettings(dbData.dokan.optionName.emailVerification, dbData.dokan.emailVerificationSettings);
    });

    test('admin can set dokan shipping status settings @pro @a', async () => {
        await admin.setDokanShippingStatusSettings(data.dokanSettings.shippingStatus);
    });

    test('admin can set dokan quote settings @pro @a', async () => {
        await admin.setDokanQuoteSettings(data.dokanSettings.quote);
    });

    test('admin can set dokan rma settings @pro @a', async () => {
        await admin.setDokanRmaSettings(data.dokanSettings.rma);
    });

    test('admin can set dokan wholesale settings @pro @a', async () => {
        await admin.setDokanWholesaleSettings(data.dokanSettings.wholesale);
    });

    test('admin can set dokan eu compliance settings @pro @a', async () => {
        await admin.setDokanEuComplianceSettings(data.dokanSettings.euCompliance);
    });

    test('admin can set dokan delivery time settings @pro @a', async () => {
        await admin.setDokanDeliveryTimeSettings(data.dokanSettings.deliveryTime);
    });

    test('admin can set dokan product advertising settings @pro @a', async () => {
        await admin.setDokanProductAdvertisingSettings(data.dokanSettings.productAdvertising);
    });

    test('admin can set dokan geolocation settings @pro @a', async () => {
        await admin.setDokanGeolocationSettings(data.dokanSettings.geolocation);
    });

    test('admin can set dokan product report abuse settings @pro @a', async () => {
        await admin.setDokanProductReportAbuseSettings(data.dokanSettings.productReportAbuse);
    });

    test('admin can set dokan spmv settings @pro @a', async () => {
        await admin.setDokanSpmvSettings(data.dokanSettings.spmv);
    });

    test('admin can set dokan vendor subscription settings @pro @a', async () => {
        await admin.setDokanVendorSubscriptionSettings(data.dokanSettings.vendorSubscription);
        await dbUtils.setDokanSettings(dbData.dokan.optionName.vendorSubscription, dbData.dokan.vendorSubscriptionSettings);
    });
});
