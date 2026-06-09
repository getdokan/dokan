import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { AdminVendorSinglePage, adminVendorSingleData } from './adminVendorSinglePage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { parseBoolean } from '@utils/helpers';
import path from 'path';

// ============================================
// ADMIN VENDOR SINGLE (detail) — new React admin dashboard (Dokan 5.0.0+)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/vendors/:id (VendorsSingle).
//
// ADMIN-ONLY spec. Every precondition (the configured page-subject vendor, a
// fresh empty vendor, a published product, a completed customer order) is seeded
// via the REST API (apiUtils.createStore / createProduct / createCustomer /
// createOrderWithStatus, admin auth) — this spec never drives the vendor UI.
// The seeded sellerId is captured and the detail route is built with it.
// See tests/pw/test-cases/admin-dashboard-seeding-strategy.md (§ Vendor single).
// ============================================

// SESSION STORAGE STATES
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

const isPro = parseBoolean(process.env.DOKAN_PRO);

let apiUtils: ApiUtils;
const ids: { primary?: string; empty?: string; product?: string; order?: string } = {};

test.describe('Admin Vendor single detail functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());

        // 1) The page subject — a fully-configured, approved vendor. createStore
        //    is idempotent (updates if the store already exists). The default
        //    payload sets featured/enabled/trusted, payment/social/address and
        //    categories; force fixed commission so the Commission Type renders.
        const [, primaryId] = await apiUtils.createStore({ ...payloads.createStore(), store_name: adminVendorSingleData.primary.storeName, user_login: adminVendorSingleData.primary.userLogin, email: adminVendorSingleData.primary.email, admin_commission_type: 'fixed' }, payloads.adminAuth, true);
        ids.primary = primaryId;
        if (ids.primary) {
            await apiUtils.updateStoreStatus(ids.primary, { status: 'active' }, payloads.adminAuth);
        }

        // 2) A published product owned by the vendor (Overview top-products grid).
        //    post_author attaches the product to the seller without vendor auth;
        //    payloads.createProduct() includes categories[] (avoids the silent
        //    "Category must be required" 404 — MEMORY: dokan_v1_products_category).
        // Best-effort: the product + completed order drive Overview top-products
        // and Pro sales stats only. Most detail-page tests just need the vendor to
        // exist, so a seeding hiccup here must not cascade the whole describe.
        if (ids.primary) {
            try {
                const [, productId] = await apiUtils.createProduct({ ...payloads.createProduct(), name: `AVS Top Product ${Date.now()}`, post_author: ids.primary }, payloads.adminAuth);
                ids.product = productId;

                // 3) A completed customer order against that product (drives sold
                //    count + Pro sales stats). Buyer is a real customer account.
                if (ids.product) {
                    const [, customerId] = await apiUtils.createCustomer({ ...payloads.createCustomer(), email: adminVendorSingleData.customerEmail, username: adminVendorSingleData.customerLogin }, payloads.adminAuth);
                    const [, , orderId] = await apiUtils.createOrderWithStatus(ids.product, { ...payloads.createOrder, customer_id: customerId, line_items: [{ product_id: ids.product, quantity: 1 }] }, 'wc-completed', payloads.adminAuth);
                    ids.order = orderId;
                }
            } catch (e) {
                console.warn('adminVendorSingle: optional product/order seeding skipped:', (e as Error).message);
            }
        }

        // 4) A fresh, approved vendor with NO products/orders — empty-state edges.
        const [, emptyId] = await apiUtils.createStore({ ...payloads.createStore(), store_name: adminVendorSingleData.empty.storeName, user_login: adminVendorSingleData.empty.userLogin, email: adminVendorSingleData.empty.email }, payloads.adminAuth);
        ids.empty = emptyId;
        if (ids.empty) {
            await apiUtils.updateStoreStatus(ids.empty, { status: 'active' }, payloads.adminAuth);
        }
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    // ----------------------------------------
    test.describe('happy paths', () => {
        let ctx: BrowserContext;
        let page: Page;
        let detail: AdminVendorSinglePage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            detail = new AdminVendorSinglePage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('opening #/vendors/:id renders the HeaderCard, status badge and InfoCard sidebar', { tag: ['@lite', '@admin'] }, async () => {
            await detail.goto(ids.primary!);
            await expect(detail.reactRoot).toBeVisible();
            await expect(detail.profileHeading).toBeVisible();
            await expect(detail.storeNameText(adminVendorSingleData.primary.storeName)).toBeVisible();
            await expect(detail.text(/Registered Since:/i)).toBeVisible();
            await expect(detail.text(/Contact:/i)).toBeVisible();
            await expect.poll(async () => detail.headerBadgeState(), { timeout: 10000 }).toBe('Enabled');
            expect(await detail.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('three information tabs render (Overview, General, Withdraw) with Overview active by default', { tag: ['@lite', '@admin'] }, async () => {
            await detail.goto(ids.primary!);
            expect(await detail.tabLabels()).toEqual(['Overview', 'General', 'Withdraw']);
            expect(await detail.isTabActive(/^Overview$/), 'Overview is active by default').toBe(true);
        });

        test('clicking the General tab shows the Profile & Address card with Name/Country/City/State/Address/Zip', { tag: ['@lite', '@admin'] }, async () => {
            await detail.goto(ids.primary!);
            await detail.switchTab(/^General$/);
            await expect(detail.text(/Profile & Address/i)).toBeVisible();
            for (const label of ['Name', 'Country', 'City', 'State', 'Address', 'Zip']) {
                await expect(detail.text(new RegExp(`^${label}$`))).toBeVisible();
            }
        });

        test('clicking the Withdraw tab loads dokan/v1/settings and shows Connected / Not Connected badges', { tag: ['@lite', '@admin'] }, async () => {
            await detail.goto(ids.primary!);
            await detail.openWithdrawTab();
            await expect(detail.text(/^Connected$/)).toBeVisible();
            await expect(detail.text(/Not Connected/i)).toBeVisible();
        });

        test('Overview tab lists the vendor top-selling products as ProductCards', { tag: ['@lite', '@admin'] }, async () => {
            test.skip(!ids.product, 'no seeded product/order — top-products grid unavailable');
            await detail.goto(ids.primary!);
            await expect(detail.text(/Top Selling Product/i)).toBeVisible();
            // The seeded completed order should populate the grid (Sold pill).
            await expect.poll(async () => detail.countOf('text=/^Sold$/'), { timeout: 15000 }).toBeGreaterThan(0);
        });

        test('Visit Store button opens the vendor storefront in a new tab', { tag: ['@lite', '@admin'] }, async () => {
            await detail.goto(ids.primary!);
            const [popup] = await Promise.all([page.context().waitForEvent('page', { timeout: 15000 }), detail.visitStoreButton.click()]);
            await popup.waitForLoadState('domcontentloaded').catch(() => undefined);
            expect(popup.url(), 'new tab targets a storefront URL').toMatch(/store|vendor|\/\?/i);
            await popup.close();
        });

        test('Vendors List back-link returns to the #/vendors list', { tag: ['@lite', '@admin'] }, async () => {
            await detail.goto(ids.primary!);
            await detail.backToList();
            await expect(page).toHaveURL(/#\/vendors(\?|$)/);
            await expect(detail.reactRoot).toBeVisible();
        });

        test('Pro injects the Send Email button into the vendor-single InfoCard', { tag: ['@pro', '@admin'] }, async () => {
            await detail.goto(ids.primary!);
            if (isPro) {
                await expect(detail.sendEmailButton).toBeVisible();
            } else {
                expect(await detail.isVisible('[data-testid="send-email-btn"]', 3000), 'Send Email is absent in Lite').toBe(false);
            }
        });

        test('Pro VendorSalesOverview renders the Store and Sales stat cards above top products', { tag: ['@pro', '@admin'] }, async () => {
            await detail.goto(ids.primary!);
            if (isPro) {
                await expect(detail.text(/Total Products/i)).toBeVisible();
                await expect(detail.text(/Current Balance/i)).toBeVisible();
            } else {
                expect(await detail.textVisible(/Total Products/i, 3000), 'sales-overview cards are absent in Lite').toBe(false);
            }
        });
    });

    // ----------------------------------------
    test.describe('edge cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let detail: AdminVendorSinglePage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            detail = new AdminVendorSinglePage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('deep-linking to #/vendors/:id and reloading re-mounts the detail view without losing the route', { tag: ['@lite', '@admin'] }, async () => {
            await detail.goto(ids.primary!);
            await detail.reload();
            await expect(page).toHaveURL(new RegExp(`#/vendors/${ids.primary}`));
            await expect(detail.profileHeading).toBeVisible();
            await expect(detail.storeNameText(adminVendorSingleData.primary.storeName)).toBeVisible();
        });

        test('a vendor with no sales shows the "No Top Selling Products" empty state on Overview', { tag: ['@lite', '@admin'] }, async () => {
            await detail.goto(ids.empty!);
            await expect(detail.profileHeading).toBeVisible();
            await expect(detail.text(/No Top Selling Products/i)).toBeVisible();
        });
    });

    // ----------------------------------------
    test.describe('negative cases', () => {
        test('navigating to #/vendors/:id with a non-numeric id leaves the page on the skeleton loader', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
            // index.tsx parseInt(vendorId) yields vendor=undefined for an alpha
            // id, so SkeletonLoader renders indefinitely (documented current
            // behavior — no 404 page). Assert the HeaderNavigation heading never
            // paints while the React root is mounted.
            const ctx = await browser.newContext({ storageState: a1 });
            const page = await ctx.newPage();
            const detail = new AdminVendorSinglePage(page);
            await page.goto(detail.url('not-a-real-id'));
            await page.waitForLoadState('domcontentloaded');
            expect(await detail.isStuckOnSkeleton(), 'an invalid id stays on the silent skeleton').toBe(true);
            await ctx.close();
        });

        test('a logged-in vendor cannot open the admin vendor-single route', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const detail = new AdminVendorSinglePage(page);
            await page.goto(detail.url(ids.primary ?? '1'));
            await page.waitForLoadState('domcontentloaded');
            expect(await detail.isAccessDenied(), 'a vendor must not see the admin vendor-single UI').toBe(true);
            await ctx.close();
        });

        test('a logged-in customer is denied access to the admin vendor-single route', { tag: ['@lite', '@customer'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: c1 });
            const page = await ctx.newPage();
            const detail = new AdminVendorSinglePage(page);
            await page.goto(detail.url(ids.primary ?? '1'));
            await page.waitForLoadState('domcontentloaded');
            expect(await detail.isAccessDenied(), 'a customer must not see the admin vendor-single UI').toBe(true);
            await ctx.close();
        });
    });
});
