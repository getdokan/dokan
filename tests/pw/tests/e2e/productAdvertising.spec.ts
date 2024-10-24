import { test, request, Page } from '@playwright/test';
import { ProductAdvertisingPage } from '@pages/productAdvertisingPage';
import { BookingPage } from '@pages/vendorBookingPage';
import { AuctionsPage } from '@pages/vendorAuctionsPage';
import { VendorPage } from '@pages/vendorPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe('Product Advertising test (admin)', () => {
    let admin: ProductAdvertisingPage;
    let aPage: Page;
    let apiUtils: ApiUtils;
    let advertisedProduct: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new ProductAdvertisingPage(aPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, , advertisedProduct] = await apiUtils.createProductAdvertisement(payloads.createProduct(), payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await aPage.close();
        await apiUtils.dispose();
    });

    //admin

    test('admin can view product advertising menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await admin.adminProductAdvertisingRenderProperly();
    });

    test('admin can add product advertisement', { tag: ['@pro', '@admin'] }, async () => {
        const [, , productName] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        await admin.addNewProductAdvertisement({ ...data.productAdvertisement, advertisedProduct: productName });
    });

    test('admin can search advertised product by product', { tag: ['@pro', '@admin'] }, async () => {
        await admin.searchAdvertisedProduct(advertisedProduct);
    });

    test('admin can filter advertised product by stores', { tag: ['@pro', '@admin'] }, async () => {
        await admin.filterAdvertisedProduct(data.productAdvertisement.filter.byStore, 'by-store');
    });

    test('admin can filter advertised product by creation process', { tag: ['@pro', '@admin'] }, async () => {
        await admin.filterAdvertisedProduct(data.productAdvertisement.filter.createVia.admin, 'by-creation');
    });

    test('admin can expire advertised product', { tag: ['@pro', '@admin'] }, async () => {
        const [, , advertisedProduct] = await apiUtils.createProductAdvertisement(payloads.createProduct(), payloads.vendorAuth);
        await admin.updateAdvertisedProduct(advertisedProduct, 'expire');
    });

    test('admin can delete advertised product', { tag: ['@pro', '@admin'] }, async () => {
        const [, , advertisedProduct] = await apiUtils.createProductAdvertisement(payloads.createProduct(), payloads.vendorAuth);
        await admin.updateAdvertisedProduct(advertisedProduct, 'delete');
    });

    test('admin can perform bulk action on product advertisements', { tag: ['@pro', '@admin', '@serial'] }, async () => {
        await admin.productAdvertisingBulkAction('delete');
    });
});

test.describe('Product Advertising test (vendor)', () => {
    let vendor: VendorPage;
    let vPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new VendorPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await vPage.close();
        await apiUtils.dispose();
    });

    // vendor

    test('vendor can buy product advertising (product list page)', { tag: ['@pro', '@vendor'] }, async () => {
        test.slow();
        const [, , productName] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        const orderId = await vendor.buyProductAdvertising(productName, 'simple');
        await apiUtils.updateOrderStatus(orderId, 'wc-completed', payloads.adminAuth);
        await vendor.assertProductAdvertisementIsBought(productName, 'simple');
    });

    test('vendor can buy booking product advertising', { tag: ['@pro', '@vendor'] }, async () => {
        test.slow();
        const [, , productName] = await apiUtils.createBookableProduct(payloads.createBookableProduct(), payloads.vendorAuth);
        const orderId = await vendor.buyProductAdvertising(productName, 'booking', BookingPage);
        await apiUtils.updateOrderStatus(orderId, 'wc-completed', payloads.adminAuth);
        await vendor.assertProductAdvertisementIsBought(productName, 'booking', BookingPage);
    });

    test('vendor can buy auction product advertising', { tag: ['@pro', '@vendor'] }, async () => {
        test.slow();
        const [, , productName] = await apiUtils.createProduct(payloads.createAuctionProduct(), payloads.vendorAuth);
        const orderId = await vendor.buyProductAdvertising(productName, 'auction', AuctionsPage);
        await apiUtils.updateOrderStatus(orderId, 'wc-completed', payloads.adminAuth);
        await vendor.assertProductAdvertisementIsBought(productName, 'auction', AuctionsPage);
    });
});
