import { test, Page } from '@playwright/test';
import { AuctionsPage } from 'pages/vendorAuctionsPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


test.describe('Auction Product test', () => {


	let admin: AuctionsPage;
	let vendor: AuctionsPage;
	let customer: AuctionsPage;
	let aPage: Page, vPage: Page, cPage: Page;
	let apiUtils: ApiUtils;
	let auctionProductName: string;


	test.beforeAll(async ({ browser, request }) => {

		const adminContext = await browser.newContext(data.auth.adminAuth);
		aPage = await adminContext.newPage();
		admin = new AuctionsPage(aPage);

		const vendorContext = await browser.newContext(data.auth.vendorAuth);
		vPage = await vendorContext.newPage();
		vendor = new AuctionsPage(vPage);

		const customerContext = await browser.newContext(data.auth.customerAuth);
		cPage = await customerContext.newPage();
		customer = new AuctionsPage(cPage);

		apiUtils = new ApiUtils(request);
		[,, auctionProductName] = await apiUtils.createProduct(payloads.createAuctionProduct(), payloads. vendorAuth);

		await customer.bidAuctionProduct(auctionProductName);

	});


	test.afterAll(async () => {
		await aPage.close();
		await vPage.close();
		await cPage.close();
	});

	test('admin can add auction product @pro', async ( ) => {
		await admin.adminAddAuctionProduct(data.product.auction);
	});

	test('vendor auction menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorAuctionRenderProperly();
	});

	test('vendor can add auction product @pro', async ( ) => {
		await vendor.addAuctionProduct({ ...data.product.auction, name: data.product.auction.productName() });
	});

	test('vendor can edit auction product @pro', async ( ) => {
		await vendor.editAuctionProduct({ ...data.product.auction, name: auctionProductName });
	});

	test('vendor can view auction product @pro', async ( ) => {
		await vendor.viewAuctionProduct(auctionProductName);
	});

	test('vendor can\'t bid own product @pro', async ( ) => {
		await vendor.cantBidOwnProduct(auctionProductName);
	});

	test('vendor can search auction product @pro', async ( ) => {
		await vendor.searchAuctionProduct(auctionProductName);
	});

	test('vendor can permanently delete auction product @pro', async ( ) => {
		const [,, auctionProductName] = await apiUtils.createProduct(payloads.createAuctionProduct(), payloads. vendorAuth);
		await vendor.deleteAuctionProduct(auctionProductName);
	});

	test('vendor auction activity page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorAuctionActivityRenderProperly();
	});

	test('vendor can filter auction activity @pro', async ( ) => {
		await vendor.filterAuctionActivity(data.date.dateRange);
	});

	test('vendor can search auction activity @pro', async ( ) => {
		await vendor.searchAuctionActivity(data.customer.username);
	});

	test('customer can bid auction product @pro', async ( ) => {
		await customer.bidAuctionProduct(auctionProductName);
	});

	test('customer can buy auction product with buy it now price @pro', async ( ) => {
		const [,, auctionProductName] = await apiUtils.createProduct(payloads.createAuctionProduct(), payloads. vendorAuth);
		await customer.buyAuctionProduct(auctionProductName);
	});


});