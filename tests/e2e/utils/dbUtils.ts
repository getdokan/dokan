import { expect } from '@playwright/test';
import { MySqlConnection, DbContext } from 'mysqlconnector';
import { serialize, unserialize } from 'php-serialize';
import { dbData } from './dbdata';

const dbPrefix = process.env.DB_PREFIX;

const mySql =  new MySqlConnection({
	hostname: process.env.HOST_NAME,
	username: process.env.USER_NAME,
	password: process.env.PASSWORD,
	db: process.env.Database,
	port: Number(process.env.DB_PORT)
});


export const dbUtils = {

	async dbQuery(query: string) {
		const dbContext: DbContext = new DbContext(mySql);
		return await dbContext.inTransactionAsync(async (dbContext) => {
			try{
				const result = await dbContext.executeAsync(query);
				return result;
				// return JSON.parse(JSON.stringify(result));
			}
			catch(err: unknown){
				console.log('dbError:', err);
				return err;
			}
		});
	},

	// get dokan settings
	async getDokanSettings(optionName: string){
		const querySelect = `Select option_value FROM ${dbPrefix}_options WHERE option_name = '${optionName}';`;
		const res = await dbUtils.dbQuery(querySelect);
		// console.log(res);
		console.log(unserialize(res[0]));
		expect(res).not.toHaveProperty('errno');
		// console.log(unserialize(res[0]));
		// return unserialize(res[0]);
	},

	// get dokan settings
	async setDokanSettings(optionName: string, optionValue: object ){
		const queryInsert = `INSERT INTO ${dbPrefix}_options VALUES ( NULL, '${optionName}', '${serialize(optionValue)}', 'yes');`;
		const queryUpdate = `UPDATE ${dbPrefix}_options SET option_value = '${serialize(optionValue)}' WHERE option_name = '${optionName}';`;
		let res = await dbUtils.dbQuery(queryInsert);
		if (res.code === 'ER_DUP_ENTRY') {
			res = await dbUtils.dbQuery(queryUpdate);
		}
		expect(res).not.toHaveProperty('errno');
	},


	// dokan general settings
	async setDokanGeneralSettings(){
		const queryInsert = `INSERT INTO ${dbPrefix}_options VALUES ( NULL, 'dokan_general', '${serialize(dbData.generalSettings)}', 'yes');`;
		const queryUpdate = `UPDATE ${dbPrefix}_options SET option_value = '${serialize(dbData.generalSettings)}' WHERE option_name = 'dokan_general';`;
		let res = await dbUtils.dbQuery(queryInsert);
		if (res.code === 'ER_DUP_ENTRY') {
			res = await dbUtils.dbQuery(queryUpdate);
		}
		expect(res).not.toHaveProperty('errno');
	},

	// dokan selling settings
	async setDokanSellingSettings(){
		const queryInsert = `INSERT INTO ${dbPrefix}_options VALUES ( NULL, 'dokan_selling', '${serialize(dbData.sellingSettings)}', 'yes');`;
		const queryUpdate = `UPDATE ${dbPrefix}_options SET option_value = '${serialize(dbData.sellingSettings)}' WHERE option_name = 'dokan_selling';`;
		let res = await dbUtils.dbQuery(queryInsert);
		if (res.code === 'ER_DUP_ENTRY') {
			res = await dbUtils.dbQuery(queryUpdate);
		}
		expect(res).not.toHaveProperty('errno');
	},

	// dokan withdraw settings
	async setDokanWithdrawSettings(){
		const queryInsert = `INSERT INTO ${dbPrefix}_options VALUES ( NULL, 'dokan_withdraw', '${serialize(dbData.withdrawSettings)}', 'yes');`;
		const queryUpdate = `UPDATE ${dbPrefix}_options SET option_value = '${serialize(dbData.withdrawSettings)}' WHERE option_name = 'dokan_withdraw';`;
		let res = await dbUtils.dbQuery(queryInsert);
		if (res.code === 'ER_DUP_ENTRY') {
			res = await dbUtils.dbQuery(queryUpdate);
		}
		expect(res).not.toHaveProperty('errno');
	},

	// dokan reverse withdraw settings
	async setDokanReverseWithdrawSettings(){
		const queryInsert = `INSERT INTO ${dbPrefix}_options VALUES ( NULL, 'dokan_reverse_withdrawal', '${serialize(dbData.reverseWithdrawSettings)}', 'yes');`;
		const queryUpdate = `UPDATE ${dbPrefix}_options SET option_value = '${serialize(dbData.reverseWithdrawSettings)}' WHERE option_name = 'dokan_reverse_withdrawal';`;
		let res = await dbUtils.dbQuery(queryInsert);
		if (res.code === 'ER_DUP_ENTRY') {
			res = await dbUtils.dbQuery(queryUpdate);
		}
		expect(res).not.toHaveProperty('errno');
	},

	// dokan page settings
	async setDokanPageSettings(){
		const queryInsert = `INSERT INTO ${dbPrefix}_options VALUES ( NULL, 'dokan_pages', '${serialize(dbData.pageSettings)}', 'yes');`;
		const queryUpdate = `UPDATE ${dbPrefix}_options SET option_value = '${serialize(dbData.pageSettings)}' WHERE option_name = 'dokan_pages';`;
		let res = await dbUtils.dbQuery(queryInsert);
		if (res.code === 'ER_DUP_ENTRY') {
			res = await dbUtils.dbQuery(queryUpdate);
		}
		expect(res).not.toHaveProperty('errno');
	},

	// dokan appearance settings
	async setDokanAppearanceSettings(){
		const queryInsert = `INSERT INTO ${dbPrefix}_options VALUES ( NULL, 'dokan_appearance', '${serialize(dbData.appearanceSettings)}', 'yes');`;
		const queryUpdate = `UPDATE ${dbPrefix}_options SET option_value = '${serialize(dbData.appearanceSettings)}' WHERE option_name = 'dokan_appearance';`;
		let res = await dbUtils.dbQuery(queryInsert);
		if (res.code === 'ER_DUP_ENTRY') {
			res = await dbUtils.dbQuery(queryUpdate);
		}
		expect(res).not.toHaveProperty('errno');
	},

	// dokan privaacy policy settings
	async setDokanPrivacyPolicySettings(){
		const queryInsert = `INSERT INTO ${dbPrefix}_options VALUES ( NULL, 'dokan_privacy', '${serialize(dbData.privacyPolicySettings)}', 'yes');`;
		const queryUpdate = `UPDATE ${dbPrefix}_options SET option_value = '${serialize(dbData.privacyPolicySettings)}' WHERE option_name = 'dokan_privacy';`;
		let res = await dbUtils.dbQuery(queryInsert);
		if (res.code === 'ER_DUP_ENTRY') {
			res = await dbUtils.dbQuery(queryUpdate);
		}
		expect(res).not.toHaveProperty('errno');
	},

	// dokan colors settings
	async setDokanColorsSettings(){
		const queryInsert = `INSERT INTO ${dbPrefix}_options VALUES ( NULL, 'dokan_colors', '${serialize(dbData.colorsSettings)}', 'yes');`;
		const queryUpdate = `UPDATE ${dbPrefix}_options SET option_value = '${serialize(dbData.colorsSettings)}' WHERE option_name = 'dokan_colors';`;
		let res = await dbUtils.dbQuery(queryInsert);
		if (res.code === 'ER_DUP_ENTRY') {
			res = await dbUtils.dbQuery(queryUpdate);
		}
		expect(res).not.toHaveProperty('errno');
	},

	// dokan store suppport settings
	async setDokanStoreSupportSettings(){
		const queryInsert = `INSERT INTO ${dbPrefix}_options VALUES ( NULL, 'dokan_store_support_setting', '${serialize(dbData.storeSupportSettings)}', 'yes');`;
		const queryUpdate = `UPDATE ${dbPrefix}_options SET option_value = '${serialize(dbData.storeSupportSettings)}' WHERE option_name = 'dokan_store_support_setting';`;
		let res = await dbUtils.dbQuery(queryInsert);
		if (res.code === 'ER_DUP_ENTRY') {
			res = await dbUtils.dbQuery(queryUpdate);
		}
		expect(res).not.toHaveProperty('errno');
	},

	// dokan rma settings
	async setDokanRmaSettings(){
		const queryInsert = `INSERT INTO ${dbPrefix}_options VALUES ( NULL, 'dokan_rma', '${serialize(dbData.rmaSettings)}', 'yes');`;
		const queryUpdate = `UPDATE ${dbPrefix}_options SET option_value = '${serialize(dbData.rmaSettings)}' WHERE option_name = 'dokan_rma';`;
		let res = await dbUtils.dbQuery(queryInsert);
		if (res.code === 'ER_DUP_ENTRY') {
			res = await dbUtils.dbQuery(queryUpdate);
		}
		expect(res).not.toHaveProperty('errno');
	},

	// dokan wholeSale settings
	async setDokanWholeSaleSettings(){
		const queryInsert = `INSERT INTO ${dbPrefix}_options VALUES ( NULL, 'dokan_wholesale', '${serialize(dbData.wholesaleSettings)}', 'yes');`;
		const queryUpdate = `UPDATE ${dbPrefix}_options SET option_value = '${serialize(dbData.wholesaleSettings)}' WHERE option_name = 'dokan_wholesale';`;
		let res = await dbUtils.dbQuery(queryInsert);
		if (res.code === 'ER_DUP_ENTRY') {
			res = await dbUtils.dbQuery(queryUpdate);
		}
		expect(res).not.toHaveProperty('errno');
	},


	// dokan delivery time settings
	async setDokanDeliveryTimeSettings(){
		const queryInsert = `INSERT INTO ${dbPrefix}_options VALUES ( NULL, 'dokan_delivery_time', '${serialize(dbData.deliveryTimeSettings)}', 'yes');`;
		const queryUpdate = `UPDATE ${dbPrefix}_options SET option_value = '${serialize(dbData.deliveryTimeSettings)}' WHERE option_name = 'dokan_delivery_time';`;
		let res = await dbUtils.dbQuery(queryInsert);
		if (res.code === 'ER_DUP_ENTRY') {
			res = await dbUtils.dbQuery(queryUpdate);
		}
		expect(res).not.toHaveProperty('errno');
	},

	// dokan product advertising settings
	async setDokanProductAdvertisingSettings(){
		const queryInsert = `INSERT INTO ${dbPrefix}_options VALUES ( NULL, 'dokan_product_advertisement', '${serialize(dbData.productAdvertisingSettings)}', 'yes');`;
		const queryUpdate = `UPDATE ${dbPrefix}_options SET option_value = '${serialize(dbData.productAdvertisingSettings)}' WHERE option_name = 'dokan_product_advertisement';`;
		let res = await dbUtils.dbQuery(queryInsert);
		if (res.code === 'ER_DUP_ENTRY') {
			res = await dbUtils.dbQuery(queryUpdate);
		}
		expect(res).not.toHaveProperty('errno');
	},

	// dokan geolocation settings
	async setDokanGeolocationSettings(){
		const queryInsert = `INSERT INTO ${dbPrefix}_options VALUES ( NULL, 'dokan_geolocation', '${serialize(dbData.geolocationSettings)}', 'yes');`;
		const queryUpdate = `UPDATE ${dbPrefix}_options SET option_value = '${serialize(dbData.geolocationSettings)}' WHERE option_name = 'dokan_geolocation';`;
		let res = await dbUtils.dbQuery(queryInsert);
		if (res.code === 'ER_DUP_ENTRY') {
			res = await dbUtils.dbQuery(queryUpdate);
		}
		expect(res).not.toHaveProperty('errno');
	},

	// dokan product report abuse settings
	async setDokanProductReportAbuseSettings(){
		const queryInsert = `INSERT INTO ${dbPrefix}_options VALUES ( NULL, 'dokan_report_abuse', '${serialize(dbData.productReportAbuseSettings)}', 'yes');`;
		const queryUpdate = `UPDATE ${dbPrefix}_options SET option_value = '${serialize(dbData.productReportAbuseSettings)}' WHERE option_name = 'dokan_report_abuse';`;
		let res = await dbUtils.dbQuery(queryInsert);
		if (res.code === 'ER_DUP_ENTRY') {
			res = await dbUtils.dbQuery(queryUpdate);
		}
		expect(res).not.toHaveProperty('errno');
	},

	// dokan spmv settings
	async setDokanSpmvSettings(){
		const queryInsert = `INSERT INTO ${dbPrefix}_options VALUES ( NULL, 'dokan_spmv', '${serialize(dbData.spmvSettings)}', 'yes');`;
		const queryUpdate = `UPDATE ${dbPrefix}_options SET option_value = '${serialize(dbData.spmvSettings)}' WHERE option_name = 'dokan_spmv';`;
		let res = await dbUtils.dbQuery(queryInsert);
		if (res.code === 'ER_DUP_ENTRY') {
			res = await dbUtils.dbQuery(queryUpdate);
		}
		expect(res).not.toHaveProperty('errno');
	},

	// dokan vendor subscription settings
	async setDokanVendorSubscriptionSettings(){
		const queryInsert = `INSERT INTO ${dbPrefix}_options VALUES ( NULL, 'dokan_product_subscription', '${serialize(dbData.vendorSubscriptionSettings)}', 'yes');`;
		const queryUpdate = `UPDATE ${dbPrefix}_options SET option_value = '${serialize(dbData.vendorSubscriptionSettings)}' WHERE option_name = 'dokan_product_subscription';`;
		let res = await dbUtils.dbQuery(queryInsert);
		if (res.code === 'ER_DUP_ENTRY') {
			res = await dbUtils.dbQuery(queryUpdate);
		}
		expect(res).not.toHaveProperty('errno');
	},

};