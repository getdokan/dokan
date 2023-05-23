import { test  } from '@playwright/test';
import { dbUtils } from '../utils/dbUtils';
import { dbData } from '../utils/dbdata';
import { serialize, unserialize } from 'php-serialize';

test.describe('setup site', ()=> {

	test('save admin settings', async ()=> {
		const query1 = 'Select meta_key From dok_usermeta';
		const query2 = 'Select meta_key From dok_usermeta';
		const query3 = `UPDATE dok_options SET option_value = '${serialize(dbData.generalSettings)}' WHERE option_name = 'dokan_general' ;`;
		const query4 = `INSERT INTO dok_options ( option_id, option_name, option_value, autoload) VALUES ( 4089 ,'dokan_rk', '${serialize(dbData.generalSettings)}' 'yes') ;`;
		const query5 = 'SELECT count (column_name) as Number FROM information_schema.columns  WHERE table_name=\'dok_options\' ;';
		const res = await dbUtils.dbQuery(query3);
		console.log(res);

	});


});