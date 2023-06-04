import { test  } from '@playwright/test';
import { data } from '../../utils/testData';
import { LoginPage } from '../../pages/loginPage';
import { AdminPage } from '../../pages/adminPage';
import { ApiUtils } from '../../utils/apiUtils';
import { apiEndpoints } from '../../utils/apiEndPoints';
import { payloads } from '../../utils/payloads';

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


	test.only('admin setup WP', async ({ page }) => {
		const loginPage = new LoginPage(page);
		const adminPage = new AdminPage(page);
		await adminPage.setupWp();
		await loginPage.adminLogin(data.admin);
	});

	// test.only('admin activate all plugins', async ({ request }) => {
	// 	//TODO: need to activate basic_auth via db first
	// 	const apiUtils = new ApiUtils(request);
	// 	const res =await apiUtils.getAllPlugins(payloads.adminAuth);
	// 	console.log(res);
	// });


});