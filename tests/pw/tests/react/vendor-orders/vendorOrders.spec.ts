import { test, expect } from '../_shared/fixtures';
import { seedOrder, authOf } from '../_shared/seed';
import { moneyDigits } from '../_shared/dataViewsTable';
import { VendorOrdersPage } from './vendorOrdersPage';

// Risk: P0 Vendor orders. Failure-mode ids (#n) refer to tests/pw/baseline/failure-modes/vendor-orders.md.
// Every test seeds its own orders and finds them by id, so tests run in parallel.

test.describe('Vendor orders (React list)', () => {
    let orders: VendorOrdersPage;

    test.beforeEach(async ({ vendorPage }) => {
        orders = new VendorOrdersPage(vendorPage);
    });

    test("#1 never lists another vendor's order, even searched by id", { tag: ['@lite', '@vendor', '@p0'] }, async ({ api }) => {
        const [own, other] = await Promise.all([seedOrder(api, 'vendor1'), seedOrder(api, 'vendor2')]);
        await orders.goto();

        await expect(await orders.find(other)).toHaveCount(0);
        await expect(orders.table.emptyState).toBeVisible();

        // Guard: the same search finds the vendor's own order, so the empty result above is isolation, not a broken search.
        await expect(await orders.find(own)).toHaveCount(1);
    });

    test('#4 row status change persists', { tag: ['@lite', '@vendor', '@p0'] }, async ({ api }) => {
        const orderId = await seedOrder(api);
        await orders.goto();

        const response = await orders.changeStatus(orderId, 'completed');
        expect(response.status()).toBeLessThan(400);

        await expect(await orders.cell(orderId, 'Status')).toHaveText(/completed/i);
        const [, order] = await api.getSingleOrder(orderId, authOf('vendor1'));
        expect(order.status).toBe('completed');
    });

    test('#5 bulk status change applies to selected orders only', { tag: ['@lite', '@vendor', '@p0'] }, async ({ api }) => {
        const [a, b, untouched] = await Promise.all([seedOrder(api), seedOrder(api), seedOrder(api)]);
        await orders.goto();
        // Newest orders sort first, so all three are on page 1.
        for (const id of [a, b, untouched]) await expect(orders.row(id)).toHaveCount(1);

        await orders.table.select(orders.row(a));
        await orders.table.select(orders.row(b));
        const response = await orders.table.bulkAction('Change status to completed');
        expect(response.status()).toBeLessThan(400);

        const status = async (id: string) => (await api.getSingleOrder(id, authOf('vendor1')))[1].status;
        expect(await status(a)).toBe('completed');
        expect(await status(b)).toBe('completed');
        expect(await status(untouched)).toBe('processing');
    });

    test('#9 status tab lists only orders in that status', { tag: ['@lite', '@vendor', '@p0'] }, async ({ api }) => {
        await seedOrder(api, 'vendor1', 'wc-processing');
        await seedOrder(api, 'vendor1', 'wc-on-hold');
        await orders.goto();

        await orders.table.tab('On hold');
        const statuses = await Promise.all((await orders.table.rows.all()).map(async row => (await orders.table.cell(row, 'Status')).innerText()));
        expect(statuses.length).toBeGreaterThan(0);
        expect(statuses.every(s => /on hold/i.test(s)), `statuses in the On hold tab: ${statuses.join(', ')}`).toBe(true);
    });

    test('#7 row total and earning match the order', { tag: ['@lite', '@vendor', '@p0'] }, async ({ api }) => {
        const orderId = await seedOrder(api, 'vendor1', 'wc-processing', 3);
        const [, order] = await api.getSingleOrder(orderId, authOf('vendor1'));
        await orders.goto();
        await orders.find(orderId);

        expect(moneyDigits(await (await orders.cell(orderId, 'Order Total')).innerText())).toBe(moneyDigits(String(order.total)));
        expect(moneyDigits(await (await orders.cell(orderId, 'Earning')).innerText())).toBe(moneyDigits(String(order.earning)));
    });
});
