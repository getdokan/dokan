import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { AdminSellerBadgesPage, adminSellerBadgesData } from './adminSellerBadgesPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import path from 'path';

// ============================================
// ADMIN SELLER BADGES — Dokan Pro seller-badge module admin list.
// Surface: wp-admin/admin.php?page=dokan#/dokan-seller-badge (legacy Vue admin
// SPA mounted on #dokan-vue-admin via the dokan-admin-routes filter).
//
// ADMIN-ONLY spec. Every badge precondition (a published badge, a draft badge,
// a publish/draft target) is seeded via the REST API (apiUtils.createSellerBadge
// + updateBatchSellerBadges, admin auth) — this spec never drives the vendor UI.
// See tests/pw/test-cases/admin-dashboard-seeding-strategy.md (§ Announcements
// & Seller badges).
//
// NOTE ON ROUTE: the task brief named page=dokan-dashboard#/dokan-seller-badge,
// but the module registers its route ONLY into the legacy Vue admin router
// (page=dokan). The React HashRouter at page=dokan-dashboard would fall through
// to AdminNotFound. The working host is therefore page=dokan (see page object).
// ============================================

// SESSION STORAGE STATES
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

let apiUtils: ApiUtils;
const ids: { published?: string; publishTarget?: string; draftTarget?: string } = {};

// Seed a seller badge (idempotent + re-runnable) and force its status.
// createSellerBadge is idempotent on 'invalid-event-type' (one badge per
// event_type) — its wrapper falls back to getSellerBadgeId, so re-running the
// suite reuses the existing definition. We then force the status deterministically
// via updateBatchSellerBadges('publish'|'draft', [id]) so each test owns a known
// starting state and tests never race each other.
async function seedBadge(b: { eventType: string; badgeName: string }, createPayload: any, status: 'publish' | 'draft'): Promise<string> {
    const [, badgeId] = await apiUtils.createSellerBadge({ ...createPayload, badge_name: b.badgeName }, payloads.adminAuth);
    if (badgeId) {
        await apiUtils.updateBatchSellerBadges(status, [badgeId], payloads.adminAuth);
    }
    return badgeId;
}

test.describe('Admin Seller Badges functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        // The seller-badge module must be active before its REST routes exist.
        await apiUtils.activateModules(payloads.moduleIds.sellerBadge, payloads.adminAuth);
        ids.published = await seedBadge(adminSellerBadgesData.published, payloads.createSellerBadgeFeatureProducts, 'publish');
        ids.publishTarget = await seedBadge(adminSellerBadgesData.publishTarget, payloads.createSellerBadgeExclusiveToPlatform, 'draft');
        ids.draftTarget = await seedBadge(adminSellerBadgesData.draftTarget, payloads.createSellerBadgeProductsPublished, 'publish');
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    // ----------------------------------------
    test.describe('happy paths', () => {
        let ctx: BrowserContext;
        let page: Page;
        let badges: AdminSellerBadgesPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            badges = new AdminSellerBadgesPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('admin can view the Seller Badge list with table and columns', { tag: ['@pro', '@admin'] }, async () => {
            await badges.goto();
            await expect(badges.reactRoot).toBeVisible();
            await expect(badges.heading).toBeVisible();
            await expect(badges.columnHeader('Badges Name')).toBeVisible();
            await expect(badges.columnHeader('Badge Event')).toBeVisible();
            await expect(badges.columnHeader('No. of Vendors')).toBeVisible();
            await expect(badges.columnHeader('Status')).toBeVisible();
            expect(await badges.getRowCount(), 'seeded badge rows render').toBeGreaterThan(0);
            expect(await badges.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('+ Create Badge link navigates to the create form', { tag: ['@pro', '@admin'] }, async () => {
            await badges.goto();
            await badges.clickCreateBadge();
            await expect(page).toHaveURL(/#\/dokan-seller-badge\/new/);
        });

        test('searching by badge name filters the list to the matching badge', { tag: ['@pro', '@admin'] }, async () => {
            await badges.goto();
            await badges.search(adminSellerBadgesData.published.badgeName);
            await expect(badges.rowByBadgeName(adminSellerBadgesData.published.badgeName)).toBeVisible();
            await expect(page.getByText(adminSellerBadgesData.draftTarget.badgeName, { exact: false })).toHaveCount(0);
        });

        test('Published tab shows a published badge with the Published status', { tag: ['@pro', '@admin'] }, async () => {
            await apiUtils.updateBatchSellerBadges('publish', [ids.published!], payloads.adminAuth);
            await badges.goto();
            await badges.clickTab(/Published/);
            await badges.search(adminSellerBadgesData.published.badgeName);
            await expect(badges.rowByBadgeName(adminSellerBadgesData.published.badgeName)).toBeVisible();
            expect(await badges.statusOfRow(adminSellerBadgesData.published.badgeName)).toBe('Published');
        });

        test('Draft tab shows a draft badge with the Draft status', { tag: ['@pro', '@admin'] }, async () => {
            await apiUtils.updateBatchSellerBadges('draft', [ids.publishTarget!], payloads.adminAuth);
            await badges.goto();
            await badges.clickTab(/Draft/);
            await badges.search(adminSellerBadgesData.publishTarget.badgeName);
            await expect(badges.rowByBadgeName(adminSellerBadgesData.publishTarget.badgeName)).toBeVisible();
            expect(await badges.statusOfRow(adminSellerBadgesData.publishTarget.badgeName)).toBe('Draft');
        });

        test('admin can publish a draft badge (status flips to Published)', { tag: ['@pro', '@admin'] }, async () => {
            await apiUtils.updateBatchSellerBadges('draft', [ids.publishTarget!], payloads.adminAuth);
            await badges.goto();
            await badges.clickTab(/Draft/);
            await badges.search(adminSellerBadgesData.publishTarget.badgeName);
            await badges.publishBadge(adminSellerBadgesData.publishTarget.badgeName);
            // Confirm via API (the list view re-filters; the source of truth is REST).
            await expect.poll(async () => await apiUtils.getSellerBadgeId(adminSellerBadgesData.publishTarget.eventType, payloads.adminAuth), { timeout: 15000 }).toBeTruthy();
            await badges.goto();
            await badges.clickTab(/Published/);
            await badges.search(adminSellerBadgesData.publishTarget.badgeName);
            await expect.poll(async () => badges.statusOfRow(adminSellerBadgesData.publishTarget.badgeName), { timeout: 15000 }).toBe('Published');
        });

        test('admin can move a published badge to draft (status flips to Draft)', { tag: ['@pro', '@admin'] }, async () => {
            await apiUtils.updateBatchSellerBadges('publish', [ids.draftTarget!], payloads.adminAuth);
            await badges.goto();
            await badges.clickTab(/Published/);
            await badges.search(adminSellerBadgesData.draftTarget.badgeName);
            await badges.setBadgeAsDraft(adminSellerBadgesData.draftTarget.badgeName);
            await badges.goto();
            await badges.clickTab(/Draft/);
            await badges.search(adminSellerBadgesData.draftTarget.badgeName);
            await expect.poll(async () => badges.statusOfRow(adminSellerBadgesData.draftTarget.badgeName), { timeout: 15000 }).toBe('Draft');
        });

        test('Edit row action navigates to the badge edit form', { tag: ['@pro', '@admin'] }, async () => {
            await badges.goto();
            await badges.search(adminSellerBadgesData.published.badgeName);
            await badges.editBadge(adminSellerBadgesData.published.badgeName);
            await expect(page).toHaveURL(/#\/dokan-seller-badge\/edit\/\d+/);
        });

        test.fixme('admin can bulk-publish draft badges from the Draft tab', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            // Own two draft badges for the bulk publish.
            await apiUtils.updateBatchSellerBadges('draft', [ids.publishTarget!, ids.draftTarget!], payloads.adminAuth);
            await badges.goto();
            await badges.clickTab(/Draft/);
            await badges.selectRowsByBadgeName([adminSellerBadgesData.publishTarget.badgeName, adminSellerBadgesData.draftTarget.badgeName]);
            await badges.bulkAction('publish', 'Yes, Publish');
            // Verify in the UI: both badges now Published.
            await badges.goto();
            await badges.clickTab(/Published/);
            for (const name of [adminSellerBadgesData.publishTarget.badgeName, adminSellerBadgesData.draftTarget.badgeName]) {
                await badges.search(name);
                await expect.poll(async () => badges.statusOfRow(name), { timeout: 12000 }).toBe('Published');
                await badges.clearSearch();
            }
        });
    });

    // ----------------------------------------
    test.describe('edge cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let badges: AdminSellerBadgesPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            badges = new AdminSellerBadgesPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('search with no match shows the empty state', { tag: ['@pro', '@admin'] }, async () => {
            await badges.goto();
            await badges.search(adminSellerBadgesData.searchMiss);
            const empty = (await badges.isEmptyStateVisible()) || (await badges.getRowCount()) === 0;
            expect(empty, 'no rows / empty-state for an unmatched search').toBe(true);
        });

        test('reloading on #/dokan-seller-badge preserves the route and re-mounts the list', { tag: ['@pro', '@admin'] }, async () => {
            await badges.goto();
            await badges.reload();
            await expect(page).toHaveURL(/#\/dokan-seller-badge/);
            await expect(badges.reactRoot).toBeVisible();
            await expect(badges.heading).toBeVisible();
        });

        test('sorting the Badges Name column requests orderby from the API', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            await badges.goto();
            const url = await badges.sortByBadgeNameAndCaptureQuery();
            expect(decodeURIComponent(url)).toMatch(/orderby=/);
        });
    });

    // ----------------------------------------
    test.describe('negative cases', () => {
        test('a logged-in vendor cannot access the admin Seller Badge page', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const badges = new AdminSellerBadgesPage(page);
            await page.goto(badges.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await badges.isAccessDenied(), 'a vendor must not see the admin Seller Badge UI').toBe(true);
            await ctx.close();
        });

        test('a logged-in customer cannot access the admin Seller Badge page', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: c1 });
            const page = await ctx.newPage();
            const badges = new AdminSellerBadgesPage(page);
            await page.goto(badges.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await badges.isAccessDenied(), 'a customer must not see the admin Seller Badge UI').toBe(true);
            await ctx.close();
        });
    });
});
