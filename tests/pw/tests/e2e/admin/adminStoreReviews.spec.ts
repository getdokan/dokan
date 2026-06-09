import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { AdminStoreReviewsPage, adminStoreReviewsData } from './adminStoreReviewsPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import path from 'path';

// Store reviews are dokan_store_reviews posts that accumulate every run (the
// "ASR " prefix is exclusive to this spec's fixtures). Without cleanup there are
// many duplicate "ASR Trash Target Review" etc. rows, so trashing/deleting ONE
// leaves duplicates behind and isReviewVisible() stays true. Clear the ASR
// reviews in beforeAll so exactly one of each exists per run.
const POSTS_TABLE = `${process.env.DB_PREFIX ?? 'wp'}_posts`;

// ============================================
// ADMIN STORE REVIEWS — new React admin dashboard (Dokan Pro 5.0.0+)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/store-reviews (AdminDataViews,
// the Pro store-reviews module's ReviewList component, route path 'store-reviews').
//
// ADMIN-ONLY spec. Every precondition (a vendor store, published customer reviews,
// pre-trashed reviews for the Trash tab / restore / delete flows) is seeded via the
// REST API — this spec never drives the storefront / vendor UI.
//
// VERIFIED against modules/store-reviews/src/components/ReviewList.tsx: the module
// has NO approve/spam status. Reviews are inserted as 'publish'; moderation is
// Move to Trash -> Restore (back to publish) / Delete Permanently, across the
// All / Trash tabs. So "approve/spam/trash" maps onto trash / restore / delete.
//
// Seeding (admin-dashboard-seeding-strategy.md § Store reviews):
//   1. activateModules('store_reviews', adminAuth)  — list + create both fail otherwise.
//   2. getSellerId-first idempotent vendor store (never take createStore's updateStore path).
//   3. createStoreReview(sellerId, payload, customerAuth) -> publish dokan_store_reviews post.
//   4. For the Trash tab / restore / delete, pre-trash via updateBatchStoreReviews('trash', [id], adminAuth).
// ============================================

// SESSION STORAGE STATES
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

let apiUtils: ApiUtils;
let sellerId: string;
const reviewIds: { visible?: string; trashTarget?: string; restoreTarget?: string; deleteTarget?: string; bulk: string[] } = { bulk: [] };

// Seed a vendor store (idempotent + re-runnable) and force it approved. Look up
// the store first so we never take createStore's "already exists -> updateStore"
// path, which 400s on the non-boolean `show_email: 'yes'` field in
// payloads.createStore() (the v1 stores PUT validates show_email as boolean).
async function seedStore(v: { storeName: string; userLogin: string; email: string }): Promise<string> {
    let id = await apiUtils.getSellerId(v.storeName, payloads.adminAuth);
    if (!id) {
        const [, newId] = await apiUtils.createStore({ ...payloads.createStore(), store_name: v.storeName, user_login: v.userLogin, email: v.email }, payloads.adminAuth);
        id = newId;
    }
    if (id) {
        await apiUtils.updateStoreStatus(id, { status: 'active' }, payloads.adminAuth);
    }
    return id;
}

// Seed a published store review authored by the default customer (verified-buyer
// path matches the existing tests/api/storeReviews.spec.ts, which passes in CI).
async function seedReview(review: { title: string; content: string; rating: number }): Promise<string> {
    const [, id] = await apiUtils.createStoreReview(sellerId, { title: review.title, content: review.content, rating: review.rating }, payloads.customerAuth);
    return id;
}

// Force a review back to a known status before a mutation test acts on it, so the
// single-action tests never race each other (restore => publish, trash => Trash tab).
async function resetReviewStatus(id: string | undefined, to: 'restore' | 'trash'): Promise<void> {
    if (!id) return;
    await apiUtils.updateBatchStoreReviews(to, [id], payloads.adminAuth);
}

test.describe('Admin Store Reviews functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        // The store_reviews Pro module must be active or both the create-permission
        // and the admin list endpoint fail.
        await apiUtils.activateModules('store_reviews', payloads.adminAuth);
        sellerId = await seedStore(adminStoreReviewsData.store);
        // Drop accumulated ASR review duplicates from prior runs so each title is
        // unique — otherwise trash/delete tests leave duplicate rows and the
        // visibility assertions never flip. (Title prefix is test-exclusive.)
        await dbUtils.dbQuery(`DELETE FROM ${POSTS_TABLE} WHERE post_type = 'dokan_store_reviews' AND post_title LIKE 'ASR %'`);
        reviewIds.visible = await seedReview(adminStoreReviewsData.visible);
        reviewIds.trashTarget = await seedReview(adminStoreReviewsData.trashTarget);
        reviewIds.restoreTarget = await seedReview(adminStoreReviewsData.restoreTarget);
        reviewIds.deleteTarget = await seedReview(adminStoreReviewsData.deleteTarget);
        reviewIds.bulk = [];
        for (const b of adminStoreReviewsData.bulk) {
            reviewIds.bulk.push(await seedReview(b));
        }
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    // ----------------------------------------
    test.describe('happy paths', () => {
        let ctx: BrowserContext;
        let page: Page;
        let reviews: AdminStoreReviewsPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            reviews = new AdminStoreReviewsPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('admin can view the Store Reviews list with DataViews table and columns', { tag: ['@pro', '@admin'] }, async () => {
            await reviews.goto();
            await expect(reviews.reactRoot).toBeVisible();
            await expect(reviews.heading).toBeVisible();
            await expect(reviews.columnHeader(/Comment/)).toBeVisible();
            await expect(reviews.columnHeader(/Reviewer/)).toBeVisible();
            await expect(reviews.columnHeader(/Rating/)).toBeVisible();
            expect(await reviews.getRowCount(), 'seeded review rows render').toBeGreaterThan(0);
            expect(await reviews.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('All and Trash status tabs are present on the list', { tag: ['@pro', '@admin'] }, async () => {
            await reviews.goto();
            await expect(reviews.tab(/All/)).toBeVisible();
            await expect(reviews.tab(/Trash/)).toBeVisible();
        });

        // QUARANTINED @exploratory: the admin Store Reviews DataViews page renders
        // NO free-text search input (ReviewList.tsx adds no <SearchInput> to
        // additionalComponents and fetchReviews sends no `search` param). Only the
        // Vendors page has search. This asserts search-driven filtering (the
        // matching row present AND a non-matching row absent) the UI cannot perform.
        // Documented product gap — re-enable when admin search lands.
        test.fixme('searching by review title filters the list to the matching review', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            await reviews.goto();
            await reviews.search(adminStoreReviewsData.visible.title);
            await expect(reviews.rowByTitle(adminStoreReviewsData.visible.title)).toBeVisible();
            await expect(page.getByText(adminStoreReviewsData.deleteTarget.title, { exact: false })).toHaveCount(0);
        });

        test('admin can move a published review to Trash (it leaves the All tab)', { tag: ['@pro', '@admin'] }, async () => {
            await resetReviewStatus(reviewIds.trashTarget, 'restore');
            await reviews.goto();
            await reviews.search(adminStoreReviewsData.trashTarget.title);
            await reviews.trashReview(adminStoreReviewsData.trashTarget.title);
            // The All-tab list does not auto-refetch after a row action, so
            // re-navigate to force a fresh fetch (mirrors the restore test, which
            // re-enters the All tab before asserting). After trashing, the review
            // must be gone from the All (publish) tab.
            await reviews.goto();
            await expect.poll(async () => reviews.isReviewVisible(adminStoreReviewsData.trashTarget.title), { timeout: 15000 }).toBe(false);
        });

        test('a trashed review appears under the Trash tab', { tag: ['@pro', '@admin'] }, async () => {
            await resetReviewStatus(reviewIds.restoreTarget, 'trash');
            await reviews.goto();
            await reviews.clickTab(/Trash/);
            await reviews.search(adminStoreReviewsData.restoreTarget.title);
            await expect(reviews.rowByTitle(adminStoreReviewsData.restoreTarget.title)).toBeVisible();
        });

        test('admin can restore a trashed review (it returns to the All tab)', { tag: ['@pro', '@admin'] }, async () => {
            await resetReviewStatus(reviewIds.restoreTarget, 'trash');
            await reviews.goto();
            await reviews.clickTab(/Trash/);
            await reviews.search(adminStoreReviewsData.restoreTarget.title);
            await reviews.restoreReview(adminStoreReviewsData.restoreTarget.title);
            // Restored review must reappear under the All (publish) tab.
            await reviews.clickTab(/All/);
            await reviews.search(adminStoreReviewsData.restoreTarget.title);
            await expect.poll(async () => reviews.isReviewVisible(adminStoreReviewsData.restoreTarget.title), { timeout: 15000 }).toBe(true);
        });

        test('admin can permanently delete a trashed review', { tag: ['@pro', '@admin'] }, async () => {
            await resetReviewStatus(reviewIds.deleteTarget, 'trash');
            await reviews.goto();
            await reviews.clickTab(/Trash/);
            await reviews.search(adminStoreReviewsData.deleteTarget.title);
            await reviews.deleteReview(adminStoreReviewsData.deleteTarget.title);
            // The Trash-tab list does not auto-refetch after a row action, so
            // re-navigate and re-enter the Trash tab to force a fresh fetch. After
            // a permanent delete, the review must be gone from the Trash tab too.
            await reviews.goto();
            await reviews.clickTab(/Trash/);
            await expect.poll(async () => reviews.isReviewVisible(adminStoreReviewsData.deleteTarget.title), { timeout: 15000 }).toBe(false);
        });

        test('admin can bulk move published reviews to Trash', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            for (const id of reviewIds.bulk) {
                await resetReviewStatus(id, 'restore');
            }
            await reviews.goto();
            await reviews.selectRowsByTitle(adminStoreReviewsData.bulk.map(b => b.title));
            await reviews.bulkAction('Move to Trash', 'Move to Trash');
            // Both bulk reviews must leave the All (publish) tab.
            for (const b of adminStoreReviewsData.bulk) {
                await reviews.search(b.title);
                await expect.poll(async () => reviews.isReviewVisible(b.title), { timeout: 10000 }).toBe(false);
                await reviews.clearSearch();
            }
        });

        test('admin can bulk restore trashed reviews', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            for (const id of reviewIds.bulk) {
                await resetReviewStatus(id, 'trash');
            }
            await reviews.goto();
            await reviews.clickTab(/Trash/);
            await reviews.selectRowsByTitle(adminStoreReviewsData.bulk.map(b => b.title));
            await reviews.bulkAction('Restore', 'Restore');
            // Both bulk reviews must return to the All (publish) tab.
            await reviews.clickTab(/All/);
            for (const b of adminStoreReviewsData.bulk) {
                await reviews.search(b.title);
                await expect.poll(async () => reviews.isReviewVisible(b.title), { timeout: 10000 }).toBe(true);
                await reviews.clearSearch();
            }
        });
    });

    // ----------------------------------------
    test.describe('edge cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let reviews: AdminStoreReviewsPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            reviews = new AdminStoreReviewsPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        // QUARANTINED @exploratory: no free-text search input on the admin Store
        // Reviews page (see the "searching by review title" test above) — a
        // search-driven empty state is unreachable via the UI. Documented product gap.
        test.fixme('search with no match shows the empty state', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            await reviews.goto();
            await reviews.search(adminStoreReviewsData.searchMiss);
            const empty = (await reviews.isEmptyStateVisible()) || (await reviews.getRowCount()) === 0;
            expect(empty, 'no rows / empty-state for an unmatched search').toBe(true);
        });

        test('reloading on #/store-reviews preserves the route and re-mounts the list (route-registration regression)', { tag: ['@pro', '@admin'] }, async () => {
            await reviews.goto();
            await reviews.reload();
            await expect(page).toHaveURL(/#\/store-reviews/);
            await expect(reviews.reactRoot).toBeVisible();
            // The route pushes element: ReviewList (a component reference, not <ReviewList/>);
            // a hard reload must still mount it without a React "invalid element type" crash.
            await expect(reviews.heading).toBeVisible();
            expect(await reviews.hasNoPhpFatal(), 'no PHP fatal after reload').toBe(true);
        });
    });

    // ----------------------------------------
    test.describe('negative cases', () => {
        test('a logged-in vendor cannot access the admin Store Reviews page', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const reviews = new AdminStoreReviewsPage(page);
            await page.goto(reviews.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await reviews.isAccessDenied(), 'a vendor must not see the admin Store Reviews UI').toBe(true);
            await ctx.close();
        });

        test('a logged-in customer cannot access the admin Store Reviews page', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: c1 });
            const page = await ctx.newPage();
            const reviews = new AdminStoreReviewsPage(page);
            await page.goto(reviews.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await reviews.isAccessDenied(), 'a customer must not see the admin Store Reviews UI').toBe(true);
            await ctx.close();
        });
    });
});
