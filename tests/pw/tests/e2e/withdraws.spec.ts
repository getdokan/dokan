import { test, Page } from '@playwright/test';
import { WithdrawsPage } from 'pages/withdrawsPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


test.describe('Withdraw test', () => {

	let withdrawsPageAdmin: WithdrawsPage;
	let withdrawsPageVendor: WithdrawsPage;
	let aPage: Page, vPage: Page;
	let apiUtils: ApiUtils;
	let currentBalance: string;
	let minimumWithdrawLimit: string;

	test.beforeAll(async ({ browser, request }) => {
		const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
		aPage = await adminContext.newPage();
		withdrawsPageAdmin = new WithdrawsPage(aPage);

		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		withdrawsPageVendor = new WithdrawsPage(vPage);

		apiUtils = new ApiUtils(request);
		[currentBalance, minimumWithdrawLimit] = await apiUtils.getMinimumWithdrawLimit( payloads.vendorAuth);
		await apiUtils.createOrderWithStatus(payloads.createProduct(), { ...payloads.createOrder, line_items: [{ quantity: 10 }] }, 'wc-completed', payloads.vendorAuth);
		await apiUtils.createWithdraw({ ...payloads.createWithdraw, amount: minimumWithdrawLimit }, payloads.vendorAuth);
	});

	test.afterAll(async ( ) => {
		await aPage.close();
		await vPage.close();
	});


	test('admin withdraw menu page is rendering properly @lite @pro @explo', async ( ) => {
		await withdrawsPageAdmin.adminWithdrawsRenderProperly();
	});

	test('admin can filter withdraws by vendor @lite @pro', async ( ) => {
		await withdrawsPageAdmin.filterWithdraws(data.predefined.vendorStores.vendor1);
	});

	test('admin can add note to withdraw request @lite @pro', async ( ) => {
		await withdrawsPageAdmin.addNoteWithdrawRequest(data.predefined.vendorStores.vendor1, 'test withdraw note');
	});

	test('admin can approve withdraw request @lite @pro', async ( ) => {
		await withdrawsPageAdmin.updateWithdrawRequest(data.predefined.vendorStores.vendor1, 'approve');
	});

	test('admin can cancel withdraw request @lite @pro', async ( ) => {
		await apiUtils.createWithdraw({ ...payloads.createWithdraw, amount: minimumWithdrawLimit }, payloads.vendorAuth);
		await withdrawsPageAdmin.updateWithdrawRequest(data.predefined.vendorStores.vendor1, 'cancel');
	});

	test('admin can delete withdraw request @lite @pro', async ( ) => {
		await apiUtils.createWithdraw({ ...payloads.createWithdraw, amount: minimumWithdrawLimit }, payloads.vendorAuth);
		await withdrawsPageAdmin.updateWithdrawRequest(data.predefined.vendorStores.vendor1, 'delete');
	});

	test('admin can perform withdraw bulk actions @lite @pro', async ( ) => {
		await apiUtils.createWithdraw({ ...payloads.createWithdraw, amount: minimumWithdrawLimit }, payloads.vendorAuth);
		await withdrawsPageAdmin.withdrawBulkAction('cancelled');
	});


	// vendor

	test('vendor withdraw menu page is rendering properly @lite @pro @explo', async ( ) => {
		await withdrawsPageVendor.vendorWithdrawRenderProperly();
	});

	test('vendor withdraw requests page is rendering properly @lite @pro @explo', async ( ) => {
		await withdrawsPageVendor.vendorWithdrawRequestsRenderProperly();
	});

	test('vendor can request withdraw @lite @pro', async ( ) => {
		await apiUtils.cancelWithdraw('', payloads.vendorAuth);
		await withdrawsPageVendor.requestWithdraw({ ...data.vendor.withdraw, minimumWithdrawAmount: minimumWithdrawLimit, currentBalance: currentBalance });
	});

	test('vendor can\'t request withdraw when pending request exits @lite @pro', async ( ) => {
		await apiUtils.createWithdraw({ ...payloads.createWithdraw, amount: minimumWithdrawLimit }, payloads.vendorAuth);
		await withdrawsPageVendor.cantRequestWithdraw();
	});

	test('vendor can cancel request withdraw @lite @pro', async ( ) => {
		await apiUtils.createWithdraw({ ...payloads.createWithdraw, amount: minimumWithdrawLimit }, payloads.vendorAuth);
		await withdrawsPageVendor.cancelWithdrawRequest();
	});

	test.only('vendor can add auto withdraw disbursement schedule @pro', async ( ) => {
		await withdrawsPageVendor.addAutoWithdrawDisbursementSchedule({ ...data.vendor.withdraw, minimumWithdrawAmount: minimumWithdrawLimit });
	});

	test('vendor can add default withdraw payment methods @lite @pro', async ( ) => {
		await withdrawsPageVendor.addDefaultWithdrawPaymentMethods(data.vendor.withdraw.defaultWithdrawMethod.bankTransfer);
		// Cleanup
		await withdrawsPageVendor.addDefaultWithdrawPaymentMethods(data.vendor.withdraw.defaultWithdrawMethod.paypal);
	});

});
