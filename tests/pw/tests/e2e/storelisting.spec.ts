import { test, request, Page } from '@playwright/test';
import { StoreListingPage } from '@pages/storeListingPage';
// import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
// import { payloads } from '@utils/payloads';

test.describe('Store listing functionality test', () => {
    let customer: StoreListingPage;
    let cPage: Page;
    // let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new StoreListingPage(cPage);
        // apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await cPage.close();
        // await apiUtils.dispose();
    });

    // store listing

    test('dokan store list page is rendering properly @lite @exp @c', async () => {
        await customer.storeListRenderProperly();
    });

    test('customer can sort stores @lite @c', async () => {
        await customer.sortStores(data.storeList.sort);
    });

    test('customer can change store view layout @lite @c', async () => {
        await customer.storeViewLayout(data.storeList.layout.list);
    });

    test('customer can search store @lite @c', async () => {
        await customer.searchStore(data.predefined.vendorStores.vendor1);
    });

    test('customer can filter stores by category @pro @c', async () => {
        await customer.filterStores('by-category', 'Uncategorized');
    });

    test('customer can filter stores by location @pro @c', async () => {
        await customer.filterStores('by-location', 'New York, NY, USA');
    });

    test.skip('customer can filter stores by ratings @pro @c', async () => {
        await customer.filterStores('by-ratings', '1');
    });

    test('customer can filter featured stores @pro @c', async () => {
        await customer.filterStores('featured');
    });

    test.skip('customer can filter open now stores @pro @c', async () => {
        await customer.filterStores('open-now');
    });

    test('customer can view stores on map @pro @c', async () => {
        await customer.storeOnMap();
    });

    test('customer can go to single store from store list @lite @c', async () => {
        await customer.goToSingleStoreFromStoreListing(data.predefined.vendorStores.vendor1);
    });
});
