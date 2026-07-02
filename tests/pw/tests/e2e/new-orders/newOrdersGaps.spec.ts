import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewOrdersPage } from './newOrdersPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
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
