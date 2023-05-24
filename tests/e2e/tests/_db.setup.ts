import { test, expect  } from '@playwright/test';
import { dbUtils } from '../utils/dbUtils';
import { dbData } from '../utils/dbdata';
import { serialize, unserialize } from 'php-serialize';

test.describe('test site', ()=> {

	test.only('save admin settings', async ()=> {
		// const query4 = `Select option_value FROM dok_options WHERE option_name = 'dokan_general' ;`;
		// const res = await dbUtils.dbQuery(query4);
		await dbUtils.getDokanSettings(dbData.dokan.optionName.general);
		// const res = await dbUtils.getDokanSettings(dbData.dokan.optionName.general);
		// console.log(res);
		// expect(res).not.toHaveProperty('errno');
	});


	test('set dokan general settings @lite @pro', async ()=> {
		await dbUtils.setDokanGeneralSettings();
	});

	test('admin set dokan selling settings @lite @pro', async ()=> {
		await dbUtils.setDokanSellingSettings();
	});

	test('admin set dokan withdraw settings @lite @pro', async ()=> {
		await dbUtils.setDokanWithdrawSettings();
	});

	test('admin set dokan reverse withdraw settings @lite @pro', async ()=> {
		await dbUtils.setDokanReverseWithdrawSettings();
	});

	test('admin set dokan page settings @lite @pro', async ()=> {
		await dbUtils.setDokanPageSettings();
	});

	test('admin set dokan appearance settings @lite @pro', async ()=> {
		await dbUtils.setDokanAppearanceSettings();
	});

	test('admin set dokan privacy policy settings @lite @pro', async ()=> {
		await dbUtils.setDokanPrivacyPolicySettings();
	});
	test('admin set dokan color settings @pro', async ()=> {
		await dbUtils.setDokanColorsSettings();
	});

	test('admin set dokan store support settings @pro', async ()=> {
		await dbUtils.setDokanStoreSupportSettings();
	});

	test('admin set dokan rma settings @pro', async ()=> {
		await dbUtils.setDokanRmaSettings();
	});

	test('admin set dokan wholesale settings @pro', async ()=> {
		await dbUtils.setDokanWholeSaleSettings();
	});

	// test('admin set dokan eu compliance settings @pro', async ()=> {
	// 	await dbUtils.
	// });

	test('admin set dokan delivery time settings @pro', async ()=> {
		await dbUtils.setDokanDeliveryTimeSettings();
	});

	test('admin set dokan product advertising settings @pro', async ()=> {
		await dbUtils.setDokanProductAdvertisingSettings();
	});

	test('admin set dokan geolocation settings @pro', async ()=> {
		await dbUtils.setDokanGeolocationSettings();
	});

	test('admin set dokan product report abuse settings @pro', async ()=> {
		await dbUtils.setDokanProductReportAbuseSettings();
	});

	test('admin set dokan spmv settings @pro', async ()=> {
		await dbUtils.setDokanSpmvSettings();
	});

	test('admin set dokan vendor subscription settings @pro', async ()=> {
		await dbUtils.setDokanVendorSubscriptionSettings();
	});


});