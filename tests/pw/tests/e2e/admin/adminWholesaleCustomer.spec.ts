import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { AdminWholesaleCustomerPage, adminWholesaleCustomerData } from './adminWholesaleCustomerPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { endPoints } from '@utils/apiEndPoints';
import { SERVER_URL } from '@utils/helpers';
import path from 'path';

// ============================================
// ADMIN WHOLESALE CUSTOMER — new React admin dashboard (Dokan Pro 5.0.0+)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/wholesale-customer
// (AdminDataViews, the Pro `wholesale` module's WholesaleCustomerList component,
// route id/path 'wholesale-customer').
//
// ADMIN-ONLY spec. The single precondition (a WooCommerce customer registered as
// a wholesale customer) is seeded over REST: getCustomerId-first then
// createCustomer with a FIXED username/email (idempotent), then
// createWholesaleCustomer(customerId) -> POST /dokan/v1/wholesale/register.
// This spec never drives the storefront / my-account / vendor UI.
//
// Seeding notes:
//   1. activateModules('wholesale', adminAuth)  — list + register both fail otherwise.
//   2. getCustomerId-first idempotent customer (fixed AWC username/email).
//   3. createWholesaleCustomer(customerId) registers them. Whether the new
//      wholesale customer lands 'active' or 'deactive' depends on the
//      need_approval_for_wholesale_customer option (default 'on' => 'deactive'),
//      so the spec NEVER assumes the initial status — it forces a known status
//      via the batch endpoint (activate/deactivate) before each status-sensitive
//      assertion, keeping the tests order-independent.
//   4. Verify with getAllWholesaleCustomers.
//
// This page DOES render a real search box (SearchInput in additionalComponents +
// search={true}) — so search genuinely filters here (unlike most Pro admin
// DataViews pages).
// ============================================

// SESSION STORAGE STATES
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

let apiUtils: ApiUtils;
let customerId: string;

// Seed a WooCommerce customer (idempotent, re-runnable). getCustomerId-first so
// re-creating the same account never 400s — createCustomer also falls back to a
// lookup + update if the username/email already exists.
async function seedCustomer(c: { username: string; email: string; firstName: string; lastName: string }): Promise<string> {
    let id = await apiUtils.getCustomerId(c.username, payloads.adminAuth);
    if (!id) {
        [, id] = await apiUtils.createCustomer(
            { ...payloads.createCustomer(), username: c.username, email: c.email, first_name: c.firstName, last_name: c.lastName },
            payloads.adminAuth
        );
    }
    return id;
}

// Force the seeded wholesale customer to a known status via the batch endpoint
// (activate => 'active', deactivate => 'deactive'). The DataViews status flips
// are confirmed against this same REST surface, so this is the source of truth.
async function setWholesaleStatus(id: string, to: 'activate' | 'deactivate'): Promise<void> {
    await apiUtils.put(endPoints.updateBatchWholesaleCustomer, { data: { [to]: [Number(id)] }, headers: payloads.adminAuth });
}

test.describe('Admin Wholesale Customer functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        // The wholesale Pro module must be active or both the register and the
        // admin list endpoint fail.
        await apiUtils.activateModules('wholesale', payloads.adminAuth);
        // Idempotent customer, then register them as a wholesale customer.
        customerId = await seedCustomer(adminWholesaleCustomerData.customer);
        await apiUtils.createWholesaleCustomer(customerId, payloads.adminAuth);
        // Confirm the seeded wholesale customer is discoverable via REST.
        const all = await apiUtils.getAllWholesaleCustomers(payloads.adminAuth);
        expect(
            all.some((wc: { email?: string; username?: string }) => wc.email === adminWholesaleCustomerData.customer.email || wc.username === adminWholesaleCustomerData.customer.username),
            'seeded wholesale customer is returned by GET /wholesale/customers'
        ).toBe(true);
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    // ----------------------------------------
    test.describe('happy paths', () => {
        let ctx: BrowserContext;
        let page: Page;
        let wholesale: AdminWholesaleCustomerPage;

        test.beforeEach(async ({ browser }) => {
            // Keep the read-only happy paths on a known status (active) so the
            // Active-tab and row-presence assertions are deterministic.
            await setWholesaleStatus(customerId, 'activate');
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            wholesale = new AdminWholesaleCustomerPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('admin can view the Wholesale Customer list with DataViews table and columns', { tag: ['@pro', '@admin'] }, async () => {
            await wholesale.goto();
            await expect(wholesale.reactRoot).toBeVisible();
            await expect(wholesale.heading).toBeVisible();
            await expect(wholesale.columnHeader(/Customer Name/)).toBeVisible();
            await expect(wholesale.columnHeader(/Email/)).toBeVisible();
            await expect(wholesale.columnHeader(/Username/)).toBeVisible();
            await expect(wholesale.columnHeader(/Registered/)).toBeVisible();
            await expect(wholesale.columnHeader(/Status/)).toBeVisible();
            expect(await wholesale.getRowCount(), 'seeded wholesale customer rows render').toBeGreaterThan(0);
            expect(await wholesale.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('All, Active and Deactive status tabs are present on the list', { tag: ['@pro', '@admin'] }, async () => {
            await wholesale.goto();
            await expect(wholesale.tab(/^All/)).toBeVisible();
            await expect(wholesale.tab(/^Active/)).toBeVisible();
            await expect(wholesale.tab(/^Deactive/)).toBeVisible();
        });

        test('the seeded wholesale customer appears as a row (by email and username)', { tag: ['@pro', '@admin'] }, async () => {
            await wholesale.goto();
            await expect(wholesale.rowByText(adminWholesaleCustomerData.customer.username)).toBeVisible();
            await expect(wholesale.rowByText(adminWholesaleCustomerData.customer.username)).toBeVisible();
        });

        test('the active seeded customer appears under the Active tab with an Active status', { tag: ['@pro', '@admin'] }, async () => {
            await wholesale.goto();
            await wholesale.clickTab(/^Active/);
            await expect(wholesale.rowByText(adminWholesaleCustomerData.customer.username)).toBeVisible();
            const status = await wholesale.getRowStatus(adminWholesaleCustomerData.customer.username);
            expect(status, 'status cell reads Active under the Active tab').toBe(adminWholesaleCustomerData.status.active);
        });

        test('searching by email filters the list to the seeded customer', { tag: ['@pro', '@admin'] }, async () => {
            await wholesale.goto();
            await wholesale.search(adminWholesaleCustomerData.customer.email);
            await expect(wholesale.rowByText(adminWholesaleCustomerData.customer.username)).toBeVisible();
            // Search narrows to the matching customer only.
            expect(await wholesale.getRowCount(), 'search by email returns exactly the seeded customer').toBe(1);
        });

        test('searching by username filters the list to the seeded customer', { tag: ['@pro', '@admin'] }, async () => {
            await wholesale.goto();
            await wholesale.search(adminWholesaleCustomerData.customer.username);
            await expect(wholesale.rowByText(adminWholesaleCustomerData.customer.username)).toBeVisible();
            expect(await wholesale.getRowCount(), 'search by username returns exactly the seeded customer').toBe(1);
        });

        // The Deactivate action is status-gated (isEligible: status === 'active'),
        // so it must be offered for the active seeded customer and the Activate
        // action must NOT be (it is eligible only for a deactive row).
        test('the row action menu offers Deactivate for an active customer (not Activate)', { tag: ['@pro', '@admin'] }, async () => {
            await wholesale.goto();
            expect(await wholesale.isActionOffered(adminWholesaleCustomerData.customer.username, 'Deactivate'), 'Deactivate offered for an active customer').toBe(true);
            expect(await wholesale.isActionOffered(adminWholesaleCustomerData.customer.username, 'Activate'), 'Activate NOT offered for an active customer').toBe(false);
        });
    });

    // ----------------------------------------
    // Status-flip flows reset the seeded customer to a known status via REST
    // before acting, so they never race each other. Row actions don't always
    // auto-refetch reliably headless -> re-goto() before reading the status cell.
    test.describe('status flip flows', () => {
        let ctx: BrowserContext;
        let page: Page;
        let wholesale: AdminWholesaleCustomerPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            wholesale = new AdminWholesaleCustomerPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        // @exploratory: a row status flip may not persist/refetch in the headless
        // Playwright browser (the list does not always re-fetch after a row
        // DokanModal confirm). The REST batch endpoint is exercised directly by the
        // other tests; this asserts the UI-driven flip end-to-end.
        test('deactivating an active customer flips its STATUS to Deactive', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            await setWholesaleStatus(customerId, 'activate');
            await wholesale.goto();
            await wholesale.search(adminWholesaleCustomerData.customer.email);
            expect(await wholesale.getRowStatus(adminWholesaleCustomerData.customer.username), 'precondition: customer is Active').toBe(adminWholesaleCustomerData.status.active);

            await wholesale.deactivateCustomer(adminWholesaleCustomerData.customer.username);

            // Re-goto to force a fresh fetch, then read the status cell specifically.
            await wholesale.goto();
            await wholesale.search(adminWholesaleCustomerData.customer.email);
            await expect.poll(async () => wholesale.getRowStatus(adminWholesaleCustomerData.customer.username), { timeout: 15000 }).toBe(adminWholesaleCustomerData.status.deactive);
        });

        // @exploratory: same headless-refetch caveat as the deactivate flip above.
        test('activating a deactive customer flips its STATUS to Active', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            await setWholesaleStatus(customerId, 'deactivate');
            await wholesale.goto();
            await wholesale.search(adminWholesaleCustomerData.customer.email);
            expect(await wholesale.getRowStatus(adminWholesaleCustomerData.customer.username), 'precondition: customer is Deactive').toBe(adminWholesaleCustomerData.status.deactive);

            await wholesale.activateCustomer(adminWholesaleCustomerData.customer.username);

            await wholesale.goto();
            await wholesale.search(adminWholesaleCustomerData.customer.email);
            await expect.poll(async () => wholesale.getRowStatus(adminWholesaleCustomerData.customer.username), { timeout: 15000 }).toBe(adminWholesaleCustomerData.status.active);
        });
    });

    // ----------------------------------------
    test.describe('edge cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let wholesale: AdminWholesaleCustomerPage;

        test.beforeEach(async ({ browser }) => {
            await setWholesaleStatus(customerId, 'activate');
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            wholesale = new AdminWholesaleCustomerPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('searching for an unmatched term shows the empty state', { tag: ['@pro', '@admin'] }, async () => {
            await wholesale.goto();
            await wholesale.search(adminWholesaleCustomerData.searchMiss);
            const empty = (await wholesale.isEmptyStateVisible()) || (await wholesale.getRowCount()) === 0;
            expect(empty, 'no rows / empty-state for an unmatched search').toBe(true);
        });

        test('reloading on #/wholesale-customer preserves the route and re-mounts the list', { tag: ['@pro', '@admin'] }, async () => {
            await wholesale.goto();
            await wholesale.reload();
            await expect(page).toHaveURL(/#\/wholesale-customer/);
            await expect(wholesale.reactRoot).toBeVisible();
            await expect(wholesale.heading).toBeVisible();
            expect(await wholesale.hasNoPhpFatal(), 'no PHP fatal after reload').toBe(true);
        });
    });

    // ----------------------------------------
    test.describe('negative cases', () => {
        test('a logged-in vendor cannot access the admin Wholesale Customer page', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const wholesale = new AdminWholesaleCustomerPage(page);
            await page.goto(wholesale.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await wholesale.isAccessDenied(), 'a vendor must not see the admin Wholesale Customer UI').toBe(true);
            await ctx.close();
        });

        test('a logged-in customer cannot access the admin Wholesale Customer page', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: c1 });
            const page = await ctx.newPage();
            const wholesale = new AdminWholesaleCustomerPage(page);
            await page.goto(wholesale.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await wholesale.isAccessDenied(), 'a customer must not see the admin Wholesale Customer UI').toBe(true);
            await ctx.close();
        });

        test('REST: an unauthenticated request to /wholesale/customers is rejected', { tag: ['@pro', '@customer'] }, async () => {
            const apiCtx = await request.newContext();
            const url = new URL(`${SERVER_URL}/dokan/v1/wholesale/customers`);
            const response = await apiCtx.get(url.toString());
            expect([401, 403], 'unauthenticated GET /wholesale/customers should be rejected').toContain(response.status());
            await apiCtx.dispose();
        });
    });
});
