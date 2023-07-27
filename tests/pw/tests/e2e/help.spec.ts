import { test } from '@playwright/test';
import { HelpPage } from 'pages/helpPage';
import { data } from 'utils/testData';


let admin: HelpPage;


test.beforeAll(async ({ browser }) => {
	const context = await browser.newContext({});
	const page = await context.newPage();
	admin = new HelpPage(page);
});


test.afterAll(async ({ browser }) => {
	await browser.close();
});


test.describe('Dokan help test', () => {

	test.use({ storageState: data.auth.adminAuthFile });

	test('dokan help menu page is rendering properly @lite @pro @explo', async ( ) => {
		await admin.adminHelpRenderProperly();
	});

	test('dokan get help dropdown is rendering properly @lite @pro @explo', async ( ) => {
		await admin.adminGetHelpDropdownRenderProperly();
	});

});
