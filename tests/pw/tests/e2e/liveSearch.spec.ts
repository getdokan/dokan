import { test, Page, request } from '@playwright/test';
import { LiveSearch } from '@pages/liveSearchPage';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';
import { payloads } from '@utils/payloads';
import { ap } from '@faker-js/faker/dist/airline-BnpeTvY9';

test.describe('Live search test', () => {
    let admin: LiveSearch;
    let customer: LiveSearch;
    let aPage: Page, cPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new LiveSearch(aPage);

        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new LiveSearch(cPage);

        apiUtils = new ApiUtils(await request.newContext());

        await dbUtils.updateOptionValue(dbData.dokanWidgets.names.liveSearch, dbData.dokanWidgets.values.liveSearchWidget);
        await dbUtils.updateOptionValue('sidebars_widgets', { ...dbData.sidebarWidgets, 'sidebar-1': [dbData.dokanWidgets.widgets.liveSearch] });
        await dbUtils.setOptionValue(dbData.dokan.optionName.liveSearch, dbData.dokan.liveSearchSettings);
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.liveSearch, payloads.adminAuth);
        await cPage.close();
        await apiUtils.dispose();
    });

    // admin

    test('admin can enable live search module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enableLiveSearchModule();
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

    // admin

    test('admin can disable live search module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.liveSearch, payloads.adminAuth);
        await admin.disableLiveSearchModule();
    });
});
