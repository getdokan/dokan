import { test, request, Page } from '@playwright/test';
import { VendorSettingsPage } from '@pages/vendorSettingsPage';
import { dbData } from '@utils/dbData';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe('Vendor settings test', () => {
    let vendor: VendorSettingsPage;
    let vPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new VendorSettingsPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.setStoreSettings(payloads.defaultStoreSettings, payloads.vendorAuth);
        await vPage.close();
        await apiUtils.dispose();
    });

    //vendor

    test('vendor can view store settings menu page', { tag: ['@lite', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorStoreSettingsRenderProperly();
    });

    test('vendor can view Shipstation settings menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorShipstationSettingsRenderProperly();
    });

    test('vendor can view social profile settings menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorSocialProfileSettingsRenderProperly();
    });

    test('vendor can view rma settings menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorRmaSettingsRenderProperly();
    });

    test('vendor can view store seo settings menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorStoreSeoSettingsRenderProperly();
    });

    // store settings

    // todo: ensure which settings need to reset, and test data should be what

    test('vendor can set store basic settings', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.setStoreSettings(data.vendor.vendorInfo, 'basic');
    });

    test('vendor can set store address settings', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.setStoreSettings(data.vendor.vendorInfo, 'address');
    });

    test('vendor can set company info settings', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.setStoreSettings(data.vendor.vendorInfo, 'company-info');
    });

    test('vendor can set map settings', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.setStoreSettings(data.vendor.vendorInfo, 'map');
    });

    test('vendor can set terms and conditions settings', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.setStoreSettings(data.vendor.vendorInfo, 'toc');
    });

    test('vendor can set open-close settings', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.setStoreSettings(data.vendor.vendorInfo, 'open-close');
    });

    test('vendor can set vacation settings', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.setStoreSettings(data.vendor.vendorInfo, 'vacation');
    });

    test('vendor can set catalog settings', { tag: ['@lite', '@vendor'] }, async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
        await vendor.setStoreSettings(data.vendor.vendorInfo, 'catalog');
        // await vendor.resetCatalog();

        // disable catalog
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, catalog_mode_hide_add_to_cart_button: 'off', catalog_mode_hide_product_price: 'off' });
    });

    test('vendor can set discount settings', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.setStoreSettings(data.vendor.vendorInfo, 'discount');
    });

    test('vendor can set biography settings', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.setStoreSettings(data.vendor.vendorInfo, 'biography');
    });

    test('vendor can set store support settings', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.setStoreSettings(data.vendor.vendorInfo, 'store-support');
    });

    test('vendor can set min-max settings', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.setStoreSettings(data.vendor.vendorInfo, 'min-max');
        // disable min-max
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, enable_min_max_quantity: 'off', enable_min_max_amount: 'off' });
    });

    test('vendor can set shipStation settings', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.setShipStation(data.vendor.shipStation);
    });

    test('vendor can set social profile settings', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.setSocialProfile(data.vendor.socialProfileUrls);
    });

    test('vendor can set rma settings', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.setRmaSettings(data.vendor.rma);
    });

    test('vendor can set store seo settings', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.setStoreSeo(data.vendor.seo);
    });
});
