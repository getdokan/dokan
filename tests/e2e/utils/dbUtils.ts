import { expect } from '@playwright/test';
import { MySqlConnection, DbContext } from 'mysqlconnector';
import { serialize, unserialize } from 'php-serialize';
// import { dbData } from './dbdata';

const dbPrefix = process.env.DB_PREFIX;

const mySql =  new MySqlConnection({
	hostname: process.env.HOST_NAME,
	username: process.env.USER_NAME,
	password: process.env.PASSWORD,
	db: process.env.Database,
	port: Number(process.env.DB_PORT)
});


export const dbUtils = {

	async dbQuery(query: string): Promise<any> {
		const dbContext: DbContext = new DbContext(mySql);
		return await dbContext.inTransactionAsync(async (dbContext) => {
			try{
				const result = await dbContext.executeAsync(query); //TODO: ADD ASSERT DBQUERY IS SUCCESSES
				// return result;
				return JSON.parse(JSON.stringify(result));
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
		expect(res).not.toHaveProperty('errno');
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
		expect(res).not.toHaveProperty('errno');
		return res;
	},


};