import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { AdminVendorSupportPage, adminVendorSupportData } from './adminVendorSupportPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { SERVER_URL } from '@utils/helpers';
import { applyAndValidateDataViewsFilter } from './adminDataViews';
import path from 'path';

// Admin-only Vendor Support spec. Ticket seeding is best-effort: mount/tab/filter/
// access-control tests don't need a row, so a seeding hiccup must not cascade —
// row-dependent tests skip when no ticket was seeded. Seeded names use the "AVS" prefix.

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

let apiUtils: ApiUtils;
const seed: { vendorId?: string; ticketSeeded?: boolean } = {};

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

test.describe('Admin Vendor Support functionality @pro', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        seed.vendorId = await seedVendor(adminVendorSupportData.vendor);

        // Best-effort: seed ONE ticket so row-dependent tests have a deterministic row.
        try {
            const [res] = await apiUtils.post(
                `${SERVER_URL}${adminVendorSupportData.rest.tickets}`,
                { data: { subject: adminVendorSupportData.ticket.subject, message: adminVendorSupportData.ticket.message, vendor_id: Number(seed.vendorId) }, headers: payloads.adminAuth },
                false
            );
            seed.ticketSeeded = res.ok();
        } catch (e) {
            seed.ticketSeeded = false;
            console.warn('adminVendorSupport: optional ticket seeding skipped:', (e as Error).message);
        }
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test.describe('happy paths', () => {
        let ctx: BrowserContext;
        let page: Page;
        let support: AdminVendorSupportPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            support = new AdminVendorSupportPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('admin can open the Vendor Support list mounted at #/vendor-support', { tag: ['@pro', '@admin'] }, async () => {
            await support.goto();
            await expect(support.reactRoot).toBeVisible();
            await expect(support.heading).toBeVisible();
            await expect(page).toHaveURL(/#\/vendor-support/);
            expect(await support.hasNoPhpFatal(), 'no PHP fatal on /vendor-support').toBe(true);
        });

        test('the All / Active / Closed status tabs render and All is active by default', { tag: ['@pro', '@admin'] }, async () => {
            await support.goto();
            await expect(support.tab(/^All/)).toBeVisible();
            await expect(support.tab(/^Active/)).toBeVisible();
            await expect(support.tab(/^Closed/)).toBeVisible();
            expect(await support.isTabSelected(/^All/), 'All tab selected on first load').toBe(true);
        });

        test('the search box is present and the Filter exposes Vendor and Date Range', { tag: ['@pro', '@admin'] }, async () => {
            await support.goto();
            await expect(support.searchBox).toBeVisible();
            const fields = await support.openFilterFieldNames();
            for (const expected of adminVendorSupportData.filterFields) {
                expect(fields.some(f => f.toLowerCase().includes(expected.toLowerCase())), `filter offers "${expected}"`).toBe(true);
            }
        });

        test('the ticket columns render when a ticket exists', { tag: ['@pro', '@admin'] }, async () => {
            test.skip(!seed.ticketSeeded, 'no vendor-support ticket could be seeded in this env');
            await support.goto();
            for (const col of adminVendorSupportData.columns) {
                await expect(support.columnHeader(new RegExp(col, 'i'))).toBeVisible();
            }
            expect(await support.getRowCount(), 'seeded ticket row renders').toBeGreaterThan(0);
        });

        test('searching by subject narrows the list to the matching ticket', { tag: ['@pro', '@admin'] }, async () => {
            test.skip(!seed.ticketSeeded, 'no vendor-support ticket could be seeded in this env');
            await support.goto();
            await support.search(adminVendorSupportData.ticket.subject);
            await expect(support.rowBySubject(adminVendorSupportData.ticket.subject)).toBeVisible();
        });

        test('applying the Vendor filter refetches the tickets list and re-renders the table', { tag: ['@pro', '@admin'] }, async () => {
            await support.goto();
            const result = await applyAndValidateDataViewsFilter(page, { requestFragment: adminVendorSupportData.rest.tickets, field: 'Vendor' });
            expect(result.requestFired, 'applying the Vendor filter refetched the tickets list').toBe(true);
            expect(result.noPhpFatal, 'no PHP fatal after filtering').toBe(true);
            expect(result.ok, 'the Vendor filter applied and the table re-rendered (rows or empty state)').toBe(true);
        });

        test('the row Actions menu exposes View / Close / Delete', { tag: ['@pro', '@admin'] }, async () => {
            test.skip(!seed.ticketSeeded, 'no vendor-support ticket could be seeded in this env');
            await support.goto();
            await support.openRowActionMenuFor(adminVendorSupportData.ticket.subject);
            expect(await support.actionMenuItemVisible(/^View$/i), 'View offered').toBe(true);
            expect(await support.actionMenuItemVisible(/^Close$/i), 'Close offered').toBe(true);
            expect(await support.actionMenuItemVisible(/^Delete$/i), 'Delete offered').toBe(true);
        });

        test('Close is destructive and opens the inline confirmation (alertdialog) before closing', { tag: ['@pro', '@admin'] }, async () => {
            test.skip(!seed.ticketSeeded, 'no vendor-support ticket could be seeded in this env');
            await support.goto();
            await support.openRowActionMenuFor(adminVendorSupportData.ticket.subject);
            await support.clickActionMenuItem(/^Close$/i);
            expect(await support.confirmDialogVisible(), 'Close opens the inline confirm before mutating').toBe(true);
        });

        test('Delete is destructive and opens the inline confirmation (alertdialog) before deleting', { tag: ['@pro', '@admin'] }, async () => {
            test.skip(!seed.ticketSeeded, 'no vendor-support ticket could be seeded in this env');
            await support.goto();
            await support.openRowActionMenuFor(adminVendorSupportData.ticket.subject);
            await support.clickActionMenuItem(/^Delete$/i);
            expect(await support.confirmDialogVisible(), 'Delete opens the inline confirm before mutating').toBe(true);
        });
    });

    test.describe('edge cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let support: AdminVendorSupportPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            support = new AdminVendorSupportPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('reloading on #/vendor-support preserves the route and re-mounts the list', { tag: ['@pro', '@admin'] }, async () => {
            await support.goto();
            await support.reload();
            await expect(page).toHaveURL(/#\/vendor-support/);
            await expect(support.reactRoot).toBeVisible();
            await expect(support.heading).toBeVisible();
        });

        test('searching a non-existent subject shows the empty state', { tag: ['@pro', '@admin'] }, async () => {
            await support.goto();
            await support.search('AVS zzz no such ticket zzz');
            expect(await support.isEmptyStateVisible(), 'empty state painted for a no-match search').toBe(true);
        });
    });

    test.describe('negative cases', () => {
        test('REST: an unauthenticated request to the vendor-support tickets is rejected', { tag: ['@pro', '@customer'] }, async () => {
            const apiCtx = await request.newContext();
            const response = await apiCtx.get(`${SERVER_URL}${adminVendorSupportData.rest.tickets}`);
            expect([401, 403], 'unauthenticated GET /vendor-support/tickets must be rejected').toContain(response.status());
            await apiCtx.dispose();
        });

        test('a logged-in vendor cannot access the admin Vendor Support page', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const support = new AdminVendorSupportPage(page);
            await page.goto(support.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await support.isAccessDenied(), 'a vendor must not see the admin Vendor Support UI').toBe(true);
            await ctx.close();
        });

        test('a logged-in customer cannot access the admin Vendor Support page', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: c1 });
            const page = await ctx.newPage();
            const support = new AdminVendorSupportPage(page);
            await page.goto(support.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await support.isAccessDenied(), 'a customer must not see the admin Vendor Support UI').toBe(true);
            await ctx.close();
        });
    });
});
