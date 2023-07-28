import { test, Page } from '@playwright/test';
import { VerificationsPage } from 'pages/verificationsPage';
import { data } from 'utils/testData';


test.describe('Verifications test', () => {

	let admin: VerificationsPage;
	let aPage: Page;


	test.beforeAll(async ({ browser }) => {
		const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
		aPage = await adminContext.newPage();
		admin = new VerificationsPage(aPage);
	});


	test.afterAll(async () => {
		await aPage.close();
	});


	test('admin verifications menu page is rendering properly @pro @explo', async ( ) => {
		await admin.adminVerificationsRenderProperly();
	});

	test.skip('admin can approve ID verification request @pro', async ( ) => {
		await admin.idVerificationRequest(data.predefined.vendorInfo.username, 'approve');
	});

	test.skip('admin can approve address verification request @pro', async ( ) => {
		await admin.addressVerificationRequest(data.predefined.vendorInfo.username, 'approve');
	});

	test.skip('admin can approve company verification request @pro', async ( ) => {
		await admin.companyVerificationRequest(data.predefined.vendorInfo.username, 'approve');
	});

	test.skip('admin can approve phone verification request @pro', async ( ) => {
		// await admin.phoneVerificationRequest(data.predefined.vendorInfo.username,'approve');
	});

});
