import { test, Page } from '@playwright/test';
import { ProductAdvertisingPage } from 'pages/productAdvertisingPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


let productAdvertisingPage: ProductAdvertisingPage;
let aPage: Page;
let apiUtils: ApiUtils;

test.beforeAll(async ({ browser, request }) => {
	const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
	aPage = await adminContext.newPage();
	productAdvertisingPage = new ProductAdvertisingPage(aPage);
	apiUtils = new ApiUtils(request);
	// await productAdvertisingPage.recreateProductAdvertisementPaymentViaSettingsSave();  //TODO: move to setup
	await apiUtils.createProductAdvertisement(payloads.createProduct(), payloads.vendorAuth);
});

test.afterAll(async ( ) => {
	await aPage.close();
});

test.describe('Product Advertising test', () => {


	test('dokan product advertising menu page is rendering properly @pro @explo', async ( ) => {
		await productAdvertisingPage.adminProductAdvertisingRenderProperly();
	});

	// test('product advertisement payment product exists @pro', async ( ) => {
	// 	const product = await apiUtils.productExistsOrNot('Product Advertisement Payment',  payloads.adminAuth);
	// 	expect(product).toBeTruthy(); //TODO move to setup
	// });

	test('admin can add product advertisement @pro', async ( ) => {
		await productAdvertisingPage.addNewProductAdvertisement(data.productAdvertisement);
	});

	test('admin can search advertised product @pro', async ( ) => {
		await productAdvertisingPage.searchAdvertisedProduct(data.productAdvertisement.advertisedProduct);  //TODO: add search by order
	});

	test('admin can filter advertised product by stores @pro', async ( ) => {
		await productAdvertisingPage.filterAdvertisedProduct(data.productAdvertisement.filter.byStore, 'by-store');
	});

	test('admin can filter advertised product by creation process @pro', async ( ) => {
		await productAdvertisingPage.filterAdvertisedProduct(data.productAdvertisement.filter.createVia.admin, 'by-creation');
	});

	test('admin can expire advertised product @pro', async ( ) => {
		await productAdvertisingPage.updateAdvertisedProduct(data.productAdvertisement.advertisedProduct, 'expire');
	});

	test('admin can delete advertised product @pro', async ( ) => {
		await productAdvertisingPage.updateAdvertisedProduct(data.productAdvertisement.advertisedProduct, 'delete');
	});

	test('admin can perform product advertising bulk action @pro', async ( ) => {
		// await apiUtils.createProductAdvertisement(payloads.createProduct(), payloads.vendorAuth);
		await productAdvertisingPage.productAdvertisingBulkAction('delete');
	});

	// test.skip('vendor can buy product advertising @pro', async ( ) => {
	// 	// await vendorPage.buyProductAdvertising(data.productAdvertisement.advertisedProduct);
	// });

	//TODO: filter by calendar
	//TODO: add tests for every setting options
	//TODO: add vendor tests
});
