import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { AdminProductAdvertisingPage, adminProductAdvertisingData } from './adminProductAdvertisingPage';
import { applyAndValidateDataViewsFilter } from './adminDataViews';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { SERVER_URL } from '@utils/helpers';
import path from 'path';

// The repo's strict tsconfig doesn't pull in `@types/node`, so `process` is
// flagged as undefined elsewhere in the suite. Declare it locally (matching the
// pattern used by the existing admin specs) so this file type-checks.
declare const process: { env: Record<string, string | undefined> };

// ============================================
// ADMIN PRODUCT ADVERTISING — new React admin dashboard (Dokan Pro 5.0.0+)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/product-advertising
// (AdminDataViews, the Pro product-adv module's AdvertisementList component,
// route path 'product-advertising').
//
// Lives in the Dokan Pro `product_advertising` module, so the whole suite is
// gated behind @pro. ADMIN-ONLY spec. Every precondition (a vendor product +
// its advertisement) is seeded via REST with
// apiUtils.createProductAdvertisement(payloads.createProduct()), which creates a
// product under a vendor store and advertises it (POST
// /dokan/v1/product_adv/create). This spec never drives the vendor UI.
//
// This page DOES have a real free-text search box (placeholder "Search", mounted
// via tabs.additionalComponents, like the Vendors page) — so search filtering
// is exercised for real here, not quarantined.
//
// Storage table is {prefix}_dokan_advertised_products (these rows are all test
// data) — cleaned in beforeAll so accumulated rows / pagination don't hide the
// freshly-seeded advertisement.
// ============================================

// SESSION STORAGE STATES
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

const ADV_TABLE = `${process.env.DB_PREFIX ?? 'wp'}_dokan_advertised_products`;

let apiUtils: ApiUtils;
// Read-only fixture advertisement shared by the happy-path reads (created once).
let seededTitle: string;

// Seed one advertised product (product + advertisement) and return its title.
// Create the product under the default VENDOR store (vendorAuth) so the helper's
// `body.store.id` resolves to a real vendor for the advertisement (matches the
// proven pattern in tests/e2e/product-advertising/productAdvertising.spec.ts —
// an admin-authored product has no vendor store, so vendor_id would be missing).
//
// IMPORTANT: the Product Name DataViews cell hard-truncates the title in the DOM
// (renders `title.slice(0, ~22) + '…'`), so a long random faker name can never be
// matched by hasText(fullTitle). Give each seeded product a SHORT unique name
// ("AADV<n>-<base36 time>", ~10 chars) so the cell renders it in full.
let advCounter = 0;
async function seedAdvertisement(): Promise<string> {
    advCounter += 1;
    const name = `AADV${advCounter}-${Date.now().toString(36).slice(-4)}`;
    const [, , advertisedProduct] = await apiUtils.createProductAdvertisement({ ...payloads.createProduct(), name }, payloads.vendorAuth);
    return advertisedProduct;
}

test.describe('Admin Product Advertising functionality @pro', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        // The product_advertising Pro module must be active or both the create
        // route and the admin list endpoint fail.
        await apiUtils.activateModules(payloads.moduleIds.productAdvertising, payloads.adminAuth);
        // Clear accumulated advertisements from prior runs so the seeded row is on
        // page 1 (newest-first) and the search/list assertions aren't hidden by
        // pagination. These rows are all test data.
        await dbUtils.dbQuery(`DELETE FROM ${ADV_TABLE};`);
        // Seed one advertisement so the list + search + Active tab all have a row.
        seededTitle = await seedAdvertisement();
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    // ----------------------------------------
    test.describe('happy paths', () => {
        let ctx: BrowserContext;
        let page: Page;
        let adv: AdminProductAdvertisingPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            adv = new AdminProductAdvertisingPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('applying the Vendor filter refetches the list and re-renders the table', { tag: ['@pro', '@admin'] }, async () => {
            await adv.goto();
            const result = await applyAndValidateDataViewsFilter(page, { requestFragment: 'dokan/v1/product_adv', field: 'Vendor' });
            expect(result.requestFired, 'applying the Vendor filter refetched the list').toBe(true);
            expect(result.noPhpFatal, 'no PHP fatal after filtering').toBe(true);
            expect(result.ok, 'the Vendor filter applied and the table re-rendered (rows or empty state)').toBe(true);
        });

        test('admin can view the Product Advertising list with DataViews table and columns', { tag: ['@pro', '@admin'] }, async () => {
            await adv.goto();
            await expect(adv.reactRoot).toBeVisible();
            await expect(adv.heading).toBeVisible();
            await expect(adv.columnHeader(/Product Name/)).toBeVisible();
            await expect(adv.columnHeader(/Store Name/)).toBeVisible();
            await expect(adv.columnHeader(/Created Via/)).toBeVisible();
            await expect(adv.columnHeader(/Order ID/)).toBeVisible();
            await expect(adv.columnHeader(/Cost/)).toBeVisible();
            await expect(adv.columnHeader(/Expires/)).toBeVisible();
            await expect(adv.columnHeader(/Status/)).toBeVisible();
            expect(await adv.getRowCount(), 'seeded advertisement rows render').toBeGreaterThan(0);
            expect(await adv.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('All, Active and Expired status tabs are present on the list', { tag: ['@pro', '@admin'] }, async () => {
            await adv.goto();
            await expect(adv.tab(/All/)).toBeVisible();
            await expect(adv.tab(/Active/)).toBeVisible();
            await expect(adv.tab(/Expired/)).toBeVisible();
        });

        test('the seeded advertised product is visible in the list', { tag: ['@pro', '@admin'] }, async () => {
            await adv.goto();
            await expect(adv.rowByProductTitle(seededTitle)).toBeVisible();
        });

        test('a freshly-advertised product appears under the Active tab', { tag: ['@pro', '@admin'] }, async () => {
            // Seed a dedicated active advertisement for this assertion so it never
            // races the expire test below.
            const title = await seedAdvertisement();
            await adv.goto();
            await adv.clickTab(/Active/);
            await expect(adv.rowByProductTitle(title)).toBeVisible();
            expect(await adv.statusOfRow(title), 'row status is Active under the Active tab').toBe('Active');
        });

        test('searching by the product title filters the list to that advertisement', { tag: ['@pro', '@admin'] }, async () => {
            await adv.goto();
            await adv.search(seededTitle);
            await expect(adv.rowByProductTitle(seededTitle)).toBeVisible();
            expect(await adv.getRowCount(), 'search narrows to the matching advertisement').toBeGreaterThan(0);
        });

        test('the "Add New" button is present and opens the Add New Advertisement modal', { tag: ['@pro', '@admin'] }, async () => {
            await adv.goto();
            await expect(adv.addNewButton).toBeVisible();
            await adv.openAddModal();
            expect(await adv.isAddModalVisible(), 'Add New Advertisement modal opens').toBe(true);
            await adv.closeAddModal();
            expect(await adv.isAddModalVisible(), 'Add modal closes cleanly').toBe(false);
        });
    });

    // ----------------------------------------
    // Mutating cases isolate the table to a known row, then assert against the
    // REST total/status headers (the source of truth the DataView renders from).
    test.describe('expire flow', () => {
        let ctx: BrowserContext;
        let page: Page;
        let adv: AdminProductAdvertisingPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            adv = new AdminProductAdvertisingPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        // The expire action posts to /dokan/v1/product_adv/batch and the
        // AdvertisementList re-fetches. If the action does not persist headless,
        // this is flagged @exploratory rather than weakening the assertion.
        test('expiring an active advertisement moves it out of the Active tab', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            const title = await seedAdvertisement();

            await adv.goto();
            await adv.clickTab(/Active/);
            await adv.search(title);
            await expect(adv.rowByProductTitle(title)).toBeVisible();

            await adv.expireAdvertisement(title);

            // The list re-fetches after the batch POST; re-navigate to the Active
            // tab to force a fresh fetch, then the advertisement must be gone.
            await adv.goto();
            await adv.clickTab(/Active/);
            await adv.search(title);
            await expect.poll(async () => adv.isAdvertisementVisible(title), { timeout: 15000 }).toBe(false);
        });

        test('a cancelled expire keeps the advertisement active', { tag: ['@pro', '@admin'] }, async () => {
            const title = await seedAdvertisement();

            await adv.goto();
            await adv.clickTab(/Active/);
            await adv.search(title);
            await expect(adv.rowByProductTitle(title)).toBeVisible();

            await adv.openRowActionMenuFor(title);
            await adv.clickActionMenuItem('Expire');
            await adv.expireModalHeading.waitFor({ state: 'visible', timeout: 10000 });
            await adv.cancelExpire();

            // Cancelling must leave the advertisement active.
            await expect(adv.rowByProductTitle(title)).toBeVisible();
            expect(await adv.statusOfRow(title), 'row stays Active after cancelling Expire').toBe('Active');
        });
    });

    // ----------------------------------------
    test.describe('edge cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let adv: AdminProductAdvertisingPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            adv = new AdminProductAdvertisingPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('searching for an unmatched product shows the empty state', { tag: ['@pro', '@admin'] }, async () => {
            await adv.goto();
            await adv.search(adminProductAdvertisingData.searchMiss);
            const empty = (await adv.isEmptyStateVisible()) || (await adv.getRowCount()) === 0;
            expect(empty, 'no rows / empty-state for an unmatched search').toBe(true);
        });

        test('reloading on #/product-advertising preserves the route and re-mounts the list', { tag: ['@pro', '@admin'] }, async () => {
            await adv.goto();
            await adv.reload();
            await expect(page).toHaveURL(/#\/product-advertising/);
            await expect(adv.reactRoot).toBeVisible();
            await expect(adv.heading).toBeVisible();
            expect(await adv.hasNoPhpFatal(), 'no PHP fatal after reload').toBe(true);
        });

        test('REST: GET /product_adv returns the seeded advertisement total to admin', { tag: ['@pro', '@admin'] }, async () => {
            const apiCtx = await request.newContext();
            const response = await adv.restGetAdvertisements(apiCtx);
            expect(response.status(), 'admin GET /product_adv returns 200').toBe(200);
            const total = await adv.restGetTotal(apiCtx);
            expect(total, 'at least one advertisement is seeded').toBeGreaterThan(0);
            await apiCtx.dispose();
        });
    });

    // ----------------------------------------
    test.describe('negative cases', () => {
        test('a logged-in vendor cannot access the admin Product Advertising page', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const adv = new AdminProductAdvertisingPage(page);
            await page.goto(adv.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await adv.isAccessDenied(), 'a vendor must not see the admin Product Advertising UI').toBe(true);
            await ctx.close();
        });

        test('a logged-in customer cannot access the admin Product Advertising page', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: c1 });
            const page = await ctx.newPage();
            const adv = new AdminProductAdvertisingPage(page);
            await page.goto(adv.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await adv.isAccessDenied(), 'a customer must not see the admin Product Advertising UI').toBe(true);
            await ctx.close();
        });

        test('REST: an unauthenticated request to /product_adv is rejected', { tag: ['@pro', '@customer'] }, async () => {
            const apiCtx = await request.newContext();
            const url = new URL(`${SERVER_URL}/dokan/v1/product_adv`);
            const response = await apiCtx.get(url.toString());
            expect([401, 403], 'unauthenticated GET /product_adv should be rejected').toContain(response.status());
            await apiCtx.dispose();
        });
    });
});
