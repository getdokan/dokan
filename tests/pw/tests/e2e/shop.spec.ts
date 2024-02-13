import { test, request, Page } from '@playwright/test';
import { ShopPage } from '@pages/shopPage';
// import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
// import { payloads } from '@utils/payloads';

test.describe('Shop functionality test', () => {
    let customer: ShopPage;
    let cPage: Page;
    // let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new ShopPage(cPage);

        // apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await cPage.close();
        // await apiUtils.dispose();
    });

    // shop page

    test('shop page is rendering properly @lite @exp @c', async () => {
        await customer.shopRenderProperly();
    });

    test('customer can sort products @lite @c', async () => {
        await customer.sortProducts('price');
    });

    test('customer can search product @lite @c', async () => {
        await customer.searchProduct(data.predefined.simpleProduct.product1.name);
    });

    test('customer can filter products by category @pro @c', async () => {
        await customer.filterProducts('by-category', 'uncategorized');
    });

    test('customer can filter products by location @pro @c', async () => {
        await customer.filterProducts('by-location', 'New York, NY, USA');
    });

    test('customer can view products list on map @pro @c', async () => {
        await customer.productOnMap();
    });

    test('customer can go to product details from shop @lite @c', async () => {
        await customer.goToProductDetailsFromShop(data.predefined.simpleProduct.product1.name);
    });
});
