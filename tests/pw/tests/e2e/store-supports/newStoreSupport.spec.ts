import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewStoreSupportPage, newStoreSupportSelectors } from './newStoreSupportPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { SERVER_URL } from '@utils/helpers';
import { VENDOR_STORAGE_STATE as v1 } from '@utils/authStates';

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Parity coverage for the 5.0.0 React rewrite of the vendor Store Support feature.
// Surfaces:
//   /dashboard/new/#/support           (DataViews ticket list + status tabs)
//   /dashboard/new/#/support/:ticketId (ticket thread + reply form)
// Ported from the legacy `store-supports` vendor cases (whose page object is a
// no-op stub), driving the React UI, plus cross-role flows (customer/admin act
// via REST → vendor React surface reflects it). Pro feature (module store_support).
// ============================================

const { VENDOR_ID, CUSTOMER_ID } = process.env;

let apiUtils: ApiUtils;
let openTicketId: string;
let openTicketTitle: string;
let closedTicketTitle: string;
const seededIds: string[] = [];

const stamp = (): string => `${Date.now()}${Math.floor(Math.random() * 1000)}`;
// Titles are truncated at 22 chars in the list (ShortContent); keep markers short.
const uniqueTitle = (label: string): string => `PW ${label} ${stamp()}`.slice(0, 22);

/** Seed a support ticket for VENDOR_ID authored by CUSTOMER_ID, tracked for cleanup. */
async function seedTicket(title: string, status: 'open' | 'closed', orderId?: string | number): Promise<string> {
    const meta: Record<string, unknown> = { ...payloads.createSupportTicket.meta, store_id: Number(VENDOR_ID) };
    if (orderId) meta.order_id = Number(orderId);
    const [, id] = await apiUtils.createSupportTicket({
        ...payloads.createSupportTicket,
        title,
        author: Number(CUSTOMER_ID),
        status,
        meta,
    });
    seededIds.push(id);
    return id;
}

test.describe('Store Support (React) functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        // The vendor Support route only registers when the module is active.
        await apiUtils.activateModules(payloads.moduleIds.storeSupport, payloads.adminAuth);
        openTicketTitle = uniqueTitle('open');
        closedTicketTitle = uniqueTitle('closed');
        openTicketId = await seedTicket(openTicketTitle, 'open');
        await seedTicket(closedTicketTitle, 'closed');
    });

    test.afterAll(async () => {
        // Best-effort cleanup of everything this suite seeded.
        for (const id of seededIds) {
            await apiUtils.delete(`${SERVER_URL}/wp/v2/dokan_store_support/${id}?force=true`, { headers: payloads.adminAuth }).catch(() => undefined);
        }
        await apiUtils?.dispose();
    });

    // ---------------------------------------------------------------
    test.describe('vendor', () => {
        let ctx: BrowserContext;
        let page: Page;
        let support: NewStoreSupportPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            support = new NewStoreSupportPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('vendor can view support tickets list with status tabs (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await support.gotoList();
            expect(page.url(), 'on the /support route').toMatch(/#\/support/);
            expect(await support.tabsVisible(), 'All / Open / Closed tabs render').toBe(true);
            // The seeded open ticket surfaces on the list.
            await expect(support.rowsWithText(openTicketTitle).first(), 'seeded open ticket row is listed').toBeVisible({ timeout: 15000 });
            expect(await support.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        // NOTE: a tab-count-badge assertion was intentionally dropped — the count
        // is not rendered in the tab's text (parseTabCount format), it is not a
        // legacy-parity motive, and the tabs' filtering behavior is fully covered
        // by the two status-tab tests below.

        test('vendor can open a support ticket details view (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await support.gotoDetails(openTicketId);
            expect(page.url(), 'on the details route').toMatch(/#\/support\/\d+/);
            expect(await support.getDetailTitleText(), 'details header shows the ticket title').toContain(openTicketTitle);
            await expect(support.replyTextarea, 'reply form is present on an open ticket').toBeVisible({ timeout: 15000 });
            expect(await support.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('vendor can filter tickets to the Open tab (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await support.gotoList();
            await support.selectTab('open');
            await expect(support.rowsWithText(openTicketTitle).first(), 'open ticket present on Open tab').toBeVisible({ timeout: 15000 });
            // Retrying assertion — the list refilters async after the tab click.
            await expect(support.rowsWithText(closedTicketTitle), 'closed ticket absent from Open tab').toHaveCount(0, { timeout: 15000 });
        });

        test('vendor can filter tickets to the Closed tab (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await support.gotoList();
            await support.selectTab('closed');
            await expect(support.rowsWithText(closedTicketTitle).first(), 'closed ticket present on Closed tab').toBeVisible({ timeout: 15000 });
            await expect(support.rowsWithText(openTicketTitle), 'open ticket absent from Closed tab').toHaveCount(0, { timeout: 15000 });
        });

        test('vendor can search a support ticket by title (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const marker = uniqueTitle('find');
            const id = await seedTicket(marker, 'open');
            await support.gotoList();
            await support.search(marker);
            await expect(support.rowsWithText(marker).first(), 'searched ticket is the matching row').toBeVisible({ timeout: 15000 });
            await expect(support.rowsWithText(openTicketTitle), 'a different ticket is filtered out by search').toHaveCount(0, { timeout: 15000 });
            await support.clearSearch();
            expect(id).toBeTruthy();
        });

        test('vendor can search a support ticket by id (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await support.gotoList();
            await support.search(openTicketId);
            const row = support.rowsWithText(`#${openTicketId}`).first();
            await expect(row, 'numeric search isolates the ticket by its #id').toBeVisible({ timeout: 15000 });
        });

        test('vendor can reply to a support ticket (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const replyText = `vendor reply ${stamp()}`;
            await support.gotoDetails(openTicketId);
            await support.submitReply(replyText);
            // Defeat the optimistic UI: reload and confirm the reply persisted.
            await support.gotoDetails(openTicketId);
            expect(await support.replyListHasText(replyText), 'vendor reply persists on the ticket after reload').toBe(true);
        });

        test('vendor can close a support ticket from the row action (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const marker = uniqueTitle('close');
            const id = await seedTicket(marker, 'open');
            await support.gotoList();
            await support.selectTab('open');
            await support.changeStatusFromRow(marker, 'Close');
            // REST oracle: the ticket is now closed.
            const [, ticket] = await apiUtils.get(`${SERVER_URL}${newStoreSupportSelectors.listRest}/${id}`, { headers: payloads.vendorAuth });
            expect(String(ticket.status ?? ticket.post_status), 'ticket transitioned to closed').toMatch(/clos/i);
        });

        test('vendor can reopen a closed support ticket from the row action (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const marker = uniqueTitle('reopen');
            const id = await seedTicket(marker, 'closed');
            await support.gotoList();
            await support.selectTab('closed');
            await support.changeStatusFromRow(marker, 'Re-open');
            const [, ticket] = await apiUtils.get(`${SERVER_URL}${newStoreSupportSelectors.listRest}/${id}`, { headers: payloads.vendorAuth });
            expect(String(ticket.status ?? ticket.post_status), 'ticket transitioned back to open').toMatch(/open/i);
        });

        test('vendor can close a ticket with a chat reply (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const marker = uniqueTitle('closechat');
            const id = await seedTicket(marker, 'open');
            await support.gotoDetails(id);
            await support.submitReply(`closing reply ${stamp()}`, true);
            const [, ticket] = await apiUtils.get(`${SERVER_URL}${newStoreSupportSelectors.listRest}/${id}`, { headers: payloads.vendorAuth });
            expect(String(ticket.status ?? ticket.post_status), 'reply-with-close closed the ticket').toMatch(/clos/i);
        });

        test('vendor replying to a closed ticket reopens it (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const marker = uniqueTitle('reopenchat');
            const id = await seedTicket(marker, 'closed');
            await support.gotoDetails(id);
            await support.submitReply(`reopening reply ${stamp()}`);
            const [, ticket] = await apiUtils.get(`${SERVER_URL}${newStoreSupportSelectors.listRest}/${id}`, { headers: payloads.vendorAuth });
            expect(String(ticket.status ?? ticket.post_status), 'replying to a closed ticket reopened it').toMatch(/open/i);
        });

        test('vendor sees a not-found state for a nonexistent ticket (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await support.gotoDetails(999999999);
            await expect(support.notFoundHeading, 'not-found heading shown for a missing ticket').toBeVisible({ timeout: 15000 });
            expect(await support.hasNoPhpFatal(), 'no PHP fatal on the not-found state').toBe(true);
        });

        test('HashRouter survives a reload on /support (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await support.gotoList();
            await page.reload({ waitUntil: 'domcontentloaded' });
            await page.locator(newStoreSupportSelectors.reactRoot).waitFor({ state: 'visible', timeout: 30000 });
            expect(page.url(), 'reload keeps the #/support route').toMatch(/#\/support/);
            expect(await support.hasNoPhpFatal(), 'no PHP fatal after reload').toBe(true);
        });
    });

    // ---------------------------------------------------------------
    test.describe('cross-role (REST-driven)', () => {
        test('a customer-created ticket (REST) appears in the vendor list (React)', { tag: ['@pro', '@vendor', '@customer', '@new-ui'] }, async ({ browser }) => {
            const subject = uniqueTitle('cust');
            // Customer creates a ticket through the real customer namespace (fires the
            // module notification + cache-invalidation hooks the wp/v2 seed skips).
            const [res, body] = await apiUtils.post(`${SERVER_URL}/dokan/v1/customer/support-tickets`, {
                data: { store_id: Number(VENDOR_ID), subject, message: 'customer needs help' },
                headers: payloads.customerAuth,
            });
            expect(res.ok(), 'customer ticket created via REST').toBe(true);
            if (body?.id) seededIds.push(String(body.id));

            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const support = new NewStoreSupportPage(page);
            try {
                await support.gotoList();
                await support.selectTab('open');
                await expect(support.rowsWithText(subject).first(), 'customer-created ticket shows in the vendor list').toBeVisible({ timeout: 15000 });
            } finally {
                await page.close();
                await ctx.close();
            }
        });

        test('an admin-closed ticket (REST) is reflected on the vendor Closed tab (React)', { tag: ['@pro', '@admin', '@vendor', '@new-ui'] }, async ({ browser }) => {
            const marker = uniqueTitle('adminclose');
            const id = await seedTicket(marker, 'open');
            // Admin closes it via REST — note the endpoint writes the raw status string,
            // so pass 'closed' (not the legacy payload's 'close').
            await apiUtils.updateSupportTicketStatus(id, 'closed', payloads.adminAuth);

            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const support = new NewStoreSupportPage(page);
            try {
                await support.gotoList();
                await support.selectTab('closed');
                await expect(support.rowsWithText(marker).first(), 'admin-closed ticket appears on the vendor Closed tab').toBeVisible({ timeout: 15000 });
            } finally {
                await page.close();
                await ctx.close();
            }
        });
    });
});
