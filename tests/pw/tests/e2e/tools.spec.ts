import { test, Page } from '@playwright/test';
import { ToolsPage } from 'pages/toolsPage';
import { data } from 'utils/testData';


let toolsPage: ToolsPage;
let page: Page;

test.beforeAll(async ({ browser }) => {
	const context = await browser.newContext({});
	page = await context.newPage();
	toolsPage = new ToolsPage(page);
});

test.afterAll(async ( ) => {
	await page.close();
});

test.describe('Tools test', () => {

	test.use({ storageState: data.auth.adminAuthFile });

	test('dokan tools menu page is rendering properly @pro @explo', async ( ) => {
		await toolsPage.adminToolsRenderProperly();
	});

	test('admin can perform dokan page Installation @pro', async ( ) => {
		await toolsPage.dokanPageInstallation();
	});

	test('admin can regenerate order sync table @pro', async ( ) => {
		await toolsPage.regenerateOrderSyncTable();
	});

	test('admin can check for duplicate orders @pro', async ( ) => {
		await toolsPage.checkForDuplicateOrders();
	});

	test('admin can set dokan setup wizard @lite @pro', async ( ) => {
		await toolsPage.setDokanSetupWizard(data.dokanSetupWizard);
	});

	test('admin can regenerate variable product variations author IDs @pro', async ( ) => {
		await toolsPage.regenerateVariableProductVariationsAuthorIds();
	});

	test.skip('admin can import dummy data @pro', async ( ) => {
		await toolsPage.importDummyData();
	});

	test.skip('admin can clear dummy data @pro', async ( ) => {
		await toolsPage.clearDummyData();
	});

	test('admin can test distance matrix API @pro', async ( ) => {
		await toolsPage.testDistanceMatrixApi(data.tools.distanceMatrixApi);
	});

});
