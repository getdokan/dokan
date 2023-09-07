import { test, Page } from '@playwright/test';
import { vendorVerificationsPage } from 'pages/vendorVerificationsPage';
import { data } from 'utils/testData';


test.describe('Verifications test', () => {

	let admin: vendorVerificationsPage;
	let vendor: vendorVerificationsPage;
	let aPage: Page, vPage: Page;


	test.beforeAll(async ({ browser }) => {
		const adminContext = await browser.newContext(data.auth.adminAuth);
		aPage = await adminContext.newPage();
		admin = new vendorVerificationsPage(aPage);

		const vendorContext = await browser.newContext(data.auth.vendorAuth);
		vPage = await vendorContext.newPage();
		vendor = new vendorVerificationsPage(vPage);


	});


	test.afterAll(async () => {
		await aPage.close();
		await vPage.close();
	});


	// vendor

	test('vendor verifications settings menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorVerificationsSettingsRenderProperly();
	});

	test('vendor can send id verification request @pro', async ( ) => {
		await vendor.sendIdVerificationRequest(data.vendor.verification);
	});

	test('vendor can send address verification request @pro', async ( ) => {
		await vendor.sendAddressVerificationRequest(data.vendor.verification);
	});

	test('vendor can send company verification request @pro', async ( ) => {
		await vendor.sendCompanyVerificationRequest(data.vendor.verification);
	});

	//todo: remove dependency: admin tests depends on vendor tests

	test('admin verifications menu page is rendering properly @pro @explo', async ( ) => {
		await admin.adminVerificationsRenderProperly();
	});

	// test('admin can approve ID verification request @pro', async ( ) => {
	// 	await admin.approveVerificationRequest(data.predefined.vendorInfo.username, 'id', 'approve');
	// });

	// test('admin can approve address verification request @pro', async ( ) => {
	// 	await admin.approveVerificationRequest(data.predefined.vendorInfo.username, 'address', 'approve');
	// });

	// test('admin can approve company verification request @pro', async ( ) => {
	// 	await admin.approveVerificationRequest(data.predefined.vendorInfo.username, 'company', 'approve');
	// });

	//todo: admin can reject requests

	// test('admin can disapprove approved ID verification request @pro', async ( ) => {
	// 	await admin.disapproveVerificationRequest(data.predefined.vendorInfo.username, 'id');
	// });

	// test('admin can disapprove approved address verification request @pro', async ( ) => {
	// 	await admin.disapproveVerificationRequest(data.predefined.vendorInfo.username, 'address');
	// });

	// test('admin can disapprove approved company verification request @pro', async ( ) => {
	// 	await admin.disapproveVerificationRequest(data.predefined.vendorInfo.username, 'company');
	// });


});
