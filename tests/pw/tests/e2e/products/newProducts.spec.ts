import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewProductsPage, newProductsData } from './newProductsPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';
import { VendorTableFilter } from '@utils/vendorTableFilter';
import { VENDOR_STORAGE_STATE as v1, CUSTOMER_STORAGE_STATE as c1 } from '@utils/authStates';

// Coverage for the 5.0.0 React vendor Products LIST at /dashboard/new/#/products
// (DataViews). The create/edit editor is owned by `product-form-manager`.
// Assertions target only the Lite-guaranteed surface so the @lite spec passes in
// both Lite and Pro. Destructive cases seed their own throwaway products via REST
// and force-delete them in teardown.

// Seed a product for the vendor and return [id, name].
async function seedProduct(
    apiUtils: ApiUtils,
    overrides: Record< string, unknown > = {}
): Promise< [ string, string ] > {
    const [ , id, name ] = await apiUtils.createProduct(
        { ...payloads.createProduct(), ...overrides },
        payloads.vendorAuth
    );
    return [ id, name ];
}

test.describe('Products (React) functionality', () => {
    // Guarantee the seeded fixture exists (idempotent) so search/status cases are deterministic.
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
            await products.revealSeeded();
            await expect(products.seededProductLink).toBeVisible();
            expect(await products.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('vendor sees the core DataViews columns (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            const headers = await products.getColumnHeaderTexts();
            // Lite-guaranteed columns (Pro adds "Advertise"; not asserted).
            for (const col of ['products', 'type', 'stock', 'status', 'price', 'earning', 'views']) {
                expect(headers, `column "${col}" present`).toContain(col);
            }
        });

        test('vendor sees the seeded product row with SKU + status (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await products.revealSeeded();
            const row = products.rowByName(newProductsData.seededProductName);
            await expect(row).toBeVisible();
            const rowText = await products.rowStatusText(newProductsData.seededProductName);
            expect(rowText, 'row shows a SKU label').toMatch(/SKU:/i);
            expect(rowText, 'row shows the Published status badge').toMatch(/Published/i);
            expect(rowText, 'row shows stock state').toMatch(/In stock/i);
        });

        // Count/empty-state checks use web-first assertions (toHaveCount/expect.poll)
        // so they auto-retry until the DataViews REST refetch repaints.
        test('vendor can filter by Published status tab (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await products.clickTab(/^Published/);
            await products.revealSeeded();
            await expect(products.rowByName(newProductsData.seededProductName)).toBeVisible();
        });

        test('vendor sees an empty Draft status tab (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await products.clickTab(/^Draft/);
            await expect(products.rows, 'draft tab is empty').toHaveCount(0);
            await expect(products.emptyState, 'empty-state banner shows for empty Draft tab').toBeVisible();
        });

        test('vendor sees an empty Pending Review status tab (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await products.clickTab(/^Pending Review/);
            await expect(products.rows, 'pending tab is empty').toHaveCount(0);
            await expect(products.emptyState, 'empty-state banner shows for empty Pending tab').toBeVisible();
        });

        test('vendor can filter by In stock status tab (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await products.clickTab(/^In stock/);
            await products.revealSeeded();
            await expect(products.rowByName(newProductsData.seededProductName)).toBeVisible();
        });

        test('vendor can switch to the Out of stock status tab (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await products.clickTab(/^Out of stock/);
            // Seeded fixture is in stock, so it must NOT appear here.
            await expect(products.rowByName(newProductsData.seededProductName)).toBeHidden();
        });

        // ---- Search ----
        test('vendor can search products (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await products.search(newProductsData.searchHit);
            await expect(products.rowByName(newProductsData.seededProductName)).toBeVisible();
        });

        test('vendor sees no results for a nonsense search (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await products.search(newProductsData.searchMiss);
            await expect(products.rows, 'nonsense query -> 0 rows').toHaveCount(0);
            await expect(products.emptyState, '"No data found" empty state shows').toBeVisible();
        });

        test('vendor can clear search to restore the list (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await products.search(newProductsData.searchMiss);
            await expect(products.rows).toHaveCount(0);
            await products.clearSearch();
            await expect.poll(() => products.getRowCount(), { message: 'clearing search restores rows' }).toBeGreaterThan(0);
        });

        test('vendor can filter products by Product Type via the funnel (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            const filter = new VendorTableFilter(page, 'products');
            // No variable products seeded -> filtering by Variable empties the list.
            await filter.applySelect('Product Type', 'Variable');
            await expect(products.rows, 'Variable filter empties the list').toHaveCount(0);
            expect(await filter.activeFilterCount(), 'one active filter').toBe(1);
            await filter.reset();
            await expect.poll(() => products.getRowCount(), { message: 'reset restores rows' }).toBeGreaterThan(0);
        });

        test('vendor can filter products by Category via the funnel (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            const filter = new VendorTableFilter(page, 'products');
            const category = await filter.applyFirstOption('Category');
            expect(category, 'a category option was applied').not.toBe('');
            expect(await filter.activeFilterCount(), 'one active filter').toBe(1);
            expect(await products.hasNoPhpFatal(), 'no PHP fatal while filtered').toBe(true);
            await filter.reset();
            await expect.poll(() => products.getRowCount(), { message: 'reset restores rows' }).toBeGreaterThan(0);
        });

        test('vendor can combine two filters and reset clears them (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            const filter = new VendorTableFilter(page, 'products');
            await filter.applyFirstOption('Category');
            await filter.applySelect('Product Type', 'Simple');
            expect(await filter.activeFilterCount(), 'two active filters').toBe(2);
            await filter.reset();
            expect(await filter.activeFilterCount(), 'reset clears all filters').toBe(0);
            await expect.poll(() => products.getRowCount()).toBeGreaterThan(0);
        });

        // FIXME (post-merge with develop #3296 "quick-create product modal"): #3296 changed the modal gate to
        // is_quick_create_enabled = NOT one_step_product_create AND NOT disable_product_popup (Assets.php), so
        // the modal now opens when one_step_product_create is OFF — the INVERSE of what these two tests assume.
        // Reworking them needs the dokan_selling option toggled and reflected in the SERVER-localized flag
        // mid-test, but that value is served through WordPress's autoloaded alloptions cache which does not
        // reliably invalidate here (verified: raw SQL, update_option via a REST helper, and 45s of reloads all
        // fail to propagate the flip intermittently). Skipped until reworked to seed the modal state reliably
        // (e.g. at env-setup) rather than toggling it per-test. Not fake-green: an explicit, documented skip.
        test.fixme('vendor can open the quick-create product modal (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            // Under #3296 the modal opens only when is_quick_create_enabled (one_step_product_create OFF).
            await products.clickAddNewProduct();
            await expect(products.quickCreateModalTitle, 'quick-create modal opened').toBeVisible();
            await expect(products.quickCreateConfirmButton).toBeVisible();
            expect(page.url(), 'stayed on the list route').toContain('#/products');
        });

        test.fixme('vendor navigates to the full create editor when quick-create is off (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            // Under #3296, quick-create is "off" when one_step_product_create is ON (is_quick_create_enabled false).
            await dbUtils.updateOptionValue(dbData.dokan.optionName.selling, { one_step_product_create: 'on' });
            await products.goto();
            await products.addNewProductButton.click();
            await page.waitForURL(/#\/products\/create/, { timeout: 15000 }).catch(() => undefined);
            expect(page.url(), 'navigated to the React create editor').toContain('#/products/create');
            await expect(products.reactRoot).toBeVisible();
        });

        test('vendor can open the seeded product editor from the list (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await products.revealSeeded();
            await products.openSeededProduct();
            // Post ids drift per environment — assert the route shape, not a literal id.
            expect(page.url(), 'product name link opens the edit route').toMatch(/#\/?products\/\d+\/edit/);
        });

        test('vendor sees the core row actions in the 3-dot menu (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await products.revealSeeded();
            const labels = (await products.rowMenuItemLabels(newProductsData.seededProductName)).map((l) => l.toLowerCase());
            for (const action of ['edit details', 'quick view', 'view in site', 'delete permanently']) {
                expect(labels.join(' | '), `row action "${action}" present`).toContain(action);
            }
        });

        test('vendor can open and close the Quick view modal (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await products.revealSeeded();
            await products.openQuickView(newProductsData.seededProductName);
            expect(await products.isQuickViewOpen(), 'quick view modal opens').toBe(true);
            const text = await products.quickViewText();
            expect(text, 'modal shows the product name').toContain(newProductsData.seededProductName);
            expect(text).toMatch(/Product info/i);
            expect(text).toMatch(/Type/i);
            expect(text).toMatch(/Status/i);
            expect(text).toMatch(/Price/i);
            await products.closeQuickView();
            expect(await products.isQuickViewOpen(), 'quick view modal closes').toBe(false);
        });

        test('vendor can open a product on the storefront via "View in site" (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await products.revealSeeded();
            const popup = await products.viewInSite(newProductsData.seededProductName);
            expect(popup, 'a storefront tab opened').not.toBeNull();
            if (popup) {
                expect(await popup.title()).not.toBe('');
                await popup.close();
            }
        });

        test('vendor can toggle the select-all checkbox (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            const before = await products.checkedRowCount();
            expect(before, 'no rows checked initially').toBe(0);
            await products.toggleSelectAll();
            const after = await products.checkedRowCount();
            expect(after, 'select-all checks every row checkbox').toBeGreaterThan(0);
            await products.toggleSelectAll();
            expect(await products.checkedRowCount(), 'unchecking select-all clears rows').toBe(0);
        });

        test('vendor product list survives a reload (HashRouter) (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await products.revealSeeded();
            await expect(products.seededProductLink).toBeVisible();
            await products.reload();
            expect(page.url(), 'HashRouter keeps the products route after reload').toContain('#/products');
            // The reload clears the search box, so narrow again before re-asserting.
            await products.revealSeeded();
            await expect(products.seededProductLink).toBeVisible();
            expect(await products.hasNoPhpFatal(), 'no PHP fatal after reload').toBe(true);
        });
    });

    test.describe('vendor destructive actions', () => {
        test.describe.configure({ mode: 'serial' });

        let apiUtils: ApiUtils;
        const createdIds: string[] = [];

        test.beforeAll(async () => {
            apiUtils = new ApiUtils(await request.newContext());
        });

        test.afterAll(async () => {
            for (const id of createdIds) {
                await apiUtils.deleteProduct(id, payloads.vendorAuth, true).catch(() => undefined);
            }
            await apiUtils.dispose();
        });

        let ctx: BrowserContext;
        let page: Page;
        let products: NewProductsPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            products = new NewProductsPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('vendor can delete a single product from the row menu (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            const [id, name] = await seedProduct(apiUtils, { name: `PWDEL-one ${Date.now()}`, status: 'publish' });
            createdIds.push(id);

            await products.goto();
            await products.search(name);
            await expect(products.rowByName(name), 'seeded product is in the list').toBeVisible();

            await products.deleteProduct(name);

            await products.search(name);
            await expect(products.rows, 'deleted product no longer in the list').toHaveCount(0);
        });

        test('vendor can cancel a delete without removing the product (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            const [id, name] = await seedProduct(apiUtils, { name: `PWDEL-cancel ${Date.now()}`, status: 'publish' });
            createdIds.push(id);

            await products.goto();
            await products.search(name);
            await expect(products.rowByName(name)).toBeVisible();

            await products.openDeleteConfirm(name);
            await products.cancelDelete();

            await expect(products.rowByName(name), 'cancelled delete keeps the product').toBeVisible();
        });

        test('vendor can bulk-delete selected products (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            const stamp = Date.now();
            const [idA, nameA] = await seedProduct(apiUtils, { name: `PWBULKDEL-A ${stamp}`, status: 'publish' });
            const [idB, nameB] = await seedProduct(apiUtils, { name: `PWBULKDEL-B ${stamp}`, status: 'publish' });
            createdIds.push(idA, idB);

            await products.goto();
            await products.search(`PWBULKDEL`);
            await expect(products.rowByName(nameA)).toBeVisible();
            await expect(products.rowByName(nameB)).toBeVisible();

            await products.selectRow(nameA);
            await products.selectRow(nameB);
            await products.bulkDelete();

            await products.search(`PWBULKDEL`);
            await expect(products.rows, 'both products bulk-deleted').toHaveCount(0);
        });

        test('vendor can bulk-publish a draft product (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            const [id, name] = await seedProduct(apiUtils, { name: `PWPUB-draft ${Date.now()}`, status: 'draft' });
            createdIds.push(id);

            await products.goto();
            await products.search(name);
            const row = products.rowByName(name);
            await expect(row).toBeVisible();
            expect(await products.rowStatusText(name), 'starts as Draft').toMatch(/Draft/i);

            await products.selectRow(name);
            await products.bulkPublish();

            // Verify via the data layer (authoritative).
            const fetched = await apiUtils.getSingleProduct(id, payloads.vendorAuth);
            expect(fetched?.status, 'product is now published').toBe('publish');
        });
    });

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

    test.describe('business flow', () => {
        test('seeded React product appears in the vendor list AND on the customer store (React)', { tag: ['@lite', '@vendor', '@customer', '@guest', '@new-ui'] }, async ({ browser }) => {
            // 1. Vendor: product present in the React list.
            const vCtx = await browser.newContext({ storageState: v1 });
            const vPage = await vCtx.newPage();
            const vProducts = new NewProductsPage(vPage);
            await vProducts.goto();
            await vProducts.search(newProductsData.searchHit);
            await expect(vProducts.rowByName(newProductsData.seededProductName), 'product in vendor list').toBeVisible();
            await vPage.close();
            await vCtx.close();

            // 2. Guest: same product publicly visible on the vendor store.
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
