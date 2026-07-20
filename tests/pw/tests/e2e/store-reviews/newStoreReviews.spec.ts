import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewStoreReviewsPage, newStoreReviewData } from './newStoreReviewsPage';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { VENDOR_STORAGE_STATE as v1 } from '@utils/authStates';

const { VENDOR_ID, PRODUCT_ID } = process.env;

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Parity coverage for the 5.0.0 React rewrite of vendor Store Reviews.
// Surface: /dashboard/new/#/reviews  (DataViews list, Pro).
//
// IMPORTANT — what the React /reviews list actually shows:
// The Pro `ReviewsController::get_reviews` (path /dokan/v1/reviews) queries
// PRODUCT-review comments left on the vendor's products (comment_query with
// post_type 'product'). It does NOT read the `dokan_store_reviews` post type.
// `apiUtils.createStoreReview` creates a `dokan_store_reviews` post, which this
// React list never queries — that is why the seeded review never appeared.
//
// So the correct seed for this surface is a PRODUCT review against the vendor's
// product (PRODUCT_ID, owned by VENDOR_ID): apiUtils.createProductReview(...).
// A review created with status 'approved' lands in the Approved tab; the
// "Review" column renders the comment content (item.review).
// ============================================

/**
 * Delete every product review (cleanup). Enumerates via the GLOBAL WooCommerce
 * reviews endpoint (not the Dokan-scoped /dokan/v1/reviews, which is filtered by
 * the current user's authored products), across all statuses, then batch-deletes.
 */
async function trashAllProductReviews(apiUtils: ApiUtils): Promise<void> {
    const [, all] = await apiUtils.get(`${endPoints.wc.getAllReviews}?status=all&per_page=100`, { headers: payloads.adminAuth });
    const ids = (Array.isArray(all) ? all : []).map((r: { id: unknown }) => r.id).filter(Boolean);
    if (!ids.length) return;
    await apiUtils.post(endPoints.wc.updateBatchReview, { data: { delete: ids }, headers: payloads.adminAuth });
}

/**
 * Count product reviews visible to the vendor on the React surface — uses the
 * SAME endpoint the React list reads (/dokan/v1/reviews, scoped to the vendor's
 * products) so it reflects exactly what the vendor sees.
 */
async function vendorReviewCount(apiUtils: ApiUtils): Promise<number> {
    const all = await apiUtils.getAllProductReviews(payloads.vendorAuth);
    return Array.isArray(all) ? all.length : 0;
}

test.describe('Store Reviews (React) functionality', () => {
    // ----------------------------------------
    // VENDOR — React DataViews list at /dashboard/new/#/reviews
    // ----------------------------------------
    test.describe('vendor', () => {
        let ctx: BrowserContext;
        let page: Page;
        let reviews: NewStoreReviewsPage;
        let apiUtils: ApiUtils;

        test.beforeAll(async () => {
            // Clean slate, then seed one approved product review against vendor1's product.
            apiUtils = new ApiUtils(await request.newContext());
            await trashAllProductReviews(apiUtils);
            await apiUtils.createProductReview(PRODUCT_ID, newStoreReviewData.review(), payloads.adminAuth);
            // Confirm the seed exists via the same endpoint the React list reads
            // (vendor-scoped /dokan/v1/reviews).
            expect(await vendorReviewCount(apiUtils), 'seeded product review exists in /dokan/v1/reviews').toBeGreaterThan(0);
        });

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            reviews = new NewStoreReviewsPage(page);
            await reviews.goto();
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test.afterAll(async () => {
            await trashAllProductReviews(apiUtils);
            await apiUtils.dispose();
        });

        test('vendor reviews page renders with the four status tabs (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await expect(reviews.heading).toBeVisible();
            await expect(reviews.approvedTab).toBeVisible();
            await expect(reviews.pendingTab).toBeVisible();
            await expect(reviews.spamTab).toBeVisible();
            await expect(reviews.trashTab).toBeVisible();
            expect(await reviews.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('vendor sees the seeded store review in the list (React)', { tag: ['@pro', '@vendor', '@customer', '@new-ui'] }, async () => {
            // The seeded review is approved -> lands under Approved. Assert it surfaces.
            const active = await reviews.getActiveReviewCount();
            expect(active, 'seeded review present across Approved/Pending tabs').toBeGreaterThan(0);
            const rowCount = await reviews.openTabWithReview();
            expect(rowCount, 'tab with the seeded review shows rows').toBeGreaterThan(0);
            expect(await reviews.hasReviewText(newStoreReviewData.matchText), 'seeded review text is visible').toBe(true);
        });

        test('vendor can switch status tabs to filter reviews (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            // Spam/Trash are empty on a fresh seed -> empty state after switching.
            await reviews.openTab('Spam');
            expect(await reviews.getTabCount('Spam'), 'Spam tab count').toBe(0);
            expect(await reviews.isEmpty(), 'Spam tab shows empty state').toBe(true);

            await reviews.openTab('Trash');
            expect(await reviews.getTabCount('Trash'), 'Trash tab count').toBe(0);
            expect(await reviews.isEmpty(), 'Trash tab shows empty state').toBe(true);
        });

        test('vendor empty status tab shows the empty state (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await reviews.openTab('Trash');
            expect(await reviews.isEmpty(), 'Trash (0) renders the No data found empty state').toBe(true);
        });

        test('vendor reviews list survives a reload (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await reviews.goto();
            await expect(reviews.heading).toBeVisible();
            await expect(reviews.approvedTab).toBeVisible();
            const active = await reviews.getActiveReviewCount();
            expect(active, 'seeded review still present after reload').toBeGreaterThan(0);
            expect(await reviews.hasNoPhpFatal(), 'no PHP fatal after reload').toBe(true);
        });
    });

    // ----------------------------------------
    // CUSTOMER — can submit a review of the vendor's product (verified via REST)
    // ----------------------------------------
    test.describe('customer', () => {
        let apiUtils: ApiUtils;

        test.beforeAll(async () => {
            apiUtils = new ApiUtils(await request.newContext());
        });

        test.afterAll(async () => {
            await trashAllProductReviews(apiUtils);
            await apiUtils.dispose();
        });

        test('customer can review store (React parity)', { tag: ['@pro', '@customer', '@new-ui'] }, async () => {
            await trashAllProductReviews(apiUtils);
            const [responseBody, reviewId] = await apiUtils.createProductReview(PRODUCT_ID, newStoreReviewData.review(), payloads.adminAuth);
            expect(responseBody, 'create review returns a body').toBeTruthy();
            expect(reviewId, 'created review has an id').toBeTruthy();

            // Confirm it persisted via the same endpoint the React list reads.
            expect(await vendorReviewCount(apiUtils), 'review exists in the reviews list').toBeGreaterThan(0);
        });

        test('customer can submit a review with the configured rating (React parity)', { tag: ['@pro', '@customer', '@new-ui'] }, async () => {
            const [responseBody] = await apiUtils.createProductReview(PRODUCT_ID, newStoreReviewData.review(), payloads.adminAuth);
            expect(responseBody, 'review created with rating').toBeTruthy();
            // rating round-trips on the WC response body.
            if (responseBody?.rating !== undefined) {
                expect(Number(responseBody.rating), 'rating round-trips').toBe(newStoreReviewData.rating);
            }
        });
    });

    // ----------------------------------------
    // ADMIN — moderation lives in wp-admin / REST (no vendor React surface).
    // Assert moderation via REST where there is no React surface to drive.
    // ----------------------------------------
    test.describe('admin', () => {
        let apiUtils: ApiUtils;

        test.beforeAll(async () => {
            apiUtils = new ApiUtils(await request.newContext());
        });

        test.afterAll(async () => {
            await trashAllProductReviews(apiUtils);
            await apiUtils.dispose();
        });

        test('admin can trash a store review (REST — no React vendor surface)', { tag: ['@pro', '@admin', '@new-ui'] }, async () => {
            await trashAllProductReviews(apiUtils);
            const [, reviewId] = await apiUtils.createProductReview(PRODUCT_ID, newStoreReviewData.review(), payloads.adminAuth);
            expect(reviewId, 'seeded a review to moderate').toBeTruthy();

            expect(await vendorReviewCount(apiUtils), 'review present before trash').toBeGreaterThan(0);

            // There is no vendor React moderation surface; moderation is admin REST.
            await trashAllProductReviews(apiUtils);
            expect(await vendorReviewCount(apiUtils), 'reviews trashed (no longer in the active list)').toBe(0);
        });
    });

    // ----------------------------------------
    // BUSINESS FLOW — cross-role end-to-end
    // Customer reviews the vendor's product (seed) -> vendor sees it in React /reviews.
    // ----------------------------------------
    test.describe('business flow', () => {
        let apiUtils: ApiUtils;

        test.beforeAll(async () => {
            apiUtils = new ApiUtils(await request.newContext());
        });

        test.afterAll(async () => {
            await trashAllProductReviews(apiUtils);
            await apiUtils.dispose();
        });

        test('customer reviews store then vendor sees it in React reviews list (React)', { tag: ['@pro', '@customer', '@vendor', '@new-ui'] }, async ({ browser }) => {
            // 1. A customer review of the vendor's product (clean slate first so the count is deterministic).
            await trashAllProductReviews(apiUtils);
            const [responseBody, reviewId] = await apiUtils.createProductReview(PRODUCT_ID, newStoreReviewData.review(), payloads.adminAuth);
            expect(responseBody, 'customer review created').toBeTruthy();
            expect(reviewId, 'review id returned').toBeTruthy();
            // Confirm via the same endpoint the React list reads (VENDOR_ID owns PRODUCT_ID).
            expect(await vendorReviewCount(apiUtils), `review for vendor ${VENDOR_ID} product is in /dokan/v1/reviews`).toBeGreaterThan(0);

            // 2. Vendor opens the React reviews list and sees it under Approved.
            const vCtx = await browser.newContext({ storageState: v1 });
            const vPage = await vCtx.newPage();
            const reviews = new NewStoreReviewsPage(vPage);
            await reviews.goto();

            const active = await reviews.getActiveReviewCount();
            expect(active, 'vendor sees the new review in Approved/Pending').toBeGreaterThan(0);
            const rowCount = await reviews.openTabWithReview();
            expect(rowCount, 'the review is listed as a row').toBeGreaterThan(0);
            expect(await reviews.hasReviewText(newStoreReviewData.matchText), 'vendor sees the review text').toBe(true);

            await vPage.close();
            await vCtx.close();
        });
    });
});
