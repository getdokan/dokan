import { Page, expect, test } from '@playwright/test';
import { BookingPage, ApiUtils, payloads, data, dbUtils, dbData } from './vendorBookingPage';
import path from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:9999';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');
const { VENDOR_ID } = process.env;

test.describe('Booking Product test', () => {
    let admin: BookingPage;
    let vendor: BookingPage;
    let customer: BookingPage;
    let aPage: Page, vPage: Page, cPage: Page;
    let apiUtils: ApiUtils;
    let bookableProductName: string;

    test.setTimeout(45000);

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new BookingPage(aPage);
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new BookingPage(vPage);
        const customerContext = await browser.newContext({ storageState: c1 });
        cPage = await customerContext.newPage();
        customer = new BookingPage(cPage);
        apiUtils = new ApiUtils(null);
        [, , bookableProductName] = await apiUtils.createBookableProduct(payloads.createBookableProduct(), payloads.vendorAuth);
        await dbUtils.setUserMeta(VENDOR_ID, '_dokan_rma_settings', dbData.testData.dokan.rmaSettings, true);
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.booking, payloads.adminAuth);
        await aPage?.close();
        await vPage?.close();
        await cPage?.close();
        await apiUtils?.dispose();
    });

    test('admin can enable woocommerce booking integration module', { tag: ['@pro', '@admin'] }, async () => { await admin.enableBookingModule(); });
    test('admin can add booking product', { tag: ['@pro', '@admin'] }, async () => { await admin.adminAddBookingProduct(data.product.booking); });
    test('vendor can view booking menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorBookingRenderProperly(); });
    test('vendor can view manage booking page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorManageBookingRenderProperly(); });
    test('vendor can view booking calendar page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorBookingCalendarRenderProperly(); });
    test('vendor can view manage booking resource page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorManageResourcesRenderProperly(); });
    test('vendor can add booking product', { tag: ['@pro', '@vendor'] }, async () => { await vendor.addBookingProduct({ ...data.product.booking, name: data.product.booking.productName() }); });
    test('vendor can edit booking product', { tag: ['@pro', '@vendor'] }, async () => { await vendor.editBookingProduct({ ...data.product.booking, name: bookableProductName }); });
    test('vendor can view booking product', { tag: ['@pro', '@vendor'] }, async () => { await vendor.viewBookingProduct(bookableProductName); });
    test("vendor can't buy own booking product", { tag: ['@pro', '@vendor'] }, async () => { await vendor.cantBuyOwnBookingProduct(bookableProductName); });
    test('vendor can search booking product', { tag: ['@pro', '@vendor'] }, async () => { await vendor.searchBookingProduct(bookableProductName); });
    test('vendor can duplicate booking product', { tag: ['@pro', '@vendor'] }, async () => { await vendor.duplicateBookingProduct(bookableProductName); });
    test('vendor can filter booking products by date', { tag: ['@pro', '@vendor'] }, async () => { await vendor.filterBookingProducts('by-date', '1'); });
    test('vendor can filter booking products by category', { tag: ['@pro', '@vendor'] }, async () => { await vendor.filterBookingProducts('by-category', 'Uncategorized'); });
    test('vendor can filter booking products by other', { tag: ['@pro', '@vendor'] }, async () => { await vendor.filterBookingProducts('by-other', 'featured'); });

    test('vendor can permanently delete booking product', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , productToDelete] = await apiUtils.createBookableProduct(payloads.createBookableProduct(), payloads.vendorAuth);
        await vendor.deleteBookingProduct(productToDelete);
    });

    test('vendor can add booking resource', { tag: ['@pro', '@vendor'] }, async () => {
        const resourceName = data.product.booking.resource.resourceName();
        await vendor.addBookingResource(resourceName);
    });

    test('vendor can edit booking resource', { tag: ['@pro', '@vendor'] }, async () => {
        const resourceName = data.product.booking.resource.resourceName();
        await vendor.addBookingResource(resourceName);
        await vendor.editBookingResource({ ...data.product.booking.resource, name: resourceName });
    });

    test('vendor can delete booking resource', { tag: ['@pro', '@vendor'] }, async () => {
        const resourceName = data.product.booking.resource.resourceName();
        await vendor.addBookingResource(resourceName);
        await vendor.deleteBookingResource(resourceName);
    });

    test('vendor can add booking for guest customer', { tag: ['@pro', '@vendor'] }, async () => { await vendor.addBooking(bookableProductName, data.bookings); });
    test('customer can buy bookable product', { tag: ['@pro', '@customer'] }, async () => { await customer.buyBookableProduct(bookableProductName, data.bookings); });
    test('vendor can add booking for existing customer', { tag: ['@pro', '@vendor'] }, async () => { await vendor.addBooking(bookableProductName, data.bookings, data.customer.username); });

    test('admin can disable woocommerce booking integration module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.booking, payloads.adminAuth);
        await admin.disableBookingModule();
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Vendor Booking (React) Tests @pro', () => {
    test('Test Case 1 - Booking page renders', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/dashboard/booking/`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Booking page renders content', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/dashboard/booking/`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.trim().length).toBeGreaterThan(50);
        await page.close();
        await ctx.close();
    });
});

