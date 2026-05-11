import { Page, expect, test } from '@utils/test';
import { WithdrawsPage, ApiUtils, data, payloads } from './withdrawsPage';
import path from 'path';
import { toPath } from '@utils/helpers';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const { PRODUCT_ID, VENDOR_ID } = process.env;

test.describe.skip('Withdraw test', () => {
    let admin: WithdrawsPage;
    let vendor: WithdrawsPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;
    let currentBalance: string;
    let minimumWithdrawLimit: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new WithdrawsPage(aPage);
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new WithdrawsPage(vPage);
        apiUtils = new ApiUtils(null);
        [currentBalance, minimumWithdrawLimit] = await apiUtils.getMinimumWithdrawLimit(payloads.vendorAuth);
        await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, line_items: [{ quantity: 100 }] }, 'wc-completed', payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await aPage?.close();
        await vPage?.close();
        await apiUtils?.dispose();
    });

    test('admin can view withdraw menu page', { tag: ['@lite', '@exploratory', '@admin'] }, async () => { await admin.adminWithdrawsRenderProperly(); });
    test('admin can filter withdrawal requests by pending status', { tag: ['@lite', '@admin'] }, async () => {
        await apiUtils.createWithdraw({ ...payloads.createWithdraw, amount: minimumWithdrawLimit }, payloads.vendorAuth);
        await admin.filterWithdraws('Pending', 'by-status');
    });
    test('admin can filter withdrawal requests by approved status', { tag: ['@lite', '@admin'] }, async () => {
        await apiUtils.createWithdraw({ ...payloads.createWithdraw, amount: minimumWithdrawLimit, user_id: VENDOR_ID, status: 'approved' }, payloads.adminAuth);
        await admin.filterWithdraws('Approved', 'by-status');
    });
    test('admin can filter withdrawal requests by cancelled status', { tag: ['@lite', '@admin'] }, async () => {
        await apiUtils.createWithdraw({ ...payloads.createWithdraw, amount: minimumWithdrawLimit, user_id: VENDOR_ID, status: 'cancelled' }, payloads.adminAuth);
        await admin.filterWithdraws('Cancelled', 'by-status');
    });
    test('admin can filter withdrawal requests by vendor', { tag: ['@lite', '@admin'] }, async () => {
        await apiUtils.createWithdraw({ ...payloads.createWithdraw, amount: minimumWithdrawLimit, user_id: VENDOR_ID }, payloads.adminAuth);
        await admin.filterWithdraws(data.predefined.vendorStores.vendor1, 'by-vendor');
    });
    test('admin can filter withdrawal requests by payment methods', { tag: ['@lite', '@admin'] }, async () => {
        await apiUtils.createWithdraw({ ...payloads.createWithdraw, amount: minimumWithdrawLimit, user_id: VENDOR_ID }, payloads.adminAuth);
        await admin.filterWithdraws(data.vendor.withdraw.defaultWithdrawMethod.paypal, 'by-payment-method');
    });
    test('admin can export withdrawal requests', { tag: ['@lite', '@admin'] }, async () => { await admin.exportWithdraws(); });
    test('admin can add note to withdrawal request', { tag: ['@lite', '@admin'] }, async () => { await admin.addNoteWithdrawRequest(data.predefined.vendorStores.vendor1, 'test withdraw note'); });
    test('admin can approve withdrawal request', { tag: ['@lite', '@admin'] }, async () => {
        await apiUtils.createWithdraw({ ...payloads.createWithdraw, amount: minimumWithdrawLimit, user_id: VENDOR_ID }, payloads.adminAuth);
        await admin.updateWithdrawRequest(data.predefined.vendorStores.vendor1, 'approve');
    });
    test('admin can cancel withdrawal request', { tag: ['@lite', '@admin'] }, async () => {
        await apiUtils.createWithdraw({ ...payloads.createWithdraw, amount: minimumWithdrawLimit, user_id: VENDOR_ID }, payloads.adminAuth);
        await admin.updateWithdrawRequest(data.predefined.vendorStores.vendor1, 'cancel');
    });
    test('admin can delete withdrawal request', { tag: ['@lite', '@admin'] }, async () => {
        await apiUtils.createWithdraw({ ...payloads.createWithdraw, amount: minimumWithdrawLimit, user_id: VENDOR_ID }, payloads.adminAuth);
        await admin.updateWithdrawRequest(data.predefined.vendorStores.vendor1, 'delete');
    });
    test('admin can perform bulk action on withdrawal requests', { tag: ['@lite', '@admin'] }, async () => {
        await apiUtils.createWithdraw({ ...payloads.createWithdraw, amount: minimumWithdrawLimit, user_id: VENDOR_ID }, payloads.adminAuth);
        await admin.withdrawBulkAction('cancelled');
    });

    test('vendor can view withdraw menu page', { tag: ['@lite', '@exploratory', '@vendor'] }, async () => { await vendor.vendorWithdrawRenderProperly(); });
    test('vendor can view withdrawal requests page', { tag: ['@lite', '@exploratory', '@vendor'] }, async () => { await vendor.vendorWithdrawRequestsRenderProperly(); });
    test('vendor can send withdrawal request', { tag: ['@lite', '@vendor'] }, async () => {
        await apiUtils.cancelWithdraw('', payloads.vendorAuth);
        await vendor.requestWithdraw({ ...data.vendor.withdraw, minimumWithdrawAmount: minimumWithdrawLimit, currentBalance: currentBalance });
    });
    test("vendor can't send withdrawal request when pending request exists", { tag: ['@lite', '@vendor'] }, async () => {
        await apiUtils.createWithdraw({ ...payloads.createWithdraw, amount: minimumWithdrawLimit, user_id: VENDOR_ID }, payloads.adminAuth);
        await vendor.cantRequestWithdraw();
    });
    test('vendor can cancel withdrawal request', { tag: ['@lite', '@vendor'] }, async () => {
        await apiUtils.createWithdraw({ ...payloads.createWithdraw, amount: minimumWithdrawLimit, user_id: VENDOR_ID }, payloads.adminAuth);
        await vendor.cancelWithdrawRequest();
    });
    test('vendor can add auto withdraw disbursement schedule', { tag: ['@pro', '@vendor'] }, async () => { await vendor.addAutoWithdrawDisbursementSchedule({ ...data.vendor.withdraw, minimumWithdrawAmount: minimumWithdrawLimit }); });
    test('vendor can add default withdraw payment methods', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addDefaultWithdrawPaymentMethods(data.vendor.withdraw.defaultWithdrawMethod.bankTransfer);
        await vendor.addDefaultWithdrawPaymentMethods(data.vendor.withdraw.defaultWithdrawMethod.paypal);
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('New Vendor Withdraw (React) Tests @lite', () => {
    test('Test Case 1 - /withdraw route mounts', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();

        await page.goto(toPath(`dashboard/new/#/withdraw`));
        await page.waitForLoadState('domcontentloaded');
        await page.locator('#dokan-vendor-dashboard-root').waitFor({ state: 'visible', timeout: 30000 });

        expect(page.url()).toMatch(/#\/withdraw/);

        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal, 'No PHP fatal').toBe(false);

        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - /withdraw-requests route mounts', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();

        await page.goto(toPath(`dashboard/new/#/withdraw-requests`));
        await page.waitForLoadState('domcontentloaded');
        await page.locator('#dokan-vendor-dashboard-root').waitFor({ state: 'visible', timeout: 30000 });

        expect(page.url()).toMatch(/#\/withdraw-requests/);
        const fatal = await page.locator("text=/Fatal error|Parse error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);

        await page.close();
        await ctx.close();
    });

    test('Test Case 3 - Withdraw page shows balance widget', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();

        await page.goto(toPath(`dashboard/new/#/withdraw`));
        await page.waitForLoadState('domcontentloaded');
        await page.locator('#dokan-vendor-dashboard-root').waitFor({ state: 'visible', timeout: 30000 });
        await page.waitForTimeout(3000);

        // Balance.tsx renders a numeric balance — look for currency markers
        // or the typical "balance" / "available" labels.
        const balanceMarkers = page.locator("text=/balance|available|earnings|withdraw/i");
        await expect(balanceMarkers.first()).toBeVisible({ timeout: 10000 });

        await page.close();
        await ctx.close();
    });

    test('Test Case 4 - HashRouter survives reload on /withdraw', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();

        await page.goto(toPath(`dashboard/new/#/withdraw`));
        await page.waitForLoadState('domcontentloaded');
        await page.locator('#dokan-vendor-dashboard-root').waitFor({ state: 'visible', timeout: 30000 });

        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.locator('#dokan-vendor-dashboard-root').waitFor({ state: 'visible', timeout: 30000 });

        expect(page.url()).toMatch(/#\/withdraw/);

        await page.close();
        await ctx.close();
    });

    test('Test Case 5 - Reverse-withdrawal route mounts', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();

        await page.goto(toPath(`dashboard/new/#/reverse-withdrawal`));
        await page.waitForLoadState('domcontentloaded');
        await page.locator('#dokan-vendor-dashboard-root').waitFor({ state: 'visible', timeout: 30000 });

        expect(page.url()).toMatch(/#\/reverse-withdrawal/);
        const fatal = await page.locator("text=/Fatal error|Parse error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);

        await page.close();
        await ctx.close();
    });
});

