import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { AdminReverseWithdrawalPage, adminReverseWithdrawalData } from './adminReverseWithdrawalPage';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';
import path from 'path';

// ============================================
// ADMIN REVERSE WITHDRAWAL — new React admin dashboard (Dokan 5.0.0+)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/reverse-withdrawal (list)
// and #/reverse-withdrawal/store/:id (per-store transactions drill-down).
//
// ADMIN-ONLY spec. The owing-balance precondition (a vendor with COD/commission
// dues) is minted programmatically through the create endpoint
// (POST dokan/v1/reverse-withdrawal/transactions, trn_type='other', manage_options/
// admin-only) — this spec never drives the vendor UI. COD + the reverse-withdrawal
// feature are enabled via dbUtils.setOptionValue + apiUtils.updatePaymentGateway.
// See tests/pw/test-cases/admin-dashboard-seeding-strategy.md (§ Reverse withdrawal).
// ============================================

// SESSION STORAGE STATES
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

let apiUtils: ApiUtils;
const ids: { owing?: string; drilldown?: string; negative?: string; filterTarget?: string } = {};

// Seed a vendor store (idempotent + re-runnable) and force it active. Look up
// the store first so we never take createStore's "already exists -> updateStore"
// path, which 400s on the non-boolean `show_email: 'yes'` field in
// payloads.createStore() (the v1 stores PUT validates show_email as boolean; the
// POST is lenient).
async function seedVendor(v: { storeName: string; userLogin: string; email: string }): Promise<string> {
    let sellerId = await apiUtils.getSellerId(v.storeName, payloads.adminAuth);
    if (!sellerId) {
        const [, id] = await apiUtils.createStore({ ...payloads.createStore(), store_name: v.storeName, user_login: v.userLogin, email: v.email }, payloads.adminAuth);
        sellerId = id;
    }
    if (sellerId) {
        await apiUtils.updateStoreStatus(sellerId, { status: 'active' }, payloads.adminAuth);
    }
    return sellerId;
}

// Mint a reverse-withdrawal transaction directly (admin-only create endpoint).
// trn_type='other' uses trn_id=0 so NO product/order is required.
async function seedTransaction(vendorId: string, opts: { debit?: string; credit?: string; note?: string }): Promise<void> {
    await apiUtils.post(
        endPoints.createReverseWithdrawalTransactions,
        {
            data: {
                trn_type: 'other',
                trn_id: 0,
                vendor_id: vendorId,
                note: opts.note ?? adminReverseWithdrawalData.note,
                debit: opts.debit ?? '0',
                credit: opts.credit ?? '0',
            },
            headers: payloads.adminAuth,
        },
        false,
    );
}

test.describe('Admin Reverse Withdrawal functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());

        // Enable the reverse-withdrawal feature + COD gateway (the dues source).
        await dbUtils.setOptionValue(dbData.dokan.optionName.reverseWithdraw, dbData.dokan.reverseWithdrawSettings);
        await apiUtils.updatePaymentGateway('cod', { enabled: true }, payloads.adminAuth);

        // Vendors.
        ids.owing = await seedVendor(adminReverseWithdrawalData.owing);
        ids.drilldown = await seedVendor(adminReverseWithdrawalData.drilldown);
        ids.negative = await seedVendor(adminReverseWithdrawalData.negative);
        ids.filterTarget = await seedVendor(adminReverseWithdrawalData.filterTarget);

        // Balances: each owing/filter/drilldown vendor gets a debit (positive owing).
        if (ids.owing) await seedTransaction(ids.owing, { debit: adminReverseWithdrawalData.debitAmount, note: 'ARW owing debit' });
        if (ids.drilldown) await seedTransaction(ids.drilldown, { debit: adminReverseWithdrawalData.debitAmount, note: 'ARW drilldown debit' });
        if (ids.filterTarget) await seedTransaction(ids.filterTarget, { debit: adminReverseWithdrawalData.debitAmount, note: 'ARW filter debit' });

        // Negative vendor: small debit then a larger credit -> balance goes negative.
        if (ids.negative) {
            await seedTransaction(ids.negative, { debit: adminReverseWithdrawalData.debitAmount, note: 'ARW negative debit' });
            await seedTransaction(ids.negative, { credit: adminReverseWithdrawalData.creditAmount, note: 'ARW negative credit' });
        }
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    // ----------------------------------------
    test.describe('happy paths', () => {
        let ctx: BrowserContext;
        let page: Page;
        let rw: AdminReverseWithdrawalPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            rw = new AdminReverseWithdrawalPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('admin can view the Reverse Withdrawal list with stat cards and DataViews columns', { tag: ['@pro', '@admin'] }, async () => {
            await rw.goto();
            await expect(rw.reactRoot).toBeVisible();
            await expect(rw.heading).toBeVisible();
            // Four stat cards from response headers.
            await expect(rw.statCard('Total Collected')).toBeVisible();
            await expect(rw.statCard('Remaining Balance')).toBeVisible();
            await expect(rw.statCard('Total Transactions')).toBeVisible();
            await expect(rw.statCard('Total Vendors')).toBeVisible();
            // DataViews columns.
            await expect(rw.columnHeader('Store')).toBeVisible();
            await expect(rw.columnHeader('Amount')).toBeVisible();
            await expect(rw.columnHeader('Date')).toBeVisible();
            expect(await rw.getRowCount(), 'seeded vendor balance rows render').toBeGreaterThan(0);
            expect(await rw.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('a seeded owing vendor appears as a balance row in the list', { tag: ['@pro', '@admin'] }, async () => {
            await rw.goto();
            // The RW list page does not render a search input (no SearchInput in additionalComponents).
            // goto() already calls waitForReady() which polls until rows are present;
            // freshly-seeded vendors appear first (orderby=added desc), so storeLink is visible directly.
            await expect(rw.storeLink(adminReverseWithdrawalData.owing.storeName)).toBeVisible({ timeout: 15000 });
        });

        test('Add New button opens the AddReverseWithdrawModal', { tag: ['@pro', '@admin'] }, async () => {
            await rw.goto();
            await rw.openAddModal();
            await expect(rw.modalTitle).toBeVisible();
            await expect(rw.modalNotesField).toBeVisible();
            // Transaction-type tabs render.
            await expect(rw.modalTypeTab('Product')).toBeVisible();
            await expect(rw.modalTypeTab('Order')).toBeVisible();
            await expect(rw.modalTypeTab('Other')).toBeVisible();
        });

        test('clicking a store name navigates to the per-store transactions drill-down', { tag: ['@pro', '@admin'] }, async () => {
            await rw.goto();
            // No search input exists on this page (see product gap note on test 17).
            // openStoreDrilldown locates the store by getByText which works without a search filter
            // because seeded vendors are at the top of the list (orderby=added desc).
            await rw.openStoreDrilldown(adminReverseWithdrawalData.drilldown.storeName);
            await expect(page).toHaveURL(/#\/reverse-withdrawal\/store\/\d+/);
            await expect(rw.drilldownRoot).toBeVisible();
            await expect(rw.backButton).toBeVisible();
        });

        test('the drill-down renders the full transaction table with all columns and stat cards', { tag: ['@pro', '@admin'] }, async () => {
            await rw.gotoStore(ids.drilldown!);
            await expect(rw.drilldownRoot).toBeVisible();
            // Store header stat card + transaction stat cards.
            await expect(rw.statCard('Store')).toBeVisible();
            await expect(rw.statCard('Total Collected')).toBeVisible();
            await expect(rw.statCard('Remaining Balance')).toBeVisible();
            await expect(rw.statCard('Total Transactions')).toBeVisible();
            // Transaction columns.
            await expect(rw.columnHeader('Transaction ID')).toBeVisible();
            await expect(rw.columnHeader('Date')).toBeVisible();
            await expect(rw.columnHeader('Transaction Type')).toBeVisible();
            await expect(rw.columnHeader('Note')).toBeVisible();
            await expect(rw.columnHeader('Debit')).toBeVisible();
            await expect(rw.columnHeader('Credit')).toBeVisible();
            await expect(rw.columnHeader('Balance')).toBeVisible();
            // The transaction tbody is populated by a REST GET that resolves AFTER
            // the columns/stat-cards paint; getRowCount() is an immediate snapshot,
            // so wait for the first row to render before counting (the drill-down
            // always has >=1 row: the Opening Balance row plus the seeded debits).
            await expect(rw.rows.first()).toBeVisible({ timeout: 15000 });
            expect(await rw.getRowCount(), 'seeded transactions render in the drill-down').toBeGreaterThan(0);
        });

        test('Back button on the drill-down returns to the Reverse Withdrawal list', { tag: ['@pro', '@admin'] }, async () => {
            await rw.gotoStore(ids.drilldown!);
            await expect(rw.drilldownRoot).toBeVisible();
            await rw.clickBack();
            await expect(page).toHaveURL(/#\/reverse-withdrawal$/);
            await expect(rw.heading).toBeVisible();
            await expect(rw.columnHeader('Store')).toBeVisible();
        });

        test('admin can record a vendor payment (credit) that reduces the vendor balance', { tag: ['@pro', '@admin'] }, async () => {
            // "Mark as paid" in this admin UI = mint a credit transaction that
            // pays down the owing balance. Seed a fresh owing balance first so
            // this test is self-contained and re-runnable, then verify the
            // credit lands in the drill-down's transaction history.
            const note = 'ARW vendor payment credit';
            await seedTransaction(ids.filterTarget!, { credit: '40', note });
            await rw.gotoStore(ids.filterTarget!);
            await expect(rw.drilldownRoot).toBeVisible();
            await expect.poll(async () => (await page.locator('table tbody tr').filter({ hasText: note }).count()) > 0, { timeout: 15000 }).toBe(true);
        });
    });

    // ----------------------------------------
    test.describe('edge cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let rw: AdminReverseWithdrawalPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            rw = new AdminReverseWithdrawalPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        // QUARANTINED @exploratory: the admin Reverse Withdrawal list renders NO
        // free-text search input (index.tsx adds no <SearchInput> to
        // additionalComponents; AdminDataViewTable bypasses the DataViews built-in
        // search). Only the Vendors page has search. This asserts a search-driven
        // empty state the UI cannot reach. Documented product gap.
        test.fixme('search with no match shows the empty state', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            await rw.goto();
            await rw.search('zzz_no_such_vendor_zzz');
            const empty = (await rw.isEmptyStateVisible()) || (await rw.getRowCount()) === 0;
            expect(empty, 'no rows / empty-state for an unmatched search').toBe(true);
        });

        test.fixme('a negative-balance transaction renders the amount wrapped in parentheses in the drill-down', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            await rw.gotoStore(ids.negative!);
            await expect(rw.drilldownRoot).toBeVisible();
            // The credit > debit makes the running balance negative; field
            // renderers wrap negatives in "( ... )".
            await expect.poll(async () => /\(\s*.*\)/.test(await rw.page.locator('table tbody').innerText()), { timeout: 15000 }).toBe(true);
        });

        test('deep-linking / reload directly onto a drill-down route survives a hard reload', { tag: ['@pro', '@admin'] }, async () => {
            await rw.gotoStore(ids.drilldown!);
            await expect(rw.drilldownRoot).toBeVisible();
            await rw.reload();
            await expect(page).toHaveURL(/#\/reverse-withdrawal\/store\/\d+/);
            await expect(rw.reactRoot).toBeVisible();
            await expect(rw.statCard('Store')).toBeVisible();
        });

        test('reloading on #/reverse-withdrawal preserves the route and re-mounts the list', { tag: ['@pro', '@admin'] }, async () => {
            await rw.goto();
            await rw.reload();
            await expect(page).toHaveURL(/#\/reverse-withdrawal/);
            await expect(rw.reactRoot).toBeVisible();
            await expect(rw.heading).toBeVisible();
        });
    });

    // ----------------------------------------
    test.describe('negative cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let rw: AdminReverseWithdrawalPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            rw = new AdminReverseWithdrawalPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('Add modal confirm stays disabled until vendor, amount and note are provided', { tag: ['@pro', '@admin'] }, async () => {
            await rw.goto();
            await rw.openAddModal();
            // Nothing entered -> confirm gated (hasValidationErrors).
            expect(await rw.isModalConfirmDisabled(), 'confirm disabled with empty form').toBe(true);
            // Filling only the note still leaves vendor + product + amount missing.
            await rw.modalNotesField.fill('ARW partial input note');
            expect(await rw.isModalConfirmDisabled(), 'confirm still disabled with partial input').toBe(true);
        });

        test('Cancel on the Add modal closes it without creating a transaction', { tag: ['@pro', '@admin'] }, async () => {
            await rw.goto();
            const before = await rw.getRowCount();
            await rw.openAddModal();
            await rw.modalNotesField.fill('ARW should-not-persist note');
            await rw.closeAddModalViaCancel();
            await expect(rw.modalTitle).toBeHidden();
            // Row count unchanged (no transaction created).
            await rw.reload();
            expect(await rw.getRowCount(), 'no new balance row after cancel').toBe(before);
        });

        test('a logged-in vendor cannot access the admin Reverse Withdrawal page', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const vctx = await browser.newContext({ storageState: v1 });
            const vpage = await vctx.newPage();
            const vrw = new AdminReverseWithdrawalPage(vpage);
            await vpage.goto(vrw.url);
            await vpage.waitForLoadState('domcontentloaded');
            expect(await vrw.isAccessDenied(), 'a vendor must not see the admin Reverse Withdrawal UI').toBe(true);
            await vctx.close();
        });

        test('a logged-in customer cannot access the admin Reverse Withdrawal page', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
            const cctx = await browser.newContext({ storageState: c1 });
            const cpage = await cctx.newPage();
            const crw = new AdminReverseWithdrawalPage(cpage);
            await cpage.goto(crw.url);
            await cpage.waitForLoadState('domcontentloaded');
            expect(await crw.isAccessDenied(), 'a customer must not see the admin Reverse Withdrawal UI').toBe(true);
            await cctx.close();
        });
    });
});
