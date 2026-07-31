import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewReturnRequestPage, newReturnRequestSelectors } from './newReturnRequestPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { endPoints } from '@utils/apiEndPoints';
import { VENDOR_STORAGE_STATE as v1 } from '@utils/authStates';

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Parity coverage for the React vendor Return Request (RMA) feature (Pro module rma).
// Surfaces: /dashboard/new/#/return-request(+/:id).
// Ported from the legacy `vendor-return-request` spec (a 100% no-op stub that
// "seeded" via a fake UI checkout — vacuous green), driving the React UI. Return
// requests are customer-created (REST is customer-only), so seeding-as-customer IS
// the customer motive; vendor drives status/message/refund/delete on the React UI.
// ============================================

const { PRODUCT_ID, VENDOR_ID, CUSTOMER_ID } = process.env;
const RMA = `${endPoints.serverUrl}/dokan/v1/rma/warranty-requests`;

let apiUtils: ApiUtils;
const stamp = (): string => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

interface Seed {
    requestId: string;
    orderId: string;
}

/** Seed one return request (fresh order) owned by VENDOR_ID for CUSTOMER_ID. */
async function seedRequest(type: 'replace' | 'refund' | 'coupon' = 'replace', status: 'new' | 'processing' = 'new'): Promise<Seed> {
    const [, order, orderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID as string, payloads.createOrder, 'wc-processing', payloads.vendorAuth);
    const [res] = await apiUtils.post(
        RMA,
        {
            data: {
                order_id: Number(orderId),
                customer_id: Number(CUSTOMER_ID),
                vendor_id: Number(VENDOR_ID),
                type,
                status,
                reasons: 'defective',
                details: `PW RMA ${type}/${status} ${stamp()}`,
                items: [{ product_id: order.line_items[0].product_id, item_id: order.line_items[0].id, quantity: 1 }],
            },
            headers: payloads.customerAuth,
        },
        false,
    );
    expect(res.status(), 'RMA request seeded (201)').toBe(201);
    const [, rows] = await apiUtils.get(`${RMA}?order_id=${orderId}`, { headers: payloads.vendorAuth });
    return { requestId: String(rows[0].id), orderId };
}

async function getStatus(requestId: string): Promise<string> {
    const [, body] = await apiUtils.get(`${RMA}/${requestId}`, { headers: payloads.vendorAuth }, false);
    return String(body?.status ?? '');
}

test.describe('Return Request (React) functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.activateModules('rma', payloads.adminAuth);
        // Clean the vendor's existing requests so list/tab oracles stay deterministic.
        const [, existing] = await apiUtils.get(`${RMA}?per_page=100`, { headers: payloads.vendorAuth }, false);
        for (const r of Array.isArray(existing) ? existing : []) {
            await apiUtils.delete(`${RMA}/${r.id}`, { headers: payloads.vendorAuth }).catch(() => undefined);
        }
    });

    test.afterAll(async () => {
        const [, existing] = await apiUtils.get(`${RMA}?per_page=100`, { headers: payloads.vendorAuth }, false);
        for (const r of Array.isArray(existing) ? existing : []) {
            await apiUtils.delete(`${RMA}/${r.id}`, { headers: payloads.vendorAuth }).catch(() => undefined);
        }
        await apiUtils?.dispose();
    });

    // ---------------------------------------------------------------
    test.describe('vendor', () => {
        let ctx: BrowserContext;
        let page: Page;
        let rma: NewReturnRequestPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            rma = new NewReturnRequestPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('vendor can view the return request list (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const seed = await seedRequest('replace', 'new');
            await rma.gotoList();
            expect(page.url(), 'on the /return-request route').toMatch(/#\/return-request/);
            await expect(rma.rowsWithText(`#${seed.orderId}`).first(), 'seeded request row is listed').toBeVisible({ timeout: 15000 });
            const headers = (await rma.columnHeaderTexts()).map(h => h.toLowerCase());
            expect(
                headers.some(h => h.includes('status')),
                'Status column present',
            ).toBe(true);
            expect(await rma.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('vendor can filter return requests by status tab (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const seedNew = await seedRequest('replace', 'new');
            const seedProc = await seedRequest('replace', 'processing');
            await rma.gotoList();
            expect(await rma.tabVisible('Processing'), 'a Processing tab appears once a processing request exists').toBe(true);
            await rma.selectTab('Processing');
            await expect(rma.rowsWithText(`#${seedProc.orderId}`).first(), 'processing request present on Processing tab').toBeVisible({ timeout: 15000 });
            await expect(rma.rowsWithText(`#${seedNew.orderId}`), 'new request absent from Processing tab').toHaveCount(0, { timeout: 15000 });
        });

        test('vendor can view return request details (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const seed = await seedRequest('replace', 'new');
            await rma.gotoDetails(seed.requestId);
            expect(page.url(), 'on the details route').toMatch(/#\/return-request\/\d+/);
            expect(await rma.detailHasText(`Order #${seed.orderId}`), 'details Order card shows the order link').toBe(true);
            expect(await rma.detailHasText('Defective'), 'details shows the seeded reason label').toBe(true);
        });

        test('vendor can send an RMA message (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const seed = await seedRequest('replace', 'new');
            const msg = `vendor msg PW-${stamp()}`;
            await rma.gotoDetails(seed.requestId);
            await rma.sendMessage(msg);
            // REST oracle: the conversation persisted.
            const [, convos] = await apiUtils.get(`${RMA}/${seed.requestId}/conversations`, { headers: payloads.vendorAuth }, false);
            expect(JSON.stringify(convos ?? ''), 'sent message persisted (REST)').toContain(msg);
        });

        test('vendor can update return request status (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const seed = await seedRequest('replace', 'new');
            await rma.gotoDetails(seed.requestId);
            await rma.updateStatus('Processing');
            expect(await getStatus(seed.requestId), 'status transitioned to processing (REST)').toBe('processing');
        });

        test('vendor can delete a return request (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const seed = await seedRequest('replace', 'new');
            await rma.gotoList();
            await rma.deleteRequest(`#${seed.orderId}`);
            // REST oracle: the request is gone.
            const [, rows] = await apiUtils.get(`${RMA}?order_id=${seed.orderId}`, { headers: payloads.vendorAuth }, false);
            expect(Array.isArray(rows) ? rows.length : 0, 'deleted request no longer resolves (REST)').toBe(0);
        });

        test('vendor can send a refund for a return request (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const seed = await seedRequest('refund', 'processing');
            await rma.gotoDetails(seed.requestId);
            await rma.sendRefund('1');
            // UI oracle: the pending-refund alert renders.
            expect(await rma.pendingRefundAlertVisible(), 'pending-refund alert shows after sending').toBe(true);
            // Admin REST oracle: a pending refund now exists for this order.
            const refundId = await apiUtils.getRefundIdByOrderId(seed.orderId, 'pending', payloads.adminAuth).catch(() => undefined);
            expect(refundId, 'a pending refund was created for the order (admin REST)').toBeTruthy();
        });

        test('vendor sees a not-found state for a missing return request (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await rma.gotoDetails(99999999);
            await expect(rma.notFoundHeading, 'not-found heading for a missing request').toBeVisible({ timeout: 15000 });
            expect(await rma.hasNoPhpFatal(), 'no PHP fatal on the not-found state').toBe(true);
        });

        test('HashRouter survives a reload on /return-request (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await seedRequest('replace', 'new');
            await rma.gotoList();
            await page.reload({ waitUntil: 'domcontentloaded' });
            await page.locator(newReturnRequestSelectors.reactRoot).waitFor({ state: 'visible', timeout: 30000 });
            expect(page.url(), 'reload keeps the #/return-request route').toMatch(/#\/return-request/);
            expect(await rma.hasNoPhpFatal(), 'no PHP fatal after reload').toBe(true);
        });
    });

    // ---------------------------------------------------------------
    test.describe('cross-role', () => {
        test('a customer-created return request appears on the vendor React list (React)', { tag: ['@pro', '@customer', '@vendor', '@new-ui'] }, async ({ browser }) => {
            // The seed POST runs as customerAuth (RMA create is customer-only) — this
            // IS the customer "request warranty" motive at the REST level.
            const seed = await seedRequest('replace', 'new');
            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const rma = new NewReturnRequestPage(page);
            try {
                await rma.gotoList();
                await expect(rma.rowsWithText(`#${seed.orderId}`).first(), 'customer-created request shows on the vendor list').toBeVisible({ timeout: 15000 });
            } finally {
                await page.close();
                await ctx.close();
            }
        });
    });
});
