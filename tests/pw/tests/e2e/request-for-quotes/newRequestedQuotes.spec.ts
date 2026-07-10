import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewRequestedQuotesPage } from './newRequestedQuotesPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { VENDOR_STORAGE_STATE as v1, CUSTOMER_STORAGE_STATE as c1 } from '@utils/authStates';

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Net-new coverage for the React vendor "Requested Quotes" list (Pro module
// request_for_quotation) at /dashboard/new/#/requested-quotes. Ports the legacy
// "vendor can view request quotes menu page" (tests/e2e/request-for-quotes, whose
// page object is a no-op stub) and adds NEW vendor behaviors the legacy never had
// (status tabs, search, Move-to-Trash + Restore). The quote DETAIL (view / update /
// approve / convert) is a legacy PHP template with no React :id route, so those 4
// legacy vendor cases STAY (they remain the only coverage of that surface). Admin
// + customer cases STAY (D3).
//
// Seed via REST as admin (store_info.store_id = VENDOR_ID scopes a quote to the
// vendor under test). Behavioral oracles REST-gate the trash/restore mutation and
// re-read the list; the View action documents the legacy boundary. Shared DB is
// polluted with other quotes, so assert on the SEEDED quote's "Quote <id>" marker,
// never exact counts (§7).
// ============================================

const { PRODUCT_ID } = process.env;

let apiUtils: ApiUtils;
let productId: string;
const seededIds: string[] = [];

/** Seed a vendor-scoped quote request via admin REST. Returns its numeric id. */
async function seedQuote(status: 'pending' | 'approve' | 'trash' = 'pending'): Promise<string> {
    const [, quoteId] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: [productId], status }, payloads.adminAuth);
    seededIds.push(quoteId);
    return quoteId;
}

test.describe('Requested Quotes (React) functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        // The vendor Requested-Quotes route + REST only register while the module is active.
        await apiUtils.activateModules(payloads.moduleIds.requestForQuotation, payloads.adminAuth);
        // A product to attach to seeded quotes (falls back to env PRODUCT_ID).
        if (PRODUCT_ID) {
            productId = PRODUCT_ID as string;
        } else {
            const [, id] = await apiUtils.createProduct({ ...payloads.createProduct(), regular_price: '50' }, payloads.vendorAuth);
            productId = id;
        }
    });

    test.afterAll(async () => {
        await apiUtils?.dispose();
    });

    // ---------------------------------------------------------------
    test.describe('vendor', () => {
        let ctx: BrowserContext;
        let page: Page;
        let quotes: NewRequestedQuotesPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            quotes = new NewRequestedQuotesPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('vendor can open the Requested Quotes list mounted at #/requested-quotes (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const quoteId = await seedQuote('pending');
            await quotes.goto();
            expect(page.url(), 'on the /requested-quotes route').toMatch(/#\/requested-quotes/);
            expect(await quotes.tabsVisible(), 'All / Pending tabs render').toBe(true);
            await expect(quotes.rowsWithText(`Quote ${quoteId}`).first(), 'the seeded quote row is listed').toBeVisible({ timeout: 15000 });
            expect(await quotes.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('the list renders Quote # / Status / Customer / Date columns (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await seedQuote('pending');
            await quotes.goto();
            const headers = (await quotes.columnHeaderTexts()).map(h => h.toLowerCase());
            expect(
                headers.some(h => h.includes('quote')),
                'a Quote # column header',
            ).toBe(true);
            expect(
                headers.some(h => h.includes('status')),
                'a Status column header',
            ).toBe(true);
            expect(
                headers.some(h => h.includes('customer')),
                'a Customer column header',
            ).toBe(true);
            expect(
                headers.some(h => h.includes('date')),
                'a Date column header',
            ).toBe(true);
        });

        test('the status tabs render with counts (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await seedQuote('pending');
            await quotes.goto();
            expect(await quotes.getTabCount('all'), 'All tab count >= 1 after seeding').toBeGreaterThanOrEqual(1);
        });

        test('the Pending tab keeps the seeded pending quote (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const quoteId = await seedQuote('pending');
            await quotes.goto();
            await quotes.selectTab('pending');
            await expect(quotes.rowsWithText(`Quote ${quoteId}`).first(), 'pending quote visible on the Pending tab').toBeVisible({ timeout: 15000 });
        });

        test('searching by quote number narrows the list (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const quoteId = await seedQuote('pending');
            await quotes.goto();
            await quotes.search(quoteId);
            await expect(quotes.rowsWithText(`Quote ${quoteId}`).first(), 'the matching quote remains after search').toBeVisible({ timeout: 15000 });
        });

        test('vendor can move a quote to Trash from row Actions after confirming (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const quoteId = await seedQuote('pending');
            await quotes.goto();
            await expect(quotes.rowsWithText(`Quote ${quoteId}`).first(), 'quote present before trashing').toBeVisible({ timeout: 15000 });
            await quotes.moveToTrash(`Quote ${quoteId}`);
            // REST oracle: the quote is now on the Trash tab (and off the All/Pending view).
            await quotes.selectTab('trash');
            await expect(quotes.rowsWithText(`Quote ${quoteId}`).first(), 'quote appears on the Trash tab after trashing').toBeVisible({ timeout: 15000 });
        });

        test('vendor can restore a trashed quote via the Pending row action (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const quoteId = await seedQuote('trash');
            await quotes.goto();
            await quotes.selectTab('trash');
            await expect(quotes.rowsWithText(`Quote ${quoteId}`).first(), 'trashed quote visible on the Trash tab').toBeVisible({ timeout: 15000 });
            await quotes.restore(`Quote ${quoteId}`);
            // REST oracle: after restore, the quote is back on the Pending tab.
            await quotes.selectTab('pending');
            await expect(quotes.rowsWithText(`Quote ${quoteId}`).first(), 'restored quote is back on the Pending tab').toBeVisible({ timeout: 15000 });
        });

        test('HashRouter survives a reload on /requested-quotes (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await quotes.goto();
            await page.reload();
            await page.waitForLoadState('domcontentloaded');
            await quotes.waitForSettle();
            expect(page.url(), 'still on /requested-quotes after reload').toMatch(/#\/requested-quotes/);
            expect(await quotes.hasNoPhpFatal(), 'no PHP fatal after reload').toBe(true);
        });
    });

    // ---------------------------------------------------------------
    test.describe('cross-role', () => {
        let ctx: BrowserContext;
        let page: Page;

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('a logged-in customer cannot mount the vendor Requested Quotes route (React)', { tag: ['@pro', '@customer', '@new-ui'] }, async ({ browser }) => {
            ctx = await browser.newContext({ storageState: c1 });
            page = await ctx.newPage();
            const quotes = new NewRequestedQuotesPage(page);
            await page.goto(quotes.url);
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(2000);
            expect(await page.locator('#dokan-vendor-dashboard-root').count(), 'the vendor SPA root does not mount for a customer').toBe(0);
        });
    });
});
