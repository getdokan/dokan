import { test, expect  } from '@playwright/test';
import { dbUtils } from '../utils/dbUtils';
import { dbData } from '../utils/dbdata';
import { serialize, unserialize } from 'php-serialize';

test.describe('test site', ()=> {

	test.only('save admin settings', async ()=> {
		// const query4 = `Select option_value FROM dok_options WHERE option_name = 'dokan_general' ;`;
		// const res = await dbUtils.dbQuery(query4);
		// await dbUtils.getDokanSettings(dbData.dokan.optionName.general);
		// const res = await dbUtils.getDokanSettings(dbData.dokan.optionName.general);
		// console.log(res);
		const res = await dbUtils.setDokanSettings(dbData.dokan.optionName.general, dbData.dokan.generalSettings);
		console.log(res);
		// expect(res).not.toHaveProperty('errno');
	});


	test('set dokan general settings @lite @pro', async ()=> {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.general, dbData.dokan.generalSettings);
	});

	test('admin set dokan selling settings @lite @pro', async ()=> {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
	});

	test('admin set dokan withdraw settings @lite @pro', async ()=> {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.withdraw, dbData.dokan.withdrawSettings);
	});

	test('admin set dokan reverse withdraw settings @lite @pro', async ()=> {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.reverseWithdraw, dbData.dokan.reverseWithdrawSettings);
	});

	test('admin set dokan page settings @lite @pro', async ()=> {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.page, dbData.dokan.pageSettings);
	});

	test('admin set dokan appearance settings @lite @pro', async ()=> {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.appearance, dbData.dokan.appearanceSettings);
	});

	test('admin set dokan privacy policy settings @lite @pro', async ()=> {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.privacyPolicy, dbData.dokan.privacyPolicySettings);
	});
	test('admin set dokan color settings @pro', async ()=> {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.colors, dbData.dokan.colorsSettings);
	});

	test('admin set dokan store support settings @pro', async ()=> {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.storeSupport, dbData.dokan.storeSupportSettings);
	});

	test('admin set dokan rma settings @pro', async ()=> {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.rma, dbData.dokan.rmaSettings);
	});

	test('admin set dokan wholesale settings @pro', async ()=> {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.wholesale, dbData.dokan.wholesaleSettings);
	});

	// test('admin set dokan eu compliance settings @pro', async ()=> {
	// 	await dbUtils.setDokanSettings()
	// });

	test('admin set dokan delivery time settings @pro', async ()=> {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.deliveryTime, dbData.dokan.deliveryTimeSettings);
	});

	test('admin set dokan product advertising settings @pro', async ()=> {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.productAdvertising, dbData.dokan.productAdvertisingSettings);
	});

	test('admin set dokan geolocation settings @pro', async ()=> {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.geolocation, dbData.dokan.geolocationSettings);
	});

	test('admin set dokan product report abuse settings @pro', async ()=> {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.productReportAbuse, dbData.dokan.productReportAbuseSettings);
	});

	test('admin set dokan spmv settings @pro', async ()=> {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.spmv, dbData.dokan.spmvSettings);
	});

	test('admin set dokan vendor subscription settings @pro', async ()=> {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.vendorSubscription, dbData.dokan.vendorSubscriptionSettings);
	});


});