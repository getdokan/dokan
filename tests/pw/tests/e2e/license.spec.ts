import { test, } from '@playwright/test';
import { LicensePage } from 'pages/licensePage';
import { data } from 'utils/testData';

let admin: LicensePage;


test.beforeAll(async ({ browser }) => {
	const context = await browser.newContext({});
	const page = await context.newPage();
	admin = new LicensePage(page);
});


test.afterAll(async ({ browser }) => {
	await browser.close();
});


test.describe('License test', () => {

	test.use({ storageState: data.auth.adminAuthFile });

	test('dokan license menu page is rendering properly @pro @explo', async ( ) => {
		await admin.adminLicenseRenderProperly();
	});

	test.skip('admin can activate license @pro', async ( ) => {
		await admin.activateLicense(data.dokanLicense.correctKey);
	});

	test('admin can\'t activate license with incorrect key @pro @neg', async ( ) => {
		await admin.activateLicense(data.dokanLicense.incorrectKey, 'incorrect');
	});

});