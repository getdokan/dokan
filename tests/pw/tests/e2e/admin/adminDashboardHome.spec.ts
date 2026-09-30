import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { AdminDashboardHomePage, adminDashboardHomeData, adminDashboardHomeEndpoints, adminNoticeFixtures } from './adminDashboardHomePage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import path from 'path';

// ============================================
// ADMIN DASHBOARD HOME — new React admin dashboard (Dokan 5.0.0+)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/ (AdminDashboard mount).
//
// ADMIN-ONLY spec. The few live happy-path counts (a real vendor store, a
// completed customer order, a product review) are seeded via the REST API
// (apiUtils.createStore + createCustomer + createOrderWithStatus +
// createProductReview, admin auth) — this spec never drives the vendor/customer
// UI. Read-only dashboard surfaces the checklist marks as MOCK-only (admin
// notices slider/counter/confirm-modal, section error / empty / skeleton
// states) are stubbed via page.route, mirroring adminPage.ts mockPromoNotices.
// See tests/pw/test-cases/admin-dashboard-seeding-strategy.md (§ Dashboard home).
// ============================================

// SESSION STORAGE STATES
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

let apiUtils: ApiUtils;
const seeded: { sellerId?: string; customerId?: string; productId?: string; orderId?: string } = {};

test.describe('Admin Dashboard home functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());

        // 1) Approved active vendor store (idempotent — createStore updates on conflict).
        const [, sellerId] = await apiUtils.createStore({ ...payloads.createStore(), store_name: adminDashboardHomeData.vendor.storeName, user_login: adminDashboardHomeData.vendor.userLogin, email: adminDashboardHomeData.vendor.email }, payloads.adminAuth);
        seeded.sellerId = sellerId;
        if (sellerId) {
            await apiUtils.updateStoreStatus(sellerId, { status: 'active' }, payloads.adminAuth);
        }

        // Steps 2-5 seed OPTIONAL "live data" (product, customer, completed order,
        // review) for the few happy-path tests that assert against real numbers.
        // They are best-effort: most tests render the shell / mock endpoints and
        // don't need this, so a seeding hiccup must NOT cascade the whole describe.
        try {
            // 2) A published product owned by that vendor (payload carries categories[] — required, see MEMORY).
            const [, productId] = await apiUtils.createProduct({ ...payloads.createProduct(), post_author: sellerId }, payloads.adminAuth);
            seeded.productId = productId;

            // 3) A customer (idempotent — createCustomer updates on conflict).
            const [, customerId] = await apiUtils.createCustomer({ ...payloads.createCustomer(), username: adminDashboardHomeData.customer.username, email: adminDashboardHomeData.customer.email, password: adminDashboardHomeData.customer.password }, payloads.adminAuth);
            seeded.customerId = customerId;

            // 4) A completed order for that product+customer -> drives all-time-stats,
            //    sales-chart, top-performing-vendors, monthly-overview live numbers.
            const orderPayload = { ...payloads.createOrder, customer_id: Number(customerId), line_items: [{ product_id: productId, quantity: 1 }] };
            const [, , orderId] = await apiUtils.createOrderWithStatus(productId, orderPayload, 'wc-completed', payloads.adminAuth);
            seeded.orderId = orderId;

            // 5) A product review with review_count>0 -> drives most-reviewed-products.
            await apiUtils.createProductReview(productId, { ...payloads.createProductReview(), status: 'approved' }, payloads.adminAuth);
        } catch (e) {
            console.warn('adminDashboardHome: optional live-data seeding skipped:', (e as Error).message);
        }
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    // ----------------------------------------
    test.describe('happy paths', () => {
        let ctx: BrowserContext;
        let page: Page;
        let dashboard: AdminDashboardHomePage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            dashboard = new AdminDashboardHomePage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('admin can open the Dashboard home and the React root mounts with no PHP fatal', { tag: ['@lite', '@admin'] }, async () => {
            await dashboard.goto();
            await expect(dashboard.reactRoot).toBeVisible();
            await expect(dashboard.pageTitle).toHaveText(/Dashboard/);
            await expect(page).toHaveURL(/page=dokan-dashboard/);
            expect(await dashboard.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('Dashboard home renders the core section headings in the documented order', { tag: ['@lite', '@admin'] }, async () => {
            await dashboard.goto();
            // Each documented heading is present.
            for (const name of adminDashboardHomeData.sectionHeadingsInOrder) {
                await expect(dashboard.sectionHeading(name), `section "${name}" renders`).toBeVisible();
            }
            // ...and they appear top-to-bottom in the documented order.
            const tops: number[] = [];
            for (const name of adminDashboardHomeData.sectionHeadingsInOrder) {
                tops.push(await dashboard.headingTop(name));
            }
            const sorted = [...tops].sort((p, q) => p - q);
            expect(tops, 'headings paint in the documented order').toEqual(sorted);
        });

        test('All-Time Marketplace Stats formats total sales/commissions as currency from live order data', { tag: ['@lite', '@admin'] }, async () => {
            await dashboard.goto();
            await expect(dashboard.sectionHeading('All-Time Marketplace Stats')).toBeVisible();
            // formatPrice renders the WC currency symbol on total_sales / total_commissions.
            // A completed order was seeded, so the grid must contain a currency-formatted amount.
            await expect.poll(async () => dashboard.allTimeStatsText(), { timeout: 15000 }).toMatch(/[$€£¥₹]\s?\d|\d[.,]\d{2}/);
        });

        test('admin notices slider shows the "X of Y" counter and prev/next nav when more than one notice exists', { tag: ['@lite', '@admin'] }, async () => {
            await dashboard.mockAdminNotices(adminNoticeFixtures.two);
            await dashboard.goto();
            await expect(dashboard.noticesWrap.first()).toBeVisible();
            await expect(dashboard.noticeNext).toBeVisible();
            await expect(dashboard.noticePrev).toBeVisible();
            expect(await dashboard.counterText(), 'counter shows current of total').toMatch(/1\s*of\s*2/);
        });

        test('clicking next in the admin notices slider advances to the second notice', { tag: ['@lite', '@admin'] }, async () => {
            await dashboard.mockAdminNotices(adminNoticeFixtures.two);
            await dashboard.goto();
            await expect(dashboard.noticesWrap.first()).toBeVisible();
            await dashboard.clickNextNotice();
            await expect.poll(async () => dashboard.counterText(), { timeout: 8000 }).toMatch(/2\s*of\s*2/);
            await expect(dashboard.noticeTitleByText('ADH Notice Two')).toBeVisible();
        });

        test('a notice action with a confirm_message opens the confirmation modal before executing', { tag: ['@lite', '@admin'] }, async () => {
            await dashboard.mockAdminNotices(adminNoticeFixtures.confirm);
            await dashboard.goto();
            await expect(dashboard.noticesWrap.first()).toBeVisible();
            await dashboard.clickNoticeAction('Run Update');
            expect(await dashboard.isConfirmModalVisible(), 'DokanModal confirmation opens on a confirm-message action').toBe(true);
        });
    });

    // ----------------------------------------
    test.describe('edge cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let dashboard: AdminDashboardHomePage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            dashboard = new AdminDashboardHomePage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('admin notices bar renders nothing when the notices endpoint returns empty', { tag: ['@lite', '@admin'] }, async () => {
            await dashboard.mockAdminNotices(adminNoticeFixtures.empty);
            await dashboard.goto();
            await expect(dashboard.sectionHeading('To-Do')).toBeVisible(); // page still renders.
            expect(await dashboard.noticesCount(), 'no notice bar for an empty notices response').toBe(0);
        });

        test('a single notice renders without the counter or prev/next nav', { tag: ['@lite', '@admin'] }, async () => {
            await dashboard.mockAdminNotices(adminNoticeFixtures.one);
            await dashboard.goto();
            await expect(dashboard.noticesWrap.first()).toBeVisible();
            await expect(dashboard.noticeNext).toHaveCount(0);
            await expect(dashboard.noticeCounter).toHaveCount(0);
        });

        test('a delayed section endpoint shows the skeleton loader before data resolves', { tag: ['@lite', '@admin'] }, async () => {
            await dashboard.mockSectionDelay(adminDashboardHomeEndpoints.todo, 5000);
            await page.goto(dashboard.url);
            await page.waitForLoadState('domcontentloaded');
            await expect(dashboard.reactRoot).toBeVisible();
            // The section HEADINGS paint immediately; only the data skeletons. While the
            // delayed /todo request is in flight, a pulse skeleton loader is visible.
            await expect(dashboard.sectionHeading('Analytics')).toBeVisible({ timeout: 15000 });
            await expect(page.locator('[class*="animate-pulse"]').first(), 'a skeleton loader is shown while the delayed section loads').toBeVisible({ timeout: 4000 });
        });

        test('reloading on the home hash route re-mounts the dashboard and stays on page=dokan-dashboard', { tag: ['@lite', '@admin'] }, async () => {
            await dashboard.goto();
            await dashboard.reload();
            await expect(page).toHaveURL(/page=dokan-dashboard/);
            await expect(dashboard.reactRoot).toBeVisible();
            await expect(dashboard.sectionHeading('To-Do')).toBeVisible();
        });
    });

    // ----------------------------------------
    test.describe('negative cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let dashboard: AdminDashboardHomePage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            dashboard = new AdminDashboardHomePage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('a failing section endpoint renders that section error box without crashing the rest of the page', { tag: ['@lite', '@admin'] }, async () => {
            await dashboard.mockSectionError(adminDashboardHomeEndpoints.todo, 'Error fetching to-do data');
            await dashboard.goto();
            // The page still mounts and other sections render.
            await expect(dashboard.reactRoot).toBeVisible();
            await expect(dashboard.sectionHeading('Analytics')).toBeVisible();
            expect(await dashboard.isSectionErrorVisible(), 'a section red error box renders on a 500').toBe(true);
            expect(await dashboard.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('a logged-in vendor cannot access the admin Dashboard home', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
            const vendorCtx = await browser.newContext({ storageState: v1 });
            const vendorPage = await vendorCtx.newPage();
            const vendorDashboard = new AdminDashboardHomePage(vendorPage);
            await vendorPage.goto(vendorDashboard.url);
            await vendorPage.waitForLoadState('domcontentloaded');
            expect(await vendorDashboard.isAccessDenied(), 'a vendor must not see the admin Dashboard home').toBe(true);
            await vendorCtx.close();
        });

        test('a logged-in customer cannot access the admin Dashboard home', { tag: ['@lite', '@customer'] }, async ({ browser }) => {
            const customerCtx = await browser.newContext({ storageState: c1 });
            const customerPage = await customerCtx.newPage();
            const customerDashboard = new AdminDashboardHomePage(customerPage);
            await customerPage.goto(customerDashboard.url);
            await customerPage.waitForLoadState('domcontentloaded');
            expect(await customerDashboard.isAccessDenied(), 'a customer must not see the admin Dashboard home').toBe(true);
            await customerCtx.close();
        });
    });

    // ----------------------------------------
    // Pro-gated sections — Vendor Metrics (is_pro_exists) and Most Reported
    // Vendors (show_most_reported_vendors). Tagged @pro: these run in the Pro
    // suite where dokan-pro is active and the option is on.
    test.describe('pro gating', () => {
        let ctx: BrowserContext;
        let page: Page;
        let dashboard: AdminDashboardHomePage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            dashboard = new AdminDashboardHomePage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('Vendor Metrics section is shown when Dokan Pro is active', { tag: ['@pro', '@admin'] }, async () => {
            await dashboard.goto();
            await expect(dashboard.sectionHeading('Vendor Metrics'), 'Vendor Metrics renders with Pro active (is_pro_exists)').toBeVisible();
        });
    });
});
