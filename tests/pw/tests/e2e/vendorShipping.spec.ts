import { test, Page } from '@playwright/test';
import { VendorShippingPage } from '@pages/vendorShippingPage';
import { data } from '@utils/testData';

test.describe('Vendor shipping test', () => {
    let vendor: VendorShippingPage;
    let vPage: Page;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new VendorShippingPage(vPage);

    });

    test.afterAll(async () => {
        await vPage.close();
    });

    //vendor

    test('vendor can view shipping settings menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorShippingSettingsRenderProperly();
    });

    test('vendor can add shipping policy', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.setShippingPolicies(data.vendor.shipping.shippingPolicy);
    });

    test('vendor can add flat rate shipping', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addShippingMethod(data.vendor.shipping.shippingMethods.flatRate);
    });

    test('vendor can add free shipping', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addShippingMethod(data.vendor.shipping.shippingMethods.freeShipping);
    });

    test('vendor can add local pickup shipping', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addShippingMethod(data.vendor.shipping.shippingMethods.localPickup);
    });

    test('vendor can add table rate shipping', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addShippingMethod(data.vendor.shipping.shippingMethods.tableRateShipping);
    });

    test('vendor can add distance rate shipping', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addShippingMethod(data.vendor.shipping.shippingMethods.distanceRateShipping);
    });

    test('vendor can edit shipping method', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addShippingMethod(data.vendor.shipping.shippingMethods.localPickup, false, true);
        await vendor.addShippingMethod(data.vendor.shipping.shippingMethods.localPickup);
    });

    test('vendor can delete shipping method', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addShippingMethod(data.vendor.shipping.shippingMethods.flatRate, true, true); 
        await vendor.deleteShippingMethod(data.vendor.shipping.shippingMethods.flatRate);
    });
});
