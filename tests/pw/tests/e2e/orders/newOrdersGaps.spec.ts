import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewOrdersPage } from './newOrdersPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { VENDOR_STORAGE_STATE as v1 } from '@utils/authStates';

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// B14 behavioral gaps for the React vendor Orders list at /dashboard/new/#/orders.
// newOrders.spec.ts already covers list/columns/search/tabs/row-actions/bulk. This
// adds the gaps it leaves: a row status-change that PERSISTS (REST) and the
// house-style MONEY ORACLE (vendor earning + admin commission reconciles to the
// order's product revenue). Lite list surface.
//
// DEFERRED (documented): a real CSV export-download test — the React export is a
// hidden-form POST to a nonce'd URL, and headless Chromium does not fire a
// `download` event for it (the dropdown opens but no download lands). Left out
// rather than shipped flaky; customer-filter/date-range correctness are backlog.
// ============================================

const { PRODUCT_ID } = process.env;

let apiUtils: ApiUtils;
const seededOrderIds: string[] = [];

const round2 = (n: number): number => Math.round(n * 100) / 100;

/** Seed one order in the given status owned by the fixture vendor; returns its id. */
async function seedOrder(status = 'wc-processing'): Promise<string> {
    const [, , orderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID as string, { ...payloads.createOrder }, status, payloads.vendorAuth);
    seededOrderIds.push(orderId);
    return orderId;
}

test.describe('Vendor orders list — behavioral gaps (React)', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils?.dispose();
    });

    let ctx: BrowserContext;
    let page: Page;
    let orders: NewOrdersPage;

    test.beforeEach(async ({ browser }) => {
        ctx = await browser.newContext({ storageState: v1 });
        page = await ctx.newPage();
        orders = new NewOrdersPage(page);
    });

    test.afterEach(async () => {
        await page?.close();
        await ctx?.close();
    });

    test('vendor updating an order status from the row action persists it (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
        const orderId = await seedOrder('wc-processing');
        await orders.goto();
        const fired = await orders.completeOrderById(orderId);
        expect(fired, 'the status-change mutation request fired').toBe(true);
        // REST oracle: the order is now completed.
        const [, order] = await apiUtils.getSingleOrder(orderId, payloads.vendorAuth);
        expect(String(order.status), 'order status persisted as completed (REST)').toBe('completed');
    });

    test('vendor order revenue equals vendor earning plus admin commission (React)', { tag: ['@lite', '@vendor', '@admin', '@new-ui'] }, async () => {
        // Money oracle (house style §7): for the seeded order, the product revenue
        // (sum of line-item totals) must equal vendor earning + admin commission.
        const orderId = await seedOrder('wc-processing');
        await orders.goto();
        await expect(orders.orderRowById(orderId).first(), 'seeded order is visible on the list').toBeVisible({ timeout: 15000 });
        const [, order] = await apiUtils.getSingleOrder(orderId, payloads.vendorAuth);
        const lineItems = order.line_items ?? [];
        const revenue = round2((lineItems as Array<{ total?: string | number }>).reduce((s, li) => s + Number(li.total ?? 0), 0));
        const earning = Number(await apiUtils.getEarningLineItems(lineItems, payloads.vendorAuth));
        const commission = Number(await apiUtils.getCommissionLineItems(lineItems, payloads.adminAuth));
        expect(round2(earning + commission), 'earning + commission == product revenue (money oracle)').toBe(revenue);
    });
});

// ============================================
// B26 (setting.spec.ts port): the order-status-change CAPABILITY GATE (negative
// path). The positive path (vendor CAN change status with the default 'on') is
// covered above. This ports the ONE unported vendor case worth porting from the
// otherwise-legacy setting.spec.ts: with dokan_selling.order_status_change='off',
// the server rejects the vendor's status-change PUT (OrderController::
// update_order_permissions_check returns false), so the status must NOT persist.
// The React row action still fires the request (the client doesn't know the
// capability) — the authoritative oracle is the REST GET (status unchanged), never
// the request firing or the menu contents. The toggle mutates a GLOBAL option that
// sibling order specs depend on ('on'), so this block is serial and restores in
// afterAll (§ mirrors newProductForm category-option pattern).
// ============================================
test.describe('Vendor orders — order-status-change capability gate (React)', () => {
    test.describe.configure({ mode: 'serial' });

    let gateApi: ApiUtils;
    const gateOrderIds: string[] = [];
    let prevSelling: unknown;
    let gateOrderId: string;

    test.beforeAll(async () => {
        gateApi = new ApiUtils(await request.newContext());
        // Seed the order in 'processing' FIRST (while the capability is still on —
        // createOrderWithStatus itself hits the gated status endpoint), THEN disable.
        const [, , orderId] = await gateApi.createOrderWithStatus(PRODUCT_ID as string, { ...payloads.createOrder }, 'wc-processing', payloads.vendorAuth);
        gateOrderId = orderId;
        gateOrderIds.push(orderId);
        // Disable the capability globally (capture prior value for restore).
        const [prev] = await dbUtils.updateOptionValue('dokan_selling', { order_status_change: 'off' });
        prevSelling = prev;
    });

    test.afterAll(async () => {
        // Restore the capability so sibling order specs keep working.
        if (prevSelling && typeof prevSelling === 'object' && 'order_status_change' in (prevSelling as object)) {
            await dbUtils.updateOptionValue('dokan_selling', { order_status_change: (prevSelling as { order_status_change: string }).order_status_change });
        } else {
            await dbUtils.updateOptionValue('dokan_selling', { order_status_change: 'on' });
        }
        for (const id of gateOrderIds) await gateApi.updateOrderStatus(id, 'cancelled', payloads.adminAuth).catch(() => undefined);
        await gateApi?.dispose();
    });

    let ctx: BrowserContext;
    let page: Page;
    let orders: NewOrdersPage;

    test.beforeEach(async ({ browser }) => {
        ctx = await browser.newContext({ storageState: v1 });
        page = await ctx.newPage();
        orders = new NewOrdersPage(page);
    });

    test.afterEach(async () => {
        await page?.close();
        await ctx?.close();
    });

    test('vendor cannot change an order status when the capability is disabled (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
        await orders.goto();
        // Attempt the status change from the row action; a rejected mutation is tolerated.
        await orders.completeOrderById(gateOrderId).catch(() => undefined);
        await page.waitForTimeout(1500);
        // Behavioral oracle (REST, no fake green): the status did NOT change — the gate held.
        const [, order] = await gateApi.getSingleOrder(gateOrderId, payloads.vendorAuth);
        expect(String(order.status), 'order status is unchanged (still processing) — the disabled capability blocked it').toBe('processing');
    });
});
