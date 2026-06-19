import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { AdminVendorsPage, adminVendorsData } from './adminVendorsPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import path from 'path';

// ============================================
// ADMIN VENDORS LIST — new React admin dashboard (Dokan 5.0.0+)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/vendors (AdminDataViews).
//
// ADMIN-ONLY spec. Every vendor precondition (approved / pending / disabled
// vendors, bulk targets) is seeded via the REST API (apiUtils.createStore +
// updateStoreStatus, admin auth) — this spec never drives the vendor UI.
// See tests/pw/test-cases/admin-dashboard-seeding-strategy.md (§ Vendors list).
// ============================================

// SESSION STORAGE STATES
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

let apiUtils: ApiUtils;
const ids: { approved?: string; pending?: string; approveTarget?: string; disableTarget?: string; bulk: string[] } = { bulk: [] };

// Seed a vendor store (idempotent + re-runnable) and force its selling status.
// Look up the store first so we never take createStore's "already exists ->
// updateStore" path, which 400s on the non-boolean `show_email: 'yes'` field in
// payloads.createStore() (the v1 stores PUT validates show_email as boolean;
// the POST is lenient).
async function seedVendor(v: { storeName: string; userLogin: string; email: string }, status: 'active' | 'inactive'): Promise<string> {
    let sellerId = await apiUtils.getSellerId(v.storeName, payloads.adminAuth);
    if (!sellerId) {
        const [, id] = await apiUtils.createStore({ ...payloads.createStore(), store_name: v.storeName, user_login: v.userLogin, email: v.email }, payloads.adminAuth);
        sellerId = id;
    }
    if (sellerId) {
        await apiUtils.updateStoreStatus(sellerId, { status }, payloads.adminAuth);
    }
    return sellerId;
}

test.describe('Admin Vendors list functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        ids.approved = await seedVendor(adminVendorsData.approved, 'active');
        ids.pending = await seedVendor(adminVendorsData.pending, 'inactive');
        ids.approveTarget = await seedVendor(adminVendorsData.approveTarget, 'inactive');
        ids.disableTarget = await seedVendor(adminVendorsData.disableTarget, 'active');
        ids.bulk = [];
        for (const b of adminVendorsData.bulk) {
            ids.bulk.push(await seedVendor(b, 'inactive'));
        }
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    // ----------------------------------------
    test.describe('happy paths', () => {
        let ctx: BrowserContext;
        let page: Page;
        let vendors: AdminVendorsPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            vendors = new AdminVendorsPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('admin can view the Vendors list with DataViews table and columns', { tag: ['@lite', '@admin'] }, async () => {
            await vendors.goto();
            await expect(vendors.reactRoot).toBeVisible();
            await expect(vendors.heading).toBeVisible();
            await expect(vendors.columnHeader('Vendor')).toBeVisible();
            await expect(vendors.columnHeader('Phone')).toBeVisible();
            await expect(vendors.columnHeader('Registered')).toBeVisible();
            await expect(vendors.columnHeader('Status')).toBeVisible();
            expect(await vendors.getRowCount(), 'seeded vendor rows render').toBeGreaterThan(0);
            expect(await vendors.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('Add Vendor button navigates to the create form', { tag: ['@lite', '@admin'] }, async () => {
            await vendors.goto();
            await vendors.clickAddVendor();
            await expect(page).toHaveURL(/#\/vendors\/create/);
        });

        test('searching by store name filters the list to the matching vendor', { tag: ['@lite', '@admin'] }, async () => {
            await vendors.goto();
            await vendors.search(adminVendorsData.approved.storeName);
            await expect(vendors.rowByStoreName(adminVendorsData.approved.storeName)).toBeVisible();
            await expect(page.getByText(adminVendorsData.pending.storeName, { exact: false })).toHaveCount(0);
        });

        test('Approved tab shows an enabled vendor with the Enabled status pill', { tag: ['@lite', '@admin'] }, async () => {
            await apiUtils.updateStoreStatus(ids.approved!, { status: 'active' }, payloads.adminAuth);
            await vendors.goto();
            await vendors.clickTab(/Approved/);
            await vendors.search(adminVendorsData.approved.storeName);
            await expect(vendors.rowByStoreName(adminVendorsData.approved.storeName)).toBeVisible();
            expect(await vendors.statusOfRow(adminVendorsData.approved.storeName)).toBe('Enabled');
        });

        test('Pending tab shows a disabled vendor with the Disabled status pill', { tag: ['@lite', '@admin'] }, async () => {
            await apiUtils.updateStoreStatus(ids.pending!, { status: 'inactive' }, payloads.adminAuth);
            await vendors.goto();
            await vendors.clickTab(/Pending/);
            await vendors.search(adminVendorsData.pending.storeName);
            await expect(vendors.rowByStoreName(adminVendorsData.pending.storeName)).toBeVisible();
            expect(await vendors.statusOfRow(adminVendorsData.pending.storeName)).toBe('Disabled');
        });

        test('admin can approve a pending vendor (status flips to Enabled)', { tag: ['@lite', '@admin'] }, async () => {
            await apiUtils.updateStoreStatus(ids.approveTarget!, { status: 'inactive' }, payloads.adminAuth);
            await vendors.goto();
            await vendors.search(adminVendorsData.approveTarget.storeName);
            await vendors.approveVendor(adminVendorsData.approveTarget.storeName);
            await expect.poll(async () => vendors.statusOfRow(adminVendorsData.approveTarget.storeName), { timeout: 15000 }).toBe('Enabled');
        });

        test('admin can disable an enabled vendor (status flips to Disabled)', { tag: ['@lite', '@admin'] }, async () => {
            await apiUtils.updateStoreStatus(ids.disableTarget!, { status: 'active' }, payloads.adminAuth);
            await vendors.goto();
            await vendors.search(adminVendorsData.disableTarget.storeName);
            await vendors.disableVendor(adminVendorsData.disableTarget.storeName);
            await expect.poll(async () => vendors.statusOfRow(adminVendorsData.disableTarget.storeName), { timeout: 15000 }).toBe('Disabled');
        });

        test('Edit row action navigates to the vendor edit form', { tag: ['@lite', '@admin'] }, async () => {
            await vendors.goto();
            await vendors.search(adminVendorsData.approved.storeName);
            await vendors.editVendor(adminVendorsData.approved.storeName);
            await expect(page).toHaveURL(/#\/vendors\/edit\/\d+/);
        });

        test('admin can bulk-approve pending vendors', { tag: ['@lite', '@admin', '@exploratory'] }, async () => {
            for (const id of ids.bulk) {
                await apiUtils.updateStoreStatus(id, { status: 'inactive' }, payloads.adminAuth);
            }
            await vendors.goto();
            await vendors.clickTab(/Pending/);
            await vendors.selectRowsByStoreName(adminVendorsData.bulk.map(b => b.storeName));
            await vendors.bulkAction('Approve Vendors', 'Yes, Approve');
            // Verify the bulk action took effect in the UI: both vendors now Enabled.
            await vendors.clickTab(/All/);
            for (const b of adminVendorsData.bulk) {
                await vendors.search(b.storeName);
                await expect.poll(async () => vendors.statusOfRow(b.storeName), { timeout: 10000 }).toBe('Enabled');
                await vendors.clearSearch();
            }
        });
    });

    // ----------------------------------------
    test.describe('edge cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let vendors: AdminVendorsPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            vendors = new AdminVendorsPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('search with no match shows the empty state', { tag: ['@lite', '@admin'] }, async () => {
            await vendors.goto();
            await vendors.search(adminVendorsData.searchMiss);
            const empty = (await vendors.isEmptyStateVisible()) || (await vendors.getRowCount()) === 0;
            expect(empty, 'no rows / empty-state for an unmatched search').toBe(true);
        });

        test('reloading on #/vendors preserves the route and re-mounts the list', { tag: ['@lite', '@admin'] }, async () => {
            await vendors.goto();
            await vendors.reload();
            await expect(page).toHaveURL(/#\/vendors/);
            await expect(vendors.reactRoot).toBeVisible();
            await expect(vendors.heading).toBeVisible();
        });

        test('sorting the Registered column requests orderby=registered from the API', { tag: ['@lite', '@admin', '@exploratory'] }, async () => {
            await vendors.goto();
            const url = await vendors.sortByRegisteredAndCaptureQuery();
            expect(decodeURIComponent(url)).toMatch(/orderby=registered/);
        });
    });

    // ----------------------------------------
    test.describe('negative cases', () => {
        test('a logged-in vendor cannot access the admin Vendors page', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const vendors = new AdminVendorsPage(page);
            await page.goto(vendors.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await vendors.isAccessDenied(), 'a vendor must not see the admin Vendors UI').toBe(true);
            await ctx.close();
        });

        test('a logged-in customer cannot access the admin Vendors page', { tag: ['@lite', '@customer'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: c1 });
            const page = await ctx.newPage();
            const vendors = new AdminVendorsPage(page);
            await page.goto(vendors.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await vendors.isAccessDenied(), 'a customer must not see the admin Vendors UI').toBe(true);
            await ctx.close();
        });
    });
});
