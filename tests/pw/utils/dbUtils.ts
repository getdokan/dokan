import mysql from 'mysql2/promise';
import { serialize, unserialize, isSerialized } from 'php-serialize';
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
        const querySelect = `SELECT meta_value FROM ${dbPrefix}_usermeta WHERE user_id = ? AND meta_key = ?;`;
        const res = await dbUtils.dbQuery(querySelect, [userId, metaKey]);
        const userMeta = unserialize(res[0].meta_value, {
            WP_Term: function () {
                return {};
            },
        }); // todo: added to handle WP_Term error, test if it works for further cases
        return userMeta;
    },

    // set user meta
    async setUserMeta(userId: string, metaKey: string, metaValue: object | string, serializeData?: boolean): Promise<any> {
        metaValue = serializeData && !isSerialized(metaValue as string) ? serialize(metaValue) : metaValue;
        const metaExists = await dbUtils.dbQuery(`SELECT COUNT(*) AS count FROM ${dbPrefix}_usermeta WHERE user_id = ? AND meta_key = ?;`, [userId, metaKey]);
        const query = metaExists[0].count > 0 ? `UPDATE ${dbPrefix}_usermeta SET meta_value = ? WHERE user_id = ? AND meta_key = ?;` : `INSERT INTO ${dbPrefix}_usermeta (user_id, meta_key, meta_value) VALUES (?, ?, ?);`;
        const res = await dbUtils.dbQuery(query, metaExists[0].count > 0 ? [metaValue, userId, metaKey] : [userId, metaKey, metaValue]);
        return res;
    },

    // update user meta
    async updateUserMeta(userId: string, metaKey: string, updatedMetaValue: any, serializeData: boolean = true): Promise<[object, object]> {
        const currentMetaValue = await this.getUserMeta(userId, metaKey);
        const newMetaValue = typeof updatedMetaValue === 'object' ? helpers.deepMergeObjects(currentMetaValue, updatedMetaValue) : updatedMetaValue;
        await this.setUserMeta(userId, metaKey, newMetaValue, serializeData);
        return [currentMetaValue, newMetaValue];
    },

    // insert option value
    async insertOptionValue(optionName: string, optionValue: object | string, serializeData: boolean = true): Promise<any> {
        optionValue = serializeData && !isSerialized(optionValue as string) ? serialize(optionValue) : optionValue;
        const query = `
                INSERT INTO ${dbPrefix}_options (option_id, option_name, option_value, autoload)
                VALUES (NULL, ?, ?, 'yes')
                ON DUPLICATE KEY UPDATE option_value = ?;
            `;
        const res = await dbUtils.dbQuery(query, [optionName, optionValue, optionValue]);
        return res;
    },

    // get option value
    async getOptionValue(optionName: string): Promise<any> {
        const query = `Select option_value FROM ${dbPrefix}_options WHERE option_name = ?;`;
        const res = await dbUtils.dbQuery(query, [optionName]);
        const optionValue = unserialize(res[0].option_value);
        return optionValue;
    },

    // set option value
    async setOptionValue(optionName: string, optionValue: object | string, serializeData: boolean = true): Promise<any> {
        optionValue = serializeData && !isSerialized(optionValue as string) ? serialize(optionValue) : optionValue;
        // const query = `UPDATE ${dbPrefix}_options SET option_value = '${optionValue}' WHERE option_name = '${optionName}';`;
        const query = `
                INSERT INTO ${dbPrefix}_options (option_id, option_name, option_value, autoload)
                VALUES (NULL, ?, ?, 'yes')
                ON DUPLICATE KEY UPDATE option_value = ?;
            `;
        const res = await dbUtils.dbQuery(query, [optionName, optionValue, optionValue]);
        return res;
    },

    // update dokan settings
    async updateOptionValue(optionName: string, updatedSettings: object | string, serializeData?: boolean): Promise<[any, any]> {
        const currentSettings = await this.getOptionValue(optionName);
        const newSettings = typeof updatedSettings === 'object' ? helpers.deepMergeObjects(currentSettings, updatedSettings) : updatedSettings;
        // console.log('currentSettings:', currentSettings);
        // console.log('newSettings:', newSettings);
        await this.setOptionValue(optionName, newSettings, serializeData);
        return [currentSettings, newSettings];
    },

    // get selling info
    async getSellingInfo(): Promise<[commission, feeRecipient]> {
        const res = await this.getOptionValue(dbData.dokan.optionName.selling);
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
        const query = `INSERT INTO ${dbPrefix}_dokan_report_abuse_reports (reason, product_id, vendor_id, customer_id, description, reported_at) VALUES (?, ?, ?, ?, ?, ?);`;
        const res = await dbUtils.dbQuery(query, [abuseReport.reason, parseInt(productId), parseInt(vendorId), parseInt(customerId), abuseReport.description, helpers.currentDateTimeFullFormat]);
        return res;
    },

    // create refund request
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

        const query = `INSERT INTO ${dbPrefix}_dokan_refund VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        const res = await dbUtils.dbQuery(query, [
            refund.id,
            refund.orderId,
            refund.sellerId,
            refund.refundAmount,
            refund.refundReason,
            refund.itemQtys,
            refund.itemTotals,
            refund.itemTaxTotals,
            refund.restockItems,
            refund.date,
            refund.status,
            refund.method,
        ]);

        return [res, refundId];
    },

    // update cell
    async updateCell(id: any, value: any): Promise<any> {
        const query = `UPDATE ${dbPrefix}_posts SET post_author = ? WHERE ID = ?;`;
        const res = await dbUtils.dbQuery(query, [value, id]);
        return res;
    },

    // create booking resource
    async createBookingResource(postId: string, url: string): Promise<any> {
        const guid = url + '?post_type=bookable_resource&#038;p=' + postId;
        const query = `UPDATE ${dbPrefix}_posts SET guid = ?, post_type = 'bookable_resource' WHERE ID = ?;`;
        const res = await dbUtils.dbQuery(query, [guid, postId]);
        return res;
    },

    // set subscription product type
    async setSubscriptionProductType(): Promise<void> {
        const termInsertQuery = `INSERT INTO ${dbPrefix}_terms (term_id, name, slug, term_group) SELECT NULL, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM ${dbPrefix}_terms WHERE name = ?);`;
        await dbUtils.dbQuery(termInsertQuery, ['product_pack', 'product_pack', 0, 'product_pack']);

        const termIdQuery = `SELECT term_id FROM ${dbPrefix}_terms WHERE name = ?;`;
        const [termIdQueryResult] = await dbUtils.dbQuery(termIdQuery, ['product_pack']);
        const termId = termIdQueryResult.term_id;
        // console.log('termId:', termId);

        const termTaxonomyInsertQuery = `INSERT INTO ${dbPrefix}_term_taxonomy (term_taxonomy_id, term_id, taxonomy, description, parent, count) SELECT NULL, ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM ${dbPrefix}_term_taxonomy WHERE term_id = ?);`;
        await dbUtils.dbQuery(termTaxonomyInsertQuery, [termId, 'product_type', '', 0, 0, termId]);
    },

    // update simple product type to subscription product type
    async updateProductType(productId?: string): Promise<void> {
        // get term ids
        const termIdQuery = `SELECT t1.term_id AS simple_term_id, t2.term_id AS subscription_term_id
                    FROM (SELECT term_id FROM ${dbPrefix}_terms WHERE name = ? ORDER BY term_id DESC LIMIT 1) t1, ${dbPrefix}_terms t2 
                    WHERE t2.name = ?;
                `;
        const [termIdQueryResult] = await dbUtils.dbQuery(termIdQuery, ['simple', 'product_pack']);
        const simpleTermId = termIdQueryResult.simple_term_id;
        const subscriptionTermId = termIdQueryResult.subscription_term_id;
        // console.log('simpleTermId:', simpleTermId, 'subscriptionTermId:', subscriptionTermId);

        const termTaxonomyIdQuery = `SELECT  t1.term_taxonomy_id AS simple_term_taxonomy_id,  t2.term_taxonomy_id AS subscription_term_taxonomy_id 
                    FROM ${dbPrefix}_term_taxonomy t1, ${dbPrefix}_term_taxonomy t2 
                    WHERE  t1.term_id = ? AND t2.term_id = ?;    
                `;
        const [termTaxonomyIdQueryResult] = await dbUtils.dbQuery(termTaxonomyIdQuery, [simpleTermId, subscriptionTermId]);
        const simpleTermTaxonomyId = termTaxonomyIdQueryResult.simple_term_taxonomy_id;
        const subscriptionTermTaxonomyId = termTaxonomyIdQueryResult.subscription_term_taxonomy_id;
        // console.log('simpleTermTaxonomyId:', simpleTermTaxonomyId, 'subscriptionTermTaxonomyId:', subscriptionTermTaxonomyId);

        const updateProductTypeQuery = `UPDATE ${dbPrefix}_term_relationships SET term_taxonomy_id = ? WHERE object_id = ? AND term_taxonomy_id = ?;`;
        await dbUtils.dbQuery(updateProductTypeQuery, [subscriptionTermTaxonomyId, productId, simpleTermTaxonomyId]);

        const updateCountQuery = `UPDATE ${dbPrefix}_term_taxonomy SET count = count + 1 WHERE term_taxonomy_id = ?;`;
        await dbUtils.dbQuery(updateCountQuery, [subscriptionTermTaxonomyId]);
    },

    async updateQuoteRuleContent(quoted: string, updatedRuleContent: object) {
        const querySelect = `SELECT rule_contents FROM ${dbPrefix}_dokan_request_quote_rules WHERE id = ?`;
        const res = await dbUtils.dbQuery(querySelect, [quoted]);

        const currentRuleContent = unserialize(res[0].rule_contents);
        const newRuleContent = helpers.deepMergeObjects(currentRuleContent, updatedRuleContent);

        const queryUpdate = `UPDATE ${dbPrefix}_dokan_request_quote_rules SET rule_contents = ? WHERE id = ?`;
        await dbUtils.dbQuery(queryUpdate, [serialize(newRuleContent), quoted]);
    },
};
