import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewWithdrawPage } from './newWithdrawPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { VENDOR_STORAGE_STATE as v1 } from '@utils/authStates';

const { PRODUCT_ID, VENDOR_ID } = process.env;

// Cancel every pending withdraw the vendor currently has. Dokan only allows one
// pending request per vendor, but the shared live DB can hold a lingering one
// from a prior run; cancelling all of them makes withdraw seeding deterministic.
// cancelWithdraw('', vendorAuth) finds the vendor's first pending and deletes it;
// loop until none remain (bounded to avoid an infinite loop on an unexpected API).
async function clearVendorPending(apiUtils: ApiUtils): Promise<void> {
    for (let i = 0; i < 5; i++) {
        const pending = await apiUtils.getAllWithdrawsByStatus('pending', payloads.vendorAuth);
        if (!Array.isArray(pending) || pending.length === 0) {
            return;
        }
        await apiUtils.cancelWithdraw(String(pending[0].id), payloads.adminAuth);
    }
}

// Seed exactly one PENDING withdraw for the vendor (after clearing any existing
// pending). createWithdraw POST always creates a *pending* record (the REST
// create_item ignores the status param) and returns its id.
async function seedPendingWithdraw(apiUtils: ApiUtils, amount: string): Promise<string> {
    await clearVendorPending(apiUtils);
    const [, withdrawId] = await apiUtils.createWithdraw({ ...payloads.createWithdraw, amount, user_id: VENDOR_ID, status: 'pending' }, payloads.adminAuth);
    return withdrawId;
}

// Seed one APPROVED withdraw for the vendor. The REST create endpoint only ever
// produces pending requests, so we create a fresh pending one and then update it
// to 'approved' via the admin PUT path (which runs the real approval validation).
async function seedApprovedWithdraw(apiUtils: ApiUtils, amount: string): Promise<void> {
    const withdrawId = await seedPendingWithdraw(apiUtils, amount);
    await apiUtils.updateWithdraw(withdrawId, { ...payloads.updateWithdraw, amount, status: 'approved' }, payloads.adminAuth);
}

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Parity coverage for the 5.0.0 React rewrite of the vendor Withdraw feature.
// Surfaces:
//   /dashboard/new/#/withdraw          (balance summary + payment widgets)
//   /dashboard/new/#/withdraw-requests (DataViews list, status tabs)
// Ported from the legacy `withdraws` spec, driving the React UI, plus a
// cross-role business flow (vendor requests -> admin approves via REST ->
// vendor's Approved tab reflects it). Lite feature.
// ============================================

// Seed earnings ONCE so the vendor balance clears the minimum withdraw limit.
// Withdraw requests are created/cleared per-test as the scenario requires.
test.describe('Withdraw (React) functionality', () => {
    let apiUtils: ApiUtils;
    let minimumWithdrawLimit: string;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        // (1) The vendor MUST have at least one active withdraw payment method,
        // otherwise: (a) the Request Withdraw modal renders a "No payment methods
        // found" warning instead of the amount form, and (b) every seeding
        // createWithdraw({ method: 'paypal' }) is rejected with 400 "Withdraw
        // method is not active" (is_valid_approval_request → in_array(method,
        // dokan_get_seller_active_withdraw_methods)). Activating PayPal writes
        // dokan_profile_settings.payment.paypal.email, making 'paypal' active.
        await apiUtils.setStoreSettings({ payment: { paypal: { email: 'withdraw-vendor@example.com' } } }, payloads.vendorAuth);
        // (2) Read balance + minimum withdraw limit ($10 on a fresh seed).
        [, minimumWithdrawLimit] = await apiUtils.getMinimumWithdrawLimit(payloads.vendorAuth);
        // (3) Give the vendor enough balance to request a withdraw: a completed
        // order with a large quantity credits the vendor's earnings well past $10.
        // dokan/v1/orders is vendor-scoped — seed earnings as the vendor who owns the product.
        await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, line_items: [{ product_id: PRODUCT_ID, quantity: 100 }] }, 'wc-completed', payloads.vendorAuth);
        // (4) The live DB accumulates withdraws across runs; Dokan allows only ONE
        // pending request per vendor. Clear any lingering pending so the suite
        // starts deterministic regardless of prior state.
        await clearVendorPending(apiUtils);
    });

    test.afterAll(async () => {
        await apiUtils?.dispose();
    });

    // ----------------------------------------
    // VENDOR
    // ----------------------------------------
    test.describe('vendor', () => {
        let ctx: BrowserContext;
        let page: Page;
        let withdraw: NewWithdrawPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            withdraw = new NewWithdrawPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('vendor can view withdraw balance page (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await withdraw.gotoWithdraw();
            expect(page.url()).toMatch(/#\/withdraw/);
            // Balance widget renders the balance + minimum-withdraw labels.
            await expect(withdraw.balanceWidget).toBeVisible();
            await expect(withdraw.yourBalance).toBeVisible();
            await expect(withdraw.minimumWithdraw).toBeVisible();
            expect(await withdraw.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('vendor can view withdrawal requests page with status tabs (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await withdraw.gotoRequests();
            expect(page.url()).toMatch(/#\/withdraw-requests/);
            expect(await withdraw.tabsAreVisible(), 'Pending/Approved/Cancelled tabs present').toBe(true);
            expect(await withdraw.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('vendor can switch between withdraw status tabs (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await withdraw.gotoRequests();
            await withdraw.selectTab('approved');
            await withdraw.selectTab('cancelled');
            await withdraw.selectTab('pending');
            // Switching tabs must never throw a fatal / break the surface.
            expect(await withdraw.hasNoPhpFatal(), 'no PHP fatal after tab switching').toBe(true);
            expect(await withdraw.tabsAreVisible()).toBe(true);
        });

        test('vendor withdraw-requests list exposes filter controls (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await withdraw.gotoRequests();
            expect(await withdraw.hasFilterControls(), 'Add Filter / Reset controls present').toBe(true);
        });

        test('vendor can send withdrawal request when balance >= minimum (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            // Ensure no pending request blocks a fresh request (clear ALL pending,
            // not just one, so the modal renders the submittable amount form).
            await clearVendorPending(apiUtils);
            await withdraw.gotoWithdraw();
            await withdraw.openRequestModal();
            await withdraw.submitWithdrawRequest(minimumWithdrawLimit);
            // Assert a pending request now exists via the React list.
            await withdraw.gotoRequests();
            await withdraw.selectTab('pending');
            expect(await withdraw.getRowCount(), 'a pending request appears after submitting').toBeGreaterThan(0);
        });

        test("vendor can't send withdrawal request when a pending request exists (React)", { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            // Seed exactly one pending request, then assert the modal blocks a new one.
            await seedPendingWithdraw(apiUtils, minimumWithdrawLimit);
            await withdraw.gotoWithdraw();
            await withdraw.openRequestModal();
            expect(await withdraw.requestIsBlocked(), 'pending notice shown / submit blocked').toBe(true);
            await withdraw.closeModal();
        });

        test('vendor can cancel a pending withdrawal request (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            // Ensure exactly one pending request to cancel.
            await seedPendingWithdraw(apiUtils, minimumWithdrawLimit);
            await withdraw.gotoRequests();
            await withdraw.selectTab('pending');
            const before = await withdraw.getRowCount();
            expect(before, 'a pending request exists to cancel').toBeGreaterThan(0);
            await withdraw.cancelFirstPendingRequest();
            // The cancelled request leaves the pending list.
            const after = await withdraw.getRowCount();
            expect(after, 'pending count decreases after cancel').toBeLessThan(before);
        });

        test('vendor balance summary exposes View Payments + Request Withdraw (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await withdraw.gotoWithdraw();
            // Request Withdraw is gated on isManualWithdrawEnable but is the default;
            // View Payments always renders in the payment-details widget.
            await expect(withdraw.viewPaymentsButton).toBeVisible();
            expect(await withdraw.requestWithdrawButtonVisible(), 'Request Withdraw button present').toBe(true);
        });

        test('HashRouter survives reload on /withdraw (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await withdraw.gotoWithdraw();
            await page.reload({ waitUntil: 'domcontentloaded' });
            await withdraw.waitForRootReady();
            expect(page.url()).toMatch(/#\/withdraw/);
            expect(await withdraw.hasNoPhpFatal(), 'no PHP fatal after reload').toBe(true);
        });

        test('HashRouter survives reload on /withdraw-requests (React)', { tag: ['@lite', '@vendor', '@new-ui'] }, async () => {
            await withdraw.gotoRequests();
            await page.reload({ waitUntil: 'domcontentloaded' });
            await withdraw.waitForRootReady();
            await withdraw.waitForListReady();
            expect(page.url()).toMatch(/#\/withdraw-requests/);
            expect(await withdraw.tabsAreVisible(), 'tabs survive reload').toBe(true);
        });
    });

    // ----------------------------------------
    // ADMIN (seeds/approves via REST; assertion is on the vendor React UI)
    // ----------------------------------------
    test.describe('admin', () => {
        test('admin-approved withdraw shows on the vendor Approved tab (React)', { tag: ['@lite', '@admin', '@vendor', '@new-ui'] }, async ({ browser }) => {
            // Admin seeds a pending request and approves it via REST (the create
            // endpoint only makes pending records, so approval is a follow-up PUT).
            await seedApprovedWithdraw(apiUtils, minimumWithdrawLimit);

            // Vendor sees it on the Approved Requests tab.
            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const withdraw = new NewWithdrawPage(page);
            await withdraw.gotoRequests();
            await withdraw.selectTab('approved');
            expect(await withdraw.getRowCount(), 'approved request visible to vendor').toBeGreaterThan(0);
            await page.close();
            await ctx.close();
        });
    });

    // ----------------------------------------
    // BUSINESS FLOW (cross-role end-to-end)
    // ----------------------------------------
    test.describe('business flow', () => {
        test('vendor requests a withdraw -> admin approves (REST) -> vendor Approved tab reflects it (React)', { tag: ['@lite', '@vendor', '@admin', '@new-ui'] }, async ({ browser }) => {
            // 0. Start from a clean slate (no lingering pending request).
            await clearVendorPending(apiUtils);

            // 1. Vendor requests a withdraw through the React modal.
            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const withdraw = new NewWithdrawPage(page);
            await withdraw.gotoWithdraw();
            await withdraw.openRequestModal();
            await withdraw.submitWithdrawRequest(minimumWithdrawLimit);
            await withdraw.gotoRequests();
            await withdraw.selectTab('pending');
            expect(await withdraw.getRowCount(), 'pending request created by vendor').toBeGreaterThan(0);

            // 2. Admin approves that pending request via the REST PUT path
            //    (find the vendor's pending request, then update it to approved).
            const pending = await apiUtils.getAllWithdrawsByStatus('pending', payloads.vendorAuth);
            expect(Array.isArray(pending) && pending.length > 0, 'vendor has a pending request to approve').toBe(true);
            await apiUtils.updateWithdraw(String(pending[0].id), { ...payloads.updateWithdraw, amount: minimumWithdrawLimit, status: 'approved' }, payloads.adminAuth);

            // 3. Vendor's Approved Requests tab reflects the approval.
            await withdraw.gotoRequests();
            await withdraw.selectTab('approved');
            expect(await withdraw.getRowCount(), 'approved request reflected on vendor React UI').toBeGreaterThan(0);

            await page.close();
            await ctx.close();
        });
    });
});
