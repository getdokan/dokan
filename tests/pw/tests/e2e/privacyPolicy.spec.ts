import { test, request, Page } from '@playwright/test';
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

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customerPage = new CustomerPage(cPage);
        customer = new PrivacyPolicy(cPage);

        apiUtils = new ApiUtils(await request.newContext());
        privacyPolicySettings = await dbUtils.getDokanSettings(dbData.dokan.optionName.privacyPolicy);
    });

    test.afterAll(async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.privacyPolicy, { ...privacyPolicySettings, enable_privacy: 'on' });
        await dbUtils.setDokanSettings(dbData.dokan.optionName.appearance, dbData.dokan.appearanceSettings);
        await cPage.close();
        await apiUtils.dispose();
    });

    test('customer can contact vendor', { tag: ['@lite', '@customer'] }, async () => {
        await customer.contactVendor(data.predefined.vendorStores.vendor1, data.storeContactData);
    });

    test('customer can navigate to Dokan privacy policy', { tag: ['@lite', '@customer'] }, async () => {
        await customer.goToPrivacyPolicy(data.predefined.vendorStores.vendor1);
    });

    test('admin can disable privacy policy on store contact form', { tag: ['@lite', '@customer'] }, async () => {  //todo: mighit need to update title form customer perspective
        await dbUtils.setDokanSettings(dbData.dokan.optionName.privacyPolicy, { ...privacyPolicySettings, enable_privacy: 'off' });
        await customer.disablePrivacyPolicy(data.predefined.vendorStores.vendor1);
    });

    test('admin can disable store contact form from store sidebar', { tag: ['@lite', '@customer'] }, async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.appearance, { ...dbData.dokan.appearanceSettings, contact_seller: 'off' });
        await customer.disableStoreContactForm(data.predefined.vendorStores.vendor1);
    });
});
