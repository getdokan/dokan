import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { AdminSubscriptionsPage, adminSubscriptionsData } from './adminSubscriptionsPage';
import { applyAndValidateDataViewsFilter } from './adminDataViews';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { payloads } from '@utils/payloads';
import { SERVER_URL } from '@utils/helpers';
import path from 'path';

// Admin-only Subscriptions spec. The page is gated behind the "Enable Vendor
// Subscription" setting (enabled in beforeAll, restored in afterAll). Subscription
// seeding is best-effort — row-dependent tests skip when none was seeded.

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

let apiUtils: ApiUtils;
let prevEnablePricing = 'off';
const seed: { vendorStore?: string; subscriptionSeeded?: boolean } = {};

test.describe('Admin Subscriptions functionality @pro', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());

        const [prev] = await dbUtils.updateOptionValue(adminSubscriptionsData.optionName, { enable_pricing: 'on' });
        prevEnablePricing = prev?.enable_pricing && prev.enable_pricing !== 'on' ? String(prev.enable_pricing) : 'off';

        try {
            await dbUtils.setSubscriptionProductType();
            const [, packId] = await apiUtils.createProduct(payloads.createDokanSubscriptionProduct(), payloads.adminAuth);
            await dbUtils.updateProductType(packId);
            await apiUtils.saveCommissionToSubscriptionProduct(packId, payloads.saveVendorSubscriptionProductCommission, payloads.adminAuth);
            const [, storeName] = await apiUtils.assignSubscriptionToVendor(packId);
            seed.vendorStore = storeName;
            seed.subscriptionSeeded = Boolean(storeName);
        } catch (e) {
            seed.subscriptionSeeded = false;
            console.warn('adminSubscriptions: optional subscription seeding skipped:', (e as Error).message);
        }
    });

    test.afterAll(async () => {
        await dbUtils.updateOptionValue(adminSubscriptionsData.optionName, { enable_pricing: prevEnablePricing });
        await apiUtils.dispose();
    });

    test.describe('happy paths', () => {
        let ctx: BrowserContext;
        let page: Page;
        let subs: AdminSubscriptionsPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            subs = new AdminSubscriptionsPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('admin can open the Subscriptions page mounted at #/subscriptions (no 404)', { tag: ['@pro', '@admin'] }, async () => {
            await subs.goto();
            await expect(subs.reactRoot).toBeVisible();
            expect(await subs.isNotFoundVisible(), 'the route must register (not a 404) when vendor subscription is enabled').toBe(false);
            await expect(subs.heading).toBeVisible();
            await expect(page).toHaveURL(/#\/subscriptions/);
            expect(await subs.hasNoPhpFatal(), 'no PHP fatal on /subscriptions').toBe(true);
        });

        test('the single "All" tab renders and is selected by default', { tag: ['@pro', '@admin'] }, async () => {
            await subs.goto();
            await expect(subs.allTab).toBeVisible();
            expect(await subs.isAllTabSelected(), 'All tab selected on first load').toBe(true);
        });

        test('the Filter exposes the Vendor and Subscription Pack fields', { tag: ['@pro', '@admin'] }, async () => {
            await subs.goto();
            const fields = await subs.openFilterFieldNames();
            for (const expected of adminSubscriptionsData.filterFields) {
                expect(fields.some(f => f.toLowerCase().includes(expected.toLowerCase())), `filter offers "${expected}"`).toBe(true);
            }
        });

        test('applying the Vendor filter refetches the subscription list and re-renders the table', { tag: ['@pro', '@admin'] }, async () => {
            await subs.goto();
            const result = await applyAndValidateDataViewsFilter(page, { requestFragment: adminSubscriptionsData.rest.subscription, field: 'Vendor' });
            expect(result.requestFired, 'applying the Vendor filter refetched /dokan/v1/subscription').toBe(true);
            expect(result.noPhpFatal, 'no PHP fatal after filtering').toBe(true);
            expect(result.ok, 'the Vendor filter applied and the table re-rendered (rows or empty state)').toBe(true);
        });

        test('the subscription columns render when a subscription exists', { tag: ['@pro', '@admin'] }, async () => {
            test.skip(!seed.subscriptionSeeded, 'no vendor subscription could be seeded in this env');
            await subs.goto();
            for (const col of adminSubscriptionsData.columns) {
                await expect(subs.columnHeader(new RegExp(escapeRe(col), 'i'))).toBeVisible();
            }
            expect(await subs.getRowCount(), 'seeded subscription row renders').toBeGreaterThan(0);
        });

        test('the seeded vendor subscription shows in the list with an Active status', { tag: ['@pro', '@admin'] }, async () => {
            test.skip(!seed.subscriptionSeeded, 'no vendor subscription could be seeded in this env');
            await subs.goto();
            await expect(subs.rowByVendor(seed.vendorStore!)).toBeVisible();
            expect(await subs.statusOfRow(seed.vendorStore!)).toBe('Active');
        });

        test('the row Actions menu exposes View Order and Cancel for an active subscription', { tag: ['@pro', '@admin'] }, async () => {
            test.skip(!seed.subscriptionSeeded, 'no vendor subscription could be seeded in this env');
            await subs.goto();
            await subs.openRowActionMenuFor(seed.vendorStore!);
            expect(await subs.actionMenuItemVisible(/View Order/i), 'View Order offered').toBe(true);
            expect(await subs.actionMenuItemVisible(/^Cancel$/i), 'Cancel offered for an active subscription').toBe(true);
        });

        test('Cancel opens the cancel-subscription modal with its period options (no inline confirm)', { tag: ['@pro', '@admin'] }, async () => {
            test.skip(!seed.subscriptionSeeded, 'no vendor subscription could be seeded in this env');
            await subs.goto();
            await subs.openRowActionMenuFor(seed.vendorStore!);
            await subs.clickActionMenuItem(/^Cancel$/i);
            expect(await subs.cancelModalVisible(), 'the Cancel Subscription modal opens before mutating').toBe(true);
            await subs.dismissCancelModal();
            await subs.goto();
            expect(await subs.statusOfRow(seed.vendorStore!)).toBe('Active');
        });
    });
    test.describe('edge cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let subs: AdminSubscriptionsPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            subs = new AdminSubscriptionsPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('reloading on #/subscriptions preserves the route and re-mounts the list', { tag: ['@pro', '@admin'] }, async () => {
            await subs.goto();
            await subs.reload();
            await expect(page).toHaveURL(/#\/subscriptions/);
            await expect(subs.reactRoot).toBeVisible();
            await expect(subs.heading).toBeVisible();
            expect(await subs.isNotFoundVisible(), 'route still registered after reload').toBe(false);
        });
    });
    test.describe('negative cases', () => {
        test('REST: an unauthenticated request to the admin subscription list is rejected', { tag: ['@pro', '@customer'] }, async () => {
            const apiCtx = await request.newContext();
            const response = await apiCtx.get(`${SERVER_URL}${adminSubscriptionsData.rest.subscription}`);
            expect([401, 403], 'unauthenticated GET /dokan/v1/subscription must be rejected').toContain(response.status());
            await apiCtx.dispose();
        });

        test('a logged-in vendor cannot access the admin Subscriptions page', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const subs = new AdminSubscriptionsPage(page);
            await page.goto(subs.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await subs.isAccessDenied(), 'a vendor must not see the admin Subscriptions UI').toBe(true);
            await ctx.close();
        });

        test('a logged-in customer cannot access the admin Subscriptions page', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: c1 });
            const page = await ctx.newPage();
            const subs = new AdminSubscriptionsPage(page);
            await page.goto(subs.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await subs.isAccessDenied(), 'a customer must not see the admin Subscriptions UI').toBe(true);
            await ctx.close();
        });
    });
});

function escapeRe(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
