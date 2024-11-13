import { test, Page } from '@playwright/test';
import { LiveSearch } from '@pages/liveSearchPage';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';

test.describe('Live search test', () => {
    let customer: LiveSearch;
    let cPage: Page;

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new LiveSearch(cPage);

        await dbUtils.updateOptionValue('widget_dokna_product_search', dbData.liveSearchWidget);
        await dbUtils.updateOptionValue('sidebars_widgets', { ...dbData.sidebarWidgets, 'sidebar-1': ['dokna_product_search-2'] });
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
