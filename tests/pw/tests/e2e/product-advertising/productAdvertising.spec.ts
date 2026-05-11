import { Page, expect, test } from '@utils/test';
import { ProductAdvertisingPage, VendorPage, AuctionsPage, BookingPage, ApiUtils, data, payloads } from './productAdvertisingPage';
import path from 'path';

import { toPath } from '@utils/helpers';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

test.describe('Product Advertising test (admin)', () => {
    let admin: ProductAdvertisingPage;
    let aPage: Page;
    let apiUtils: ApiUtils;
    let advertisedProduct: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new ProductAdvertisingPage(aPage);
        apiUtils = new ApiUtils(null);
        [, , advertisedProduct] = await apiUtils.createProductAdvertisement(payloads.createProduct(), payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.productAdvertising, payloads.adminAuth);
        await aPage?.close();
        await apiUtils.dispose();
    });

    test('admin can enable product advertising module', { tag: ['@pro', '@admin'] }, async () => { await admin.enableProductAdvertisingModule(); });
    test('admin can view product advertising menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => { await admin.adminProductAdvertisingRenderProperly(); });

    test('admin can add product advertisement', { tag: ['@pro', '@admin'] }, async () => {
        const [, , productName] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        await admin.addNewProductAdvertisement({ ...data.productAdvertisement, advertisedProduct: productName });
    });

    test('admin can search advertised product by product', { tag: ['@pro', '@admin'] }, async () => { await admin.searchAdvertisedProduct(advertisedProduct); });
    test('admin can filter advertised product by stores', { tag: ['@pro', '@admin'] }, async () => { await admin.filterAdvertisedProduct(data.productAdvertisement.filter.byStore, 'by-store'); });
    test('admin can filter advertised product by creation process', { tag: ['@pro', '@admin'] }, async () => { await admin.filterAdvertisedProduct(data.productAdvertisement.filter.createVia.admin, 'by-creation'); });

    test('admin can expire advertised product', { tag: ['@pro', '@admin'] }, async () => {
        const [, , ad] = await apiUtils.createProductAdvertisement(payloads.createProduct(), payloads.vendorAuth);
        await admin.updateAdvertisedProduct(ad, 'expire');
    });

    test('admin can delete advertised product', { tag: ['@pro', '@admin'] }, async () => {
        const [, , ad] = await apiUtils.createProductAdvertisement(payloads.createProduct(), payloads.vendorAuth);
        await admin.updateAdvertisedProduct(ad, 'delete');
    });

    test('admin can perform bulk action on product advertisements', { tag: ['@pro', '@admin', '@serial'] }, async () => {
        await admin.productAdvertisingBulkAction('delete');
    });
});

test.describe('Product Advertising test (vendor)', () => {
    let admin: ProductAdvertisingPage;
    let vendor: VendorPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new ProductAdvertisingPage(aPage);
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new VendorPage(vPage);
        apiUtils = new ApiUtils(null);
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.productAdvertising, payloads.adminAuth);
        await aPage?.close();
        await vPage?.close();
        await apiUtils.dispose();
    });

    test('vendor can buy product advertising (product list page)', { tag: ['@pro', '@vendor'] }, async () => {
        test.slow();
        const [, , productName] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        const orderId = await vendor.buyProductAdvertising(productName, 'simple');
        await apiUtils.updateOrderStatus(orderId, 'wc-completed', payloads.adminAuth);
    });

    test.skip('vendor can buy booking product advertising', { tag: ['@pro', '@vendor'] }, async () => {
        test.slow();
        const [, , productName] = await apiUtils.createBookableProduct(payloads.createBookableProduct(), payloads.vendorAuth);
        const orderId = await vendor.buyProductAdvertising(productName, 'booking', BookingPage);
        await apiUtils.updateOrderStatus(orderId, 'wc-completed', payloads.adminAuth);
        await vendor.assertProductAdvertisementIsBought(productName, 'booking', BookingPage);
    });

    test.skip('vendor can buy auction product advertising', { tag: ['@pro', '@vendor'] }, async () => {
        test.slow();
        const [, , productName] = await apiUtils.createProduct(payloads.createAuctionProduct(), payloads.vendorAuth);
        const orderId = await vendor.buyProductAdvertising(productName, 'auction', AuctionsPage);
        await apiUtils.updateOrderStatus(orderId, 'wc-completed', payloads.adminAuth);
        await vendor.assertProductAdvertisementIsBought(productName, 'auction', AuctionsPage);
    });

    test.skip('admin can disable product advertising module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.productAdvertising, payloads.adminAuth);
        await admin.disableProductAdvertisingModule();
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Product Advertising (React) Tests @pro', () => {
    test('Test Case 1 - Vendor advertising page renders', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/product_advertising/`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Admin advertising page renders', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`wp-admin/admin.php?page=product_advertising`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator(".notice-error, body.error-page").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });
});

