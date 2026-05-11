import { Page, expect, test } from '@utils/test';
import { ModulesPage, api, payloads, testData } from './modulesPage';
import path from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:9999';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');

test.describe('Modules test', () => {
    let admin: ModulesPage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new ModulesPage(aPage);
        await api.init();
    });

    test.afterAll(async () => {
        await aPage?.close();
        await api.dispose();
    });

    test('admin can view modules menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await admin.adminModulesRenderProperly(testData.moduleStats);
    });

    test('admin can search module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.searchModule(testData.modulesName.auctionIntegration);
    });

    test('admin can filter modules by category', { tag: ['@pro', '@admin'] }, async () => {
        await admin.filterModules(testData.moduleCategory.productManagement);
    });

    test('admin can deactivate module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.activateDeactivateModule(testData.modulesName.auctionIntegration);
    });

    test('admin can activate module', { tag: ['@pro', '@admin'] }, async () => {
        await api.deactivateModules(payloads.moduleIds.auction, payloads.adminAuth);
        await admin.activateDeactivateModule(testData.modulesName.auctionIntegration);
    });

    test('admin can perform bulk action on modules', { tag: ['@pro', '@admin'] }, async () => {
        await admin.moduleBulkAction('activate');
    });

    test('admin can change module view layout', { tag: ['@pro', '@admin'] }, async () => {
        await admin.moduleViewLayout(testData.layout.list);
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Admin Modules (React) Tests @lite', () => {
    test('Test Case 1 - Modules page mounts at #/pro-modules', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/wp-admin/admin.php?page=dokan-dashboard#/pro-modules`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        expect(page.url()).toMatch(/#\/pro-modules/);
        const fatal = await page.locator(".notice-error, body.error-page").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Modules page shows modules grid / cards', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/wp-admin/admin.php?page=dokan-dashboard#/pro-modules`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(4000);
        // The modules page renders a grid of module cards (or similar).
        const cards = await page.locator('[class*="module"], [class*="card"], article').count();
        expect(cards, 'Modules page should render at least one module card').toBeGreaterThan(0);
        await page.close();
        await ctx.close();
    });

    test('Test Case 3 - Modules page survives reload', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/wp-admin/admin.php?page=dokan-dashboard#/pro-modules`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
        expect(page.url()).toMatch(/#\/pro-modules/);
        await page.close();
        await ctx.close();
    });
});

