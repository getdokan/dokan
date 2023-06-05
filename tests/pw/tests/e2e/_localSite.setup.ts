import { test  } from '@playwright/test';
import { data } from '../../utils/testData';
import { LoginPage } from '../../pages/loginPage';
import { AdminPage } from '../../pages/adminPage';
import { ApiUtils } from '../../utils/apiUtils';
import { apiEndpoints } from '../../utils/apiEndPoints';
import { payloads } from '../../utils/payloads';
import { dbUtils } from '../../utils/dbUtils';
import { dbData } from '../../utils/dbData';


test.describe('setup local site', () => {

	// test('download wordpress to desired folder', async ({ page }) => {
	// 	//TODO: create everything using bash script if needed
	// 	//TODO: get desired folder path
	// 	//TODO: download wordpress zip and unzip it
	// 	//TODO: clone desired plugins to wp-plugings
	// 	//TODO:
	// 	//TODO:
	// 	//TODO:

	// });

	// test.only('delete database or all tables ', async ({ page }) => {
	//  });


	test('admin setup WP', async ({ page }) => {
		const loginPage = new LoginPage(page);
		const adminPage = new AdminPage(page);
		await adminPage.setupWp();
		await loginPage.adminLogin(data.admin);
		await adminPage.setPermalinkSettings(data.wpSettings.permalink);
	});

	test.only('set site permalink', async ({ request }) => {
		const apiUtils = new ApiUtils(request);

		const l = await apiUtils.getAllPlugins(payloads.adminAuth);
		console.log(l);
	});

	test.only('activate plugins & modules', async () => {
		await dbUtils.UpdateWpOptionTable(dbData.optionName.activePlugins, dbData.plugins);
		// await dbUtils.UpdateWpOptionTable(dbData.dokan.optionName.dokanActiveModules, dbData.dokan.modules);
	});


	// test.only('admin activate all plugins', async ({ request }) => {
	// 	//TODO: need to activate basic_auth via db first
	// 	const apiUtils = new ApiUtils(request);
	// 	const res =await apiUtils.getAllPlugins(payloads.adminAuth);
	// 	console.log(res);
	// });


});