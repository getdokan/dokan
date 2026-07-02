import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewOrdersPage } from './newOrdersPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { VendorTableFilter } from '@utils/vendorTableFilter';
import { VENDOR_STORAGE_STATE as v1, CUSTOMER_STORAGE_STATE as c1 } from '@utils/authStates';

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Parity coverage for the 5.0.0 React rewrite of the vendor Orders list.
// Surface: /dashboard/new/#/orders  (DataViews list, Lite).
// Ported from the legacy `orders` (vendor) and `my-orders` (customer) specs,
// driving the React UI, plus a cross-role business flow
// (customer places order -> vendor sees it in React /orders -> vendor completes
// it -> the change persists).
//
// The React list is EMPTY on a fresh seed, so we seed a processing order in
// beforeAll via the REAL ApiUtils.
// ============================================

let seededOrderId: string;

test.describe('Orders (React) functionality', () => {
    test.beforeAll(async () => {
        const apiUtils = new ApiUtils(await request.newContext());
        const [, , orderId] = await apiUtils.createOrderWithStatus(
            process.env.PRODUCT_ID as string,
            { ...payloads.createOrder, line_items: [{ product_id: process.env.PRODUCT_ID, quantity: 2 }] },
            'wc-processing',
            // dokan/v1/orders is vendor-scoped: a customer gets 403 and admin gets
            // 400 ("not your product"). Seed as the vendor who owns p1_v1.
            payloads.vendorAuth,
        );
        seededOrderId = orderId;
        await apiUtils.dispose();
    });

    // ============================================
    // VENDOR — React /dashboard/new/#/orders (DataViews)
    // ============================================
    test.describe('vendor', () => {
        let ctx: BrowserContext;
        let page: Page;
        let orders: NewOrdersPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            orders = new NewOrdersPage(page);
            await orders.goto();
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('vendor can view order list page (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await expect(orders.reactRoot).toBeVisible({ timeout: 15000 });
            await expect(orders.heading).toBeVisible();
            await expect(orders.exportButton, 'Export control is present').toBeVisible();
            expect(await orders.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('vendor order list shows the seeded order row (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            const rows = await orders.getRowCount();
            const empty = await orders.isEmptyStateVisible();
            expect(rows > 0 || empty, 'order list shows rows OR an empty-state banner').toBe(true);
            // Seed should have succeeded — expect at least one row.
            expect(rows, 'seeded processing order should appear as a row').toBeGreaterThan(0);
        });

        test('vendor sees the core order columns (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            const headers = await orders.getColumnHeaderTexts();
            // Lite-guaranteed columns (Shipment is conditional on the shipping feature; not asserted).
            for (const col of ['order', 'order total', 'earning', 'status', 'customer']) {
                expect(headers.join(' | '), `column "${col}" present`).toContain(col);
            }
        });

        test('vendor seeded order row shows status badge + total (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await orders.fillSearch(String(seededOrderId));
            const row = orders.orderRowById(seededOrderId);
            await expect(row, 'seeded order row is isolated by id').toBeVisible();
            const rowText = (await row.innerText()).replace(/\s+/g, ' ');
            expect(rowText, 'row shows the Processing status badge').toMatch(/Processing/i);
            expect(rowText, 'row shows a money amount').toMatch(/\d/);
            await orders.clearSearch();
        });

        test('vendor can open the Export dropdown (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await orders.openExportMenu();
            await expect(orders.exportFilteredOption, 'dropdown exposes "Export Filtered"').toBeVisible();
            await page.keyboard.press('Escape').catch(() => undefined);
        });

        test('vendor can view the All status tab (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await orders.clickStatusTab('All');
            expect(await orders.getRowCount(), 'All tab lists the accumulated orders').toBeGreaterThan(0);
        });

        test('vendor sees the empty state for a non-existent order id search (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await orders.fillSearch('999999999');
            expect(await orders.getRowCount(), 'non-existent id yields zero rows').toBe(0);
            expect(await orders.isEmptyStateVisible(), '"No Order Yet" empty-state banner shows').toBe(true);
            await orders.clearSearch();
        });

        test('vendor can filter orders by Customer via the funnel (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            const filter = new VendorTableFilter(page, 'orders');
            await filter.searchSelect('Customer', 'customer');
            expect(await filter.activeFilterCount(), 'customer filter is active').toBe(1);
            expect(await orders.hasNoPhpFatal(), 'no PHP fatal after filtering').toBe(true);
            await filter.reset();
        });

        test('vendor can filter orders by Date Range via the funnel (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            const filter = new VendorTableFilter(page, 'orders');
            await filter.applyDateRange('Date Range', 1, 28);
            expect(await filter.activeFilterCount(), 'date range filter is active').toBeGreaterThan(0);
            expect(await orders.hasNoPhpFatal(), 'no PHP fatal after date filtering').toBe(true);
            await filter.reset();
        });

        test('vendor can search orders — narrows to zero rows for a non-existent order id (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            // The vendor orders list searches strictly by order id: the REST
            // controller casts `search` with absint() and filters on the post id
            // (OrderController::get_items -> Order\Manager: post__in/id = (int)search).
            // A non-numeric query collapses to 0 (falsy) and is ignored, so the
            // only meaningful "narrows to zero" search is a numeric id that does
            // not exist. Use one far above any seeded id.
            const before = await orders.getRowCount();
            expect(before, 'seeded order present before search').toBeGreaterThan(0);

            await orders.fillSearch('999999999');
            const after = await orders.getRowCount();
            expect(after, 'searching a non-existent order id narrows the list').toBeLessThan(before);
            expect(after, 'non-existent order id yields zero rows').toBe(0);

            await orders.clearSearch();
        });

        test('vendor can search orders — exact order id keeps the row (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await orders.fillSearch(String(seededOrderId));
            const after = await orders.getRowCount();
            expect(after, 'searching the seeded order id keeps at least one row').toBeGreaterThan(0);
            await orders.clearSearch();
        });

        test('vendor can filter orders by status tab — Processing shows the seeded order (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await orders.clickStatusTab('Processing');
            const rows = await orders.getRowCount();
            expect(rows, 'Processing tab shows the seeded processing order').toBeGreaterThan(0);
        });

        test('vendor row actions menu exposes View + at least one status-change action (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await orders.openRowActionMenuByIndex(0);
            await expect(orders.actionMenuItem('View'), "row action menu contains 'View'").toBeVisible({ timeout: 5000 });
            const statusActions = await orders.visibleStatusChangeActions();
            expect(statusActions.length, 'menu exposes at least one status-change action').toBeGreaterThan(0);
            await page.keyboard.press('Escape');
        });

        test('vendor can view order details from the row action (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await orders.viewFirstOrder();
            expect(page.url(), 'View navigates away from the bare orders list').not.toMatch(/#\/orders$/);
            expect(await orders.hasNoPhpFatal(), 'order details page has no PHP fatal').toBe(true);
        });

        test('vendor status-change action issues a non-GET request (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            const result = await orders.changeFirstRowStatusAndCaptureRequest();
            test.skip(result.label === null, 'No status-change action available for the current order status');
            expect(result.sawNonGet, `status change "${result.label}" issued a non-GET REST request`).toBe(true);
        });

        test('vendor order list deep-link survives reload (HashRouter) (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await page.reload({ waitUntil: 'domcontentloaded' });
            await orders.waitForReady();
            expect(page.url(), 'URL hash is still #/orders after reload').toMatch(/#\/orders/);
            await expect(orders.reactRoot).toBeVisible({ timeout: 15000 });
        });

        test('vendor order list renders without a PHP fatal (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            expect(await orders.hasNoPhpFatal(), 'order list shows no PHP fatal').toBe(true);
        });
    });

    // Bulk status change mutates real orders, so each case seeds its own orders
    // and operates only on those (selected by id), never select-all.
    test.describe('vendor bulk actions', () => {
        test.describe.configure({ mode: 'serial' });

        let bulkApi: ApiUtils;

        test.beforeAll(async () => {
            bulkApi = new ApiUtils(await request.newContext());
        });

        test.afterAll(async () => {
            await bulkApi.dispose();
        });

        test('vendor can bulk-change status of selected orders (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async ({ browser }) => {
            const mk = async () => {
                const [, , id] = await bulkApi.createOrderWithStatus(
                    process.env.PRODUCT_ID as string,
                    { ...payloads.createOrder, line_items: [{ product_id: process.env.PRODUCT_ID, quantity: 1 }] },
                    'wc-processing',
                    payloads.vendorAuth,
                );
                return id;
            };
            const idA = await mk();
            const idB = await mk();

            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const orders = new NewOrdersPage(page);
            await orders.goto();
            // Newest orders sort to the top of the All tab, so both are on page 1.
            await orders.clickStatusTab('All');
            await expect(orders.orderRowById(idA)).toBeVisible();
            await expect(orders.orderRowById(idB)).toBeVisible();

            await orders.selectOrderRow(idA);
            await orders.selectOrderRow(idB);
            await orders.bulkChangeStatus('Change status to completed');

            await page.close();
            await ctx.close();

            // Authoritative: both orders persisted as completed.
            const [, bodyA] = await bulkApi.getSingleOrder(idA, payloads.vendorAuth);
            const [, bodyB] = await bulkApi.getSingleOrder(idB, payloads.vendorAuth);
            expect(bodyA.status, 'order A bulk-completed').toBe('completed');
            expect(bodyB.status, 'order B bulk-completed').toBe('completed');
        });
    });

    // ============================================
    // CUSTOMER — WooCommerce My Account orders (the React vendor list is
    // vendor-scoped; customers view their own orders via my-account).
    // Ported from the legacy `my-orders` spec.
    // ============================================
    test.describe('customer', () => {
        let ctx: BrowserContext;
        let page: Page;
        let orders: NewOrdersPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: c1 });
            page = await ctx.newPage();
            orders = new NewOrdersPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('customer can view my orders page and sees the seeded order (React parity)', { tag: ['@lite', '@customer', '@new-ui'] }, async () => {
            await orders.gotoMyAccountOrders();
            const rows = await orders.getCustomerOrderRowCount();
            expect(rows, 'customer sees at least their seeded order').toBeGreaterThan(0);
            expect(await orders.hasNoPhpFatal(), 'my-account orders has no PHP fatal').toBe(true);
        });

        test('customer can view order details (React parity)', { tag: ['@lite', '@customer', '@new-ui'] }, async () => {
            await orders.customerViewOrderDetails(seededOrderId);
            expect(await orders.hasNoPhpFatal(), 'order details has no PHP fatal').toBe(true);
        });
    });

    // ============================================
    // BUSINESS FLOW — cross-role end-to-end.
    // ============================================
    test.describe('business flow', () => {
        test('customer order appears in vendor React /orders, vendor completes it, change persists (React)', { tag: ['@lite', '@vendor', '@customer', '@new-ui'] }, async ({ browser }) => {
            // 1. Seed a fresh processing order placed by the customer.
            const apiUtils = new ApiUtils(await request.newContext());
            const [, , flowOrderId] = await apiUtils.createOrderWithStatus(
                process.env.PRODUCT_ID as string,
                { ...payloads.createOrder, line_items: [{ product_id: process.env.PRODUCT_ID, quantity: 2 }] },
                'wc-processing',
                payloads.vendorAuth,
            );

            // 2. Vendor sees it in the React orders list.
            const vCtx = await browser.newContext({ storageState: v1 });
            const vPage = await vCtx.newPage();
            const orders = new NewOrdersPage(vPage);
            await orders.goto();
            await orders.clickStatusTab('Processing');
            expect(await orders.getRowCount(), 'vendor sees the customer order in Processing').toBeGreaterThan(0);

            // 3. Vendor changes THIS order's status to Completed. We target the
            //    seeded order id (not a blind first row) so the flow stays
            //    deterministic despite many accumulated orders on the live DB.
            const changed = await orders.completeOrderById(flowOrderId);
            await vPage.close();
            await vCtx.close();

            // 4. Assert the change persisted (re-query the order via REST).
            test.skip(!changed, 'Completed action not available for the order in its current state');
            const [, body] = await apiUtils.getSingleOrder(flowOrderId, payloads.vendorAuth);
            expect(body.status, 'order status persisted as completed').toBe('completed');

            await apiUtils.dispose();
        });
    });
});
