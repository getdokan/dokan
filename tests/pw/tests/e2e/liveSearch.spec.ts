import { test, Page, request } from '@playwright/test';
import { LiveSearch } from '@pages/liveSearchPage';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';

test.describe.skip('License test', () => {
    let customer: LiveSearch;
    let cPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new LiveSearch(cPage);

        apiUtils = new ApiUtils(await request.newContext());
        await dbUtils.updateOptionValue('sidebars_widgets', dbData.widget.liveSearch); // todo: doesn't work need to fix
    });

    test.afterAll(async () => {
        await dbUtils.setOptionValue(dbData.dokan.optionName.liveSearch, dbData.dokan.liveSearchSettings);
        await cPage.close();
    });

    // customer

    test('customer can search product using live search (suggestion box)', { tag: ['@pro', '@customer'] }, async () => {
        await customer.searchByLiveSearch(data.predefined.simpleProduct.product1.name);
    });

    test('customer can search product with category using live search (suggestion box)', { tag: ['@pro', '@customer'] }, async () => {
        await customer.searchByLiveSearch(data.predefined.simpleProduct.product1.name, false, data.predefined.categories.uncategorized);
    });

    test('customer can search product using live search (autoload content)', { tag: ['@pro', '@customer'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.liveSearch, { live_search_option: 'old_live_search' });
        await customer.searchByLiveSearch(data.predefined.simpleProduct.product1.name, true);
    });

    test('customer can search product with category using live search (autoload content)', { tag: ['@pro', '@customer'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.liveSearch, { live_search_option: 'old_live_search' });
        await customer.searchByLiveSearch(data.predefined.simpleProduct.product1.name, true, data.predefined.categories.uncategorized);
    });
});
