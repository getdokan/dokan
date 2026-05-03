import { Page, expect, test } from '@playwright/test';
import { PrintfulPage, ApiUtils, payloads } from './printfulPage';
import path from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:9999';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

test.describe.skip('Printful module functionality test', () => {
    let admin: PrintfulPage;
    let vendor: PrintfulPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new PrintfulPage(aPage);

        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new PrintfulPage(vPage);

        apiUtils = new ApiUtils(null);
        await apiUtils.activateModules(payloads.moduleIds.printful, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.printful, payloads.adminAuth);
        await aPage?.close();
        await vPage?.close();
        await apiUtils.dispose();
    });

    test('admin can enable printful module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enablePrintfulModule();
    });

    test('vendor can view printful menu page', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorPrintfulSettingsRenderProperly();
    });

    test.skip('vendor can connect printful account', { tag: ['@pro', '@vendor'] }, async () => { await vendor.connectPrintful(); });
    test.skip('vendor can disconnect printful account', { tag: ['@pro', '@vendor'] }, async () => { await vendor.disconnectPrintful(); });

    test('vendor can enable printful shipping', { tag: ['@pro', '@vendor'] }, async () => { await vendor.enableShipping('printful'); });
    test('vendor can enable marketplace shipping', { tag: ['@pro', '@vendor'] }, async () => { await vendor.enableShipping('marketplace'); });
    test('vendor can enable both printful and marketplace shipping', { tag: ['@pro', '@vendor'] }, async () => { await vendor.enableShipping('both'); });

    test('admin can disable printful module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.printful, payloads.adminAuth);
        await admin.disablePrintfulModule();
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Printful (React) Tests @pro', () => {
    test('Test Case 1 - Vendor printful page renders', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/dashboard/printful/`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Printful page renders content', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/dashboard/printful/`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.trim().length).toBeGreaterThan(50);
        await page.close();
        await ctx.close();
    });
});

