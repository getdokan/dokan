import { Page, expect, test } from '@utils/test';
import { VendorToolsPage, ApiUtils, payloads } from './vendorToolsPage';
import path from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:9999';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

test.describe('Vendor tools test', () => {
    let admin: VendorToolsPage;
    let vendor: VendorToolsPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new VendorToolsPage(aPage);
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new VendorToolsPage(vPage);
        apiUtils = new ApiUtils(null);
        await apiUtils.deleteAllProducts('p0_v1', payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.vendorImportExport, payloads.adminAuth);
        await aPage?.close();
        await vPage?.close();
        await apiUtils?.dispose();
    });

    test('admin can enable product importer and exporter module', { tag: ['@pro', '@admin'] }, async () => { await admin.enableProductImporterExporterModule(); });
    test('vendor can view tools menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorToolsRenderProperly(); });
    test('vendor can export product as xml', { tag: ['@pro', '@vendor'] }, async () => { await vendor.exportProduct('xml'); });
    test('vendor can export product as csv', { tag: ['@pro', '@vendor'] }, async () => { await vendor.exportProduct('csv'); });
    test('vendor can import product as xml', { tag: ['@pro', '@vendor'] }, async () => { await vendor.importProduct('xml', 'utils/sampleData/products.xml'); });
    test('vendor can import product as csv', { tag: ['@pro', '@vendor'] }, async () => { await vendor.importProduct('csv', 'utils/sampleData/products.csv'); });
    test('admin can disable product importer and exporter module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.vendorImportExport, payloads.adminAuth);
        await admin.disableProductImporterExporterModule();
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Vendor Tools (React) Tests @pro', () => {
    test('Test Case 1 - Tools page renders', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/dashboard/tools/`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Tools page renders content', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/dashboard/tools/`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.trim().length).toBeGreaterThan(50);
        await page.close();
        await ctx.close();
    });
});

