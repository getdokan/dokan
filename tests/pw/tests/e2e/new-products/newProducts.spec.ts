import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewProductsPage, newProductsData } from './newProductsPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import path from 'path';

// ============================================
// SESSION STORAGE VARIABLES
// ============================================
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Parity coverage for the 5.0.0 React rewrite of the vendor Products LIST.
// Surface: /dashboard/new/#/products  (DataViews, Lite).
// Ported from the legacy `products` spec (list-level titles only — the product
// CREATE/EDIT editor is covered by `product-form-manager`, NOT duplicated here),
// plus a cross-role business flow (seeded React product -> vendor list ->
// customer storefront).
// Fixture: pre-seeded simple product `p1_v1 (simple)` (id 19), published,
// in-stock, owned by `vendor1store`.
// ============================================

test.describe('Products (React) functionality', () => {
    // Guarantee the seeded fixture exists so the list is non-empty and the
    // status/search cases are deterministic. If `p1_v1` is missing (a wiped
    // env), recreate it via the REAL ApiUtils (categories[] required, per the
    // v1/products contract). Idempotent: skips creation when already present.
    test.beforeAll(async () => {
        const apiUtils = new ApiUtils(await request.newContext());
        const all = await apiUtils.getAllProducts(payloads.vendorAuth);
        const exists = Array.isArray(all) && all.some((p: { name?: string }) => typeof p?.name === 'string' && /p1_v1/i.test(p.name));
        if (!exists) {
            await apiUtils.createProduct(
                { ...payloads.createProduct(), name: newProductsData.seededProductName, status: 'publish' },
                payloads.vendorAuth,
            );
        }
        await apiUtils.dispose();
    });

    // ----------------------------------------
    test.describe('vendor', () => {
        let ctx: BrowserContext;
        let page: Page;
        let products: NewProductsPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            products = new NewProductsPage(page);
            await products.goto();
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('vendor can view product list page (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await expect(products.reactRoot).toBeVisible();
            await expect(products.tab(/^All/)).toBeVisible();
            expect(await products.getRowCount(), 'seeded product row renders').toBeGreaterThan(0);
            await expect(products.seededProductLink).toBeVisible();
            expect(await products.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('vendor sees the seeded product row (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await expect(products.rowByName(newProductsData.seededProductName)).toBeVisible();
        });

        test('vendor can filter by Published status tab (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await products.clickTab(/^Published/);
            expect(await products.getRowCount(), 'published tab shows the published product').toBeGreaterThan(0);
            await expect(products.rowByName(newProductsData.seededProductName)).toBeVisible();
        });

        test('vendor sees an empty Draft status tab (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await products.clickTab(/^Draft/);
            // No drafts seeded -> 0 rows + empty-state banner.
            expect(await products.getRowCount(), 'draft tab is empty').toBe(0);
            expect(await products.isEmptyStateVisible(), 'empty-state banner shows for empty Draft tab').toBe(true);
        });

        test('vendor can filter by In stock status tab (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await products.clickTab(/^In stock/);
            expect(await products.getRowCount(), 'in-stock tab shows the in-stock product').toBeGreaterThan(0);
            await expect(products.rowByName(newProductsData.seededProductName)).toBeVisible();
        });

        test('vendor can search products (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await products.search(newProductsData.searchHit);
            await expect(products.rowByName(newProductsData.seededProductName)).toBeVisible();
        });

        test('vendor sees no results for a nonsense search (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await products.search(newProductsData.searchMiss);
            expect(await products.getRowCount(), 'nonsense query -> 0 rows').toBe(0);
            expect(await products.isEmptyStateVisible(), '"No data found" empty state shows').toBe(true);
        });

        test('vendor can clear search to restore the list (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await products.search(newProductsData.searchMiss);
            expect(await products.getRowCount()).toBe(0);
            await products.clearSearch();
            expect(await products.getRowCount(), 'clearing search restores rows').toBeGreaterThan(0);
        });

        test('vendor can open the Add new product editor (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await products.clickAddNewProduct();
            expect(page.url(), 'navigated to the React create editor').toContain('#/products/create');
            await expect(products.reactRoot).toBeVisible();
        });

        test('vendor can open the seeded product editor from the list (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await products.openSeededProduct();
            expect(page.url(), 'product name link opens the edit route').toMatch(/#\/?products\/19\/edit/);
        });

        test('vendor can toggle the select-all checkbox (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            const before = await products.checkedRowCount();
            expect(before, 'no rows checked initially').toBe(0);
            await products.toggleSelectAll();
            const after = await products.checkedRowCount();
            expect(after, 'select-all checks every row checkbox').toBeGreaterThan(0);
            // Toggling off again clears them.
            await products.toggleSelectAll();
            expect(await products.checkedRowCount(), 'unchecking select-all clears rows').toBe(0);
        });

        test('vendor product list survives a reload (HashRouter) (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await expect(products.seededProductLink).toBeVisible();
            await products.reload();
            expect(page.url(), 'HashRouter keeps the products route after reload').toContain('#/products');
            await expect(products.seededProductLink).toBeVisible();
            expect(await products.hasNoPhpFatal(), 'no PHP fatal after reload').toBe(true);
        });
    });

    // ----------------------------------------
    test.describe('customer', () => {
        test('customer can view the seeded product on the vendor storefront (React)', { tag: ['@lite', '@customer', '@new-ui'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: c1 });
            const page = await ctx.newPage();
            const products = new NewProductsPage(page);
            await products.gotoStore();
            expect(await products.storeShowsProduct(newProductsData.seededProductName), 'product visible on the store').toBe(true);
            await page.close();
            await ctx.close();
        });

        test('guest can view the seeded product on the vendor storefront (React)', { tag: ['@lite', '@guest', '@new-ui'] }, async ({ browser }) => {
            const ctx = await browser.newContext(); // fresh, unauthenticated.
            const page = await ctx.newPage();
            const products = new NewProductsPage(page);
            await products.gotoStore();
            expect(await products.storeShowsProduct(newProductsData.seededProductName), 'product visible to guest on the store').toBe(true);
            await page.close();
            await ctx.close();
        });
    });

    // ----------------------------------------
    test.describe('business flow', () => {
        test('seeded React product appears in the vendor list AND on the customer store (React)', { tag: ['@lite', '@vendor', '@customer', '@guest', '@new-ui'] }, async ({ browser }) => {
            // 1. Vendor: the product (created in the React editor, seeded as p1_v1)
            //    is present in the React products list.
            const vCtx = await browser.newContext({ storageState: v1 });
            const vPage = await vCtx.newPage();
            const vProducts = new NewProductsPage(vPage);
            await vProducts.goto();
            await vProducts.search(newProductsData.searchHit);
            await expect(vProducts.rowByName(newProductsData.seededProductName), 'product in vendor list').toBeVisible();
            await vPage.close();
            await vCtx.close();

            // 2. Guest: the same product is publicly visible on the vendor store.
            const gCtx = await browser.newContext();
            const gPage = await gCtx.newPage();
            const gProducts = new NewProductsPage(gPage);
            await gProducts.gotoStore();
            expect(await gProducts.storeShowsProduct(newProductsData.seededProductName), 'product on the customer-facing store').toBe(true);
            await gPage.close();
            await gCtx.close();
        });
    });
});
