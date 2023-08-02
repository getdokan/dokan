import { test, Page } from '@playwright/test';
import { AuctionsPage } from 'pages/vendorAuctionsPage';
// import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
// import { payloads } from 'utils/payloads';
// import { faker } from '@faker-js/faker';


test.describe('Auction Product test', () => {


	let admin: AuctionsPage;
	let vendor: AuctionsPage;
	let customer: AuctionsPage;
	let aPage: Page, vPage: Page, cPage: Page;
	// let apiUtils: ApiUtils;
	const auctionProductName = data.product.auction.productName();


	test.beforeAll(async ({ browser }) => {

		const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
		aPage = await adminContext.newPage();
		admin = new AuctionsPage(aPage);

		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		vendor = new AuctionsPage(vPage);

		const customerContext = await browser.newContext({ storageState: data.auth.customerAuthFile });
		cPage = await customerContext.newPage();
		customer = new AuctionsPage(cPage);

		await vendor.addAuctionProduct({ ...data.product.auction, name: auctionProductName }); //todo: convert with api
		await customer.bidAuctionProduct(auctionProductName); //todo: convert with api

		// apiUtils = new ApiUtils(request);

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

	test.skip('vendor can edit auction product @pro', async ( ) => {
		await vendor.editAuctionProduct({ ...data.product.auction, name: 'Awesome Rubber Chicken (Auction)' });
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
		const auctionProductName = data.product.auction.productName();
		await vendor.addAuctionProduct({ ...data.product.auction, name: auctionProductName });
		await vendor.deleteAuctionProduct(auctionProductName);
	});

	test('vendor auction activity page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorAuctionActivityRenderProperly();
	});

	//todo: filter auction activity

	test('vendor can search auction activity @pro', async ( ) => {
		await vendor.searchAuctionActivity(data.customer.username);
		// await vendor.searchAuctionActivity(data.customer.username + '@yopmail.com');
	});


	test('customer can bid auction product @pro', async ( ) => {
		await customer.bidAuctionProduct(auctionProductName);
	});

	//todo:add more customer tests buy now, after bid buy...

});