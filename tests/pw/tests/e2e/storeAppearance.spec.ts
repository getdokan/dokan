import { test, Page } from '@playwright/test';
import { StoreAppearance } from '@pages/storeAppearance';
import { CustomerPage } from '@pages/customerPage';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';

test.describe('Store Appearance test', () => {
    let customer: StoreAppearance;
    let customerPage: CustomerPage;
    let cPage: Page;
    let apiUtils: ApiUtils;
    let privacyPolicySettings: object;

    test.beforeAll(async ({ browser, request }) => {
        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customerPage = new CustomerPage(cPage);
        customer = new StoreAppearance(cPage);

        apiUtils = new ApiUtils(request);
        privacyPolicySettings = await dbUtils.getDokanSettings(dbData.dokan.optionName.privacyPolicy);
    });

    test.afterAll(async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.appearance, dbData.dokan.appearanceSettings);
        await cPage.close();
    });

    test('store map is disabled on store sidebar @lite', async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.appearance, { ...dbData.dokan.appearanceSettings, store_map: 'off' });
        await customer.disableMapOnStoreSidebar(data.predefined.vendorStores.vendor1);
    });

    test('store open-close time is disabled store sidebar @lite', async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.appearance, { ...dbData.dokan.appearanceSettings, store_open_close: 'off' });
        await customer.disableStoreOpenCloseTimeOnStoreSidebar(data.predefined.vendorStores.vendor1);
    });

    test('vendor info is disabled on single store page @lite', async () => {
        console.log(await dbUtils.getDokanSettings(dbData.dokan.optionName.appearance));
        // await dbUtils.setDokanSettings(dbData.dokan.optionName.appearance, {
        //     ...dbData.dokan.appearanceSettings,
        //     hide_vendor_info: { email: 'email', phone: 'phone', address: 'address' },
        // });
        // console.log(await dbUtils.getDokanSettings(dbData.dokan.optionName.appearance));
        // await customer.disableVendorInfoOnSingleStorePage(data.predefined.vendorStores.vendor1);
    });
});
