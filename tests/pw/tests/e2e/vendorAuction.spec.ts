import { test, request, Page } from '@playwright/test';
import { AuctionsPage } from '@pages/vendorAuctionsPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe('Auction Product test', () => {
    let admin: AuctionsPage;
    let vendor: AuctionsPage;
    let customer: AuctionsPage;
    let aPage: Page, vPage: Page, cPage: Page;
    let apiUtils: ApiUtils;
    let auctionProductName: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new AuctionsPage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new AuctionsPage(vPage);

        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new AuctionsPage(cPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, , auctionProductName] = await apiUtils.createProduct(payloads.createAuctionProduct(), payloads.vendorAuth);
        await customer.bidAuctionProduct(auctionProductName);
    });

    test.afterAll(async () => {
        await aPage.close();
        await vPage.close();
        await cPage.close();
        await apiUtils.dispose();
    });

    // admin

    test('admin can add auction product', { tag: ['@pro', '@admin'] }, async () => {
        await admin.adminAddAuctionProduct(data.product.auction);
    });

    //vendor

    test('vendor can view auction menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorAuctionRenderProperly();
    });

    test('vendor can add auction product', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addAuctionProduct({ ...data.product.auction, name: data.product.auction.productName() });
    });

    test('vendor can edit auction product', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.editAuctionProduct({ ...data.product.auction, name: auctionProductName });
    });

    test('vendor can view auction product', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.viewAuctionProduct(auctionProductName);
    });

    test("vendor can't bid own product", { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.cantBidOwnProduct(auctionProductName);
    });

    test('vendor can search auction product', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.searchAuctionProduct(auctionProductName);
    });

    test('vendor can permanently delete auction product', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , auctionProductName] = await apiUtils.createProduct(payloads.createAuctionProduct(), payloads.vendorAuth);
        await vendor.deleteAuctionProduct(auctionProductName);
    });

    test('vendor can view auction activity page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorAuctionActivityRenderProperly();
    });

    test('vendor can filter auction activity', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.filterAuctionActivity(data.date.dateRange);
    });

    test('vendor can search auction activity', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.searchAuctionActivity(data.customer.username);
    });

    test('customer can bid auction product', { tag: ['@pro', '@customer'] }, async () => {
        await customer.bidAuctionProduct(auctionProductName);
    });

    test.skip('customer can buy auction product with buy it now price', { tag: ['@pro', '@customer'] }, async () => {
        const [, , auctionProductName] = await apiUtils.createProduct(payloads.createAuctionProduct(), payloads.vendorAuth); // todo: buy it now price is not saved by api
        await customer.buyAuctionProduct(auctionProductName);
    });
});
