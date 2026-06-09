import { Page, expect, test } from '@utils/test';
import { ProductReviewsPage, ApiUtils, payloads } from './productReviewsPage';
import path from 'path';

import { toPath } from '@utils/helpers';

const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

const { PRODUCT_ID } = process.env;

test.describe.skip('Product Reviews test', () => {
    let vendor: ProductReviewsPage;
    let vPage: Page;
    let apiUtils: ApiUtils;
    let reviewMessage: string;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new ProductReviewsPage(vPage);
        apiUtils = new ApiUtils(null);
        [, , reviewMessage] = await apiUtils.createProductReview(PRODUCT_ID, payloads.createProductReview(), payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await vPage?.close();
        await apiUtils.dispose();
    });

    test('vendor can view product reviews menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorProductReviewsRenderProperly(); });
    test('vendor can view product review', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.viewProductReview(reviewMessage); });

    test('vendor can unApprove product review', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , m] = await apiUtils.createProductReview(PRODUCT_ID, payloads.createProductReview(), payloads.vendorAuth);
        await vendor.updateProductReview('unApprove', m);
    });

    test('vendor can spam product review', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , m] = await apiUtils.createProductReview(PRODUCT_ID, payloads.createProductReview(), payloads.vendorAuth);
        await vendor.updateProductReview('spam', m);
    });

    test('vendor can trash product review', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , m] = await apiUtils.createProductReview(PRODUCT_ID, payloads.createProductReview(), payloads.vendorAuth);
        await vendor.updateProductReview('trash', m);
    });

    test('vendor can approve product review', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , m] = await apiUtils.createProductReview(PRODUCT_ID, { ...payloads.createProductReview(), status: 'hold' }, payloads.vendorAuth);
        await vendor.updateProductReview('approve', m);
    });

    test('vendor can restore trashed product review', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , m] = await apiUtils.createProductReview(PRODUCT_ID, { ...payloads.createProductReview(), status: 'trash' }, payloads.vendorAuth);
        await vendor.updateProductReview('restore', m);
    });

    test('vendor can permanently-delete product review', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , m] = await apiUtils.createProductReview(PRODUCT_ID, { ...payloads.createProductReview(), status: 'trash' }, payloads.vendorAuth);
        await vendor.updateProductReview('permanently-delete', m);
    });

    test('vendor can perform bulk action on product reviews', { tag: ['@pro', '@vendor', '@serial'] }, async () => {
        await vendor.productReviewsBulkActions('hold');
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Vendor Reviews (React) Tests @pro', () => {
    test('Test Case 1 - Reviews page renders', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/reviews/`));
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('#dokan-vendor-dashboard-layout-root')).toBeVisible({ timeout: 30_000 });

        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal, 'Reviews page should not show a PHP fatal').toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Reviews DataViews table or empty state renders', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/reviews/`));
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('#dokan-vendor-dashboard-layout-root')).toBeVisible({ timeout: 30_000 });

        const tableVisible = await page.locator('table, [role="table"]').first().isVisible({ timeout: 3000 }).catch(() => false);
        const emptyVisible = await page.locator("text=/no reviews|nothing to show|empty/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(tableVisible || emptyVisible, 'Reviews list should show a table or empty state').toBe(true);

        await page.close();
        await ctx.close();
    });

    test('Test Case 3 - Reviews page has heading', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/reviews/`));
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('#dokan-vendor-dashboard-layout-root')).toBeVisible({ timeout: 30_000 });

        await expect(
            page.locator("h1, h2, h3").filter({ hasText: /reviews?/i }).first(),
            'Reviews heading should be visible',
        ).toBeVisible({ timeout: 10000 });

        await page.close();
        await ctx.close();
    });

    test('Test Case 4 - Page survives reload', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/reviews/`));
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('#dokan-vendor-dashboard-layout-root')).toBeVisible({ timeout: 30_000 });
        await page.reload({ waitUntil: 'domcontentloaded' });
        await expect(page.locator('#dokan-vendor-dashboard-layout-root')).toBeVisible({ timeout: 30_000 });
        const fatal = await page.locator("text=/Fatal error|Parse error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });
});

