import { Page, expect, test } from '@playwright/test';
import { LiveSearch, api, db, payloads, testData } from './liveSearchPage';
import path from 'path';

import { toPath } from '@utils/helpers';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

test.describe('Live search test', () => {
    let admin: LiveSearch;
    let customer: LiveSearch;
    let aPage: Page, cPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new LiveSearch(aPage);

        const customerContext = await browser.newContext({ storageState: c1 });
        cPage = await customerContext.newPage();
        customer = new LiveSearch(cPage);

        await api.init();
        await db.updateOptionValue(testData.widgetName, testData.widgetValue);
        await db.updateOptionValue('sidebars_widgets', { ...testData.sidebarWidgets, 'sidebar-1': [testData.widgetKey] });
        await db.setOptionValue(testData.optionName.liveSearch, testData.liveSearchSettings);
    });

    test.afterAll(async () => {
        await api.activateModules(payloads.moduleIds.liveSearch, payloads.adminAuth);
        await aPage?.close();
        await cPage?.close();
        await api.dispose();
        await db.dispose();
    });

    test('admin can enable live search module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enableLiveSearchModule();
    });

    test('customer can search product using live search (suggestion box)', { tag: ['@pro', '@customer'] }, async () => {
        await customer.searchByLiveSearch(testData.predefined.simpleProduct.product1.name);
    });

    test('customer can search product with category using live search (suggestion box)', { tag: ['@pro', '@customer'] }, async () => {
        await customer.searchByLiveSearch(testData.predefined.simpleProduct.product1.name, false, testData.predefined.categories.uncategorized);
    });

    test('customer can search product using live search (autoload content)', { tag: ['@pro', '@customer'] }, async () => {
        await db.updateOptionValue(testData.optionName.liveSearch, { live_search_option: 'old_live_search' });
        await customer.searchByLiveSearch(testData.predefined.simpleProduct.product1.name, true);
    });

    test('customer can search product with category using live search (autoload content)', { tag: ['@pro', '@customer'] }, async () => {
        await db.updateOptionValue(testData.optionName.liveSearch, { live_search_option: 'old_live_search' });
        await customer.searchByLiveSearch(testData.predefined.simpleProduct.product1.name, true, testData.predefined.categories.uncategorized);
    });

    test('admin can disable live search module', { tag: ['@pro', '@admin'] }, async () => {
        await api.deactivateModules(payloads.moduleIds.liveSearch, payloads.adminAuth);
        await admin.disableLiveSearchModule();
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Live Search (React) Tests @pro', () => {
    test('Test Case 1 - Front-end shop page renders without fatal', { tag: ['@pro', '@guest'] }, async ({ browser }) => {
        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        await page.goto(toPath(`shop/`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });
});

