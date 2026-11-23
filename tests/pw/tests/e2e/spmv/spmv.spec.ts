import { Page, expect, test } from '@utils/test';
import { SpmvPage, ApiUtils, data, payloads, dbUtils, dbData } from './spmvPage';
import path from 'path';

import { toPath } from '@utils/helpers';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

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
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new SpmvPage(aPage);
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new SpmvPage(vPage);
        const customerContext = await browser.newContext({ storageState: c1 });
        cPage = await customerContext.newPage();
        customer = new SpmvPage(cPage);
        apiUtils = new ApiUtils(null);
        await dbUtils.updateOptionValue(dbData.dokan.optionName.selling, { enable_min_max_quantity: 'off', enable_min_max_amount: 'off' });
        [, , productName] = await apiUtils.createProduct({ ...payloads.createProduct(), name: data.predefined.spmv.productName() }, payloads.vendor2Auth);
        [, productId, productName2] = await apiUtils.createProduct({ ...payloads.createProduct(), name: data.predefined.spmv.productName() }, payloads.vendor2Auth);
        await apiUtils.addSpmvProductToStore(productId, payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
        await apiUtils.activateModules(payloads.moduleIds.spmv, payloads.adminAuth);
        await aPage?.close();
        await vPage?.close();
        await cPage?.close();
        await apiUtils.dispose();
    });

    test('admin can enable SPMV module', { tag: ['@pro', '@admin'] }, async () => { await admin.enableSpmvModule(); });

    test('admin can assign SPMV product to other vendor', { tag: ['@pro', '@admin'] }, async () => {
        const [, pid] = await apiUtils.createProduct({ ...payloads.createProduct(), name: data.predefined.spmv.productName() }, payloads.vendor2Auth);
        await admin.assignSpmvProduct(pid, data.predefined.vendorStores.vendor1);
    });

    test('vendor can view SPMV menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorSpmvRenderProperly(); });
    test('vendor can search similar product on SPMV page', { tag: ['@pro', '@vendor'] }, async () => { await vendor.searchSimilarProduct(productName, 'spmv'); });
    test('vendor can search similar product on product popup', { tag: ['@pro', '@vendor'] }, async () => { await vendor.searchSimilarProduct(productName, 'popup'); });

    test('vendor can search similar booking product', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , bookableProductName] = await apiUtils.createBookableProduct(payloads.createBookableProduct(), payloads.vendor2Auth);
        await vendor.searchSimilarProduct(bookableProductName, 'booking');
    });

    test('vendor can search similar auction product', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , auctionProductName] = await apiUtils.createProduct(payloads.createAuctionProduct(), payloads.vendor2Auth);
        await vendor.searchSimilarProduct(auctionProductName, 'auction');
    });

    test('vendor can go to own product edit from SPMV page', { tag: ['@pro', '@vendor'] }, async () => { await vendor.goToProductEditFromSpmv(data.predefined.simpleProduct.product1.name); });
    test('vendor can sort SPMV products', { tag: ['@pro', '@vendor'] }, async () => { await vendor.sortSpmvProduct('price'); });
    test('vendor can clone product', { tag: ['@pro', '@vendor'] }, async () => { await vendor.cloneProduct(productName); });

    test('vendor can clone product via sell item button', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , pname] = await apiUtils.createProduct({ ...payloads.createProduct(), name: data.predefined.spmv.productName() }, payloads.vendor2Auth);
        await vendor.cloneProductViaSellItemButton(pname);
    });

    test('customer can view other available vendors', { tag: ['@pro', '@customer'] }, async () => { await customer.viewOtherAvailableVendors(productName2); });
    test('customer can view other available vendor', { tag: ['@pro', '@customer'] }, async () => { await customer.viewOtherAvailableVendor(productName2, data.predefined.vendorStores.vendor1); });
    test('customer can view other available vendor product', { tag: ['@pro', '@customer'] }, async () => { await customer.viewOtherAvailableVendorProduct(productName2, data.predefined.vendorStores.vendor1); });
    test('customer can add to cart other available vendor product', { tag: ['@pro', '@customer'] }, async () => { await customer.addToCartOtherAvailableVendorsProduct(productName2, data.predefined.vendorStores.vendor1); });

    test('admin can disable SPMV module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.spmv, payloads.adminAuth);
        await admin.disableSpmvModule();
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('SPMV (React) Tests @pro', () => {
    test('Test Case 1 - Admin SPMV page renders', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`wp-admin/admin.php?page=dokan#/spmv`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator(".notice-error, body.error-page").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - SPMV page renders content', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`wp-admin/admin.php?page=dokan#/spmv`));
        await page.waitForLoadState('domcontentloaded');
        await expect
            .poll(async () => (await page.locator('body').innerText()).trim().length, {
                timeout: 30_000,
                intervals: [500, 1000, 2000, 3000],
            })
            .toBeGreaterThan(50);
        await page.close();
        await ctx.close();
    });
});

