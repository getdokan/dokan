import { test, Page } from '@playwright/test';
import { VerificationsPage } from 'pages/verificationsPage';
import { data } from 'utils/testData';


let verificationsPage: VerificationsPage;
let aPage: Page;

test.beforeAll(async ({ browser }) => {
	const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
	aPage = await adminContext.newPage();
	verificationsPage = new VerificationsPage(aPage);
});

test.afterAll(async ( ) => {
	await aPage.close();
});

test.describe('Verifications test', () => {
	//TODO: need multiple verification request via admin


	test('admin verifications menu page is rendering properly @pro @explo', async ( ) => {
		await verificationsPage.adminVerificationsRenderProperly();
	});

	test.skip('admin can approve ID verification request @pro', async ( ) => {
		await verificationsPage.idVerificationRequest(data.predefined.vendorInfo.username, 'approve');
	});

	test.skip('admin can approve address verification request @pro', async ( ) => {
		await verificationsPage.addressVerificationRequest(data.predefined.vendorInfo.username, 'approve');
	});

	test.skip('admin can approve company verification request @pro', async ( ) => {
		await verificationsPage.companyVerificationRequest(data.predefined.vendorInfo.username, 'approve');
	});

	test.skip('admin can approve phone verification request @pro', async ( ) => {
		//TODO: await verificationsPage.phoneVerificationRequest(data.predefined.vendorInfo.username,'approve');
	});

	//TODO: admin can disapprove verification request
	//TODO: add vendor tests

});
