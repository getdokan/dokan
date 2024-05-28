import { test, Page } from '@playwright/test';
import { SingleProductPage } from '@pages/singleProductPage';
import { data } from '@utils/testData';

test.describe('Single product functionality test', () => {
    let customer: SingleProductPage;
    let cPage: Page;

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new SingleProductPage(cPage);
    });

    test.afterAll(async () => {
        await cPage.close();
    });

    // single product page

    test('customer can view single product page', { tag: ['@lite', '@exploratory', '@customer'] }, async () => {
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
