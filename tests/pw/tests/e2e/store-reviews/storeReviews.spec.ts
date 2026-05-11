import { Page, expect, test } from '@utils/test';
import { StoreReviewsPage, ApiUtils, data, payloads } from './storeReviewsPage';
import path from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:9999';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');
const { VENDOR_ID } = process.env;

test.describe('Store Reviews test', () => {
    let admin: StoreReviewsPage;
    let vendor: StoreReviewsPage;
    let customer: StoreReviewsPage;
    let aPage: Page, vPage: Page, cPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new StoreReviewsPage(aPage);
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new StoreReviewsPage(vPage);
        const customerContext = await browser.newContext({ storageState: c1 });
        cPage = await customerContext.newPage();
        customer = new StoreReviewsPage(cPage);
        apiUtils = new ApiUtils(null);
        await apiUtils.updateBatchStoreReviews('trash', [], payloads.adminAuth);
        await apiUtils.createStoreReview(VENDOR_ID, payloads.createStoreReview, payloads.customerAuth);
        const [, reviewId] = await apiUtils.createStoreReview(VENDOR_ID, { ...payloads.createStoreReview, title: 'trashed test review' }, payloads.customerAuth);
        await apiUtils.deleteStoreReview(reviewId, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.storeReviews, payloads.adminAuth);
        await aPage?.close();
        await vPage?.close();
        await cPage?.close();
        await apiUtils.dispose();
    });

    test('admin can enable store reviews module', { tag: ['@pro', '@exploratory', '@admin'] }, async () => { await admin.enableStoreReviewsModule(data.predefined.vendorStores.vendor1); });
    test('admin can view store reviews menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => { await admin.adminStoreReviewsRenderProperly(); });
    test('admin can view store review', { tag: ['@pro', '@exploratory', '@admin'] }, async () => { await admin.viewStoreReview(); });
    test('admin can edit store review', { tag: ['@pro', '@admin'] }, async () => { await admin.editStoreReview(data.storeReview.review()); });
    test('admin can filter store reviews by vendor', { tag: ['@pro', '@admin'] }, async () => { await admin.filterStoreReviews(data.storeReview.filter.byVendor); });
    test('admin can delete store review', { tag: ['@pro', '@admin'] }, async () => { await admin.updateStoreReview('trash'); });
    test('admin can restore deleted store review', { tag: ['@pro', '@admin'] }, async () => { await admin.updateStoreReview('permanently-delete'); });
    test('admin can permanently delete store review', { tag: ['@pro', '@admin'] }, async () => { await admin.updateStoreReview('restore'); });

    test('admin can perform bulk action on store reviews', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.createStoreReview(VENDOR_ID, payloads.createStoreReview, payloads.customerAuth);
        await admin.storeReviewsBulkAction('trash');
    });

    test('customer can review store', { tag: ['@pro', '@customer'] }, async () => {
        await apiUtils.updateBatchStoreReviews('trash', [], payloads.adminAuth);
        await customer.reviewStore(data.predefined.vendorStores.vendor1, data.storeReview.review(), 'create');
    });

    test('customer can edit store review', { tag: ['@pro', '@customer'] }, async () => { await customer.reviewStore(data.predefined.vendorStores.vendor1, data.storeReview.review(), 'edit'); });

    test('customer can view own review', { tag: ['@pro', '@customer'] }, async () => {
        await apiUtils.updateBatchStoreReviews('trash', [], payloads.adminAuth);
        await apiUtils.createStoreReview(VENDOR_ID, payloads.createStoreReview, payloads.customerAuth);
        await customer.viewOwnReview(data.predefined.vendorStores.vendor1);
    });

    test("vendor can't review own store", { tag: ['@pro', '@vendor'] }, async () => { await vendor.cantReviewOwnStore(data.predefined.vendorStores.vendor1); });

    test('admin can disable store reviews module', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.storeReviews, payloads.adminAuth);
        await admin.disableStoreReviewsModule(data.predefined.vendorStores.vendor1);
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Store Reviews (React) Tests @pro', () => {
    test('Test Case 1 - Vendor store reviews page renders', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/dashboard/store-reviews/`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Admin store reviews page renders', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/wp-admin/admin.php?page=store_review`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator(".notice-error, body.error-page").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 3 - Vendor store reviews shows table or empty state', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/dashboard/store-reviews/`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        const tableVisible = await page.locator('table, [role="table"]').first().isVisible({ timeout: 3000 }).catch(() => false);
        const emptyVisible = await page.locator("text=/no reviews|nothing|empty/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(tableVisible || emptyVisible).toBe(true);
        await page.close();
        await ctx.close();
    });
});

