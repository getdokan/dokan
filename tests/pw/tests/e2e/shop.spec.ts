import { test, Page } from '@playwright/test';
import { ShopPage } from '@pages/shopPage';
import { data } from '@utils/testData';

test.describe('Shop functionality test', () => {
    let customer: ShopPage;
    let cPage: Page;

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new ShopPage(cPage);
    });

    test.afterAll(async () => {
        await cPage.close();
    });

    // shop page

    test('customer can view shop page', { tag: ['@lite', '@exploratory', '@customer'] }, async () => {
        await customer.shopRenderProperly();
    });

    test('customer can sort products', { tag: ['@lite', '@customer'] }, async () => {
        await customer.sortProducts('price');
    });

    test('customer can search product', { tag: ['@lite', '@customer'] }, async () => {
        await customer.searchProduct(data.predefined.simpleProduct.product1.name);
    });

    test('customer can filter products by category', { tag: ['@pro', '@customer'] }, async () => {
        await customer.filterProducts('by-category', 'uncategorized');
    });

    test('customer can filter products by location', { tag: ['@pro', '@customer'] }, async () => {
        await customer.filterProducts('by-location', 'New York, NY, USA');
    });

    test('customer can view products list on map', { tag: ['@pro', '@customer'] }, async () => {
        await customer.productOnMap();
    });

    test('customer can go to product details from shop', { tag: ['@lite', '@customer'] }, async () => {
        await customer.goToProductDetailsFromShop(data.predefined.simpleProduct.product1.name);
    });
});
