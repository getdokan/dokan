import { test, Page } from '@playwright/test';
import { ShopPage } from 'pages/shopPage';
// import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
// import { payloads } from 'utils/payloads';


test.describe('Shop functionality test', () => {


	let customer: ShopPage;
	let page: Page;
	// let apiUtils: ApiUtils;


	test.beforeAll(async ({ browser }) => {
		const customerContext = await browser.newContext({ storageState: data.auth.customerAuthFile });
		page = await customerContext.newPage();
		customer = new ShopPage(page);

		// apiUtils = new ApiUtils(request);
	});


	test.afterAll(async () => {
		await page.close();
	});


	// shop page


	test('shop page is rendering properly @lite @pro @explo', async ( ) => {
		await customer.shopRenderProperly();
	});

	test('customer can sort products @lite @pro', async ( ) => {
		await customer.sortProducts('price');
	});

	test('customer can search product @lite @pro', async ( ) => {
		await customer.searchProduct(data.predefined.simpleProduct.product1.name);
	});

	test('customer can view products on map @pro', async ( ) => {
		await customer.productOnMap();
		// await customer.productOnMap(data.predefined.simpleProduct.product1.name);
	});

	test('customer can go to product details from shop @lite @pro', async ( ) => {
		await customer.goToProductDetails(data.predefined.simpleProduct.product1.name);
	});


});
