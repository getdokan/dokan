import { expect } from '@playwright/test';
import { MySqlConnection, DbContext } from 'mysqlconnector';
import { serialize, unserialize } from 'php-serialize';
import { dbData } from './dbData';
// const { DB_HOST_NAME, DB_USER_NAME, DB_USER_PASSWORD, DATABASE, DB_PORT, DB_PREFIX  } = process.env;

const dbPrefix = process.env.DB_PREFIX;

const mySql =  new MySqlConnection({
	hostname: process.env.DB_HOST_NAME,
	username: process.env.DB_USER_NAME,
	password: process.env.DB_USER_PASSWORD,
	db: process.env.DATABASE,
	port: Number(process.env.DB_PORT)
});


export const dbUtils = {

	// execute db query
	async dbQuery(query: string): Promise<any> {
		const dbContext: DbContext = new DbContext(mySql);
		return await dbContext.inTransactionAsync(async (dbContext) => {
			try{
				const result = await dbContext.executeAsync(query);
				const res = JSON.parse(JSON.stringify(result));
				expect(res).not.toHaveProperty('errno'); //TODO: ADD Actual ASSERT DBQUERY IS SUCCESSES, update it
				return res;
			}
			catch(err: unknown){
				// console.log('dbError:', err);
				return err;
			}
		});
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

	// get admin commission info
	async getCommissionInfo(): Promise<any> {
		const res = await this.getDokanSettings(dbData.dokan.optionName.selling);
		const commissionType = res.commission_type;
		const commission = [res.admin_percentage, res.additional_fee ];
		return [commissionType, commission];
	}


};