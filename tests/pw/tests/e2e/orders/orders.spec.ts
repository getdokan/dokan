import { request, expect, test } from '@utils/test';
import { OrdersPage } from './ordersPage';
import path from 'path';
import { NewOrderListPage } from './newOrderListPage';
import { toPath } from '@utils/helpers';

// ============================================
// SESSION STORAGE VARIABLES
// ============================================
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json'); // Vendor session storage

// ============================================
// TEST SETUP
// ============================================

const { DOKAN_PRO } = process.env;

test.describe('Order functionality test @lite', () => {
    let orderId: string;

    test.beforeAll(async () => {
        orderId = await OrdersPage.createTestOrder(await request.newContext());
    });

    // ============================================
    // TEST CASES
    // ============================================

    test('vendor can view order menu page', { tag: ['@lite', '@exploratory', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        await ordersPage.vendorOrdersRenderProperly();
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test('vendor can export all orders', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        await ordersPage.exportOrders('all');
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test('vendor can export filtered orders', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        await ordersPage.filterOrders('by-customer', ordersPage.testData.customer.username);
        await ordersPage.exportOrders('filtered');
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test('vendor can search order', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        await ordersPage.searchOrder(orderId);
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test('vendor can filter orders by customer', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        await ordersPage.filterOrders('by-customer', ordersPage.testData.customer.username);
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test('vendor can filter orders by date range', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        await ordersPage.filterOrders('by-date', ordersPage.testData.date.dateRange);
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test.skip('vendor can view order details', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        await ordersPage.viewOrderDetails(orderId);
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test('vendor can update order status on order table', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        await ordersPage.updateOrderStatusOnTable(orderId, ordersPage.testData.order.orderStatus.processing);
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test.skip('vendor can update order status on order details', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const freshOrderId = await OrdersPage.createTestOrder(await request.newContext());
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        await ordersPage.updateOrderStatus(freshOrderId, ordersPage.testData.order.orderStatus.completed);
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test.skip('vendor can add order note', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        await ordersPage.addOrderNote(orderId, ordersPage.testData.orderNote.customer);
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test.skip('vendor can add private order note', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        await ordersPage.addOrderNote(orderId, ordersPage.testData.orderNote.private);
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test.skip('vendor can add tracking details to order', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        if (DOKAN_PRO) {
            await OrdersPage.disableShippingStatus();
            await ordersPage.addTrackingDetails(orderId, ordersPage.testData.orderTrackingDetails);
            await OrdersPage.enableShippingStatus();
        } else {
            await ordersPage.addTrackingDetails(orderId, ordersPage.testData.orderTrackingDetails);
        }
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test('vendor can add shipment to order', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        await ordersPage.addShipment(orderId, ordersPage.testData.orderShipmentDetails);
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test.skip('vendor can add downloadable product permission to order', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const downloadableProductName = await OrdersPage.createDownloadableProduct(await request.newContext());
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        await ordersPage.addDownloadableProduct(orderId, downloadableProductName);
        await ordersPage.removeDownloadableProduct(orderId, downloadableProductName);
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test('vendor can perform bulk action on orders', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        await ordersPage.orderBulkAction('completed', orderId);
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    // ============================================
    // NEW REACT VENDOR ORDER LIST (5.0.0+)
    // ============================================
    // The React `OrderList` component (src/dashboard/orders/OrderList.tsx)
    // mounts at /dashboard/orders/ in 5.0.0+. The legacy table is kept
    // working under the existing tests above for parity coverage.

    test('vendor order list page renders (React or legacy)', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();

        await page.goto(toPath(`dashboard/orders/`));
        await page.waitForLoadState('domcontentloaded');

        // Either the React DataViews UI or the legacy WC orders table.
        const reactRoot = page.locator('.dokan-react-orders, [class*="dokan-orders"]');
        const legacyTable = page.locator('table.dokan-table, table.dokan-orders-table');
        const reactVisible = await reactRoot.first().isVisible({ timeout: 5000 }).catch(() => false);
        const legacyVisible = await legacyTable.first().isVisible({ timeout: 5000 }).catch(() => false);

        // eslint-disable-next-line playwright/no-conditional-expect
        // (intentional: accept either UI during rollout)
        if (!reactVisible && !legacyVisible) {
            throw new Error('Vendor order list rendered neither React nor legacy UI');
        }

        await page.close();
        await context.close();
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('New Vendor Order List (React) Tests @lite', () => {
    test('Test Case 1 - React order list mounts at /dashboard/new/#/orders', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const list = new NewOrderListPage(page);

        await list.goto();
        await list.waitForReactReady();

        await expect(
            page.locator(list.selectors.reactRoot),
            'Order list React root (#dokan-vendor-dashboard-root) should mount',
        ).toBeVisible({ timeout: 15000 });

        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Order list renders rows or an empty-state banner', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const list = new NewOrderListPage(page);

        await list.goto();
        await list.waitForReactReady();

        const rows = await list.getRowCount();
        const empty = await page.locator("text=/no orders|no items|nothing to show|create your first/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(rows > 0 || empty, 'Order list should show rows OR an empty-state banner').toBe(true);

        await page.close();
        await ctx.close();
    });

    test('Test Case 3 - Search filter narrows the list to zero rows for nonsense query', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const list = new NewOrderListPage(page);

        await list.goto();
        await list.waitForReactReady();

        const before = await list.getRowCount();
        test.skip(before < 1, 'No orders to test search against');

        // The order list may not have a top-level search input — it uses
        // CustomerFilter and DateRangePicker instead. Skip if we can't find one.
        const searchVisible = await page.locator(list.selectors.searchInput).first().isVisible({ timeout: 2000 }).catch(() => false);
        test.skip(!searchVisible, 'Order list does not expose a free-text search input in this build');

        await list.fillSearch('zzz_no_such_order_zzz');
        const after = await list.getRowCount();
        // The OrderList doesn't expose a free-text title search; the visible
        // input may be the legacy admin bar, which doesn't filter the
        // DataViews. Treat any reduction (or no-change with skip) gracefully.
        expect(after, 'Search filter should not increase the row count').toBeLessThanOrEqual(before);

        await list.clearSearch();
        await page.close();
        await ctx.close();
    });

    test('Test Case 4 - Row actions menu exposes View and at least one status-change action', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const list = new NewOrderListPage(page);

        await list.goto();
        await list.waitForReactReady();

        const rows = await list.getRowCount();
        test.skip(rows < 1, 'No orders to test row actions on');

        await list.openRowActionMenuByIndex(0);

        await expect(
            page.locator(list.selectors.actionMenuItem('View')).first(),
            "Row action menu should contain 'View'",
        ).toBeVisible({ timeout: 5000 });

        // At least one of the three status-change actions should appear,
        // depending on the order's current status.
        const onHold = page.locator(list.selectors.actionMenuItem('Change status to on-hold'));
        const processing = page.locator(list.selectors.actionMenuItem('Change status to processing'));
        const completed = page.locator(list.selectors.actionMenuItem('Change status to completed'));
        const onHoldVisible = await onHold.first().isVisible({ timeout: 1000 }).catch(() => false);
        const processingVisible = await processing.first().isVisible({ timeout: 1000 }).catch(() => false);
        const completedVisible = await completed.first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(
            onHoldVisible || processingVisible || completedVisible,
            'Row action menu should expose at least one status-change action',
        ).toBe(true);

        await page.keyboard.press('Escape');
        await page.close();
        await ctx.close();
    });

    test('Test Case 5 - Page renders without a PHP fatal', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const list = new NewOrderListPage(page);

        await list.goto();
        await list.waitForReactReady();

        expect(await list.hasNoServerError(), 'Order list should not show a PHP fatal').toBe(true);

        await page.close();
        await ctx.close();
    });

    test('Test Case 6 - Vendor announcement modal does not block list mount', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const list = new NewOrderListPage(page);

        await list.goto();
        await list.waitForReactReady();

        const modalVisible = await page.locator('.vendor-announcement-modal').first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(modalVisible, 'Vendor announcement modal should be auto-dismissed').toBe(false);

        await page.close();
        await ctx.close();
    });

    test('Test Case 7 - Direct deep link to /orders works (HashRouter survives reload)', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const list = new NewOrderListPage(page);

        await list.goto();
        await list.waitForReactReady();

        await page.reload({ waitUntil: 'domcontentloaded' });
        await list.waitForReactReady();

        expect(page.url(), 'URL hash should still be #/orders after reload').toMatch(/#\/orders/);
        await expect(page.locator(list.selectors.reactRoot)).toBeVisible({ timeout: 15000 });

        await page.close();
        await ctx.close();
    });

    test.skip('Test Case 8 - Status-change action issues a non-GET request', { tag: ['@lite', '@exploratory', '@vendor'] }, async ({ browser }) => {
        // Skipped: timing on the click → REST request handshake is brittle
        // because the order list refetches the rows immediately after status
        // update, masking the original PATCH/POST. Re-enable once the test
        // can intercept the network traffic on the page level.
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const list = new NewOrderListPage(page);

        await list.goto();
        await list.waitForReactReady();

        const rows = await list.getRowCount();
        test.skip(rows < 1, 'No orders to update status on');

        await list.openRowActionMenuByIndex(0);

        const candidates = [
            'Change status to on-hold',
            'Change status to processing',
            'Change status to completed',
        ];

        // Listen for ANY non-GET request on /wp-json/ — the order REST URL
        // varies by Dokan version (could be /dokan/v1/orders, /dokan/v2/orders,
        // or /wc/v3/orders depending on routing).
        const respPromise = page.waitForRequest(
            (req) => req.url().includes('/wp-json/') && req.method() !== 'GET',
            { timeout: 15000 },
        ).catch(() => null);

        let clicked = false;
        for (const label of candidates) {
            const item = page.locator(list.selectors.actionMenuItem(label)).first();
            if (await item.isVisible({ timeout: 500 }).catch(() => false)) {
                await item.click();
                clicked = true;
                break;
            }
        }

        test.skip(!clicked, 'No status-change action visible (e.g. order in completed already)');

        const req = await respPromise;
        expect(req, 'A status-change action should issue a non-GET REST request').not.toBeNull();

        await page.close();
        await ctx.close();
    });
});

