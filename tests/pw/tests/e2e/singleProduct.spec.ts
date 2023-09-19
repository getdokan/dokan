import { test, Page } from '@playwright/test';
import { SingleProductPage } from 'pages/singleProductPage';
// import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
// import { payloads } from 'utils/payloads';

test.describe('Single product functionality test', () => {
    let customer: SingleProductPage;
    let cPage: Page;
    // let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new SingleProductPage(cPage);
        // apiUtils = new ApiUtils(request);
    });

    test.afterAll(async () => {
        await cPage.close();
    });

    // single product page

    test('single product is rendering properly @lite @explo', async () => {
        await customer.singleProductRenderProperly(data.predefined.simpleProduct.product1.name);
    });

    test('customer can view highlighted vendor info @lite', async () => {
        await customer.viewHighlightedVendorInfo(data.predefined.simpleProduct.product1.name);
    });

    test('customer can view product vendor info @lite', async () => {
        await customer.productVendorInfo(data.predefined.simpleProduct.product1.name);
    });

    test('customer can view product location @pro', async () => {
        await customer.productLocation(data.predefined.simpleProduct.product1.name);
    });

    test('customer can view product warranty policy @pro', async () => {
        await customer.productWarrantyPolicy(data.predefined.simpleProduct.product1.name);
    });

    test('customer can view more products @lite', async () => {
        await customer.viewMoreProducts(data.predefined.simpleProduct.product1.name);
    });

    test('customer can view related products @lite', async () => {
        await customer.viewRelatedProducts(data.predefined.simpleProduct.product1.name);
    });

    test('customer can review product @lite', async () => {
        await customer.reviewProduct(data.predefined.simpleProduct.product1.name, data.product.review);
    });
});
