import { test, Page } from '@playwright/test';
import { SingleProductPage } from 'pages/singleProductPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
// import { payloads } from 'utils/payloads';


test.describe('Single product functionality test', () => {


	let singleProductPage: SingleProductPage;
	let page: Page;
	let apiUtils: ApiUtils;

	test.beforeAll(async ({ browser, request }) => {
		const customerContext = await browser.newContext({ storageState: data.auth.customerAuthFile });
		page = await customerContext.newPage();
		singleProductPage = new SingleProductPage(page);
		apiUtils = new ApiUtils(request);
	});

	test.afterAll(async () => {
		await page.close();
	});


	// single product page

	test('single product is rendering properly @lite @pro @explo', async ( ) => {
		await singleProductPage.singleProductRenderProperly(data.predefined.simpleProduct.product1.name);
	});

	test('customer can view highlighted vendor info @lite @pro', async ( ) => {
		await singleProductPage.viewHighlightedVendorInfo(data.predefined.simpleProduct.product1.name);
	});

	test('customer can view product vendor info @lite @pro', async ( ) => {
		await singleProductPage.productVendorInfo(data.predefined.simpleProduct.product1.name);
	});

	test('customer can view product location @pro', async ( ) => {
		await singleProductPage.productLocation(data.predefined.simpleProduct.product1.name);
	});

	test('customer can view product warranty policy @pro', async ( ) => {
		await singleProductPage.productWarrantyPolicy(data.predefined.simpleProduct.product1.name);
	});

	test('customer can view more products @lite @pro', async ( ) => {
		await singleProductPage.viewMoreProducts(data.predefined.simpleProduct.product1.name);
	});

	test('customer can view related products @lite @pro', async ( ) => {
		await singleProductPage.viewRelatedProducts(data.predefined.simpleProduct.product1.name);
	});

	test('customer can review product @lite @pro', async ( ) => {
		await singleProductPage.reviewProduct(data.predefined.simpleProduct.product1.name, data.product.review);
	});

});
