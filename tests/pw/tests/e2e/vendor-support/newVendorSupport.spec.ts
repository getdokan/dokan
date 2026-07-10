import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewVendorSupportPage, newVendorSupportSelectors } from './newVendorSupportPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { SERVER_URL } from '@utils/helpers';
import { VENDOR_STORAGE_STATE as v1, CUSTOMER_STORAGE_STATE as c1 } from '@utils/authStates';

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Net-new coverage for the React vendor "Admin Support" feature (vendor ↔ admin
// tickets; Pro module vendor_support). Surfaces:
//   /dashboard/new/#/vendor-support       (DataViews ticket list + status tabs)
//   /dashboard/new/#/vendor-support/:id   (ticket thread + reply + status change)
// There is NO legacy vendor spec — only the wp-admin side is covered elsewhere
// (tests/e2e/admin/adminVendorSupport.spec.ts, a different SPA), so nothing is
// skipped here. Cross-role flows drive the admin via REST.
// ============================================

const TICKETS = `${SERVER_URL}/dokan/v1/vendor-support/tickets`;

let apiUtils: ApiUtils;
let openSubject: string;
let closedSubject: string;
const seededIds: string[] = [];

const stamp = (): string => `${Date.now()}${Math.floor(Math.random() * 1000)}`;
// Subject cells truncate at 30 chars; keep markers short and match on prefix.
const uniqueSubject = (label: string): string => `NVS ${label} ${stamp()}`.slice(0, 28);

/** Create a vendor-owned ticket via REST; tracked for cleanup. Returns its id. */
async function seedTicket(subject: string, status: 'open' | 'closed' = 'open'): Promise<string> {
    const [, body] = await apiUtils.post(TICKETS, { data: { subject, message: `${subject} body`, status: 'open' }, headers: payloads.vendorAuth });
    const id = String(body?.id);
    seededIds.push(id);
    if (status === 'closed') {
        await apiUtils.put(`${TICKETS}/${id}`, { data: { status: 'closed' }, headers: payloads.vendorAuth });
    }
    return id;
}

async function getTicketStatus(id: string): Promise<string> {
    const [, body] = await apiUtils.get(`${TICKETS}/${id}`, { headers: payloads.vendorAuth }, false);
    return String(body?.status ?? '');
}

test.describe('Vendor Support (React) functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        // The vendor Admin-Support route + REST routes only register while the module is active.
        await apiUtils.activateModules(payloads.moduleIds.vendorSupport, payloads.adminAuth);
        openSubject = uniqueSubject('open');
        closedSubject = uniqueSubject('closed');
        await seedTicket(openSubject, 'open');
        await seedTicket(closedSubject, 'closed');
    });

    test.afterAll(async () => {
        for (const id of seededIds) {
            await apiUtils.delete(`${TICKETS}/${id}`, { headers: payloads.adminAuth }).catch(() => undefined);
        }
        await apiUtils?.dispose();
    });

    // ---------------------------------------------------------------
    test.describe('vendor', () => {
        let ctx: BrowserContext;
        let page: Page;
        let support: NewVendorSupportPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            support = new NewVendorSupportPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('vendor can open the Admin Support list mounted at #/vendor-support (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await support.gotoList();
            expect(page.url(), 'on the /vendor-support route').toMatch(/#\/vendor-support/);
            await expect(support.headerHeading, 'the "Admin Support" header renders').toBeVisible({ timeout: 15000 });
            expect(await support.tabsVisible(), 'All / Active / Closed tabs render').toBe(true);
            await expect(support.rowsWithText(openSubject).first(), 'seeded open ticket row is listed').toBeVisible({ timeout: 15000 });
            expect(await support.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('the ticket list renders Ticket Id / Subject / Status / Date columns without the admin Vendor column (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await support.gotoList();
            const headers = (await support.columnHeaderTexts()).map(h => h.toLowerCase());
            expect(
                headers.some(h => h.includes('subject')),
                'Subject column present',
            ).toBe(true);
            expect(
                headers.some(h => h.includes('status')),
                'Status column present',
            ).toBe(true);
            expect(
                headers.some(h => h === 'vendor'),
                'admin-only Vendor column is absent for a vendor',
            ).toBe(false);
        });

        test('the All / Active / Closed tabs render with counts (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await support.gotoList();
            // Counts only grow on the shared DB; assert >= our two seeds rather than equality.
            expect(await support.getTabCount('all'), 'All tab count reflects >= the two seeded tickets').toBeGreaterThanOrEqual(2);
            expect(await support.getTabCount('closed'), 'Closed tab count reflects >= the seeded closed ticket').toBeGreaterThanOrEqual(1);
        });

        test('the Closed tab filters the list to closed tickets (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await support.gotoList();
            await support.selectTab('closed');
            await expect(support.rowsWithText(closedSubject).first(), 'closed ticket present on Closed tab').toBeVisible({ timeout: 15000 });
            await expect(support.rowsWithText(openSubject), 'open ticket absent from Closed tab').toHaveCount(0, { timeout: 15000 });
        });

        test('vendor can create a ticket through the Add New Ticket modal (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const subject = uniqueSubject('create');
            await support.gotoList();
            await support.createTicket(subject, 'please help with this order');
            await expect(support.rowsWithText(subject).first(), 'created ticket appears in the list').toBeVisible({ timeout: 15000 });
            // REST oracle: the ticket exists and is open.
            const [, list] = await apiUtils.get(`${TICKETS}?search=${encodeURIComponent(subject)}`, { headers: payloads.vendorAuth });
            const found = Array.isArray(list) ? list.find((t: { subject?: string; id?: number }) => String(t.subject) === subject) : undefined;
            expect(found, 'created ticket is retrievable via REST').toBeTruthy();
            if (found?.id) seededIds.push(String(found.id));
            expect(String(found?.status), 'created ticket is open').toBe('open');
        });

        test('searching by subject narrows the list to the matching ticket (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await support.gotoList();
            await support.search(openSubject);
            await expect(support.rowsWithText(openSubject).first(), 'searched ticket is the matching row').toBeVisible({ timeout: 15000 });
            await expect(support.rowsWithText(closedSubject), 'a different ticket is filtered out by search').toHaveCount(0, { timeout: 15000 });
            await support.clearSearch();
        });

        test('searching a non-existent subject shows the empty state (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await support.gotoList();
            await support.search(`zzz-no-such-ticket-${stamp()}`);
            await expect(support.settledRows, 'no settled rows for a non-matching search').toHaveCount(0, { timeout: 15000 });
            await expect(page.locator(newVendorSupportSelectors.emptyState).first(), 'empty-state banner shows').toBeVisible({ timeout: 10000 });
        });

        test('the row Actions menu offers View / Close but never Delete for a vendor (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const subject = uniqueSubject('actions');
            await seedTicket(subject, 'open');
            await support.gotoList();
            const items = await support.rowActionItems(subject);
            expect(items.view, 'View action available').toBe(true);
            expect(items.close, 'Close action available').toBe(true);
            expect(items.del, 'Delete action is admin-only, absent for a vendor').toBe(false);
        });

        test('vendor can close a ticket from the row Actions menu after confirming (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const subject = uniqueSubject('rowclose');
            const id = await seedTicket(subject, 'open');
            await support.gotoList();
            await support.closeTicketFromRow(subject);
            expect(await getTicketStatus(id), 'ticket transitioned to closed (REST)').toBe('closed');
        });

        test('vendor can open a ticket detail thread from the list (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await support.gotoList();
            await support.openTicketByText(openSubject);
            expect(page.url(), 'on the ticket detail route').toMatch(/#\/vendor-support\/\d+/);
            expect(await support.getDetailHeadingText(), 'detail heading is "#<id> - <subject>"').toContain(openSubject);
        });

        test('vendor can reply from the ticket detail (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const subject = uniqueSubject('reply');
            const id = await seedTicket(subject, 'open');
            const replyText = `vendor reply ${stamp()}`;
            await support.gotoDetails(id);
            await support.reply(replyText);
            // REST oracle: the conversation count grew (>= 2: opening message + reply).
            const [, body] = await apiUtils.get(`${TICKETS}/${id}`, { headers: payloads.vendorAuth });
            expect(Number(body?.conversations_count ?? 0), 'reply added a conversation (REST)').toBeGreaterThanOrEqual(2);
        });

        test('replying to a closed ticket reopens it (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const subject = uniqueSubject('reopen');
            const id = await seedTicket(subject, 'closed');
            expect(await getTicketStatus(id), 'ticket starts closed').toBe('closed');
            await support.gotoDetails(id);
            await support.reply(`reopening reply ${stamp()}`);
            expect(await getTicketStatus(id), 'replying to a closed ticket reopened it (REST)').toBe('open');
        });

        test('HashRouter survives a reload on /vendor-support (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await support.gotoList();
            await page.reload({ waitUntil: 'domcontentloaded' });
            await page.locator(newVendorSupportSelectors.reactRoot).waitFor({ state: 'visible', timeout: 30000 });
            expect(page.url(), 'reload keeps the #/vendor-support route').toMatch(/#\/vendor-support/);
            expect(await support.hasNoPhpFatal(), 'no PHP fatal after reload').toBe(true);
        });
    });

    // ---------------------------------------------------------------
    test.describe('cross-role', () => {
        test('an admin reply (REST) appears in the vendor ticket timeline (React)', { tag: ['@pro', '@vendor', '@admin', '@new-ui'] }, async ({ browser }) => {
            const subject = uniqueSubject('adminreply');
            const id = await seedTicket(subject, 'open');
            const adminMsg = `admin reply ${stamp()}`;
            await apiUtils.post(`${TICKETS}/${id}/conversations`, { data: { message: adminMsg }, headers: payloads.adminAuth });

            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const support = new NewVendorSupportPage(page);
            try {
                await support.gotoDetails(id);
                expect(await support.detailHasText(adminMsg), "admin's reply shows in the vendor's ticket timeline").toBe(true);
            } finally {
                await page.close();
                await ctx.close();
            }
        });

        test('business flow: vendor creates (UI) then admin closes (REST) and the vendor sees it closed (React)', { tag: ['@pro', '@vendor', '@admin', '@new-ui'] }, async ({ browser }) => {
            const subject = uniqueSubject('flow');
            // 1. Vendor creates a ticket through the React modal.
            const ctxV = await browser.newContext({ storageState: v1 });
            const pageV = await ctxV.newPage();
            const supportV = new NewVendorSupportPage(pageV);
            let id = '';
            try {
                await supportV.gotoList();
                await supportV.createTicket(subject, 'created via the React modal');
                const [, list] = await apiUtils.get(`${TICKETS}?search=${encodeURIComponent(subject)}`, { headers: payloads.vendorAuth });
                const found = Array.isArray(list) ? list.find((t: { subject?: string; id?: number }) => String(t.subject) === subject) : undefined;
                expect(found, 'vendor-created ticket exists (REST)').toBeTruthy();
                id = String(found.id);
                seededIds.push(id);
            } finally {
                await pageV.close();
                await ctxV.close();
            }

            // 2. Admin closes it via REST.
            await apiUtils.put(`${TICKETS}/${id}`, { data: { status: 'closed' }, headers: payloads.adminAuth });
            expect(await getTicketStatus(id), 'admin closed the ticket (REST)').toBe('closed');

            // 3. Vendor sees it under the Closed tab.
            const ctx2 = await browser.newContext({ storageState: v1 });
            const page2 = await ctx2.newPage();
            const support2 = new NewVendorSupportPage(page2);
            try {
                await support2.gotoList();
                await support2.selectTab('closed');
                await expect(support2.rowsWithText(subject).first(), 'admin-closed ticket appears on the vendor Closed tab').toBeVisible({ timeout: 15000 });
            } finally {
                await page2.close();
                await ctx2.close();
            }
        });

        test('a logged-in customer cannot mount the vendor Admin Support route (React)', { tag: ['@pro', '@customer', '@new-ui'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: c1 });
            const page = await ctx.newPage();
            const support = new NewVendorSupportPage(page);
            try {
                await page.goto(support.listUrl);
                await page.waitForLoadState('domcontentloaded');
                await page.waitForTimeout(2000);
                // A customer is redirected — the vendor dashboard root must not mount.
                await expect(page.locator(newVendorSupportSelectors.reactRoot), 'vendor dashboard root does not mount for a customer').toHaveCount(0);
                expect(await support.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
            } finally {
                await page.close();
                await ctx.close();
            }
        });
    });
});
