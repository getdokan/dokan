import { test, Page } from '@playwright/test';
import { VendorSpmvPage } from 'pages/vendorSpmvPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


test.describe('Vendor SPMV test', () => {


	let vendor: VendorSpmvPage;
	let vPage: Page;
	let apiUtils: ApiUtils;
	let productName: string;


	test.beforeAll(async ({ browser, request }) => {
		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		vendor = new VendorSpmvPage(vPage);

		apiUtils = new ApiUtils(request);
		await apiUtils.createStore (payloads.createStore2, payloads.adminAuth);
		[,, productName] = await apiUtils.createProduct({ ...payloads.createProduct(), name: data.predefined.spmv.productName() }, payloads.vendor2Auth);
		//todo: might need to delete user: delete user wp api
	});


	test.afterAll(async () => {
		await vPage.close();
	});


	test('vendor spmv menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorSpmvRenderProperly();
	});

	test('vendor can search similar product on spmv page @pro @explo', async ( ) => {
		await vendor.searchSimilarProduct(productName, 'spmv');
	});

	test('vendor can search similar product on product popup @pro @explo', async ( ) => {
		await vendor.searchSimilarProduct(productName, 'popup');
	});

	// test('vendor can search similar booking product @pro @explo', async ( ) => {
	//todo: need admin booking product via api
	// 	await vendor.searchSimilarProduct(productName, 'booking');
	// });

	// test('vendor can search similar auction product @pro @explo', async ( ) => {
	//todo: need admin auction product via api
	// 	await vendor.searchSimilarProduct(productName, 'auction');
	// });

	test('vendor can go to product edit from spmv @pro @explo', async ( ) => {
		await vendor.goToProductEditFromSPMV(data.predefined.simpleProduct.product1.name);
	});

	test('vendor can sort spmv products @pro @explo', async ( ) => {
		await vendor.sortSpmvProduct('price');
	});

	test('vendor can clone product @pro @explo', async ( ) => {
		await vendor.cloneProduct(productName);
	});

	//todo: add more spmv settings test

});