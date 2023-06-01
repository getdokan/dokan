import { test as setup, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';
import { dbUtils } from '../utils/dbUtils';
import { dbData } from '../utils/dbData';

let apiUtils: ApiUtils;

setup.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
});

setup.describe(' api test', () => {

	// //TODO: remove this after : replacing admin as vendor
	// setup('setup store settings @lite @pro', async ({ request }) => {
	// 	const response = await request.put(endPoints.updateSettings, { data: payloads.setupStore });
	// 	const responseBody = await apiUtils.getResponseBody(response);
	// 	expect(response.ok()).toBeTruthy();
	// });

	setup('create customer @lite @pro', async ({ request }) => { 
		const apiUtils = new ApiUtils(request);
		let [, customerId] = await apiUtils.createCustomer (payloads.createCustomer1 , payloads.adminAuth);
		process.env.customerId = customerId;
	});

	setup('create vendor @lite @pro', async ({ request }) => {
		const apiUtils = new ApiUtils(request);
		let [, sellerId] = await apiUtils.createStore (payloads.createStore1 , payloads.adminAuth);
		process.env.vendorId = sellerId;
	});

	// setup('set dokan general settings @lite @pro', async () => {
	// 	await dbUtils.setDokanSettings(dbData.dokan.optionName.general, {...dbData.dokan.generalSettings, store_category_type: 'single'});
	// });

	// setup('admin set dokan selling settings @lite @pro', async () => {
	// 	await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
	// });

	// setup('admin set dokan reverse withdraw settings @lite @pro', async () => {
	// 	await dbUtils.setDokanSettings(dbData.dokan.optionName.reverseWithdraw, dbData.dokan.reverseWithdrawSettings);
	// });

});
