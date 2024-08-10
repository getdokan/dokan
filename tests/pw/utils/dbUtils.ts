import mysql from 'mysql2/promise';
import { serialize, unserialize } from 'php-serialize';
import { dbData } from '@utils/dbData';
import { helpers } from '@utils/helpers';
import { commission, feeRecipient } from '@utils/interfaces';
const { DB_HOST_NAME, DB_USER_NAME, DB_USER_PASSWORD, DATABASE, DB_PORT, DB_PREFIX } = process.env;
const dbPrefix = DB_PREFIX;

const pool = mysql.createPool({
    host: DB_HOST_NAME,
    user: DB_USER_NAME,
    password: DB_USER_PASSWORD,
    database: DATABASE,
    port: DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export const dbUtils = {
    async dbQuery(query: string, params?: any[]): Promise<any> {
        let connection: mysql.PoolConnection | undefined;
        try {
            connection = await pool.getConnection();
            const [result] = await connection.execute(query, params);
            // console.log(result);
            return result;
        } catch (err) {
            console.error('Database query error:', err);
            throw err;
        } finally {
            // release connection back to the pool
            if (connection) {
                connection.release();
            }
        }
    },

    // get max id
    async getMaxId(columnName: string, tableName: string): Promise<any> {
        const query = `SELECT MAX(${columnName}) as id FROM ${dbPrefix}_${tableName};`;
        const res = await dbUtils.dbQuery(query);
        const id = res[0].id;
        return id;
    },

    // get user meta
    async getUserMeta(userId: string, metaKey: string): Promise<any> {
        const querySelect = `Select meta_value FROM ${dbPrefix}_usermeta WHERE user_id = '${userId}' AND meta_key = '${metaKey}';`;
        const res = await dbUtils.dbQuery(querySelect);
        const userMeta = unserialize(res[0].meta_value, {
            WP_Term: function () {
                return {};
            },
        }); //todo: added to handle WP_Term error, test if it works for further cases
        // console.log(userMeta);
        return userMeta;
    },

    // set user meta
    async setUserMeta(userId: string, metaKey: string, metaValue: object | string, serializeData?: boolean): Promise<any> {
        metaValue = serializeData ? serialize(metaValue) : metaValue;
        const metaExists = await dbUtils.dbQuery(`SELECT COUNT(*) AS count FROM ${dbPrefix}_usermeta WHERE user_id = '${userId}' AND meta_key = '${metaKey}';`);
        const query =
            metaExists[0].count > 0
                ? `UPDATE ${dbPrefix}_usermeta SET meta_value = '${metaValue}'  WHERE user_id = '${userId}' AND meta_key = '${metaKey}';`
                : `INSERT INTO ${dbPrefix}_usermeta VALUES ( NULL, '${userId}', '${metaKey}', '${metaValue}');`;
        const res = await dbUtils.dbQuery(query);
        return res;
    },

    // update dokan settings
    async updateUserMeta(userId: string, metaKey: string, updatedMetaValue: any, serializeData?: boolean): Promise<[object, object]> {
        const currentMetaValue = await this.getUserMeta(userId, metaKey);
        const newMetaValue = typeof updatedMetaValue === 'object' ? helpers.deepMergeObjects(currentMetaValue, updatedMetaValue) : updatedMetaValue;
        // console.log('newSettings:', newMetaValue);
        await this.setUserMeta(userId, metaKey, newMetaValue, serializeData);
        return [currentMetaValue, newMetaValue];
    },

    // get option value // todo: update method name getOptionValue 
    async getDokanSettings(optionName: string): Promise<any> {
        const query = `Select option_value FROM ${dbPrefix}_options WHERE option_name = '${optionName}';`;
        const res = await dbUtils.dbQuery(query);
        const optionValue = unserialize(res[0].option_value);
        // console.log(optionValue);
        return optionValue;
    },

    // set option value //todo: update method name setOptionValue
    async setDokanSettings(optionName: string, optionValue: object | string, serializeData: boolean = true): Promise<any> {
        optionValue = serializeData ? serialize(optionValue) : optionValue; // todo: test if all calles are updated with serialize data
        const query = `
            INSERT INTO ${dbPrefix}_options (option_id, option_name, option_value, autoload)
            VALUES (NULL, '${optionName}', '${optionValue}', 'yes')
            ON DUPLICATE KEY UPDATE option_value = '${optionValue}';
        `;
        const res = await dbUtils.dbQuery(query);
        return res;
    },

    // update option value //todo: update method name updateOptionValue
    async updateWpOptionTable(optionName: string, optionValue: object | string, serializeData?: boolean): Promise<any> {
        optionValue = serializeData ? serialize(optionValue) : optionValue;
        const query = `UPDATE ${dbPrefix}_options SET option_value = '${optionValue}' WHERE option_name = '${optionName}';`;
        const res = await dbUtils.dbQuery(query);
        return res;
    },

    // update dokan settings
    async updateDokanSettings(optionName: string, updatedSettings: object): Promise<[object, object]> {
        const currentSettings = await this.getDokanSettings(optionName);
        const newSettings = helpers.deepMergeObjects(currentSettings, updatedSettings);
        // console.log('newSettings:', newSettings);
        await this.setDokanSettings(optionName, newSettings);
        return [currentSettings, newSettings];
    },

    // get selling info
    async getSellingInfo(): Promise<[commission, feeRecipient]> {
        const res = await this.getDokanSettings(dbData.dokan.optionName.selling);
        const commission = {
            type: res.commission_type,
            amount: res.admin_percentage,
            additionalAmount: res.additional_fee,
        };
        const feeRecipient = {
            shippingFeeRecipient: res.shipping_fee_recipient,
            taxFeeRecipient: res.tax_fee_recipient,
            shippingTaxFeeRecipient: res.shipping_tax_fee_recipient,
        };
        return [commission, feeRecipient];
    },

    // create abuse report
    async createAbuseReport(abuseReport: any, productId: string, vendorId: string, customerId: string): Promise<any> {
        const query = `
        INSERT INTO ${dbPrefix}_dokan_report_abuse_reports (reason, product_id, vendor_id, customer_id, description, reported_at)
        VALUES ('${abuseReport.reason}', ${parseInt(productId)}, ${parseInt(vendorId)}, ${parseInt(customerId)}, '${abuseReport.description}',  '${helpers.currentDateTimeFullFormat}');`;
        const res = await dbUtils.dbQuery(query);
        return res;
    },

    // create refund
    async createRefundRequest(responseBody: any): Promise<[any, string]> {
        const refundId = (await this.getMaxId('id', 'dokan_refund')) + 1;

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
            date: helpers.currentDateTimeFullFormat,
            status: 0, // 0 for pending, 1 for completed
            method: 0,
        };

        const query = `INSERT INTO ${dbPrefix}_dokan_refund VALUES ( '${refund.id}', '${refund.orderId}', '${refund.sellerId}', ${refund.refundAmount}, 
        '${refund.refundReason}', '${refund.itemQtys}', '${refund.itemTotals}', '${refund.itemTaxTotals}', '${refund.restockItems}', '${refund.date}', 
        '${refund.status}', '${refund.method}' );`;
        const res = await dbUtils.dbQuery(query);
        return [res, refundId];
    },

    // update cell
    async updateCell(id: any, value: any): Promise<any> {
        const query = `UPDATE ${dbPrefix}_posts SET post_author = '${value}' WHERE ID = '${id}';`;
        const res = await dbUtils.dbQuery(query);
        return res;
    },

    // create booking resource
    async createBookingResource(postId: string, url: string): Promise<any> {
        const guid = url + '?post_type=bookable_resource&#038;p=' + postId;
        const query = `UPDATE ${dbPrefix}_posts SET guid = '${guid}', post_type = 'bookable_resource' WHERE ID = '${postId}';`;
        const res = await dbUtils.dbQuery(query);
        return res;
    },
};
