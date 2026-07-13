import { Page, expect, test } from '@utils/test';
import { AuctionsPage, ApiUtils, data, payloads } from './vendorAuctionPage';
import path from 'path';

import { toPath } from '@utils/helpers';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

test.describe('Auction Product test', () => {
    let admin: AuctionsPage;
    let vendor: AuctionsPage;
    let customer: AuctionsPage;
    let aPage: Page, vPage: Page, cPage: Page;
    let apiUtils: ApiUtils;
    let auctionProductName: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new AuctionsPage(aPage);
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new AuctionsPage(vPage);
        const customerContext = await browser.newContext({ storageState: c1 });
        cPage = await customerContext.newPage();
        customer = new AuctionsPage(cPage);
        apiUtils = new ApiUtils(null);
        [, , auctionProductName] = await apiUtils.createProduct(payloads.createAuctionProduct(), payloads.vendorAuth);
        await customer.bidAuctionProduct(auctionProductName);
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.auction, payloads.adminAuth);
        await aPage?.close();
        await vPage?.close();
        await cPage?.close();
        await apiUtils.dispose();
    });

    test('admin can enable auction integration module', { tag: ['@pro', '@admin'] }, async () => { await admin.enableAuctionIntegrationModule(); });
    test('admin can add auction product', { tag: ['@pro', '@admin'] }, async () => { await admin.adminAddAuctionProduct(data.product.auction); });
    test('vendor can view auction menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorAuctionRenderProperly(); });
    test('vendor can add auction product', { tag: ['@pro', '@vendor'] }, async () => { await vendor.addAuctionProduct({ ...data.product.auction, name: data.product.auction.productName() }); });
    test('vendor can edit auction product', { tag: ['@pro', '@vendor'] }, async () => { await vendor.editAuctionProduct({ ...data.product.auction, name: auctionProductName }); });
    test('vendor can view auction product', { tag: ['@pro', '@vendor'] }, async () => { await vendor.viewAuctionProduct(auctionProductName); });
    test("vendor can't bid own product", { tag: ['@pro', '@vendor'] }, async () => { await vendor.cantBidOwnProduct(auctionProductName); });
    test('vendor can search auction product', { tag: ['@pro', '@vendor'] }, async () => { await vendor.searchAuctionProduct(auctionProductName); });

    test('vendor can duplicate auction product', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , name] = await apiUtils.createProduct(payloads.createAuctionProduct(), payloads.vendorAuth);
        await vendor.duplicateAuctionProduct(name);
    });

    test('vendor can permanently delete auction product', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , name] = await apiUtils.createProduct(payloads.createAuctionProduct(), payloads.vendorAuth);
        await vendor.deleteAuctionProduct(name);
    });

    test('vendor can view auction activity page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorAuctionActivityRenderProperly(); });
    test('vendor can filter auction activity', { tag: ['@pro', '@vendor'] }, async () => { await vendor.filterAuctionActivity(data.date.dateRange); });
    test('vendor can search auction activity', { tag: ['@pro', '@vendor'] }, async () => { await vendor.searchAuctionActivity(data.customer.username); });
    test('customer can bid auction product', { tag: ['@pro', '@customer'] }, async () => { await customer.bidAuctionProduct(auctionProductName); });

    test('customer can buy auction product with buy it now price', { tag: ['@pro', '@customer'] }, async () => {
        test.skip(true, 'buy it now price is not saved by api');
        const [, , name] = await apiUtils.createProduct(payloads.createAuctionProduct(), payloads.vendorAuth);
        await customer.buyAuctionProduct(name);
    });

    test('admin can disable auction integration module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.auction, payloads.adminAuth);
        await admin.disableAuctionIntegrationModule();
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Vendor Auction (React) Tests @pro', () => {
    test('Test Case 1 - Auction page renders', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/auction/`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Auction page renders content', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/auction/`));
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
});

