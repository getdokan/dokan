import { expect } from '@playwright/test';
import { MySqlConnection, DbContext } from 'mysqlconnector';
import { serialize, unserialize } from 'php-serialize';
import { dbData } from './dbData';
import { helpers } from './helpers';
const { DB_HOST_NAME, DB_USER_NAME, DB_USER_PASSWORD, DATABASE, DB_PORT, DB_PREFIX  } = process.env;

const mySql =  new MySqlConnection({
	hostname: DB_HOST_NAME,
	username: DB_USER_NAME,
	password: DB_USER_PASSWORD,
	db: DATABASE,
	port: Number(DB_PORT)
});

const dbPrefix = DB_PREFIX;

export const dbUtils = {

	// execute db query
	async dbQuery(query: string): Promise<any> {
		const dbContext: DbContext = new DbContext(mySql);
		return await dbContext.inTransactionAsync(async (dbContext) => {
			try{
				const result = await dbContext.executeAsync(query);
				const res = JSON.parse(JSON.stringify(result));
				expect(res).not.toHaveProperty('errno'); //TODO: ADD Actual ASSERT DB_QUERY IS SUCCESSES, update it
				return res;
			}
			catch(err: unknown){
				// console.log('dbError:', err);
				return err;
			}
		});
	},

	// get max id
	async getMaxId(columnName: string, tableName: string ): Promise<any> {
		const querySelect = `SELECT MAX(${columnName}) as id FROM ${dbPrefix}_${tableName};`;
		const res = await dbUtils.dbQuery(querySelect);
		// console.log(res);
		const id = res[0].id;
		return id;
	},

	// update option table
	async UpdateWpOptionTable(optionName: string, optionValue: object ): Promise<any> {
		const queryUpdate = `UPDATE ${dbPrefix}_options SET option_value = '${serialize(optionValue)}' WHERE option_name = '${optionName}';`;
		const res = await dbUtils.dbQuery(queryUpdate);
		// console.log(res);
		return res;
	},

	// get dokan settings
	async getDokanSettings(optionName: string): Promise<any> {
		const querySelect = `Select option_value FROM ${dbPrefix}_options WHERE option_name = '${optionName}';`;
		const res = await dbUtils.dbQuery(querySelect);
		// console.log(res[0].option_value);
		// console.log(unserialize(res[0].option_value));
		return unserialize(res[0].option_value);
	},

	// set dokan settings
	async setDokanSettings(optionName: string, optionValue: object ): Promise<any> {
		const queryInsert = `INSERT INTO ${dbPrefix}_options VALUES ( NULL, '${optionName}', '${serialize(optionValue)}', 'yes');`;
		let res = await dbUtils.dbQuery(queryInsert);
		if (res.code === 'ER_DUP_ENTRY') {
			const queryUpdate = `UPDATE ${dbPrefix}_options SET option_value = '${serialize(optionValue)}' WHERE option_name = '${optionName}';`;
			res = await dbUtils.dbQuery(queryUpdate);
		}
		// console.log(res);
		return res;
	},

	// get selling info
	async getSellingInfo(): Promise<object[]> {
		const res = await this.getDokanSettings(dbData.dokan.optionName.selling);
		const commission = {
			type: res.commission_type,
			amount:res.admin_percentage,
			additionalAmount: res.additional_fee
		};
		const feeRecipient = {
			shippingFeeRecipient: res.shipping_fee_recipient,
			taxFeeRecipient: res.tax_fee_recipient,
			shippingTaxFeeRecipient: res.shipping_tax_fee_recipient,
		};
		return [commission, feeRecipient];
	},

	// create abuse report
	async createAbuseReport(abuseReport: any, productId: string, vendorId: string, customerId: string ): Promise<any> {
		const querySelect = `INSERT INTO ${dbPrefix}_dokan_report_abuse_reports (reason, product_id, vendor_id, customer_id, description, reported_at) VALUES ('${abuseReport.reason}', ${parseInt(productId)}, ${parseInt(vendorId)}, ${parseInt(customerId)}, '${abuseReport.description}',  '${helpers.currentDateTime1}');`;
		const res = await dbUtils.dbQuery(querySelect);
		// console.log(res);
		return res;
	},

	// create refund
	async createRefund(responseBody: any): Promise<[any, string]>{
		const refundId = await this.getMaxId('id', 'dokan_refund') + 1;

		const refund = {
			id: refundId,
			orderId: responseBody.id,
			sellerId: responseBody.stores[0].id,
			refundAmount: 20.5,
			refundReason: 'test refund',
			itemQtys: `{"${responseBody.line_items[0].id}": 1 }`,
			itemTotals: `{"${responseBody.line_items[0].id}":"10.000000","${responseBody.shipping_lines[0].id}":"5.000000"}`,
			itemTaxTotals: `{"${responseBody.line_items[0].id}":{"${responseBody.line_items[0].taxes[0].id}":5},"${responseBody.shipping_lines[0].id}":{"${responseBody.line_items[0].taxes[0].id}":0.5}}`,
			restockItems: 1,
			date: helpers.currentDateTime1,
			status: 0, // 0 for pending, 1 for completed
			method: 0,
		};
		// console.log('refund data:', refund);
		const queryInsert = `INSERT INTO ${dbPrefix}_dokan_refund VALUES ( '${refund.id}', '${refund.orderId}', '${refund.sellerId}', ${refund.refundAmount}, '${refund.refundReason}', '${refund.itemQtys}', '${refund.itemTotals}', '${refund.itemTaxTotals}', '${refund.restockItems}', '${refund.date}', '${refund.status}', '${refund.method}' );`;
		const res = await dbUtils.dbQuery(queryInsert);
		// console.log(res);
		return [res, refundId];
	},

};