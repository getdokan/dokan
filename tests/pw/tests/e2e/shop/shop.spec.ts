import { test, Page } from '@utils/test';
import { ShopPage, data } from './shopPage';
import path from 'path';

const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

test.describe('Shop functionality test', () => {
    let customer: ShopPage;
    let cPage: Page;

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext({ storageState: c1 });
        cPage = await customerContext.newPage();
        customer = new ShopPage(cPage);
    });

    test.afterAll(async () => { await cPage?.close(); });

    test('customer can view shop page', { tag: ['@lite', '@exploratory', '@customer'] }, async () => { await customer.shopRenderProperly(); });
    test('customer can sort products', { tag: ['@lite', '@customer'] }, async () => { await customer.sortProducts('price'); });
    test('customer can search product', { tag: ['@lite', '@customer'] }, async () => { await customer.searchProduct(data.predefined.simpleProduct.product1.name); });
    test('customer can filter products by category', { tag: ['@pro', '@customer'] }, async () => {});
    test('customer can filter products by location', { tag: ['@pro', '@customer'] }, async () => { await customer.filterProducts('by-location', 'New York, NY, USA'); });
    test('customer can view products list on map', { tag: ['@pro', '@customer'] }, async () => { await customer.productOnMap(); });
    test('customer can go to product details from shop', { tag: ['@lite', '@customer'] }, async () => { await customer.goToProductDetailsFromShop(data.predefined.simpleProduct.product1.name); });
});
