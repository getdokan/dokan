import { test, request, Page } from '@playwright/test';
import { ProductAdvertisingPage } from '@pages/productAdvertisingPage';
import { VendorPage } from '@pages/vendorPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe('Product Advertising test', () => {
    let admin: ProductAdvertisingPage;
    let vendor: VendorPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;
    let productName: string;
    let advertisedProduct: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new ProductAdvertisingPage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new VendorPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, , productName] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        [, , advertisedProduct] = await apiUtils.createProductAdvertisement(payloads.createProduct(), payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await aPage.close();
        await vPage.close();
        await apiUtils.dispose();
    });

    //admin

    test('admin can view product advertising menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await admin.adminProductAdvertisingRenderProperly();
    });

    test('admin can add product advertisement', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addNewProductAdvertisement({ ...data.productAdvertisement, advertisedProduct: productName });
    });

    test('admin can search advertised product', { tag: ['@pro', '@admin'] }, async () => {
        await admin.searchAdvertisedProduct(advertisedProduct);
    });

    test('admin can filter advertised product by stores', { tag: ['@pro', '@admin'] }, async () => {
        await admin.filterAdvertisedProduct(data.productAdvertisement.filter.byStore, 'by-store');
    });

    test('admin can filter advertised product by creation process', { tag: ['@pro', '@admin'] }, async () => {
        await admin.filterAdvertisedProduct(data.productAdvertisement.filter.createVia.admin, 'by-creation');
    });

    test('admin can expire advertised product', { tag: ['@pro', '@admin'] }, async () => {
        await admin.updateAdvertisedProduct(productName, 'expire');
    });

    test('admin can delete advertised product', { tag: ['@pro', '@admin'] }, async () => {
        const [, , advertisedProduct] = await apiUtils.createProductAdvertisement(payloads.createProduct(), payloads.vendorAuth);
        await admin.updateAdvertisedProduct(advertisedProduct, 'delete');
    });

    test.skip('admin can perform bulk action on product advertisements', { tag: ['@pro', '@admin'] }, async () => {
        // todo: might cause other tests to fail in parallel
        await admin.productAdvertisingBulkAction('delete');
    });

    // vendor

    test.skip('vendor can buy product advertising', { tag: ['@pro', '@vendor'] }, async () => {
        //todo: p1_v1 status gets pending review; need to resolve
        const [, , productName] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        const orderId = await vendor.buyProductAdvertising(productName);
        await apiUtils.updateOrderStatus(orderId, 'wc-completed', payloads.adminAuth);
    });

    test.skip('vendor can buy booking product advertising', { tag: ['@pro', '@vendor'] }, async () => {
        // todo: create booking product via api
        const orderId = await vendor.buyProductAdvertising(data.productAdvertisement.advertisedProduct);
        await apiUtils.updateOrderStatus(orderId, 'wc-completed', payloads.adminAuth);
    });

    test.skip('vendor can buy auction product advertising', { tag: ['@pro', '@vendor'] }, async () => {
        // todo: create auction product via api
        const orderId = await vendor.buyProductAdvertising(data.productAdvertisement.advertisedProduct);
        await apiUtils.updateOrderStatus(orderId, 'wc-completed', payloads.adminAuth);
    });
});
