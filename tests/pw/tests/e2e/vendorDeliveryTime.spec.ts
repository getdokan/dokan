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

    test('vendor delivery time menu page is rendering properly @pro @exp @v', async () => {
        await vendor.vendorDeliveryTimeRenderProperly();
    });

    test('vendor delivery time settings menu page is rendering properly @pro @exp @v', async () => {
        await vendor.vendorDeliveryTimeSettingsRenderProperly();
    });

    test('vendor can set delivery time settings @pro @v', async () => {
        await vendor.setDeliveryTimeSettings(data.vendor.deliveryTime);
    });

    test('vendor can filter delivery time @pro @v', async () => {
        await vendor.filterDeliveryTime('delivery');
    });

    test('vendor can change view style of delivery time calender @pro @v', async () => {
        await vendor.updateCalendarView('week');
    });

    test.skip('customer can buy product with delivery time @pro @c', async () => {
        await customer.addProductToCart(data.predefined.simpleProduct.product1.name, 'single-product');
        await customer.placeOrderWithDeliverTimeStorePickup('delivery-time', data.deliveryTime);
    });

    test.skip('customer can buy product with store pickup @pro @c', async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.deliveryTime, { ...dbData.dokan.deliveryTimeSettings, allow_vendor_override_settings: 'off' }); // todo: added for: previous test is disable store pickup
        await customer.addProductToCart(data.predefined.simpleProduct.product1.name, 'single-product');
        await customer.placeOrderWithDeliverTimeStorePickup('store-pickup', data.deliveryTime);
    });
});
