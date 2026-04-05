import { test, Page } from '@playwright/test';
import { SingleStorePage, data } from './singleStorePage';
import path from 'path';

const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

test.describe('Single store functionality test', () => {
    let customer: SingleStorePage;
    let cPage: Page;

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext({ storageState: c1 });
        cPage = await customerContext.newPage();
        customer = new SingleStorePage(cPage);
    });

    test.afterAll(async () => { await cPage?.close(); });

    test.skip('customer can view single store page', { tag: ['@lite', '@exploratory', '@customer'] }, async () => { await customer.singleStoreRenderProperly(data.predefined.vendorStores.vendor1); });
    test.skip('customer can view store open-close time on single store', { tag: ['@lite', '@customer'] }, async () => { await customer.storeOpenCloseTime(data.predefined.vendorStores.vendor1); });
    test('customer can search product on single store', { tag: ['@lite', '@customer'] }, async () => { await customer.singleStoreSearchProduct(data.predefined.vendorStores.vendor1, data.predefined.simpleProduct.product1.name); });
    test('customer can sort products on single store', { tag: ['@lite', '@customer'] }, async () => { await customer.singleStoreSortProducts(data.predefined.vendorStores.vendor1, 'price'); });
    test('customer can view store terms and conditions', { tag: ['@lite', '@customer'] }, async () => { await customer.storeTermsAndCondition(data.predefined.vendorStores.vendor1, data.vendor.toc); });
    test('customer can share store', { tag: ['@pro', '@customer'] }, async () => { await customer.storeShare(data.predefined.vendorStores.vendor1, data.storeShare.facebook); });
});
