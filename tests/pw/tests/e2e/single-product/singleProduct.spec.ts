import { test, Page } from '@utils/test';
import { SingleProductPage, ApiUtils, data, payloads } from './singleProductPage';
import path from 'path';

const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

test.describe('Single product functionality test', () => {
    let customer: SingleProductPage;
    let cPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext({ storageState: c1 });
        cPage = await customerContext.newPage();
        customer = new SingleProductPage(cPage);
        apiUtils = new ApiUtils(null);
    });

    test.afterAll(async () => { await cPage?.close(); await apiUtils.dispose(); });

    // KEEP skipped: page-object method singleProductRenderProperly + ApiUtils.createProduct are stubs (no real implementation).
    test.skip('customer can view single product page', { tag: ['@lite', '@exploratory', '@customer'] }, async () => {
        await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        await customer.singleProductRenderProperly(data.predefined.simpleProduct.product1.name);
    });

    // KEEP skipped: page-object method viewHighlightedVendorInfo is a stub (no real implementation).
    test.skip('customer can view highlighted vendor info', { tag: ['@lite', '@customer'] }, async () => { await customer.viewHighlightedVendorInfo(data.predefined.simpleProduct.product1.name); });
    // KEEP skipped: page-object method productVendorInfo is a stub (no real implementation).
    test.skip('customer can view product vendor info', { tag: ['@lite', '@customer'] }, async () => { await customer.productVendorInfo(data.predefined.simpleProduct.product1.name); });
    test('customer can view product location', { tag: ['@pro', '@customer'] }, async () => { await customer.productLocation(data.predefined.simpleProduct.product1.name); });
    test('customer can view product warranty policy', { tag: ['@pro', '@customer'] }, async () => { await customer.productWarrantyPolicy(data.predefined.simpleProduct.product1.name); });
    // KEEP skipped: page-object method viewMoreProducts is a stub (no real implementation).
    test.skip('customer can view more products', { tag: ['@lite', '@customer'] }, async () => { await customer.viewMoreProducts(data.predefined.simpleProduct.product1.name); });
    // KEEP skipped: page-object method viewRelatedProducts is a stub (no real implementation).
    test.skip('customer can view related products', { tag: ['@lite', '@customer'] }, async () => { await customer.viewRelatedProducts(data.predefined.simpleProduct.product1.name); });
    // KEEP skipped: page-object method reviewProduct is a stub (no real implementation).
    test.skip('customer can review product', { tag: ['@lite', '@customer'] }, async () => { await customer.reviewProduct(data.predefined.simpleProduct.product1.name, data.product.review); });
});
