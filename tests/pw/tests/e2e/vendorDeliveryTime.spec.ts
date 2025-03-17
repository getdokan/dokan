import { test, Page, request } from '@playwright/test';
import { VendorDeliveryTimePage } from '@pages/vendorDeliveryTimePage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { data } from '@utils/testData';

test.describe('Vendor delivery time test', () => {
    let admin: VendorDeliveryTimePage;
    let vendor: VendorDeliveryTimePage;
    let customer: VendorDeliveryTimePage;
    let aPage: Page, vPage: Page, cPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new VendorDeliveryTimePage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new VendorDeliveryTimePage(vPage);

        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new VendorDeliveryTimePage(cPage);

        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.deliveryTime, payloads.adminAuth);
        await vPage.close();
        await cPage.close();
    });

    // admin

    test('admin can enable delivery time module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enableDeliveryTimeModule();
    });

    //vendor

    test('vendor can view delivery time menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorDeliveryTimeRenderProperly();
    });

    test('vendor can view delivery time settings menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorDeliveryTimeSettingsRenderProperly();
    });

    test('vendor can set delivery time settings', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.setDeliveryTimeSettings(data.vendor.deliveryTime);
    });

    test('vendor can filter delivery time', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.filterDeliveryTime('delivery');
    });

    test('vendor can change view style of delivery time calendar', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.updateCalendarView('week');
    });

    // customer

    test('customer can buy product with delivery time', { tag: ['@pro', '@customer'] }, async () => {
        await customer.addProductToCart(data.predefined.simpleProduct.product1.name, 'single-product');
        await customer.placeOrderWithDeliverTimeStorePickup('delivery-time', data.deliveryTime);
    });

    test('customer can buy product with store pickup', { tag: ['@pro', '@customer'] }, async () => {
        await customer.addProductToCart(data.predefined.simpleProduct.product1.name, 'single-product');
        await customer.placeOrderWithDeliverTimeStorePickup('store-pickup', data.deliveryTime);
    });

    // admin

    test('admin can disable delivery time module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.deliveryTime, payloads.adminAuth);
        await admin.disableDeliveryTimeModule();
    });
});
