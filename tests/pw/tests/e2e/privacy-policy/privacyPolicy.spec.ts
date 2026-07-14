import { test, Page, request } from '@utils/test';
import { PrivacyPolicyPage, ApiUtils, data, dbData, dbUtils, seedPrivacyPage } from './privacyPolicyPage';
import path from 'path';

const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

test.describe('Privacy Policy & Store Contact form test', () => {
    let customer: PrivacyPolicyPage;
    let cPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext({ storageState: c1 });
        cPage = await customerContext.newPage();
        customer = new PrivacyPolicyPage(cPage);
        apiUtils = new ApiUtils(await request.newContext());
        // Deterministic start state: privacy policy + store contact form ON, so the
        // navigate/disable cases don't depend on a prior run's leftover option state.
        // seedPrivacyPage also creates/points `dokan_privacy.privacy_page` at a real
        // published page — without it the `a.dokan-privacy-policy-link` never renders
        // (CI's fresh setup leaves privacy_page empty; the shared Docker masked this).
        await seedPrivacyPage(apiUtils);
        await dbUtils.updateOptionValue(dbData.dokan.optionName.appearance, { contact_seller: 'on' });
    });

    test.afterAll(async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.privacyPolicy, { enable_privacy: 'on' });
        await dbUtils.updateOptionValue(dbData.dokan.optionName.appearance, { contact_seller: 'on' });
        await dbUtils.setOptionValue('sidebars_widgets', dbData.emptySideBarsWidgets);
        await cPage?.close();
        await apiUtils.dispose();
    });

    test.skip('customer can contact vendor', { tag: ['@lite', '@customer'] }, async () => {
        await customer.contactVendor(data.predefined.vendorStores.vendor1, data.storeContactData);
    });

    test('customer can navigate to Dokan privacy policy', { tag: ['@lite', '@customer'] }, async () => {
        await customer.goToPrivacyPolicy(data.predefined.vendorStores.vendor1);
    });

    test('admin can disable privacy policy on store contact form', { tag: ['@lite', '@customer'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.privacyPolicy, { enable_privacy: 'off' });
        await customer.disablePrivacyPolicy(data.predefined.vendorStores.vendor1);
    });

    test.skip('admin can disable store contact form from store sidebar', { tag: ['@lite', '@customer'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.appearance, { contact_seller: 'off' });
        await customer.disableStoreContactForm(data.predefined.vendorStores.vendor1);
    });
});
