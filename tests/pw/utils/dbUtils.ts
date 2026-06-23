import 'dotenv/config';
import mysql from 'mysql2/promise';
import { isSerialized, serialize, unserialize } from 'php-serialize';
import { helpers } from '@utils/helpers';

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
    async setUserMeta(userId: string, metaKey: string, metaValue: object | string | null, serializeData?: boolean): Promise<any> {
        try {
            // Validate required parameters
            if (userId === undefined || userId === null) {
                throw new Error('setUserMeta: userId is required and cannot be null or undefined.');
            }
            if (metaKey === undefined || metaKey === null) {
                throw new Error('setUserMeta: metaKey is required and cannot be null or undefined.');
            }
            // Sanitize metaValue: replace undefined with null
            metaValue = metaValue === undefined ? null : metaValue;
            metaValue = serializeData && metaValue !== null && !isSerialized(metaValue as string) ? serialize(metaValue) : metaValue;
            const metaExists = await dbUtils.dbQuery(
                `SELECT COUNT(*) AS count
                                                      FROM ${dbPrefix}_usermeta
                                                      WHERE user_id = ?
                                                        AND meta_key = ?;`,
                [userId, metaKey],
            );
            const query =
                metaExists[0].count > 0
                    ? `UPDATE ${dbPrefix}_usermeta
                                                     SET meta_value = ?
                                                     WHERE user_id = ?
                                                       AND meta_key = ?;`
                    : `INSERT INTO ${dbPrefix}_usermeta (user_id, meta_key, meta_value)
                                                                             VALUES (?, ?, ?);`;
            const res = await dbUtils.dbQuery(query, metaExists[0].count > 0 ? [metaValue, userId, metaKey] : [userId, metaKey, metaValue]);
            return res;
        } catch (error) {
            console.error('Error in setUserMeta:', error);
            throw error;
        }
    },

    // update user meta
    async updateUserMeta(userId: string, metaKey: string, updatedMetaValue: any, serializeData: boolean = true): Promise<[object, object]> {
        const currentMetaValue = await this.getUserMeta(userId, metaKey);
        const newMetaValue = typeof updatedMetaValue === 'object' ? helpers.deepMergeObjects(currentMetaValue, updatedMetaValue) : updatedMetaValue;
        await this.setUserMeta(userId, metaKey, newMetaValue, serializeData);
        return [currentMetaValue, newMetaValue];
    },

    /**
     * Seed a vendor as Stripe-Connect-connected WITHOUT the Stripe OAuth login.
     * Writes exactly what the OAuth callback does (RegisterWithdrawMethods.php:218-223):
     * `dokan_connected_vendor_id` + `_stripe_connect_access_key` (+ the
     * `dokan_profile_settings[payment][stripe]` flag for parity).
     *
     * `suppressValidation` (default true) pre-sets the weekly access-key check
     * transient so a placeholder access key is NOT validated against Stripe (and
     * thus NOT wiped) if the seeded vendor's dashboard is loaded during a test
     * (dokan-pro module.php:193-238 deletes both meta on a failed Account::retrieve).
     *
     * NOTE: a placeholder `accountId` is enough for the gateway to show at
     * checkout and for the card charge (charged on the platform account). The
     * later vendor `Transfer::create` needs a REAL Stripe test connected account
     * — pass a genuine `acct_…` for money/split/refund assertions.
     */
    async seedStripeConnectedVendor(
        vendorId: string | number,
        opts: { accountId: string; accessKey?: string; suppressValidation?: boolean },
    ): Promise<void> {
        const { accountId, accessKey = 'placeholder_access_key', suppressValidation = true } = opts;
        const id = String(vendorId);
        await dbUtils.setUserMeta(id, 'dokan_connected_vendor_id', accountId);
        await dbUtils.setUserMeta(id, '_stripe_connect_access_key', accessKey);
        // Optional parity flag (not read by checkout/availability/splits); best-effort.
        try {
            await dbUtils.updateUserMeta(id, 'dokan_profile_settings', { payment: { stripe: 1 } }, true);
        } catch {
            await dbUtils.setUserMeta(id, 'dokan_profile_settings', { payment: { stripe: 1 } }, true);
        }
        if (suppressValidation) {
            const name = `dokan_check_stripe_access_key_valid_${vendorId}`;
            const timeout = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
            await dbUtils.setOptionValue(`_transient_${name}`, 'sent', false);
            await dbUtils.setOptionValue(`_transient_timeout_${name}`, String(timeout), false);
        }
    },

    /**
     * Empty a logged-in customer's WooCommerce cart so a fresh browser context
     * starts clean. A logged-in cart lives in TWO places — the
     * `_woocommerce_persistent_cart_*` user meta AND the live session row in
     * `_woocommerce_sessions` (keyed by user id) — so both must be cleared, or
     * leftover items from prior tests (e.g. declined-card tests that never
     * complete) pollute later checkouts.
     */
    async clearCustomerCart(userId: string | number): Promise<void> {
        await dbUtils.dbQuery(`DELETE FROM ${dbPrefix}_usermeta WHERE user_id = ? AND meta_key LIKE '_woocommerce_persistent_cart_%';`, [
            String(userId),
        ]);
        await dbUtils.dbQuery(`DELETE FROM ${dbPrefix}_woocommerce_sessions WHERE session_key = ?;`, [String(userId)]);
    },

    /** Undo seedStripeConnectedVendor — restores the vendor to "not connected". */
    async removeStripeConnectedVendor(vendorId: string | number): Promise<void> {
        const id = String(vendorId);
        await dbUtils.dbQuery(
            `DELETE FROM ${dbPrefix}_usermeta WHERE user_id = ? AND meta_key IN ('dokan_connected_vendor_id', '_stripe_connect_access_key');`,
            [id],
        );
        const name = `dokan_check_stripe_access_key_valid_${vendorId}`;
        await dbUtils.dbQuery(`DELETE FROM ${dbPrefix}_options WHERE option_name IN (?, ?);`, [`_transient_${name}`, `_transient_timeout_${name}`]);
    },

    // safe scalar user-meta read — returns the raw meta_value string (NOT unserialized), or null when the row is absent.
    // getUserMeta() throws on a missing row (res[0] is undefined); use this when a meta may legitimately not exist yet.
    async getUserMetaValue(userId: string | number, metaKey: string): Promise<string | null> {
        const res = await dbUtils.dbQuery(`SELECT meta_value FROM ${dbPrefix}_usermeta WHERE user_id = ? AND meta_key = ?;`, [String(userId), metaKey]);
        return res.length ? (res[0].meta_value as string) : null;
    },

    // remove a vendor's active vendor-subscription (product_pack) state — cleanup for the vendor-subscription specs.
    // Does NOT cancel the Stripe subscription itself; pair with stripeApi.cancelSubscription() when a sub_… exists.
    async removeVendorSubscription(vendorId: string | number): Promise<void> {
        await dbUtils.dbQuery(
            `DELETE FROM ${dbPrefix}_usermeta WHERE user_id = ? AND meta_key IN (` +
                `'product_package_id', 'product_order_id', 'product_pack_startdate', 'product_pack_enddate', ` +
                `'can_post_product', 'product_no_with_pack', '_customer_recurring_subscription', ` +
                `'_stripe_subscription_id', 'dokan_has_active_cancelled_subscrption');`,
            [String(vendorId)],
        );
    },

    // delete one or more user-meta rows by key (generic — no named helper existed for arbitrary keys).
    async deleteUserMeta(userId: string | number, metaKeys: string[]): Promise<void> {
        if (!metaKeys.length) {
            return;
        }
        const placeholders = metaKeys.map(() => '?').join(', ');
        await dbUtils.dbQuery(`DELETE FROM ${dbPrefix}_usermeta WHERE user_id = ? AND meta_key IN (${placeholders});`, [String(userId), ...metaKeys]);
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
        await this.setOptionValue(optionName, newSettings, serializeData);
        return [currentSettings, newSettings];
    },

    // delete option row
    async deleteOptionRow(optionNames: string[]): Promise<any> {
        const query = `DELETE FROM ${dbPrefix}_options WHERE option_name IN (${optionNames.map(() => '?').join(',')})`;
        const res = await dbUtils.dbQuery(query, optionNames);
        return res;
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
        const res = await dbUtils.dbQuery(query, [refund.id, refund.orderId, refund.sellerId, refund.refundAmount, refund.refundReason, refund.itemQtys, refund.itemTotals, refund.itemTaxTotals, refund.restockItems, refund.date, refund.status, refund.method]);

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

    // get child order ids
    async getChildOrderIds(orderId: string): Promise<string[]> {
        const query = `SELECT id FROM ${dbPrefix}_wc_orders WHERE parent_order_id = ?;`;
        const res = await dbUtils.dbQuery(query, [orderId]);
        const ids = res.map((row: { id: number }) => row.id);
        return ids;
    },

    async updateQuoteRuleContent(quoted: string, updatedRuleContent: object) {
        const querySelect = `SELECT rule_contents FROM ${dbPrefix}_dokan_request_quote_rules WHERE id = ?`;
        const res = await dbUtils.dbQuery(querySelect, [quoted]);

        const currentRuleContent = unserialize(res[0].rule_contents);
        const newRuleContent = helpers.deepMergeObjects(currentRuleContent, updatedRuleContent);

        const queryUpdate = `UPDATE ${dbPrefix}_dokan_request_quote_rules SET rule_contents = ? WHERE id = ?`;
        await dbUtils.dbQuery(queryUpdate, [serialize(newRuleContent), quoted]);
    },

    async followVendor(followerId: string, vendorId: string) {
        const currentTime = helpers.currentDateTimeFullFormat;
        const query = `INSERT INTO ${dbPrefix}_dokan_follow_store_followers (vendor_id, follower_id, followed_at)
            SELECT ?, ?, ?
            WHERE NOT EXISTS (  SELECT 1 FROM ${dbPrefix}_dokan_follow_store_followers WHERE vendor_id = ? AND follower_id = ? );`;
        const res = await dbUtils.dbQuery(query, [vendorId, followerId, currentTime, vendorId, followerId]);
        return res;
    },

    async addStoreMapLocation(sellerId: string) {
        await dbUtils.updateUserMeta(sellerId, 'dokan_profile_settings', { find_address: 'New York, NY, USA' });
        await dbUtils.setUserMeta(sellerId, 'dokan_geo_latitude', '40.7127753', false);
        await dbUtils.setUserMeta(sellerId, 'dokan_geo_longitude', '-74.0059728', false);
        await dbUtils.setUserMeta(sellerId, 'dokan_geo_public', '1', false);
        await dbUtils.setUserMeta(sellerId, 'dokan_geo_address', 'New York, NY, USA', false);
    },

    // ============================================
    // ADMIN-DASHBOARD SEEDING HELPERS
    // ============================================
    // Net-new writers for the admin-dashboard test suite (see
    // tests/pw/test-cases/admin-dashboard-seeding-strategy.md). They force
    // states the REST API cannot set, so admin-only specs can seed
    // preconditions without ever driving the vendor/customer UI:
    // post meta, post/order dates (back-dating for date-range filters and the
    // monthly-comparison / sales-chart stats), vendor balance, and the
    // vendor's user_registered date (the admin Vendors "Registered" column).

    // set post meta (insert or update) — the postmeta twin of setUserMeta.
    async setPostMeta(postId: string | number, metaKey: string, metaValue: object | string | null, serializeData?: boolean): Promise<any> {
        if (postId === undefined || postId === null) {
            throw new Error('setPostMeta: postId is required and cannot be null or undefined.');
        }
        if (!metaKey) {
            throw new Error('setPostMeta: metaKey is required and cannot be null or undefined.');
        }
        metaValue = metaValue === undefined ? null : metaValue;
        metaValue = serializeData && metaValue !== null && !isSerialized(metaValue as string) ? serialize(metaValue) : metaValue;
        const metaExists = await dbUtils.dbQuery(`SELECT COUNT(*) AS count FROM ${dbPrefix}_postmeta WHERE post_id = ? AND meta_key = ?;`, [postId, metaKey]);
        const query = metaExists[0].count > 0 ? `UPDATE ${dbPrefix}_postmeta SET meta_value = ? WHERE post_id = ? AND meta_key = ?;` : `INSERT INTO ${dbPrefix}_postmeta (post_id, meta_key, meta_value) VALUES (?, ?, ?);`;
        return await dbUtils.dbQuery(query, metaExists[0].count > 0 ? [metaValue, postId, metaKey] : [postId, metaKey, metaValue]);
    },

    // back-date (or set) a post's published date — wp_posts.post_date[_gmt].
    // `date` is a MySQL datetime string, e.g. '2025-01-15 10:00:00'.
    async setPostDate(postId: string | number, date: string): Promise<any> {
        const query = `UPDATE ${dbPrefix}_posts SET post_date = ?, post_date_gmt = ? WHERE ID = ?;`;
        return await dbUtils.dbQuery(query, [date, date, postId]);
    },

    // back-date a WooCommerce order (HPOS wc_orders + the analytics
    // wc_order_stats mirror when present) so admin date-range filters and the
    // monthly-comparison / sales-chart prior-period figures are deterministic.
    // The stats update is best-effort — the table may be empty on a fresh env.
    async setOrderDate(orderId: string | number, date: string): Promise<void> {
        await dbUtils.dbQuery(`UPDATE ${dbPrefix}_wc_orders SET date_created_gmt = ?, date_updated_gmt = ? WHERE id = ?;`, [date, date, orderId]);
        try {
            await dbUtils.dbQuery(`UPDATE ${dbPrefix}_wc_order_stats SET date_created = ?, date_created_gmt = ? WHERE order_id = ?;`, [date, date, orderId]);
        } catch (e) {
            console.warn('setOrderDate: wc_order_stats update skipped:', (e as Error).message);
        }
    },

    // force a vendor balance row — admin Withdraw and Vendor-detail figures
    // (available balance, total earning) derive from this table, so seeding it
    // directly avoids relying on the order→commission settle cron.
    //
    // Balance math (Vendor::get_balance): balance = SUM(debit WHERE status IN the
    // active order statuses, default 'wc-completed'/'wc-refunded') − SUM(credit).
    // So a positive available balance is a DEBIT (an earning) with an active order
    // status; a CREDIT models a withdrawal (subtracts). To give a vendor spendable
    // balance call setVendorBalance(id, { debit: amount }) — `status` defaults to
    // the active order status 'wc-completed' so the debit counts as earnings.
    async setVendorBalance(vendorId: string | number, opts: { credit?: number; debit?: number; trnId?: number; trnType?: string; perticulars?: string; status?: string; trnDate?: string; balanceDate?: string } = {}): Promise<any> {
        const { credit = 0, debit = 0, trnType = 'dokan_orders', perticulars = 'seeded balance', status = 'wc-completed', trnDate = helpers.currentDateTimeFullFormat, balanceDate = helpers.currentDateTimeFullFormat } = opts;
        const trnId = opts.trnId ?? (await this.getMaxId('id', 'dokan_vendor_balance')) + 1;
        const query = `INSERT INTO ${dbPrefix}_dokan_vendor_balance (vendor_id, trn_id, trn_type, perticulars, debit, credit, status, trn_date, balance_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        return await dbUtils.dbQuery(query, [vendorId, trnId, trnType, perticulars, debit, credit, status, trnDate, balanceDate]);
    },

    // set a user's registration date — wp_users.user_registered. REST won't
    // set this; needed for the admin Vendors "Registered" sortable column and
    // the missing/old-date edge cases.
    async setUserRegisteredDate(userId: string | number, date: string): Promise<any> {
        const query = `UPDATE ${dbPrefix}_users SET user_registered = ? WHERE ID = ?;`;
        return await dbUtils.dbQuery(query, [date, userId]);
    },

    // ============================================
    // EMAIL LOG (Email Log plugin → ${dbPrefix}_email_log)
    // ============================================
    // The Email Log plugin records every wp_mail() call into its own table
    // BEFORE the SMTP transport runs, so a row exists even when the env's
    // sendmail can't connect. These helpers let tests assert the admin email
    // fired by a front-end abuse-report submit.

    // highest existing email-log id — record this BEFORE an action so later
    // reads only consider rows created by that action (avoids matching mail
    // left over from earlier tests in the run).
    async getMaxEmailLogId(): Promise<number> {
        const query = `SELECT MAX(id) AS id FROM ${dbPrefix}_email_log;`;
        const res = await dbUtils.dbQuery(query);
        return Number(res[0]?.id ?? 0);
    },

    // parametrised read of recent email-log rows, newest first. All filters
    // are optional; `sinceId` scopes to rows created after a recorded baseline.
    async getEmailLogs(opts: { subjectLike?: string; toEmail?: string; sinceId?: number } = {}): Promise<any[]> {
        const { subjectLike, toEmail, sinceId } = opts;
        const where: string[] = [];
        const params: any[] = [];
        if (subjectLike !== undefined) {
            where.push('subject LIKE ?');
            params.push(subjectLike);
        }
        if (toEmail !== undefined) {
            where.push('to_email = ?');
            params.push(toEmail);
        }
        if (sinceId !== undefined) {
            where.push('id > ?');
            params.push(sinceId);
        }
        const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
        const query = `SELECT id, to_email, subject, message, headers, sent_date FROM ${dbPrefix}_email_log ${whereClause} ORDER BY id DESC LIMIT 5;`;
        const res = await dbUtils.dbQuery(query, params);
        return res as any[];
    },

    // poll the email log until a matching row appears or the timeout elapses —
    // the submit → wp_mail path is async, so the row may not be present the
    // instant the front-end confirmation dialog closes.
    async waitForEmailLog(opts: { subjectLike?: string; toEmail?: string; sinceId?: number } = {}, timeoutMs: number = 15000): Promise<any | null> {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            const rows = await dbUtils.getEmailLogs(opts);
            if (rows.length > 0) {
                return rows[0];
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        return null;
    },

    // ============================================
    // STRIPE CONNECT — SAVED CARDS + GATEWAY SETTINGS
    // ============================================

    // read a customer's saved payment tokens (+ their tokenmeta) for a gateway —
    // WC exposes NO REST endpoint for payment tokens, so saved-card verification
    // (F1/F3/F5) must read the DB directly. Joins ${dbPrefix}_woocommerce_payment_tokens
    // to ${dbPrefix}_woocommerce_payment_tokenmeta (FK payment_token_id) and pulls
    // the four card meta keys (last4, brand, expiry_month, expiry_year). The `token`
    // column holds the Stripe pm_ id for a DynamicPaymentMethod token.
    async getCustomerPaymentTokens(userId: string | number, gatewayId: string = 'dokan-stripe-connect'): Promise<Array<{ token_id: number; token: string; type: string; last4: string; brand: string; expiry: string; is_default: number }>> {
        const query = `SELECT token_id, token, type, is_default FROM ${dbPrefix}_woocommerce_payment_tokens WHERE user_id = ? AND gateway_id = ?;`;
        const rows = await dbUtils.dbQuery(query, [String(userId), gatewayId]);
        const tokens: Array<{ token_id: number; token: string; type: string; last4: string; brand: string; expiry: string; is_default: number }> = [];
        for (const row of rows as Array<{ token_id: number; token: string; type: string; is_default: number }>) {
            const metaRows = await dbUtils.dbQuery(
                `SELECT meta_key, meta_value FROM ${dbPrefix}_woocommerce_payment_tokenmeta WHERE payment_token_id = ? AND meta_key IN ('last4', 'brand', 'expiry_month', 'expiry_year');`,
                [row.token_id],
            );
            const meta: Record<string, string> = {};
            for (const m of metaRows as Array<{ meta_key: string; meta_value: string }>) {
                meta[m.meta_key] = m.meta_value;
            }
            tokens.push({
                token_id: row.token_id,
                token: row.token,
                type: row.type,
                last4: meta.last4 ?? '',
                brand: meta.brand ?? '',
                expiry: meta.expiry_month && meta.expiry_year ? `${meta.expiry_month}/${meta.expiry_year}` : '',
                is_default: row.is_default,
            });
        }
        return tokens;
    },

    // Delete a customer's saved payment tokens (+ their tokenmeta) for a gateway. Needed by the new-card flows
    // (e.g. the declined-card test): once any saved-card test has run in the shard, classic checkout DEFAULTS to a
    // saved-token radio and the valid saved card is used instead of the NEW card under test — so a declined NEW
    // card silently succeeds via the saved card and no error appears. Purging the tokens removes that default so
    // the new-card Payment Element is the only option. Returns the number of tokens deleted.
    async deleteCustomerPaymentTokens(userId: string | number, gatewayId: string = 'dokan-stripe-connect'): Promise<number> {
        const rows = (await dbUtils.dbQuery(
            `SELECT token_id FROM ${dbPrefix}_woocommerce_payment_tokens WHERE user_id = ? AND gateway_id = ?;`,
            [String(userId), gatewayId],
        )) as Array<{ token_id: number }>;
        for (const { token_id } of rows) {
            await dbUtils.dbQuery(`DELETE FROM ${dbPrefix}_woocommerce_payment_tokenmeta WHERE payment_token_id = ?;`, [token_id]);
            await dbUtils.dbQuery(`DELETE FROM ${dbPrefix}_woocommerce_payment_tokens WHERE token_id = ?;`, [token_id]);
        }
        return rows.length;
    },

    // partial-update ONE key of the serialized Stripe Connect gateway option
    // (woocommerce_dokan-stripe-connect_settings) WITHOUT disturbing the other keys —
    // the settings-behaviour matrix toggles a single key (allow_non_connected_sellers /
    // enabled) and re-running configureGateway would risk clearing the saved test keys.
    // Reads the existing option (getOptionValue throws if the row is missing — the
    // gateway is configured by pre-setup, so the row is assumed present), sets the one
    // key, and writes it back serialized.
    async setStripeGatewaySetting(key: string, value: string): Promise<void> {
        const optionName = 'woocommerce_dokan-stripe-connect_settings';
        const settings = await dbUtils.getOptionValue(optionName);
        settings[key] = value;
        await dbUtils.setOptionValue(optionName, settings);
    },
};
