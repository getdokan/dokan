import { test, Page } from '@playwright/test';
import { LicensePage } from 'pages/licensePage';
import { data } from 'utils/testData';

let licensePage: LicensePage;
let page: Page;

test.beforeAll(async ({ browser }) => {
	const context = await browser.newContext({});
	page = await context.newPage();
	licensePage = new LicensePage(page);
});

test.afterAll(async ( ) => {
	await page.close();
});

test.describe('License test', () => {

	test.use({ storageState: data.auth.adminAuthFile });

	test('dokan license menu page is rendering properly @pro @explo', async ( ) => {
		await licensePage.adminLicenseRenderProperly();
	});

	test.skip('admin can activate license @pro', async ( ) => {
		await licensePage.activateLicense(data.dokanLicense.correctKey);
	});

	test('admin can\'t activate license with incorrect key @pro @neg', async ( ) => {
		await licensePage.activateLicense(data.dokanLicense.incorrectKey, 'incorrect');
	});

});