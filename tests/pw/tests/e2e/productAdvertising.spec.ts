import { test, Page } from '@playwright/test';
import { ProductAdvertisingPage } from 'pages/productAdvertisingPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


test.describe('Product Advertising test', () => {

	let admin: ProductAdvertisingPage;
	let aPage: Page;
	let apiUtils: ApiUtils;


	test.beforeAll(async ({ browser, request }) => {
		const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
		aPage = await adminContext.newPage();
		admin = new ProductAdvertisingPage(aPage);

		apiUtils = new ApiUtils(request);
		await apiUtils.createProductAdvertisement(payloads.createProduct(), payloads.vendorAuth);
	});


	test.afterAll(async () => {
		await aPage.close();
	});


	test('dokan product advertising menu page is rendering properly @pro @explo', async ( ) => {
		await admin.adminProductAdvertisingRenderProperly();
	});

	test('admin can add product advertisement @pro', async ( ) => {
		await admin.addNewProductAdvertisement(data.productAdvertisement);
	});

	test('admin can search advertised product @pro', async ( ) => {
		await admin.searchAdvertisedProduct(data.productAdvertisement.advertisedProduct);  //TODO: add search by order
	});

	test('admin can filter advertised product by stores @pro', async ( ) => {
		await admin.filterAdvertisedProduct(data.productAdvertisement.filter.byStore, 'by-store');
	});

	test('admin can filter advertised product by creation process @pro', async ( ) => {
		await admin.filterAdvertisedProduct(data.productAdvertisement.filter.createVia.admin, 'by-creation');
	});

	test('admin can expire advertised product @pro', async ( ) => {
		await admin.updateAdvertisedProduct(data.productAdvertisement.advertisedProduct, 'expire');
	});

	test('admin can delete advertised product @pro', async ( ) => {
		await admin.updateAdvertisedProduct(data.productAdvertisement.advertisedProduct, 'delete');
	});

	test('admin can perform product advertising bulk action @pro', async ( ) => {
		// await apiUtils.createProductAdvertisement(payloads.createProduct(), payloads.vendorAuth);
		await admin.productAdvertisingBulkAction('delete');
	});

	// test.skip('vendor can buy product advertising @pro', async ( ) => {
	// 	// await vendorPage.buyProductAdvertising(data.productAdvertisement.advertisedProduct);
	// });

	//TODO: filter by calendar
	//TODO: add tests for every setting options
	//TODO: add vendor tests
});
