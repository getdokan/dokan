import { test, Page } from '@playwright/test';
import { HelpPage } from 'pages/helpPage';
import { data } from 'utils/testData';


test.describe('Dokan help test', () => {

	test.use({ storageState: data.auth.adminAuthFile });


	let admin: HelpPage;
	let aPage: Page;


	test.beforeAll(async ({ browser }) => {
		const context = await browser.newContext({});
		aPage = await context.newPage();
		admin = new HelpPage(aPage);
	});


	test.afterAll(async () => {
		await aPage.close();
	});

	test('dokan help menu page is rendering properly @lite @pro @explo', async ( ) => {
		await admin.adminHelpRenderProperly();
	});

	test('dokan get help dropdown is rendering properly @lite @pro @explo', async ( ) => {
		await admin.adminGetHelpDropdownRenderProperly();
	});

});
