import { Page, expect, test } from '@utils/test';
import { VendorDeliveryTimePage, ApiUtils, data, payloads } from './vendorDeliveryTimePage';
import path from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:9999';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

test.describe('Vendor delivery time test', () => {
    let admin: VendorDeliveryTimePage;
    let vendor: VendorDeliveryTimePage;
    let customer: VendorDeliveryTimePage;
    let aPage: Page, vPage: Page, cPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new VendorDeliveryTimePage(aPage);
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new VendorDeliveryTimePage(vPage);
        const customerContext = await browser.newContext({ storageState: c1 });
        cPage = await customerContext.newPage();
        customer = new VendorDeliveryTimePage(cPage);
        apiUtils = new ApiUtils(null);
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.deliveryTime, payloads.adminAuth);
        await aPage?.close();
        await vPage?.close();
        await cPage?.close();
        await apiUtils?.dispose();
    });

    test('admin can enable delivery time module', { tag: ['@pro', '@admin'] }, async () => { await admin.enableDeliveryTimeModule(); });
    test('vendor can view delivery time menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorDeliveryTimeRenderProperly(); });
    test('vendor can view delivery time settings menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorDeliveryTimeSettingsRenderProperly(); });
    test.skip('vendor can set delivery time settings', { tag: ['@pro', '@vendor'] }, async () => { await vendor.setDeliveryTimeSettings(data.vendor.deliveryTime); });
    test('vendor can filter delivery time', { tag: ['@pro', '@vendor'] }, async () => { await vendor.filterDeliveryTime('delivery'); });
    test('vendor can change view style of delivery time calendar', { tag: ['@pro', '@vendor'] }, async () => { await vendor.updateCalendarView('week'); });

    test('customer can buy product with delivery time', { tag: ['@pro', '@customer'] }, async () => {
        await customer.addProductToCart(data.predefined.simpleProduct.product1.name, 'single-product');
        await customer.placeOrderWithDeliverTimeStorePickup('delivery-time', data.deliveryTime);
    });

    test.skip('customer can buy product with store pickup', { tag: ['@pro', '@customer'] }, async () => {
        await customer.addProductToCart(data.predefined.simpleProduct.product1.name, 'single-product');
        await customer.placeOrderWithDeliverTimeStorePickup('store-pickup', data.deliveryTime);
    });

    test('admin can disable delivery time module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.deliveryTime, payloads.adminAuth);
        await admin.disableDeliveryTimeModule();
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Vendor Delivery Time (React) Tests @pro', () => {
    test('Test Case 1 - Vendor delivery time page renders', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/dashboard/delivery-time-dashboard/`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Page renders content', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/dashboard/delivery-time-dashboard/`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.trim().length).toBeGreaterThan(50);
        await page.close();
        await ctx.close();
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Delivery Time Front-end (React) Tests @pro', () => {
    test('Test Case 1 - Page renders without fatal', { tag: ['@pro', '@guest'] }, async ({ browser }) => {
        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        await page.goto(`${BASE}/product/p1_v1-simple/`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Page renders content', { tag: ['@pro', '@guest'] }, async ({ browser }) => {
        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        await page.goto(`${BASE}/product/p1_v1-simple/`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(4000);
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.trim().length).toBeGreaterThan(50);
        await page.close();
        await ctx.close();
    });
});

