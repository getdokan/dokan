import { test, request, Page } from '@playwright/test';
import { SingleProductPage } from '@pages/singleProductPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe('Single product functionality test', () => {
    let customer: SingleProductPage;
    let cPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new SingleProductPage(cPage);

        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await cPage.close();
        await apiUtils.dispose();
    });

    // single product page

    test('customer can view single product page', { tag: ['@lite', '@exploratory', '@customer'] }, async () => {
        await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        await customer.singleProductRenderProperly(data.predefined.simpleProduct.product1.name);
    });

    test('customer can view highlighted vendor info', { tag: ['@lite', '@customer'] }, async () => {
        await customer.viewHighlightedVendorInfo(data.predefined.simpleProduct.product1.name);
    });

    test('customer can view product vendor info', { tag: ['@lite', '@customer'] }, async () => {
        await customer.productVendorInfo(data.predefined.simpleProduct.product1.name);
    });

    test('customer can view product location', { tag: ['@pro', '@customer'] }, async () => {
        await customer.productLocation(data.predefined.simpleProduct.product1.name);
    });

    test('customer can view product warranty policy', { tag: ['@pro', '@customer'] }, async () => {
        await customer.productWarrantyPolicy(data.predefined.simpleProduct.product1.name);
    });

    test('customer can view more products', { tag: ['@lite', '@customer'] }, async () => {
        await customer.viewMoreProducts(data.predefined.simpleProduct.product1.name);
    });

    test('customer can view related products', { tag: ['@lite', '@customer'] }, async () => {
        await customer.viewRelatedProducts(data.predefined.simpleProduct.product1.name);
    });

    test('customer can review product', { tag: ['@lite', '@customer'] }, async () => {
        await customer.reviewProduct(data.predefined.simpleProduct.product1.name, data.product.review);
    });
});
