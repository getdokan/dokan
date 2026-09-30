import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { AdminStoreSupportPage, adminStoreSupportData } from './adminStoreSupportPage';
import { applyAndValidateDataViewsFilter } from './adminDataViews';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import path from 'path';

// ============================================
// ADMIN STORE SUPPORT — new React admin dashboard (Dokan Pro 5.0.0+)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/admin-store-support
// (AdminDataViews list) + #/admin-store-support/:ticketId/:vendorId (detail).
//
// ADMIN-ONLY spec. The admin Store Support REST controller exposes ONLY
// read/reply/status/batch/delete-comment — there is NO admin create-ticket
// route, so every ticket precondition (open / closed / read / unread / bulk
// targets) is seeded as a CUSTOMER precondition via the REST API
// (apiUtils.createSupportTicket + updateSupportTicketStatus, admin auth). This
// spec never drives the vendor/customer UI.
// See tests/pw/test-cases/admin-dashboard-seeding-strategy.md (§ Store support).
// ============================================

// The ticket author (customer) and recipient (vendor) come from the canonical
// seeded env ids — they are the standard customer / vendor the suite provisions.
const { CUSTOMER_ID, VENDOR_ID } = process.env;

// SESSION STORAGE STATES
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

let apiUtils: ApiUtils;
const ids: {
    open?: string;
    closed?: string;
    closeTarget?: string;
    openTarget?: string;
    bulk: string[];
} = { bulk: [] };

// Seed a support ticket (idempotent + re-runnable) and force its status.
// createSupportTicket always POSTs a new dokan_store_support CPT, so look the
// ticket up by its (unique, namespaced) title first to avoid duplicating it on
// re-runs. The helper uses admin auth internally.
async function seedTicket(title: string, status: 'open' | 'closed'): Promise<string> {
    let ticketId = await findTicketIdByTitle(title);
    if (!ticketId) {
        const [, id] = await apiUtils.createSupportTicket({
            ...payloads.createSupportTicket,
            title,
            author: CUSTOMER_ID,
            meta: { store_id: VENDOR_ID },
        });
        ticketId = id;
    }
    if (ticketId) {
        await apiUtils.updateSupportTicketStatus(ticketId, status, payloads.adminAuth);
    }
    return ticketId;
}

// Find a seeded ticket id by its post_title (the admin list returns post_title).
async function findTicketIdByTitle(title: string): Promise<string> {
    const all = await apiUtils.getAllSupportTickets(payloads.adminAuth);
    const match = Array.isArray(all) ? all.find((t: { post_title?: string }) => t?.post_title === title) : undefined;
    return match ? String(match.ID ?? match.id) : '';
}

test.describe('Admin Store Support functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        ids.open = await seedTicket(adminStoreSupportData.open.title, 'open');
        ids.closed = await seedTicket(adminStoreSupportData.closed.title, 'closed');
        ids.closeTarget = await seedTicket(adminStoreSupportData.closeTarget.title, 'open');
        ids.openTarget = await seedTicket(adminStoreSupportData.openTarget.title, 'closed');
        ids.bulk = [];
        for (const b of adminStoreSupportData.bulk) {
            ids.bulk.push(await seedTicket(b.title, 'open'));
        }
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    // ----------------------------------------
    test.describe('happy paths', () => {
        let ctx: BrowserContext;
        let page: Page;
        let support: AdminStoreSupportPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            support = new AdminStoreSupportPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('applying the Vendor filter refetches the list and re-renders the table', { tag: ['@pro', '@admin'] }, async () => {
            await support.goto();
            const result = await applyAndValidateDataViewsFilter(page, { requestFragment: 'dokan/v1/admin/support-ticket', field: 'Vendor' });
            expect(result.requestFired, 'applying the Vendor filter refetched the list').toBe(true);
            expect(result.noPhpFatal, 'no PHP fatal after filtering').toBe(true);
            expect(result.ok, 'the Vendor filter applied and the table re-rendered (rows or empty state)').toBe(true);
        });

        test('admin can view the Store Support list with DataViews table and columns', { tag: ['@pro', '@admin'] }, async () => {
            await support.goto();
            await expect(support.reactRoot).toBeVisible();
            await expect(support.heading).toBeVisible();
            await expect(support.columnHeader('Ticket ID')).toBeVisible();
            await expect(support.columnHeader('Title')).toBeVisible();
            await expect(support.columnHeader('Vendor')).toBeVisible();
            await expect(support.columnHeader('Customer')).toBeVisible();
            await expect(support.columnHeader('Status')).toBeVisible();
            expect(await support.getRowCount(), 'seeded ticket rows render').toBeGreaterThan(0);
            expect(await support.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('searching by ticket title filters the list to the matching ticket', { tag: ['@pro', '@admin'] }, async () => {
            await support.goto();
            await support.search(adminStoreSupportData.open.title);
            await expect(support.rowByTitle(adminStoreSupportData.open.title)).toBeVisible();
            await expect(page.getByText(adminStoreSupportData.closed.title, { exact: true })).toHaveCount(0);
        });

        test('Open tab shows an open ticket with the Open status pill', { tag: ['@pro', '@admin'] }, async () => {
            await apiUtils.updateSupportTicketStatus(ids.open!, 'open', payloads.adminAuth);
            await support.goto();
            await support.clickTab(/Open/);
            await support.search(adminStoreSupportData.open.title);
            await expect(support.rowByTitle(adminStoreSupportData.open.title)).toBeVisible();
            expect(await support.statusOfRow(adminStoreSupportData.open.title)).toBe('Open');
        });

        test('Closed tab shows a closed ticket with the Closed status pill', { tag: ['@pro', '@admin'] }, async () => {
            await apiUtils.updateSupportTicketStatus(ids.closed!, 'closed', payloads.adminAuth);
            await support.goto();
            await support.clickTab(/Closed/);
            await support.search(adminStoreSupportData.closed.title);
            await expect(support.rowByTitle(adminStoreSupportData.closed.title)).toBeVisible();
            expect(await support.statusOfRow(adminStoreSupportData.closed.title)).toBe('Closed');
        });

        test('admin can close an open ticket (status flips to Closed)', { tag: ['@pro', '@admin'] }, async () => {
            await apiUtils.updateSupportTicketStatus(ids.closeTarget!, 'open', payloads.adminAuth);
            await support.goto();
            await support.search(adminStoreSupportData.closeTarget.title);
            await support.closeTicket(adminStoreSupportData.closeTarget.title);
            await expect.poll(async () => support.statusOfRow(adminStoreSupportData.closeTarget.title), { timeout: 15000 }).toBe('Closed');
        });

        test('admin can re-open a closed ticket (status flips to Open)', { tag: ['@pro', '@admin'] }, async () => {
            await apiUtils.updateSupportTicketStatus(ids.openTarget!, 'closed', payloads.adminAuth);
            await support.goto();
            await support.clickTab(/Closed/);
            await support.search(adminStoreSupportData.openTarget.title);
            await support.openTicket(adminStoreSupportData.openTarget.title);
            // Re-opening the ticket fires a refetch on the still-active Closed
            // tab, which now excludes the (Open) ticket — so the row vanishes and
            // statusOfRow times out. Switch to the All tab (which lists every
            // status) and re-apply the search before polling its status pill.
            await support.clickTab(/All/);
            await support.search(adminStoreSupportData.openTarget.title);
            await expect.poll(async () => support.statusOfRow(adminStoreSupportData.openTarget.title), { timeout: 15000 }).toBe('Open');
        });

        test('clicking a ticket opens the single ticket detail route', { tag: ['@pro', '@admin'] }, async () => {
            await support.goto();
            await support.search(adminStoreSupportData.open.title);
            await support.openTicketDetail(adminStoreSupportData.open.title);
            await expect(page).toHaveURL(/#\/admin-store-support\/\d+\/\d+/);
            await expect(page.getByRole('heading', { name: 'Ticket Summary' })).toBeVisible();
        });

        test('admin can bulk-close open tickets', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            for (const id of ids.bulk) {
                await apiUtils.updateSupportTicketStatus(id, 'open', payloads.adminAuth);
            }
            await support.goto();
            await support.clickTab(/Open/);
            await support.selectRowsByTitle(adminStoreSupportData.bulk.map(b => b.title));
            await support.bulkAction('Close');
            // Verify the bulk action took effect in the UI: both tickets now Closed.
            await support.clickTab(/All/);
            for (const b of adminStoreSupportData.bulk) {
                await support.search(b.title);
                await expect.poll(async () => support.statusOfRow(b.title), { timeout: 10000 }).toBe('Closed');
                await support.clearSearch();
            }
        });
    });

    // ----------------------------------------
    test.describe('edge cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let support: AdminStoreSupportPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            support = new AdminStoreSupportPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('search with no match shows the empty state', { tag: ['@pro', '@admin'] }, async () => {
            await support.goto();
            await support.search(adminStoreSupportData.searchMiss);
            const empty = (await support.isEmptyStateVisible()) || (await support.getRowCount()) === 0;
            expect(empty, 'no rows / empty-state for an unmatched search').toBe(true);
        });

        test('reloading on #/admin-store-support preserves the route and re-mounts the list', { tag: ['@pro', '@admin'] }, async () => {
            await support.goto();
            await support.reload();
            await expect(page).toHaveURL(/#\/admin-store-support/);
            await expect(support.reactRoot).toBeVisible();
            await expect(support.heading).toBeVisible();
        });

        test('status tabs switch the active selection and refetch with the matching status', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            await support.goto();
            const [req] = await Promise.all([page.waitForRequest(/\/dokan\/v1\/admin\/support-ticket/, { timeout: 15000 }), support.clickTab(/Open/)]);
            expect(decodeURIComponent(req.url())).toMatch(/post_status=open/);
            expect(await support.selectedTabName()).toMatch(/Open/);
        });

        test('deep-linking the detail route with a non-existent ticket id renders the not-found state, not a crash', { tag: ['@pro', '@admin'] }, async () => {
            await support.gotoSingle(99999999, VENDOR_ID ?? 1);
            expect(await support.isDetailNotFound(), 'a bogus ticket id must degrade to NotFound, never white-screen').toBe(true);
            expect(await support.hasNoPhpFatal(), 'no PHP fatal on bad detail id').toBe(true);
        });
    });

    // ----------------------------------------
    test.describe('negative cases', () => {
        test('IDOR: a mismatched vendorId on the detail route does not expose the ticket', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
            // Seed a real ticket, then tamper the vendorId in the URL to a value
            // that does not own it. The backend ownership check (vendor_id ties to
            // the ticket's store_id) must refuse to load it.
            const wrongVendorId = String(Number(VENDOR_ID ?? 3) + 999999);
            const ctx = await browser.newContext({ storageState: a1 });
            const page = await ctx.newPage();
            const support = new AdminStoreSupportPage(page);
            await support.gotoSingle(ids.open!, wrongVendorId);
            expect(await support.isDetailNotFound(), 'tampering vendorId must not load the ticket').toBe(true);
            await ctx.close();
        });

        test('a logged-in vendor cannot access the admin Store Support page', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const support = new AdminStoreSupportPage(page);
            await page.goto(support.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await support.isAccessDenied(), 'a vendor must not see the admin Store Support UI').toBe(true);
            await ctx.close();
        });

        test('a logged-in customer cannot access the admin Store Support page', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: c1 });
            const page = await ctx.newPage();
            const support = new AdminStoreSupportPage(page);
            await page.goto(support.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await support.isAccessDenied(), 'a customer must not see the admin Store Support UI').toBe(true);
            await ctx.close();
        });
    });
});
