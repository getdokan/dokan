import { Page, expect, test } from '@utils/test';
import { StoreListingPage, data } from './storeListingPage';
import path from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:9999';

const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

test.describe('Store list functionality test', () => {
    let customer: StoreListingPage;
    let cPage: Page;

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext({ storageState: c1 });
        cPage = await customerContext.newPage();
        customer = new StoreListingPage(cPage);
    });

    test.afterAll(async () => { await cPage?.close(); });

    test('customer can view store list page', { tag: ['@lite', '@exploratory', '@customer'] }, async () => { await customer.storeListRenderProperly(); });
    test('customer can sort stores', { tag: ['@lite', '@customer'] }, async () => { await customer.sortStores(data.storeList.sort); });
    test('customer can change store view layout', { tag: ['@lite', '@customer'] }, async () => { await customer.storeViewLayout(data.storeList.layout.list); });
    test('customer can search store', { tag: ['@lite', '@customer'] }, async () => { await customer.searchStore(data.predefined.vendorStores.vendor1); });
    test('customer can filter stores by category', { tag: ['@pro', '@customer'] }, async () => { await customer.filterStores('by-category', 'Uncategorized'); });
    test('customer can filter stores by location', { tag: ['@pro', '@customer'] }, async () => { await customer.filterStores('by-location', 'New York, NY, USA'); });
    test('customer can filter stores by ratings', { tag: ['@pro', '@customer'] }, async () => { await customer.filterStores('by-ratings', '5'); });
    test('customer can filter featured stores', { tag: ['@pro', '@customer'] }, async () => { await customer.filterStores('featured'); });
    test.skip('customer can filter open now stores', { tag: ['@pro', '@customer'] }, async () => { await customer.filterStores('open-now'); });
    test('customer can view stores on map', { tag: ['@pro', '@customer'] }, async () => { await customer.storeOnMap(); });
    test('customer can go to single store from store list', { tag: ['@lite', '@customer'] }, async () => { await customer.goToSingleStoreFromStoreListing(data.predefined.vendorStores.vendor1); });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Store Listing Front-end (React-aware) Tests @lite', () => {
    test('Test Case 1 - Store listing page renders for guest', { tag: ['@lite', '@guest'] }, async ({ browser }) => {
        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        await page.goto(`${BASE}/store-listing/`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Store listing page renders content', { tag: ['@lite', '@guest'] }, async ({ browser }) => {
        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        await page.goto(`${BASE}/store-listing/`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.trim().length).toBeGreaterThan(50);
        await page.close();
        await ctx.close();
    });
});

