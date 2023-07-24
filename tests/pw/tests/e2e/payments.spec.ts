import { test, Page } from '@playwright/test';
import { PaymentsPage } from 'pages/paymentsPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';


test.describe('Vendor functionality test', () => {


	let paymentsPageAdmin: PaymentsPage;
	let paymentsPageVendor: PaymentsPage;
	let aPage: Page, vPage: Page;
	let apiUtils: ApiUtils;

	test.beforeAll(async ({ browser, request }) => {
		const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
		aPage = await adminContext.newPage();
		paymentsPageAdmin = new PaymentsPage(aPage);

		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		paymentsPageVendor = new PaymentsPage(vPage);

		apiUtils = new ApiUtils(request);

	});


	test.afterAll(async () => {
		await vPage.close();
	});


	test('vendor payment menu is rendering properly @lite @pro @explo', async ( ) => {
		// await paymentsPageVendor.vendorDashboardRenderProperly();
		//TODO: payment render properly
	});


	test('vendor can add paypal payment method @lite @pro', async ( ) => {
		await paymentsPageVendor.setBasicPayment({ ...data.vendor.payment, methodName: 'paypal' });
	});

	test('vendor can add bank payment method @lite @pro', async ( ) => {
		await paymentsPageVendor.setBankTransfer(data.vendor.payment);
	});

	test('vendor can add skrill payment method @lite @pro', async ( ) => {
		await paymentsPageVendor.setBasicPayment({ ...data.vendor.payment, methodName: 'skrill' });
	});

	test('vendor can add custom payment method @lite @pro', async ( ) => {
		await paymentsPageVendor.setBasicPayment({ ...data.vendor.payment, methodName: 'custom' });
	});

	test('vendor can disconnect paypal payment method @lite @pro', async ( ) => {
		await paymentsPageVendor.disconnectBasicPayment({ ...data.vendor.payment, methodName: 'paypal' });
	});

	test('vendor can disconnect bank payment method @lite @pro', async ( ) => {
		await paymentsPageVendor.disconnectBasicPayment({ ...data.vendor.payment, methodName: 'bank' });
	});

	test('vendor can disconnect skrill payment method @lite @pro', async ( ) => {
		await paymentsPageVendor.disconnectBasicPayment({ ...data.vendor.payment, methodName: 'skrill' });
	});

	test('vendor can disconnect custom payment method @lite @pro', async ( ) => {
		await paymentsPageVendor.disconnectBasicPayment({ ...data.vendor.payment, methodName: 'custom' });
	});


});
