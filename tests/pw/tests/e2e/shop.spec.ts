import { test, Page } from '@playwright/test';
import { ShopPage } from 'pages/shopPage';
// import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
// import { payloads } from 'utils/payloads';


test.describe('Shop functionality test', () => {


	let customer: ShopPage;
	let cPage: Page;
	// let apiUtils: ApiUtils;


	test.beforeAll(async ({ browser }) => {
		const customerContext = await browser.newContext({ storageState: data.auth.customerAuthFile });
		cPage = await customerContext.newPage();
		customer = new ShopPage(cPage);

		// apiUtils = new ApiUtils(request);
	});


	test.afterAll(async () => {
		await cPage.close();
	});


	// shop page


	test('shop page is rendering properly @lite @explo', async ( ) => {
		await customer.shopRenderProperly();
	});

	test('customer can sort products @lite', async ( ) => {
		await customer.sortProducts('price');
	});

	test('customer can search product @lite', async ( ) => {
		await customer.searchProduct(data.predefined.simpleProduct.product1.name);
	});

	test('customer can filter products by category @pro', async ( ) => {
		await customer.filterProducts('by-category', 'uncategorized');
	});

	test('customer can filter products by location @pro', async ( ) => {
		await customer.filterProducts('by-location', 'New York, NY, USA');
	});

	test('customer can view products on map @pro', async ( ) => {
		await customer.productOnMap();
		// await customer.productOnMap(data.predefined.simpleProduct.product1.name);
	});

	test('customer can go to product details from shop @lite', async ( ) => {
		await customer.goToProductDetailsFromShop(data.predefined.simpleProduct.product1.name);
	});


});
