import { test, expect } from '../_shared/fixtures';
import { seedOrder, authOf, customerId, backdateOrder } from '../_shared/seed';
import { moneyDigits } from '../_shared/dataViewsTable';
import { VendorOrdersPage, csvOrderIds } from './vendorOrdersPage';

const orderOf = async (api: Parameters<typeof seedOrder>[0], id: string) => (await api.getSingleOrder(id, authOf('vendor1')))[1];

// Risk: P0 Vendor orders. Failure-mode ids (#n) refer to tests/pw/baseline/failure-modes/vendor-orders.md.
// Every test seeds its own orders and finds them by id, so tests run in parallel.

test.describe('Vendor orders (React list)', () => {
    let orders: VendorOrdersPage;

    test.beforeEach(async ({ vendorPage }) => {
        orders = new VendorOrdersPage(vendorPage);
    });

    test("#1 never lists another vendor's order, even searched by id", { tag: ['@lite', '@vendor', '@p0'] }, async ({ api }) => {
        const [own, other] = await Promise.all([seedOrder(api), seedOrder(api, { vendor: 'vendor2' })]);
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
        await seedOrder(api);
        await seedOrder(api, { status: 'wc-on-hold' });
        await orders.goto();

        await orders.table.tab('On hold');
        const statuses = await Promise.all((await orders.table.rows.all()).map(async row => (await orders.table.cell(row, 'Status')).innerText()));
        expect(statuses.length).toBeGreaterThan(0);
        expect(statuses.every(s => /on hold/i.test(s)), `statuses in the On hold tab: ${statuses.join(', ')}`).toBe(true);
    });

    test('#16 list shows the order, money, status and customer columns', { tag: ['@lite', '@vendor', '@p0'] }, async () => {
        await orders.goto();
        await expect(orders.page.locator('table thead th')).toContainText(['Order', 'Order Total', 'Earning', 'Status', 'Customer'], { ignoreCase: true });
    });

    test('#17 deep link to the list survives a reload', { tag: ['@lite', '@vendor', '@p1'] }, async ({ api }) => {
        const orderId = await seedOrder(api);
        await orders.goto();
        await orders.page.reload();
        await orders.table.settled();
        await expect(orders.page).toHaveURL(/#\/orders$/);
        await expect(await orders.find(orderId)).toHaveCount(1);
    });

    test('#7 row total and earning match the order', { tag: ['@lite', '@vendor', '@p0'] }, async ({ api }) => {
        const orderId = await seedOrder(api, { quantity: 3 });
        const [, order] = await api.getSingleOrder(orderId, authOf('vendor1'));
        await orders.goto();
        await orders.find(orderId);

        expect(moneyDigits(await (await orders.cell(orderId, 'Order Total')).innerText())).toBe(moneyDigits(String(order.total)));
        expect(moneyDigits(await (await orders.cell(orderId, 'Earning')).innerText())).toBe(moneyDigits(String(order.earning)));
    });

    test('#10 customer filter lists only that customer\'s orders', { tag: ['@lite', '@vendor', '@p1'] }, async ({ api }) => {
        const customer = await customerId(api, 'customer1');
        const [theirs, guest] = await Promise.all([seedOrder(api, { customer }), seedOrder(api)]);
        await orders.goto();
        await orders.filterByCustomer('customer1', /customer1/);

        const ids = await orders.rowIds();
        expect(ids).toContain(theirs);
        expect(ids).not.toContain(guest);
        const owners = await Promise.all(ids.map(async id => String((await orderOf(api, id)).customer_id)));
        expect(owners.every(owner => owner === customer), `customer_id per row: ${owners.join(', ')}`).toBe(true);
    });

    test('#10 date range filter lists only orders inside the range', { tag: ['@lite', '@vendor', '@p1'] }, async ({ api }) => {
        const [recent, old] = await Promise.all([seedOrder(api), seedOrder(api)]);
        backdateOrder(old, 40);

        const today = new Date();
        const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        await orders.goto();
        await orders.filterByDays(1, today.getDate());

        const ids = await orders.rowIds();
        expect(ids).toContain(recent);
        expect(ids).not.toContain(old);
        const dates = await Promise.all(ids.map(async id => new Date((await orderOf(api, id)).date_created)));
        expect(dates.every(d => d >= firstOfMonth), `dates per row: ${dates.map(d => d.toISOString()).join(', ')}`).toBe(true);
    });

    test('#11 filtered export contains exactly the searched order', { tag: ['@lite', '@vendor', '@p1'] }, async ({ api }) => {
        const orderId = await seedOrder(api);
        await orders.goto();
        await orders.find(orderId);
        expect(csvOrderIds(await orders.exportCsv('Export Filtered'))).toEqual([orderId]);
    });

    test('#11 filtered export honours the customer filter', { tag: ['@lite', '@vendor', '@p1'] }, async ({ api }) => {
        // Known bug (FINDINGS.md #5): the export handler reads customer_id from $_GET, the React form POSTs it,
        // so a customer-filtered export contains every order. Remove test.fail once fixed.
        test.fail();
        const customer = await customerId(api, 'customer1');
        const [theirs, guest] = await Promise.all([seedOrder(api, { customer }), seedOrder(api)]);
        await orders.goto();
        await orders.filterByCustomer('customer1', /customer1/);

        const exported = csvOrderIds(await orders.exportCsv('Export Filtered'));
        expect(exported).toContain(theirs);
        expect(exported, 'a guest order in a customer-filtered export').not.toContain(guest);
    });

    test('#12 View opens the details of the clicked order', { tag: ['@lite', '@vendor', '@p1'] }, async ({ api }) => {
        const orderId = await seedOrder(api);
        await orders.goto();
        await (await orders.find(orderId)).getByRole('link', { name: `#${orderId}`, exact: true }).click();
        await expect(orders.page).toHaveURL(new RegExp(`[?&]order_id=${orderId}(&|$)`));
        await expect(orders.page.getByText(new RegExp(`#\\s*${orderId}\\b`)).first()).toBeVisible();
    });
});
