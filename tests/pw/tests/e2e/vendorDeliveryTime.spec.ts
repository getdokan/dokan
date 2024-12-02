import { test, Page } from '@playwright/test';
import { VendorDeliveryTimePage } from '@pages/vendorDeliveryTimePage';
import { dbData } from '@utils/dbData';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';

test.describe('Vendor delivery time test', () => {
    let vendor: VendorDeliveryTimePage;
    let customer: VendorDeliveryTimePage;
    let vPage: Page, cPage: Page;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new VendorDeliveryTimePage(vPage);

        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new VendorDeliveryTimePage(cPage);
    });

    test.afterAll(async () => {
        await vPage.close();
        await cPage.close();
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

    test('customer can buy product with delivery time', { tag: ['@pro', '@customer'] }, async () => {
        test.skip(true, 'run when chart & checkout block pr is merged');
        await customer.addProductToCart(data.predefined.simpleProduct.product1.name, 'single-product');
        await customer.placeOrderWithDeliverTimeStorePickup('delivery-time', data.deliveryTime);
    });

    test('customer can buy product with store pickup', { tag: ['@pro', '@customer'] }, async () => {
        test.skip(true, 'run when chart & checkout block pr is merged');
        await dbUtils.setOptionValue(dbData.dokan.optionName.deliveryTime, { ...dbData.dokan.deliveryTimeSettings, allow_vendor_override_settings: 'off' }); // todo: resolve: previous test disable store pickup
        await customer.addProductToCart(data.predefined.simpleProduct.product1.name, 'single-product');
        await customer.placeOrderWithDeliverTimeStorePickup('store-pickup', data.deliveryTime);
    });
});
