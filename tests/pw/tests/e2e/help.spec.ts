import { test, Page } from '@playwright/test';
import { HelpPage } from 'pages/helpPage';
import { data } from 'utils/testData';


let helpPage: HelpPage;
let page: Page;

test.beforeAll(async ({ browser }) => {
	const context = await browser.newContext({});
	page = await context.newPage();
	helpPage = new HelpPage(page);
});

test.afterAll(async ( ) => {
	await page.close();
});

test.describe('Dokan help test', () => {

	test.use({ storageState: data.auth.adminAuthFile });

	test('dokan help menu page is rendering properly @lite @pro @explo', async ( ) => {
		await helpPage.adminHelpRenderProperly();
	});

	test('dokan get help dropdown is rendering properly @lite @pro @explo', async ( ) => {
		await helpPage.adminGetHelpDropdownRenderProperly();
	});

});
