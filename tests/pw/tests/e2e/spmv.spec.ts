import { test, request, Page } from '@playwright/test';
import { SpmvPage } from '@pages/spmvPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';

test.describe('Vendor SPMV test', () => {
    let admin: SpmvPage;
    let vendor: SpmvPage;
    let customer: SpmvPage;
    let aPage: Page, vPage: Page, cPage: Page;
    let apiUtils: ApiUtils;
    let productName: string;
    let productName2: string;
    let productId: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new SpmvPage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new SpmvPage(vPage);

        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new SpmvPage(cPage);

        apiUtils = new ApiUtils(await request.newContext());
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, enable_min_max_quantity: 'off', enable_min_max_amount: 'off' }); // todo: might exists dokan issue -> min-max field is required on admin product edit
        [, , productName] = await apiUtils.createProduct({ ...payloads.createProduct(), name: data.predefined.spmv.productName() }, payloads.vendor2Auth);
        [, productId, productName2] = await apiUtils.createProduct({ ...payloads.createProduct(), name: data.predefined.spmv.productName() }, payloads.vendor2Auth);
        await apiUtils.addSpmvProductToStore(productId, payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
        await aPage.close();
        await vPage.close();
        await cPage.close();
        await apiUtils.dispose();
    });

    test('admin can assign SPMV product to other vendor', { tag: ['@pro', '@admin'] }, async () => {
        const [, productId] = await apiUtils.createProduct({ ...payloads.createProduct(), name: data.predefined.spmv.productName() }, payloads.vendor2Auth);
        await admin.assignSpmvProduct(productId, data.predefined.vendorStores.vendor1);
    });

    //vendor

    test('vendor can view SPMV menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorSpmvRenderProperly();
    });

    test('vendor can search similar product on SPMV page', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.searchSimilarProduct(productName, 'spmv');
    });

    test('vendor can search similar product on product popup', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.searchSimilarProduct(productName, 'popup');
    });

    test('vendor can search similar booking product', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , bookableProductName] = await apiUtils.createBookableProduct(payloads.createBookableProduct(), payloads.vendor2Auth);
        await vendor.searchSimilarProduct(bookableProductName, 'booking');
    });

    test('vendor can search similar auction product', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , auctionProductName] = await apiUtils.createProduct(payloads.createAuctionProduct(), payloads.vendor2Auth);
        await vendor.searchSimilarProduct(auctionProductName, 'auction');
    });

    test('vendor can go to own product edit from SPMV page', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.goToProductEditFromSpmv(data.predefined.simpleProduct.product1.name);
    });

    test('vendor can sort SPMV products', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.sortSpmvProduct('price');
    });

    test('vendor can clone product', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.cloneProduct(productName);
    });

    test('vendor can clone product via sell item button', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , productName] = await apiUtils.createProduct({ ...payloads.createProduct(), name: data.predefined.spmv.productName() }, payloads.vendor2Auth);
        await vendor.cloneProductViaSellItemButton(productName);
    });

    // customer

    test('customer can view other available vendors', { tag: ['@pro', '@customer'] }, async () => {
        await customer.viewOtherAvailableVendors(productName2);
    });

    test('customer can view other available vendor', { tag: ['@pro', '@customer'] }, async () => {
        await customer.viewOtherAvailableVendor(productName2, data.predefined.vendorStores.vendor1);
    });

    test('customer can view other available vendor product', { tag: ['@pro', '@customer'] }, async () => {
        await customer.viewOtherAvailableVendorProduct(productName2, data.predefined.vendorStores.vendor1);
    });

    test('customer can add to cart other available vendor product', { tag: ['@pro', '@customer'] }, async () => {
        await customer.addToCartOtherAvailableVendorsProduct(productName2, data.predefined.vendorStores.vendor1);
    });
});
