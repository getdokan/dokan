import { test, request, Page } from '@playwright/test';
import { PrivacyPolicyPage } from '@pages/privacyPolicyPage';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';

test.describe('Privacy Policy & Store Contact form test', () => {
    let customer: PrivacyPolicyPage;
    let cPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new PrivacyPolicyPage(cPage);
        apiUtils = new ApiUtils(await request.newContext());

        // await dbUtils.updateOptionValue('widget_dokan-store-contact-widget', dbData.storeContactFormWidget);
        // await dbUtils.updateOptionValue('sidebars_widgets', { ...dbData.sidebarWidgets, 'sidebar-store': ['dokan-store-contact-widget-2'] });
    });

    test.afterAll(async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.privacyPolicy, { enable_privacy: 'on' });
        await dbUtils.updateOptionValue(dbData.dokan.optionName.appearance, { contact_seller: 'on' });
        await dbUtils.setOptionValue('sidebars_widgets', dbData.emptySideBarsWidgets); // todo: remove in future
        await cPage.close();
        await apiUtils.dispose();
    });

    test('customer can contact vendor', { tag: ['@lite', '@customer'] }, async () => {
        await customer.contactVendor(data.predefined.vendorStores.vendor1, data.storeContactData);
    });

    test('customer can navigate to Dokan privacy policy', { tag: ['@lite', '@customer'] }, async () => {
        await customer.goToPrivacyPolicy(data.predefined.vendorStores.vendor1);
    });

    test('admin can disable privacy policy on store contact form', { tag: ['@lite', '@customer'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.privacyPolicy, { enable_privacy: 'off' });
        await customer.disablePrivacyPolicy(data.predefined.vendorStores.vendor1);
    });

    test('admin can disable store contact form from store sidebar', { tag: ['@lite', '@customer'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.appearance, { contact_seller: 'off' });
        await customer.disableStoreContactForm(data.predefined.vendorStores.vendor1);
    });
});
