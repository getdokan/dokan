import { Page, expect, test } from '@utils/test';
import { SingleStorePage, data } from './singleStorePage';
import path from 'path';

import { toPath } from '@utils/helpers';

const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

test.describe('Single store functionality test', () => {
    let customer: SingleStorePage;
    let cPage: Page;

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext({ storageState: c1 });
        cPage = await customerContext.newPage();
        customer = new SingleStorePage(cPage);
    });

    test.afterAll(async () => { await cPage?.close(); });

    // KEEP skipped: singleStoreRenderProperly is an empty stub in singleStorePage.ts (no real implementation).
    test.skip('customer can view single store page', { tag: ['@lite', '@exploratory', '@customer'] }, async () => { await customer.singleStoreRenderProperly(data.predefined.vendorStores.vendor1); });
    // KEEP skipped: storeOpenCloseTime is an empty stub in singleStorePage.ts (no real implementation).
    test.skip('customer can view store open-close time on single store', { tag: ['@lite', '@customer'] }, async () => { await customer.storeOpenCloseTime(data.predefined.vendorStores.vendor1); });
    test('customer can search product on single store', { tag: ['@lite', '@customer'] }, async () => { await customer.singleStoreSearchProduct(data.predefined.vendorStores.vendor1, data.predefined.simpleProduct.product1.name); });
    test('customer can sort products on single store', { tag: ['@lite', '@customer'] }, async () => { await customer.singleStoreSortProducts(data.predefined.vendorStores.vendor1, 'price'); });
    test('customer can view store terms and conditions', { tag: ['@lite', '@customer'] }, async () => { await customer.storeTermsAndCondition(data.predefined.vendorStores.vendor1, data.vendor.toc); });
    test('customer can share store', { tag: ['@pro', '@customer'] }, async () => { await customer.storeShare(data.predefined.vendorStores.vendor1, data.storeShare.facebook); });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Single Store Front-end (React-aware) Tests @lite', () => {
    test('Test Case 1 - Single store page renders for guest', { tag: ['@lite', '@guest'] }, async ({ browser }) => {
        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        await page.goto(toPath(`store/vendor1/`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Single store page renders content', { tag: ['@lite', '@guest'] }, async ({ browser }) => {
        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        await page.goto(toPath(`store/vendor1/`));
        await page.waitForLoadState('domcontentloaded');
        await expect
            .poll(async () => (await page.locator('body').innerText()).trim().length, {
                timeout: 30_000,
                intervals: [500, 1000, 2000, 3000],
            })
            .toBeGreaterThan(50);
        await page.close();
        await ctx.close();
    });

    test('Test Case 3 - Customer can view store page', { tag: ['@lite', '@customer'] }, async ({ browser }) => {
        const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');
        const ctx = await browser.newContext({ storageState: c1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`store/vendor1/`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });
});

