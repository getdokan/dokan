import { Page, expect, test } from '@utils/test';
import { StoresPage, ApiUtils, data, payloads } from './storesPage';
import path from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:9999';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const { VENDOR_ID, PRODUCT_ID } = process.env;

test.describe('Stores test', () => {
    let admin: StoresPage;
    let aPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new StoresPage(aPage);
        apiUtils = new ApiUtils(null);
    });

    test.afterAll(async () => { await aPage?.close(); await apiUtils.dispose(); });

    test('admin can view vendors menu page', { tag: ['@lite', '@exploratory', '@admin'] }, async () => { await admin.adminVendorsRenderProperly(); });
    test('admin can view vendor details', { tag: ['@pro', '@admin'] }, async () => { await admin.viewVendorDetails(VENDOR_ID); });
    test('admin can email vendor', { tag: ['@pro', '@admin'] }, async () => { await admin.emailVendor(VENDOR_ID, data.vendor.vendorInfo.sendEmail); });
    test('admin can add vendor', { tag: ['@lite', '@admin'] }, async () => { await admin.addVendor(data.vendor.vendorInfo); });
    test('admin can search vendors', { tag: ['@lite', '@admin'] }, async () => { await admin.searchVendor(data.predefined.vendorStores.vendor1); });

    test('admin can filter vendors by status (pending)', { tag: ['@lite', '@admin'] }, async () => {
        const [, sellerId] = await apiUtils.createStore(payloads.createStore(), payloads.adminAuth);
        await apiUtils.updateStoreStatus(sellerId, { status: 'inactive' }, payloads.adminAuth);
        await admin.filterVendors('pending');
    });

    test('admin can filter vendors by status (approved)', { tag: ['@lite', '@admin'] }, async () => { await admin.filterVendors('approved'); });

    test("admin can enable vendor's selling capability", { tag: ['@lite', '@admin'] }, async () => {
        const [, sellerId, storeName] = await apiUtils.createStore(payloads.createStore(), payloads.adminAuth);
        await apiUtils.updateStoreStatus(sellerId, { status: 'inactive' }, payloads.adminAuth);
        await admin.updateVendor(storeName, 'enable');
    });

    test("admin can disable vendor's selling capability", { tag: ['@lite', '@admin'] }, async () => {
        const [, , storeName] = await apiUtils.createStore(payloads.createStore(), payloads.adminAuth);
        await admin.updateVendor(storeName, 'disable');
    });

    test.skip('admin can edit vendor info', { tag: ['@lite', '@admin'] }, async () => { await admin.editVendor(VENDOR_ID, data.vendor); });
    test('admin can view vendor products', { tag: ['@lite', '@admin'] }, async () => { await admin.viewVendor(data.predefined.vendorStores.vendor1, 'products'); });

    test('admin can view vendor orders', { tag: ['@lite', '@admin'] }, async () => {
        await apiUtils.createOrder(PRODUCT_ID, payloads.createOrder, payloads.vendorAuth);
        await admin.viewVendor(data.predefined.vendorStores.vendor1, 'orders');
    });

    test('admin can perform bulk action on vendors', { tag: ['@lite', '@admin'] }, async () => { await admin.vendorBulkAction('approved'); });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Admin Vendors (React) Tests @lite', () => {
    test('Test Case 1 - Vendors list mounts at #/vendors', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/wp-admin/admin.php?page=dokan-dashboard#/vendors`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        expect(page.url()).toMatch(/#\/vendors/);
        const fatal = await page.locator(".notice-error, body.error-page").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Vendors page shows DataViews table or list', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/wp-admin/admin.php?page=dokan-dashboard#/vendors`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(4000);
        const tableVisible = await page.locator('table, [role="table"], [class*="dataviews"]').first().isVisible({ timeout: 3000 }).catch(() => false);
        expect(tableVisible, 'Vendors page should show a DataViews table').toBe(true);
        await page.close();
        await ctx.close();
    });

    test('Test Case 3 - /vendors/create form mounts', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/wp-admin/admin.php?page=dokan-dashboard#/vendors/create`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        expect(page.url()).toMatch(/#\/vendors\/create/);
        // Form should have a name / username input
        const formInput = page.locator('input[type="text"], input[type="email"]');
        await expect(formInput.first()).toBeVisible({ timeout: 10000 });
        await page.close();
        await ctx.close();
    });

    test('Test Case 4 - Vendors page survives reload', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/wp-admin/admin.php?page=dokan-dashboard#/vendors`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
        expect(page.url()).toMatch(/#\/vendors/);
        await page.close();
        await ctx.close();
    });

    test('Test Case 5 - Vendor detail route /vendors/:id mounts', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        const vendorId = process.env.VENDOR_ID || '1';
        await page.goto(`${BASE}/wp-admin/admin.php?page=dokan-dashboard#/vendors/${vendorId}`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        expect(page.url()).toContain('#/vendors/');
        const fatal = await page.locator(".notice-error, body.error-page").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });
});

