import { test, Page } from '@playwright/test';
import { StoreAppearance } from '@pages/storeAppearance';
// import { CustomerPage } from '@pages/customerPage';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';

test.describe.skip('Store Appearance test', () => {
    let customer: StoreAppearance;
    // let customerPage: CustomerPage;
    let cPage: Page;

    // todo: need to remove default dokan store sidebar content

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        // customerPage = new CustomerPage(cPage);
        customer = new StoreAppearance(cPage);
    });

    test.afterAll(async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.appearance, { store_map: 'on', store_open_close: 'on', hide_vendor_info: { email: '', phone: '', address: '' } });
        await cPage.close();
    });

    test('store map is disabled on store sidebar', { tag: ['@lite', '@customer'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.appearance, { store_map: 'off' });
        await customer.disableMapOnStoreSidebar(data.predefined.vendorStores.vendor1);
    });

    test('store open-close time is disabled store sidebar', { tag: ['@lite', '@customer'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.appearance, { store_open_close: 'off' });
        await customer.disableStoreOpenCloseTimeOnStoreSidebar(data.predefined.vendorStores.vendor1);
    });

    test.skip('vendor info is disabled on single store page', { tag: ['@lite', '@customer'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.appearance, { hide_vendor_info: { email: 'email', phone: 'phone', address: 'address' } });
        await customer.disableVendorInfoOnSingleStorePage(data.predefined.vendorStores.vendor1);
    });
});
