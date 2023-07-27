import { test, Page } from '@playwright/test';
import { ToolsPage } from 'pages/toolsPage';
import { data } from 'utils/testData';


test.describe('Tools test', () => {

	test.use({ storageState: data.auth.adminAuthFile });


	let admin: ToolsPage;
	let aPage: Page;


	test.beforeAll(async ({ browser }) => {
		const context = await browser.newContext({});
		aPage = await context.newPage();
		admin = new ToolsPage(aPage);
	});


	test.afterAll(async () => {
		await aPage.close();
	});

	test('dokan tools menu page is rendering properly @pro @explo', async ( ) => {
		await admin.adminToolsRenderProperly();
	});

	test('admin can perform dokan page Installation @pro', async ( ) => {
		await admin.dokanPageInstallation();
	});

	test('admin can regenerate order sync table @pro', async ( ) => {
		await admin.regenerateOrderSyncTable();
	});

	test('admin can check for duplicate orders @pro', async ( ) => {
		await admin.checkForDuplicateOrders();
	});

	test('admin can set dokan setup wizard @lite @pro', async ( ) => {
		await admin.setDokanSetupWizard(data.dokanSetupWizard);
	});

	test('admin can regenerate variable product variations author IDs @pro', async ( ) => {
		await admin.regenerateVariableProductVariationsAuthorIds();
	});

	test.skip('admin can import dummy data @pro', async ( ) => {
		await admin.importDummyData();
	});

	test.skip('admin can clear dummy data @pro', async ( ) => {
		await admin.clearDummyData();
	});

	test('admin can test distance matrix API @pro', async ( ) => {
		await admin.testDistanceMatrixApi(data.tools.distanceMatrixApi);
	});

});
