import { Page, expect, test } from '@playwright/test';
import { VendorAnalyticsPage, ApiUtils, payloads } from './vendorAnalyticsPage';
import path from 'path';

import { toPath } from '@utils/helpers';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

test.describe.skip('Vendor analytics test', () => {
    let admin: VendorAnalyticsPage;
    let vendor: VendorAnalyticsPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new VendorAnalyticsPage(aPage);
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new VendorAnalyticsPage(vPage);
        apiUtils = new ApiUtils(null);
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.vendorAnalytics, payloads.adminAuth);
        await aPage?.close();
        await vPage?.close();
        await apiUtils.dispose();
    });

    test('admin can enable vendor analytics module', { tag: ['@pro', '@admin'] }, async () => { await admin.enableVendorAnalyticsModule(); });
    test('vendor can view analytics menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorAnalyticsRenderProperly(); });

    test('admin can disable vendor analytics module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.vendorAnalytics, payloads.adminAuth);
        await admin.disableVendorAnalyticsModule();
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Vendor Analytics (React) Tests @pro', () => {
    test('Test Case 1 - Analytics page renders', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/analytics/`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Analytics page renders content', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/analytics/`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.trim().length).toBeGreaterThan(50);
        await page.close();
        await ctx.close();
    });
});

