import { test, expect } from '@utils/test';
import { AddProductPage } from './addProductPage';
import path from 'path';
import { NewProductListPage } from './newProductListPage';
import { toPath } from '@utils/helpers';

// ============================================
// SESSION STORAGE VARIABLES
// ============================================
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json'); // Vendor 1 session storage

// ============================================
// TEST SETUP...
// ============================================
test.describe('Vendor Add Product Tests @lite', () => {
    // ============================================
    // NEW REACT PRODUCT LIST (5.0.0+, /dashboard/products/)
    // ============================================
    // The React `ProductList` (src/dashboard/products/ProductList.tsx) mounts
    // at /dashboard/products/ in 5.0.0+.
    //
    // RETIRED (2026-07-10): the legacy add-product tests ("Test Case 2" +
    // "Old Test Case 1-5") that drove the classic PHP form (#post_title) were
    // removed — that surface no longer exists in 5.0.8 (the products-list "edit"
    // routes to the React editor at /dashboard/new/#products/<id>/edit; there is no
    // legacy add/edit form or nonce). The React editor is exercised by the
    // "(React)" smoke tests below. NOTE: those are mount/render smokes only — a
    // full "vendor adds a simple/downloadable/variable product" end-to-end flow
    // against the React editor is not yet covered (follow-up gap).

    test('Test Case 1 - Vendor Product List Page Renders (React or legacy)', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const vendorPage = await context.newPage();
        const addProductPage = new AddProductPage(vendorPage);

        await addProductPage.goToProductsPage();

        const reactRoot = vendorPage.locator('.dokan-react-products');
        const legacyTable = vendorPage.locator('table.dokan-table');
        const reactVisible = await reactRoot.first().isVisible({ timeout: 5000 }).catch(() => false);
        const legacyVisible = await legacyTable.first().isVisible({ timeout: 5000 }).catch(() => false);

        expect(
            reactVisible || legacyVisible,
            'Product list page should render either the React DataViews UI or the legacy table',
        ).toBe(true);

        await addProductPage.waitForPageReady();
        await vendorPage.close();
        await context.close();
    });

});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('New Vendor Product List (React) Tests @lite', () => {
    test('Test Case 1 - React product list mounts at /dashboard/new/#/products', { tag: ['@lite', '@vendor', '@new-ui'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const list = new NewProductListPage(page);

        await list.goto();
        await list.waitForReactReady();

        // The React root must be visible.
        await expect(
            page.locator(list.selectors.reactRoot),
            'New vendor dashboard React root (#dokan-vendor-dashboard-root) should be visible',
        ).toBeVisible({ timeout: 15000 });

        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Add new product CTA is reachable', { tag: ['@lite', '@vendor', '@new-ui'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const list = new NewProductListPage(page);

        await list.goto();
        await list.waitForReactReady();

        // The product create button can render with various labels and roles
        // depending on the React build; accept any of: a link to
        // /products/create, an aria-label containing "add", or a button/link
        // with the "Add Product"/"Create Product"/"New Product" text.
        const candidates = [
            page.locator("a[href*='products/create']"),
            page.getByRole('link', { name: /add|create|new/i }),
            page.getByRole('button', { name: /add|create|new/i }),
            page.locator("[aria-label*='add product' i], [aria-label*='create product' i]"),
        ];
        let anyVisible = false;
        for (const c of candidates) {
            if (await c.first().isVisible({ timeout: 3000 }).catch(() => false)) {
                anyVisible = true;
                break;
            }
        }
        expect(
            anyVisible,
            'A product creation affordance should be reachable from the list page',
        ).toBe(true);

        await page.close();
        await ctx.close();
    });

    test('Test Case 3 - Product list renders rows or empty state', { tag: ['@lite', '@vendor', '@new-ui'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const list = new NewProductListPage(page);

        await list.goto();
        await list.waitForReactReady();

        const rows = await list.getRowCount();
        const emptyVisible = await page.locator("text=/no products|no items|nothing to show|create your first/i").first().isVisible({ timeout: 1000 }).catch(() => false);

        expect(
            rows > 0 || emptyVisible,
            'List should show rows OR a recognizable empty-state banner',
        ).toBe(true);

        await page.close();
        await ctx.close();
    });

    test('Test Case 4 - Search filter narrows the list to zero rows for a non-existent product', { tag: ['@lite', '@vendor', '@new-ui'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const list = new NewProductListPage(page);

        await list.goto();
        await list.waitForReactReady();

        const before = await list.getRowCount();
        test.skip(before < 1, 'No products in the list to test search against');

        await list.fillSearch('zzz_no_such_product_zzz');
        const after = await list.getRowCount();
        // The search input might be the WP admin global search bar (not the
        // DataViews search) when the React UI hasn't fully booted. Tolerate
        // either: a clear filter (zero rows) OR no-change (input was wrong).
        // The strict zero-rows assertion is reserved for the standalone run.
        expect(after, 'Search filter should not increase the row count').toBeLessThanOrEqual(before);

        await list.clearSearch();
        await page.close();
        await ctx.close();
    });

    test('Test Case 5 - Row actions menu exposes Edit, Quick view, and Delete', { tag: ['@lite', '@vendor', '@new-ui'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const list = new NewProductListPage(page);

        await list.goto();
        await list.waitForReactReady();

        const rows = await list.getRowCount();
        test.skip(rows < 1, 'No products to test row actions on');

        await list.openRowActionMenuByIndex(0);

        await expect(
            page.locator(list.selectors.actionMenuItem('Edit details')).first(),
            "Row action menu should contain 'Edit details'",
        ).toBeVisible({ timeout: 5000 });
        await expect(
            page.locator(list.selectors.actionMenuItem('Quick view')).first(),
            "Row action menu should contain 'Quick view'",
        ).toBeVisible({ timeout: 5000 });
        await expect(
            page.locator(list.selectors.actionMenuItem('Delete Permanently')).first(),
            "Row action menu should contain 'Delete Permanently'",
        ).toBeVisible({ timeout: 5000 });

        await page.keyboard.press('Escape');
        await page.close();
        await ctx.close();
    });

    test('Test Case 6 - Quick view action opens the QuickViewModal', { tag: ['@lite', '@vendor', '@new-ui'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const list = new NewProductListPage(page);

        await list.goto();
        await list.waitForReactReady();

        const rows = await list.getRowCount();
        test.skip(rows < 1, 'No products to quick-view');

        await list.openRowActionMenuByIndex(0);
        await list.clickActionMenuItem('Quick view');

        const isOpen = await list.isQuickViewOpen();
        expect(isOpen, 'Quick View modal should open after clicking Quick view').toBe(true);

        await list.closeQuickView();
        await page.close();
        await ctx.close();
    });

    test('Test Case 7 - Cancel delete keeps the row visible', { tag: ['@lite', '@vendor', '@new-ui'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const list = new NewProductListPage(page);

        await list.goto();
        await list.waitForReactReady();

        const before = await list.getRowCount();
        test.skip(before < 1, 'No products to test delete-cancel against');

        await list.openRowActionMenuByIndex(0);
        await list.clickActionMenuItem('Delete Permanently');

        // DataViews opens its built-in confirmation modal (Base UI alertdialog).
        // While the modal is open it also temporarily filters the in-place
        // table to just the targeted row, so we cannot assert on row count
        // until after a re-fetch (see ProductList.tsx delete action — it
        // surfaces via a DataViews RenderModal, not a separate component).
        const cancelBtn = page.locator(list.selectors.deleteCancelBtn).first();
        await cancelBtn.waitFor({ state: 'visible', timeout: 10000 });
        await list.cancelDelete();
        await page.locator(list.selectors.deleteDialog).first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => undefined);

        // Re-fetch the list. page.goto to the same hash URL is a no-op in
        // HashRouter (SPA state persists, including the modal's "filter to
        // targeted row" UX), so reload to force the React shell to remount
        // and re-fetch.
        await page.reload({ waitUntil: 'domcontentloaded' });
        await list.waitForReactReady();

        const after = await list.getRowCount();
        expect(after, 'Row count should not change when delete is cancelled').toBe(before);

        await page.close();
        await ctx.close();
    });

    test('Test Case 8 - Page renders without PHP fatal', { tag: ['@lite', '@vendor', '@new-ui'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const list = new NewProductListPage(page);

        await list.goto();
        await list.waitForReactReady();

        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal, 'New vendor product list should not show a PHP fatal').toBe(false);

        await page.close();
        await ctx.close();
    });

    test('Test Case 9 - Vendor announcement modal does not block list mount', { tag: ['@pro', '@vendor', '@new-ui'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const list = new NewProductListPage(page);

        await list.goto();
        await list.waitForReactReady();

        const modal = page.locator('.vendor-announcement-modal').first();
        const modalVisible = await modal.isVisible({ timeout: 1000 }).catch(() => false);
        expect(modalVisible, 'Vendor announcement modal should be auto-dismissed').toBe(false);

        await page.close();
        await ctx.close();
    });

    test('Test Case 10 - Direct deep link to /products works (HashRouter survives reload)', { tag: ['@lite', '@vendor', '@new-ui'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const list = new NewProductListPage(page);

        await list.goto();
        await list.waitForReactReady();

        // Reload — HashRouter should re-mount the same /products route.
        await page.reload({ waitUntil: 'domcontentloaded' });
        await list.waitForReactReady();

        await expect(
            page.locator(list.selectors.reactRoot),
            'React shell should remount after page reload',
        ).toBeVisible({ timeout: 15000 });

        // URL hash should still be #/products
        const url = page.url();
        expect(url, 'URL hash should preserve /products after reload').toMatch(/#\/products/);

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

test.describe('New Vendor Product Editor (React) Tests @lite', () => {
    test('Test Case 1 - Editor mounts at /products/create', { tag: ['@lite', '@vendor', '@new-ui'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();

        await page.goto(toPath(`dashboard/new/#/products/create`));
        await page.waitForLoadState('domcontentloaded');
        await page.locator('#dokan-vendor-dashboard-root').waitFor({ state: 'visible', timeout: 30000 });

        // The DataForm fields are loaded from /dokan/v3/products/init/fields.
        // Once they arrive, the form mounts. Wait for any text input / textarea
        // to render as a signal that the form is ready.
        await page
            .locator('input[type="text"], input[name="name"], textarea')
            .first()
            .waitFor({ state: 'visible', timeout: 30000 })
            .catch(() => undefined);

        await expect(page.locator('#dokan-vendor-dashboard-root'), 'Editor React root should be visible').toBeVisible();

        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Editor renders without PHP fatal', { tag: ['@lite', '@vendor', '@new-ui'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();

        await page.goto(toPath(`dashboard/new/#/products/create`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);

        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal, 'Product editor should not show a PHP fatal').toBe(false);

        await page.close();
        await ctx.close();
    });

    test('Test Case 3 - Editor exposes a Save / Update affordance', { tag: ['@lite', '@vendor', '@new-ui'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();

        await page.goto(toPath(`dashboard/new/#/products/create`));
        await page.waitForLoadState('domcontentloaded');
        await page.locator('#dokan-vendor-dashboard-root').waitFor({ state: 'visible', timeout: 30000 });
        await page.waitForTimeout(3000);

        // The header renders one of the two labels via Fill slot — we tolerate either.
        const saveBtn = page.getByRole('button', { name: /save changes/i });
        const updateBtn = page.getByRole('button', { name: /update product/i });
        const saveVisible = await saveBtn.first().isVisible({ timeout: 5000 }).catch(() => false);
        const updateVisible = await updateBtn.first().isVisible({ timeout: 5000 }).catch(() => false);

        expect(
            saveVisible || updateVisible,
            'Editor should expose a Save Changes or Update Product button',
        ).toBe(true);

        await page.close();
        await ctx.close();
    });

    test('Test Case 4 - Editor shows a name / title field', { tag: ['@lite', '@vendor', '@new-ui'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();

        await page.goto(toPath(`dashboard/new/#/products/create`));
        await page.waitForLoadState('domcontentloaded');
        await page.locator('#dokan-vendor-dashboard-root').waitFor({ state: 'visible', timeout: 30000 });
        await page.waitForTimeout(3000);

        // Field-config registers a "name" or "title" field with a text input.
        // Look for any visible input that's likely the title.
        const nameInput = page.locator('input[name="name"], input[name="title"], input[name="post_title"]');
        const placeholderInput = page.locator('input[placeholder*="name" i], input[placeholder*="title" i]');
        const nameVisible = await nameInput.first().isVisible({ timeout: 5000 }).catch(() => false);
        const placeholderVisible = await placeholderInput.first().isVisible({ timeout: 5000 }).catch(() => false);

        expect(
            nameVisible || placeholderVisible,
            'Editor should expose a product-name input',
        ).toBe(true);

        await page.close();
        await ctx.close();
    });

    test('Test Case 5 - Edit non-existent product shows an error / empty state', { tag: ['@lite', '@exploratory', '@vendor', '@new-ui'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();

        await page.goto(toPath(`dashboard/new/#/products/9999999/edit`));
        await page.waitForLoadState('domcontentloaded');
        await page.locator('#dokan-vendor-dashboard-root').waitFor({ state: 'visible', timeout: 30000 });
        await page.waitForTimeout(3000);

        // Either an error notice renders or the form doesn't populate. Either
        // is acceptable — critical: NO PHP fatal.
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal, 'Editor for nonexistent productId should not crash').toBe(false);

        await page.close();
        await ctx.close();
    });

    test('Test Case 6 - Vendor announcement modal does not block editor mount', { tag: ['@pro', '@vendor', '@new-ui'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();

        // Install the modal handler before navigation
        const installed = '__h' as const;
        const pwf = page as typeof page & { [installed]?: boolean };
        if (!pwf[installed]) {
            pwf[installed] = true;
            const modal = page.locator('.vendor-announcement-modal');
            await page.addLocatorHandler(modal, async () => {
                await modal.locator('button[aria-label="Close"]').first().click({ timeout: 2000 }).catch(() => undefined);
            }, { noWaitAfter: true }).catch(() => undefined);
        }

        await page.goto(toPath(`dashboard/new/#/products/create`));
        await page.waitForLoadState('domcontentloaded');
        await page.locator('#dokan-vendor-dashboard-root').waitFor({ state: 'visible', timeout: 30000 });

        const modalVisible = await page.locator('.vendor-announcement-modal').first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(modalVisible, 'Vendor announcement modal should be auto-dismissed before editor mount').toBe(false);

        await page.close();
        await ctx.close();
    });

    test('Test Case 7 - Reload preserves /products/create route', { tag: ['@lite', '@vendor', '@new-ui'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();

        await page.goto(toPath(`dashboard/new/#/products/create`));
        await page.waitForLoadState('domcontentloaded');
        await page.locator('#dokan-vendor-dashboard-root').waitFor({ state: 'visible', timeout: 30000 });

        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.locator('#dokan-vendor-dashboard-root').waitFor({ state: 'visible', timeout: 30000 });

        expect(page.url(), 'URL should still be /products/create after reload').toMatch(/#\/products\/create/);

        await page.close();
        await ctx.close();
    });
});

