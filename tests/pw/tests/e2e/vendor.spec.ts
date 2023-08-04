import { test, Page } from '@playwright/test';
import { LoginPage } from 'pages/loginPage';
import { VendorPage } from 'pages/vendorPage';
// import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
// import { payloads } from 'utils/payloads';


test.describe('Vendor user functionality test1', () => {

	test.use({ storageState: { cookies: [], origins: [] } });

	let loginPage: LoginPage;
	let vendorPage: VendorPage;
	let page: Page;


	test.beforeAll(async ({ browser }) => {
		const context = await browser.newContext();
		page = await context.newPage();
		loginPage = new LoginPage(page);
		vendorPage = new VendorPage(page);
	});


	test.afterAll(async () => {
		await page.close();
	});


	test('vendor can register @lite @pro', async ( ) => {
		await vendorPage.vendorRegister(data.vendor.vendorInfo, { ...data.vendorSetupWizard, choice:false });
	});

	test('vendor can login @lite @pro', async ( ) => {
		await loginPage.login(data.vendor);
	});

	test('vendor can logout @lite @pro', async ( ) => {
		await loginPage.login(data.vendor);
		await loginPage.logout();
	});

});


test.describe('Vendor functionality test', () => {


	let vendor: VendorPage;
	let vPage: Page;
	// let apiUtils: ApiUtils;


	test.beforeAll(async ({ browser,  }) => {
		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		vendor = new VendorPage(vPage);
		// apiUtils = new ApiUtils(request);
	});


	test.afterAll(async () => {
		await vPage.close();
	});


	test('vendor can setup setup-wizard @lite @pro', async ( ) => {
		await vendor.vendorSetupWizard(data.vendorSetupWizard);
	});

	test('vendor can visit own Store @lite @pro', async ( ) => {
		await vendor.visitStore(data.predefined.vendorStores.vendor1);
	});

	test('vendor account details menu page is rendering properly @lite @pro @explo', async ( ) => {
		await vendor.vendorAccountDetailsRenderProperly();
	});

	test('vendor update account details @lite @pro', async ( ) => {
		await vendor.setVendorDetails(data.vendor.vendorInfo);
	});


	test('vendor can add simple product @lite @pro', async ( ) => {
		await vendor.vendorAddSimpleProduct(data.product.simple);
	});

	// test.skip('vendor can add variable product @pro', async ( ) => {
	// 	await vendor.addVariableProduct(data.product.variable);
	// });

	test('vendor can add simple subscription product @pro', async ( ) => {
		await vendor.vendorAddSimpleSubscription(data.product.simpleSubscription);
	});

	// test.skip('vendor can add variable subscription product @pro', async ( ) => {
	// 	await vendor.addVariableSubscription(data.product.variableSubscription);
	// });

	test('vendor can add external product @pro', async ( ) => {
		await vendor.vendorAddExternalProduct(data.product.external);
	});


	test('vendor user subscriptions menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorUserSubscriptionsRenderProperly();
	});

	test('vendor analytics menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorAnalyticsRenderProperly();
	});


});
