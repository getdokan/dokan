import { test, Page } from '@playwright/test';
import { WithdrawsPage } from 'pages/withdrawsPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


test.describe('Withdraw test', () => {

	let withdrawsPage: WithdrawsPage;
	let aPage: Page;
	let apiUtils: ApiUtils;
	let minimumWithdrawLimit: string;

	test.beforeAll(async ({ browser, request }) => {
		const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
		aPage = await adminContext.newPage();
		withdrawsPage = new WithdrawsPage(aPage);
		apiUtils = new ApiUtils(request);
		minimumWithdrawLimit = await apiUtils.getMinimumWithdrawLimit( payloads.adminAuth);
		await apiUtils.createOrderWithStatus(payloads.createProduct(), { ...payloads.createOrder, line_items: [{ quantity: 10 }] }, 'wc-completed', payloads.vendorAuth);
		await apiUtils.createWithdraw({ ...payloads.createWithdraw, amount: minimumWithdrawLimit }, payloads.vendorAuth);
	});

	test.afterAll(async ( ) => {
		await aPage.close();
	});

	// test.use({ storageState: data.auth.adminAuthFile });

	test('admin withdraw menu page is rendering properly @lite @pro @explo', async ( ) => {
		await withdrawsPage.adminWithdrawsRenderProperly();
	});

	test('admin can filter withdraws by vendor @lite @pro', async ( ) => {
		await withdrawsPage.filterWithdraws(data.predefined.vendorStores.vendor1);
	});

	test('admin can add note to withdraw request @lite @pro', async ( ) => {
		await withdrawsPage.addNoteWithdrawRequest(data.predefined.vendorStores.vendor1, 'test withdraw note');
	});

	test('admin can approve withdraw request @lite @pro', async ( ) => {
		await withdrawsPage.updateWithdrawRequest(data.predefined.vendorStores.vendor1, 'approve');
	});

	test('admin can cancel withdraw request @lite @pro', async ( ) => {
		await apiUtils.createWithdraw({ ...payloads.createWithdraw, amount: minimumWithdrawLimit }, payloads.vendorAuth);
		await withdrawsPage.updateWithdrawRequest(data.predefined.vendorStores.vendor1, 'cancel');
	});

	test('admin can delete withdraw request @lite @pro', async ( ) => {
		await apiUtils.createWithdraw({ ...payloads.createWithdraw, amount: minimumWithdrawLimit }, payloads.vendorAuth);
		await withdrawsPage.updateWithdrawRequest(data.predefined.vendorStores.vendor1, 'delete');
	});

	test('admin can perform withdraw bulk actions @lite @pro', async ( ) => {
		await apiUtils.createWithdraw({ ...payloads.createWithdraw, amount: minimumWithdrawLimit }, payloads.vendorAuth);
		await withdrawsPage.withdrawBulkAction('cancelled');
	});

	//TODO: add vendor tests
});
