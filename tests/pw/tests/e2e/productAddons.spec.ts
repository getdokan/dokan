import { test, Page } from '@playwright/test';
import { ProductAddonsPage } from 'pages/productAddonsPage';
import { data } from 'utils/testData';


test.describe('Product addon functionality test', () => {


	let vendor: ProductAddonsPage;
	let vPage: Page;
	let addonName: string;
	let addonFieldTitle: string;


	test.beforeAll(async ({ browser }) => {
		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		vendor = new ProductAddonsPage(vPage);

		addonName = data.vendor.addon.randomName();
		addonFieldTitle = data.vendor.addon.randomTitle();
		await vendor.addAddon({ ...data.vendor.addon, name: addonName, titleRequired: addonFieldTitle });
	});


	test.afterAll(async () => {
		await vPage.close();
	});

	test('vendor product addons menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorProductAddonsSettingsRenderProperly();
	});

	test('vendor can add addons @pro', async ( ) => {
		await vendor.addAddon({ ...data.vendor.addon, name: data.vendor.addon.randomName() });
	});

	test('vendor can edit addon @pro', async ( ) => {

		await vendor.editAddon({ ...data.vendor.addon, name: addonName, titleRequired: addonFieldTitle });
	});

	test('vendor can delete addon @pro', async ( ) => {
		await vendor.deleteAddon({ ...data.vendor.addon, name: addonName });
	});


});
