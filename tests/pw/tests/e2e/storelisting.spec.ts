import { test, Page } from '@playwright/test';
import { StoreListingPage } from '@pages/storeListingPage';
import { data } from '@utils/testData';

test.describe('Store list functionality test', () => {
    let customer: StoreListingPage;
    let cPage: Page;

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new StoreListingPage(cPage);
    });

    test.afterAll(async () => {
        await cPage.close();
    });

    // store listing

    test('customer can view store list page', { tag: ['@lite', '@exploratory', '@customer'] }, async () => {
        await customer.storeListRenderProperly();
    });

    test('customer can sort stores', { tag: ['@lite', '@customer'] }, async () => {
        await customer.sortStores(data.storeList.sort);
    });

    test('customer can change store view layout', { tag: ['@lite', '@customer'] }, async () => {
        await customer.storeViewLayout(data.storeList.layout.list);
    });

    test('customer can search store', { tag: ['@lite', '@customer'] }, async () => {
        await customer.searchStore(data.predefined.vendorStores.vendor1);
    });

    test('customer can filter stores by category', { tag: ['@pro', '@customer'] }, async () => {
        await customer.filterStores('by-category', 'Uncategorized');
    });

    test('customer can filter stores by location', { tag: ['@pro', '@customer'] }, async () => {
        await customer.filterStores('by-location', 'New York, NY, USA');
    });

    test.skip('customer can filter stores by ratings', { tag: ['@pro', '@customer'] }, async () => {
        await customer.filterStores('by-ratings', '1');
    });

    test('customer can filter featured stores', { tag: ['@pro', '@customer'] }, async () => {
        await customer.filterStores('featured');
    });

    test.skip('customer can filter open now stores', { tag: ['@pro', '@customer'] }, async () => {
        await customer.filterStores('open-now');
    });

    test('customer can view stores on map', { tag: ['@pro', '@customer'] }, async () => {
        await customer.storeOnMap();
    });

    test('customer can go to single store from store list', { tag: ['@lite', '@customer'] }, async () => {
        await customer.goToSingleStoreFromStoreListing(data.predefined.vendorStores.vendor1);
    });
});
