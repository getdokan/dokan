import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { AdminRequestForQuotePage, adminRequestForQuoteData } from './adminRequestForQuotePage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import path from 'path';

// ============================================
// ADMIN REQUEST FOR QUOTE — new React admin dashboard (Dokan Pro 5.0.0+)
// Surfaces (AdminDataViews, registered via the 'dokan-admin-dashboard-routes'
// filter by the request-for-quotation module):
//   wp-admin/admin.php?page=dokan-dashboard#/request-for-quote              (customer quote requests)
//   wp-admin/admin.php?page=dokan-dashboard#/request-for-quote/quote-rules (admin quote rules)
//
// ADMIN-ONLY spec. Every precondition (customer quote requests, quote rules,
// trashed rows, bulk targets) is seeded via the REST API with adminAuth — the
// RFQ create endpoints are manage_options-gated, so even "customer" quote
// requests are seeded with adminAuth, not customerAuth. This spec never drives
// the vendor/customer UI. See the seeding-strategy doc (§ Request for quote).
// ============================================

// SESSION STORAGE STATES
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

const { CUSTOMER_ID } = process.env;

let apiUtils: ApiUtils;
let vendorId: string;
let productId: string;

// Seed the owning vendor store (idempotent + re-runnable). Look up the store
// first so we never take createStore's "already exists -> updateStore" path,
// which 400s on the non-boolean `show_email: 'yes'` field in
// payloads.createStore() (the v1 stores PUT validates show_email as boolean).
async function seedVendor(): Promise<string> {
    const v = adminRequestForQuoteData.vendor;
    let id = await apiUtils.getSellerId(v.storeName, payloads.adminAuth);
    if (!id) {
        const [, sellerId] = await apiUtils.createStore({ ...payloads.createStore(), store_name: v.storeName, user_login: v.userLogin, email: v.email }, payloads.adminAuth);
        id = sellerId;
    }
    if (id) {
        await apiUtils.updateStoreStatus(id, { status: 'active' }, payloads.adminAuth);
    }
    return id;
}

// Seed one customer quote request for the ARFQ vendor's product.
async function seedQuote(title: string, status = 'pending'): Promise<string> {
    const [, quoteId] = await apiUtils.createQuoteRequest(
        {
            ...payloads.createQuoteRequest(),
            quote_title: title,
            product_ids: [productId],
            user_id: CUSTOMER_ID,
            store_info: { store_id: vendorId },
            status,
        },
        payloads.adminAuth,
    );
    return quoteId;
}

// Seed one admin quote rule for the ARFQ vendor's product.
async function seedRule(name: string, status = 'publish'): Promise<string> {
    const [, ruleId] = await apiUtils.createQuoteRule({ ...payloads.createQuoteRule(), rule_name: name, product_ids: [productId], status }, payloads.adminAuth);
    return ruleId;
}

test.describe('Admin Request for Quote functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        vendorId = await seedVendor();
        [, productId] = await apiUtils.createProduct({ ...payloads.createProduct(), post_author: vendorId }, payloads.adminAuth);
        // Read-only fixtures (asserted but never mutated by a UI test).
        await seedQuote(adminRequestForQuoteData.quote.pendingTitle, 'pending');
        await seedRule(adminRequestForQuoteData.rule.publishedName, 'publish');
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    // ----------------------------------------
    test.describe('happy paths', () => {
        let ctx: BrowserContext;
        let page: Page;
        let rfq: AdminRequestForQuotePage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            rfq = new AdminRequestForQuotePage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('admin can view the Quote Requests list with DataViews table and columns', { tag: ['@pro', '@admin'] }, async () => {
            await rfq.goto();
            await expect(rfq.reactRoot).toBeVisible();
            await expect(rfq.quotesHeading).toBeVisible();
            await expect(rfq.columnHeader('Customer')).toBeVisible();
            await expect(rfq.columnHeader('Status')).toBeVisible();
            await expect(rfq.columnHeader('Vendor')).toBeVisible();
            expect(await rfq.getRowCount(), 'seeded quote-request rows render').toBeGreaterThan(0);
            expect(await rfq.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('the seeded pending quote request appears under the Pending tab', { tag: ['@pro', '@admin'] }, async () => {
            await rfq.goto();
            await rfq.clickTab(/Pending/);
            await expect(rfq.rowByText(adminRequestForQuoteData.quote.pendingTitle)).toBeVisible();
            expect(await rfq.statusOfRow(adminRequestForQuoteData.quote.pendingTitle)).toMatch(/Pending/);
        });

        test('New Quote button navigates to the add-new-quote form', { tag: ['@pro', '@admin'] }, async () => {
            await rfq.goto();
            await rfq.clickNewQuote();
            await expect(page).toHaveURL(/#\/request-for-quote\/add-new-quote/);
        });

        test('Quote Rules List nav card switches to the rules DataView', { tag: ['@pro', '@admin'] }, async () => {
            await rfq.goto();
            await rfq.clickQuoteRulesNavCard();
            await expect(page).toHaveURL(/#\/request-for-quote\/quote-rules/);
            await expect(rfq.rulesHeading).toBeVisible();
            await expect(rfq.columnHeader('Price Visibility')).toBeVisible();
            await expect(rfq.columnHeader('Priority')).toBeVisible();
        });

        test('admin can view the Quote Rules list and the seeded rule renders', { tag: ['@pro', '@admin'] }, async () => {
            await rfq.gotoRules();
            await expect(rfq.rulesHeading).toBeVisible();
            await expect(rfq.rowByText(adminRequestForQuoteData.rule.publishedName)).toBeVisible();
            expect(await rfq.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        // QUARANTINED @exploratory: the Quote Rules tab renders NO search input.
        // QuoteRulesList.tsx DEFINES a SimpleInput (placeholder 'Search rules…') in
        // its filterFields, but never passes it as the `filter` prop to
        // AdminDataViewTable, so it is never mounted. This asserts search-driven
        // filtering the UI cannot perform. Documented product gap (search defined
        // but not wired) — re-enable when the rules filter is rendered.
        test('searching the Quote Rules list filters to the matching rule', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            const name = `ARFQ Search Rule ${Date.now()}`;
            await seedRule(name, 'publish');
            await rfq.gotoRules();
            await rfq.searchRules(name);
            await expect(rfq.rowByText(name)).toBeVisible();
            expect(await rfq.hasRow(adminRequestForQuoteData.rule.publishedName), 'unmatched rule is filtered out').toBe(false);
        });

        test('admin can trash a quote request (it leaves the Pending tab)', { tag: ['@pro', '@admin'] }, async () => {
            const title = `ARFQ Trash Quote ${Date.now()}`;
            await seedQuote(title, 'pending');
            await rfq.goto();
            await rfq.clickTab(/Pending/);
            await expect(rfq.rowByText(title)).toBeVisible();
            await rfq.trashRow(title);
            await expect.poll(async () => rfq.hasRow(title), { timeout: 15000 }).toBe(false);
        });

        test('admin can permanently delete a trashed quote request', { tag: ['@pro', '@admin'] }, async () => {
            const title = `ARFQ Delete Quote ${Date.now()}`;
            await seedQuote(title, 'trash');
            await rfq.goto();
            await rfq.clickTab(/Trash/);
            await expect(rfq.rowByText(title)).toBeVisible();
            await rfq.deleteRowPermanently(title);
            await expect.poll(async () => rfq.hasRow(title), { timeout: 15000 }).toBe(false);
        });

        test('admin can bulk-trash pending quote requests', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            const titles = adminRequestForQuoteData.quote.bulk.map(t => `${t} ${Date.now()}`);
            for (const t of titles) {
                await seedQuote(t, 'pending');
            }
            await rfq.goto();
            await rfq.clickTab(/Pending/);
            await rfq.selectRowsByText(titles);
            await rfq.bulkAction('Trash', 'Confirm');
            for (const t of titles) {
                await expect.poll(async () => rfq.hasRow(t), { timeout: 15000 }).toBe(false);
            }
        });
    });

    // ----------------------------------------
    test.describe('edge cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let rfq: AdminRequestForQuotePage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            rfq = new AdminRequestForQuotePage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        // QUARANTINED @exploratory: the Quote Rules search input is defined in
        // filterFields but never wired to AdminDataViewTable (see the rules-search
        // test above), so a search-driven empty state is unreachable. Documented gap.
        test('Quote Rules search with no match shows the empty state', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            await rfq.gotoRules();
            await rfq.searchRules(adminRequestForQuoteData.searchMiss);
            const empty = (await rfq.isEmptyStateVisible()) || (await rfq.getRowCount()) === 0;
            expect(empty, 'no rows / empty-state for an unmatched rule search').toBe(true);
        });

        test('reloading on #/request-for-quote preserves the route and re-mounts the list', { tag: ['@pro', '@admin'] }, async () => {
            await rfq.goto();
            await rfq.reload();
            await expect(page).toHaveURL(/#\/request-for-quote/);
            await expect(rfq.reactRoot).toBeVisible();
            await expect(rfq.quotesHeading).toBeVisible();
        });

        test('deep-linking to an edit-quote route with a non-existent id degrades gracefully (no fatal)', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            await page.goto(rfq.url.replace('#/request-for-quote', '#/request-for-quote/edit-quote/99999999'));
            await page.waitForLoadState('domcontentloaded');
            await expect(rfq.reactRoot).toBeVisible();
            expect(await rfq.hasNoPhpFatal(), 'a garbage edit-quote id must not white-screen the SPA').toBe(true);
        });
    });

    // ----------------------------------------
    test.describe('negative cases', () => {
        test('a logged-in vendor cannot access the admin Request for Quote page', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const rfq = new AdminRequestForQuotePage(page);
            await page.goto(rfq.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await rfq.isAccessDenied(), 'a vendor must not see the admin RFQ UI').toBe(true);
            await ctx.close();
        });

        test('a logged-in customer cannot access the admin Request for Quote page', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: c1 });
            const page = await ctx.newPage();
            const rfq = new AdminRequestForQuotePage(page);
            await page.goto(rfq.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await rfq.isAccessDenied(), 'a customer must not see the admin RFQ UI').toBe(true);
            await ctx.close();
        });
    });
});
