import { test, request, Page } from '@playwright/test';
import { ProductAddonsPage } from '@pages/productAddonsPage';
import { ProductsPage } from '@pages/productsPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { serialize } from 'php-serialize';
import { responseBody } from '@utils/interfaces';

const { VENDOR_ID } = process.env;

test.describe('Product addon functionality test', () => {
    let vendor: ProductAddonsPage;
    let vendor1: ProductsPage;
    let vPage: Page;
    let addonName: string;
    let addonFieldTitle: string;
    let categoryName: string;
    let productName: string;
    let apiUtils: ApiUtils;

    // create product addon
    async function createVendorProductAddon(): Promise<[responseBody, string, string, string, string]> {
        const [, categoryId, categoryName] = await apiUtils.createCategory(payloads.createCategoryRandom(), payloads.adminAuth);
        const [responseBody, addonId, addonName, addonFieldTitle] = await apiUtils.createProductAddon({ ...payloads.createGlobalProductAddons(), restrict_to_categories: [categoryId] }, payloads.adminAuth);
        await dbUtils.updateCell(addonId, VENDOR_ID);
        return [responseBody, addonId, addonName, addonFieldTitle, categoryName];
    }

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new ProductAddonsPage(vPage);
        vendor1 = new ProductsPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, , addonName, addonFieldTitle, categoryName] = await createVendorProductAddon();
        [, , productName] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await apiUtils.deleteAllProductAddons(payloads.adminAuth);
        await vPage.close();
        await apiUtils.dispose();
    });

    // vendor

    test('vendor can view product addons menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorProductAddonsSettingsRenderProperly();
    });

    // global addon

    test('vendor can add global product addon', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addAddon({ ...data.vendor.addon(), category: categoryName });
    });

    test('vendor can edit global product addon', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.editAddon({ ...data.vendor.addon(), name: addonName, title: addonFieldTitle });
    });

    test('vendor can import global product addon field', { tag: ['@pro', '@vendor'] }, async () => {
        const [, addonId, , addonFieldTitle] = await createVendorProductAddon();
        await vendor.importAddonField(addonId, serialize([payloads.createGlobalProductAddons().fields[0]]), addonFieldTitle);
    });

    test('vendor can export global product addon field', { tag: ['@pro', '@vendor'] }, async () => {
        const [responseBody, addonId] = await createVendorProductAddon();
        await vendor.exportAddonField(addonId, responseBody.fields[0]);
    });

    test('vendor can remove product addon field', { tag: ['@pro', '@vendor'] }, async () => {
        const [, addonId, , addonFieldTitle] = await createVendorProductAddon();
        await vendor.removeAddonField(addonId, addonFieldTitle);
    });

    test('vendor can remove global product addon', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , addonName] = await createVendorProductAddon();
        await vendor.removeAddon({ ...data.vendor.addon(), name: addonName });
    });

    // product addon

    test('vendor can add product addon', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor1.addProductAddon(productName, data.product.productInfo.addon);
    });

    test('vendor can import product addon', { tag: ['@pro', '@vendor'] }, async () => {
        const addon = payloads.createProductAddon();
        await vendor1.importAddon(productName, serialize([addon]), addon.name);
    });

    test('vendor can export product addon', { tag: ['@pro', '@vendor'] }, async () => {
        const [responseBody, , productName] = await apiUtils.createProductWithAddon(payloads.createProduct(), [payloads.createProductAddon()], payloads.vendorAuth);
        await vendor1.exportAddon(productName, serialize(apiUtils.getMetaDataValue(responseBody.meta_data, '_product_addons')));
    });

    test('vendor can remove product addon', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , productName, addonName] = await apiUtils.createProductWithAddon(payloads.createProduct(), [payloads.createProductAddon()], payloads.vendorAuth);
        await vendor1.removeAddon(productName, addonName[0] as string);
    });
});
