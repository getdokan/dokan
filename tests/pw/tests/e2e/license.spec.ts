import { test, Page } from '@playwright/test';
import { LicensePage } from 'pages/licensePage';
import { data } from 'utils/testData';


test.describe('License test', () => {

	test.use({ storageState: data.auth.adminAuthFile });

	let admin: LicensePage;
	let aPage: Page;


	test.beforeAll(async ({ browser }) => {
		const context = await browser.newContext({});
		aPage = await context.newPage();
		admin = new LicensePage(aPage);
	});


	test.afterAll(async () => {
		await aPage.close();
	});


	test('dokan license menu page is rendering properly @pro @explo', async ( ) => {
		await admin.adminLicenseRenderProperly();
	});

	// test.skip('admin can activate license @pro', async ( ) => {
	// 	await admin.activateLicense(data.dokanLicense.correctKey);
	// });

	test('admin can\'t activate license with incorrect key @pro @neg', async ( ) => {
		await admin.activateLicense(data.dokanLicense.incorrectKey, 'incorrect');
	});

});