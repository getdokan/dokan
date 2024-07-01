import { test, Page } from '@playwright/test';
import { SingleStorePage } from '@pages/singleStorePage';
import { data } from '@utils/testData';

test.describe('Single store functionality test', () => {
    let customer: SingleStorePage;
    let cPage: Page;

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new SingleStorePage(cPage);
    });

    test.afterAll(async () => {
        await cPage.close();
    });

    // single store page

    test('customer can view single store page', { tag: ['@lite', '@exploratory', '@customer'] }, async () => {
        await customer.singleStoreRenderProperly(data.predefined.vendorStores.vendor1);
    });

    test.skip('customer can view store open-close time on single store', { tag: ['@lite', '@customer'] }, async () => {
        // todo: pre: need store open close time
        await customer.storeOpenCloseTime(data.predefined.vendorStores.vendor1);
    });

    test('customer can search product on single store', { tag: ['@lite', '@customer'] }, async () => {
        await customer.singleStoreSearchProduct(data.predefined.vendorStores.vendor1, data.predefined.simpleProduct.product1.name);
    });

    test('customer can sort products on single store', { tag: ['@lite', '@customer'] }, async () => {
        await customer.singleStoreSortProducts(data.predefined.vendorStores.vendor1, 'price');
    });

    test.skip('customer can view store terms and conditions', { tag: ['@lite', '@customer'] }, async () => {
        // todo: pre need toc on store and admin settings
        await customer.storeTermsAndCondition(data.predefined.vendorStores.vendor1, data.vendor.toc);
    });

    test('customer can share store', { tag: ['@pro', '@customer'] }, async () => {
        await customer.storeShare(data.predefined.vendorStores.vendor1, data.storeShare.facebook);
    });
});
