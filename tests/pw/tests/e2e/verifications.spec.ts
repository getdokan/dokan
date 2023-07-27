import { test } from '@playwright/test';
import { VerificationsPage } from 'pages/verificationsPage';
import { data } from 'utils/testData';


let admin: VerificationsPage;


test.beforeAll(async ({ browser }) => {
	const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
	const aPage = await adminContext.newPage();
	admin = new VerificationsPage(aPage);
});


test.afterAll(async ({ browser }) => {
	await browser.close();
});


test.describe('Verifications test', () => {
	//TODO: need multiple verification request via admin


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
		//TODO: await admin.phoneVerificationRequest(data.predefined.vendorInfo.username,'approve');
	});

	//TODO: admin can disapprove verification request
	//TODO: add vendor tests

});
