import { Page, expect, test } from '@playwright/test';
import { SellerBadgesPage, ApiUtils, data, payloads } from './sellerBadgesPage';
import path from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:9999';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

test.describe('Seller badge test', () => {
    let admin: SellerBadgesPage;
    let vendor: SellerBadgesPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new SellerBadgesPage(aPage);
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new SellerBadgesPage(vPage);
        apiUtils = new ApiUtils(null);
        await apiUtils.createSellerBadge(payloads.createSellerBadgeProductsPublished, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.sellerBadge, payloads.adminAuth);
        await aPage?.close();
        await vPage?.close();
        await apiUtils.dispose();
    });

    test('admin can enable seller badge module', { tag: ['@pro', '@admin'] }, async () => { await admin.enableSellerBadgeModule(); });
    test('admin can view seller badge menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => { await admin.adminSellerBadgeRenderProperly(); });
    test('admin can preview seller badge', { tag: ['@pro', '@exploratory', '@admin'] }, async () => { await admin.previewSellerBadge(data.sellerBadge.eventName.productsPublished); });
    test('admin can view seller badge details', { tag: ['@pro', '@exploratory', '@admin'] }, async () => { await admin.viewSellerBadge(data.sellerBadge.eventName.productsPublished); });
    test('admin can search seller badge', { tag: ['@pro', '@admin'] }, async () => { await admin.searchSellerBadge(data.sellerBadge.eventName.productsPublished); });

    test('admin can create seller badge', { tag: ['@pro', '@admin'] }, async () => {
        const badgeId = await apiUtils.getSellerBadgeId(data.sellerBadge.eventName.numberOfItemsSold, payloads.adminAuth);
        if (badgeId) await apiUtils.deleteSellerBadge(badgeId, payloads.adminAuth);
        await admin.createSellerBadge({ ...data.sellerBadge, badgeName: data.sellerBadge.eventName.numberOfItemsSold });
    });

    test('admin can edit seller badge', { tag: ['@pro', '@admin'] }, async () => { await admin.editSellerBadge({ ...data.sellerBadge, badgeName: data.sellerBadge.eventName.productsPublished }); });
    test.skip('admin can filter vendors by seller badge', { tag: ['@pro', '@admin'] }, async () => { await admin.filterVendorsByBadge(data.sellerBadge.eventName.productsPublished); });
    test.skip('admin can view seller badge vendors', { tag: ['@pro', '@admin'] }, async () => { await admin.sellerBadgeVendors(data.sellerBadge.eventName.productsPublished); });
    test('admin can view seller badges acquired by vendor', { tag: ['@pro', '@admin'] }, async () => { await admin.sellerBadgeAcquiredByVendor(data.predefined.vendorStores.vendor1); });

    test('admin can update seller badge status', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.createSellerBadge(payloads.createSellerBadgeExclusiveToPlatform, payloads.adminAuth);
        await admin.updateSellerBadge(data.sellerBadge.eventName.exclusiveToPlatform, 'draft');
    });

    test('admin can delete seller badge', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.createSellerBadge(payloads.createSellerBadgeExclusiveToPlatform, payloads.adminAuth);
        await admin.updateSellerBadge(data.sellerBadge.eventName.exclusiveToPlatform, 'delete');
    });

    test('admin can perform bulk action on seller badges', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.createSellerBadge(payloads.createSellerBadgeFeatureProducts, payloads.adminAuth);
        await admin.sellerBadgeBulkAction('delete', data.sellerBadge.eventName.featuredProducts);
    });

    test('vendor can view badges menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorSellerBadgeRenderProperly(); });
    test('vendor can view badge acquired congratulation popup message action', { tag: ['@pro', '@vendor'] }, async () => { await vendor.sellerBadgeCongratsPopup(); });
    test('vendor can search seller badge', { tag: ['@pro', '@vendor'] }, async () => { await vendor.vendorSearchSellerBadge(data.sellerBadge.eventName.productsPublished); });
    test('vendor can filter seller badges', { tag: ['@pro', '@vendor'] }, async () => { await vendor.filterSellerBadges('available_badges'); });

    test('admin can disable seller badge module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.sellerBadge, payloads.adminAuth);
        await admin.disableSellerBadgeModule();
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Seller Badges (React) Tests @pro', () => {
    test('Test Case 1 - Vendor badges page renders', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/dashboard/seller-badge/`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Admin badges page renders', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/wp-admin/admin.php?page=seller_badge`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator(".notice-error, body.error-page").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 3 - Vendor page survives reload', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/dashboard/seller-badge/`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });
});

