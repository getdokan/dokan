import { test, Page } from '@playwright/test';
import { PrivacyPolicy } from '@pages/privacyPolicyPage';
import { CustomerPage } from '@pages/customerPage';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';

test.describe.skip('Privacy Policy & Store Contact form test', () => {
    let customer: PrivacyPolicy;
    let customerPage: CustomerPage;
    let cPage: Page;
    let apiUtils: ApiUtils;
    let privacyPolicySettings: object;

    test.beforeAll(async ({ browser, request }) => {
        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customerPage = new CustomerPage(cPage);
        customer = new PrivacyPolicy(cPage);

        apiUtils = new ApiUtils(request);
        privacyPolicySettings = await dbUtils.getDokanSettings(dbData.dokan.optionName.privacyPolicy);
    });

    test.afterAll(async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.privacyPolicy, { ...privacyPolicySettings, enable_privacy: 'on' });
        await dbUtils.setDokanSettings(dbData.dokan.optionName.appearance, dbData.dokan.appearanceSettings);
        await cPage.close();
    });

    test('customer can contact vendor @lite', async () => {
        await customer.contactVendor(data.predefined.vendorStores.vendor1, data.storeContactData);
    });

    test('customer can navigate to dokan privacy policy @lite', async () => {
        await customer.goToPrivacyPolicy(data.predefined.vendorStores.vendor1);
    });

    test('privacy policy is disabled on store contact form @lite', async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.privacyPolicy, { ...privacyPolicySettings, enable_privacy: 'off' });
        await customer.disablePrivacyPolicy(data.predefined.vendorStores.vendor1);
    });

    test('store contact form is disabled on store sidebar @lite', async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.appearance, { ...dbData.dokan.appearanceSettings, contact_seller: 'off' });
        await customer.disableStoreContactForm(data.predefined.vendorStores.vendor1);
    });
});
