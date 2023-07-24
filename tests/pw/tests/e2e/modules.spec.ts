import { test, Page } from '@playwright/test';
import { ModulesPage } from 'pages/modulesPage';
import { data } from 'utils/testData';


let modulesPage: ModulesPage;
let page: Page;

test.beforeAll(async ({ browser }) => {
	const context = await browser.newContext({});
	page = await context.newPage();
	modulesPage = new ModulesPage(page);
});

test.afterAll(async ( ) => {
	await page.close();
});

test.describe('Modules test', () => {

	test.use({ storageState: data.auth.adminAuthFile });

	test('dokan modules menu page is rendering properly @pro @explo', async ( ) => {
		await modulesPage.adminModulesRenderProperly();
	});

	test('admin can search module @pro', async ( ) => {
		await modulesPage.searchModule(data.modules.modulesName.AuctionIntegration);
	});

	test('admin can filter modules by category @pro', async ( ) => {
		await modulesPage.filterModules(data.modules.moduleCategory.productManagement);
	});

	test('admin can deactivate module @pro', async ( ) => {
		await modulesPage.activateDeactivateModule(data.modules.modulesName.AuctionIntegration);
	});

	test('admin can activate module @pro', async ( ) => {
		await modulesPage.activateDeactivateModule(data.modules.modulesName.AuctionIntegration);
	});

	test('admin can perform module bulk action @pro', async ( ) => {
		await modulesPage.moduleBulkAction('activate');
	});

	test('admin can change module view layout @pro', async ( ) => {
		await modulesPage.moduleViewLayout(data.modules.layout.list);
	});


});
