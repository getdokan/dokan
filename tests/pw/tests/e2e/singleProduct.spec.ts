import { test, Page } from '@playwright/test';
import { SingleProductPage } from '@pages/singleProductPage';
// import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
// import { payloads } from '@utils/payloads';

test.describe('Single product functionality test', () => {
    let customer: SingleProductPage;
    let cPage: Page;
    // let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new SingleProductPage(cPage);
        // apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await cPage.close();
        // await apiUtils.dispose();
    });

    // single product page

    test('single product is rendering properly @lite @exp @c', async () => {
        await customer.singleProductRenderProperly(data.predefined.simpleProduct.product1.name);
    });

    test('customer can view highlighted vendor info @lite @c', async () => {
        await customer.viewHighlightedVendorInfo(data.predefined.simpleProduct.product1.name);
    });

    test('customer can view product vendor info @lite @c', async () => {
        await customer.productVendorInfo(data.predefined.simpleProduct.product1.name);
    });

    test('customer can view product location @pro @c', async () => {
        await customer.productLocation(data.predefined.simpleProduct.product1.name);
    });

    test('customer can view product warranty policy @pro @c', async () => {
        await customer.productWarrantyPolicy(data.predefined.simpleProduct.product1.name);
    });

    test('customer can view more products @lite @c', async () => {
        await customer.viewMoreProducts(data.predefined.simpleProduct.product1.name);
    });

    test('customer can view related products @lite @c', async () => {
        await customer.viewRelatedProducts(data.predefined.simpleProduct.product1.name);
    });

    test('customer can review product @lite @c', async () => {
        await customer.reviewProduct(data.predefined.simpleProduct.product1.name, data.product.review);
    });
});
