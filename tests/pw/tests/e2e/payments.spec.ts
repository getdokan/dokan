import { test, Page } from '@playwright/test';
import { PaymentsPage } from 'pages/paymentsPage';
// import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';


test.describe('Vendor functionality test', () => {


	// let admin: PaymentsPage;
	let vendor: PaymentsPage;
	let aPage: Page, vPage: Page;
	// let apiUtils: ApiUtils;


	test.beforeAll(async ({ browser, }) => {
		// const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
		// aPage = await adminContext.newPage();
		// admin = new PaymentsPage(aPage);

		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		const vPage = await vendorContext.newPage();
		vendor = new PaymentsPage(vPage);

		// apiUtils = new ApiUtils(request);

	});


	test.afterAll(async () => {
		await aPage.close();
		await vPage.close();
	});


	test('vendor payment menu is rendering properly @lite @pro @explo', async ( ) => {
		await vendor.vendorPaymentSettingsRenderProperly();
	});

	test('vendor can add paypal payment method @lite @pro', async ( ) => {
		await vendor.setBasicPayment({ ...data.vendor.payment, methodName: 'paypal' });
	});

	test('vendor can add bank payment method @lite @pro', async ( ) => {
		await vendor.setBankTransfer(data.vendor.payment);
	});

	test('vendor can add skrill payment method @lite @pro', async ( ) => {
		await vendor.setBasicPayment({ ...data.vendor.payment, methodName: 'skrill' });
	});

	test('vendor can add custom payment method @lite @pro', async ( ) => {
		await vendor.setBasicPayment({ ...data.vendor.payment, methodName: 'custom' });
	});

	test('vendor can disconnect paypal payment method @lite @pro', async ( ) => {
		await vendor.disconnectBasicPayment({ ...data.vendor.payment, methodName: 'paypal' });
	});

	test('vendor can disconnect bank payment method @lite @pro', async ( ) => {
		await vendor.disconnectBasicPayment({ ...data.vendor.payment, methodName: 'bank' });
	});

	test('vendor can disconnect skrill payment method @lite @pro', async ( ) => {
		await vendor.disconnectBasicPayment({ ...data.vendor.payment, methodName: 'skrill' });
	});

	test('vendor can disconnect custom payment method @lite @pro', async ( ) => {
		await vendor.disconnectBasicPayment({ ...data.vendor.payment, methodName: 'custom' });
	});


});
