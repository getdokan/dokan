import { Page, expect, APIRequestContext, request as playwrightRequest } from '@playwright/test';
import { faker } from '@faker-js/faker';
import mysql from 'mysql2/promise';
import { isSerialized, serialize, unserialize } from 'php-serialize';

import { toPath } from '@utils/helpers';
const SERVER_URL = process.env.SERVER_URL ? process.env.SERVER_URL : toPath('wp-json');
const { DOKAN_PRO, ADMIN, ADMIN_PASSWORD, USER_PASSWORD, DB_HOST_NAME, DB_USER_NAME, DB_USER_PASSWORD, DATABASE, DB_PORT, DB_PREFIX } = process.env;

// ============================================
// HELPER UTILITIES
// ============================================

const basicAuth = (username: string, password: string) => 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

function slugify(str: string): string {
    return str
        .toString()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');
}

function isPlainObject(value: any): boolean {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function deepMergeArrays(targetArray: any[], sourceArray: any[]): any[] {
    if (targetArray.every((item: any) => item instanceof Object && !Array.isArray(item)) && sourceArray.every(item => item instanceof Object && !Array.isArray(item))) {
        const mergedArray = [...targetArray];
        sourceArray.forEach((item: { [key: string]: any }, index: number) => {
            if (index < mergedArray.length && item instanceof Object && !Array.isArray(item)) {
                mergedArray[index] = deepMergeObjects(mergedArray[index], item);
            } else {
                mergedArray.push(item);
            }
        });
        return mergedArray;
    } else {
        return [...sourceArray];
    }
}

function deepMergeObjects(target: { [key: string]: any }, source: { [key: string]: any }): any {
    const result = { ...target };
    for (const key of Object.keys(source)) {
        if (isPlainObject(source[key]) && isPlainObject(target[key])) {
            result[key] = deepMergeObjects(target[key], source[key]);
        } else if (Array.isArray(source[key]) && Array.isArray(target[key])) {
            result[key] = deepMergeArrays(target[key], source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
}

// ============================================
// DATABASE UTILITIES
// ============================================

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

const db = {
    async query(query: string, params?: any[]): Promise<any> {
        let connection: mysql.PoolConnection | undefined;
        try {
            connection = await pool.getConnection();
            const [result] = await connection.execute(query, params);
            return result;
        } catch (err) {
            console.error('Database query error:', err);
            throw err;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    },

    async getUserMeta(userId: string, metaKey: string): Promise<any> {
        const res = await db.query(`SELECT meta_value FROM ${DB_PREFIX}_usermeta WHERE user_id = ? AND meta_key = ?;`, [userId, metaKey]);
        return unserialize(res[0].meta_value, { WP_Term: function () { return {}; } });
    },

    async setUserMeta(userId: string, metaKey: string, metaValue: object | string, serializeData = true): Promise<any> {
        metaValue = metaValue === undefined ? null as any : metaValue;
        metaValue = serializeData && !isSerialized(metaValue as string) ? serialize(metaValue) : metaValue;
        const metaExists = await db.query(`SELECT COUNT(*) AS count FROM ${DB_PREFIX}_usermeta WHERE user_id = ? AND meta_key = ?;`, [userId, metaKey]);
        const query = metaExists[0].count > 0
            ? `UPDATE ${DB_PREFIX}_usermeta SET meta_value = ? WHERE user_id = ? AND meta_key = ?;`
            : `INSERT INTO ${DB_PREFIX}_usermeta (user_id, meta_key, meta_value) VALUES (?, ?, ?);`;
        return await db.query(query, metaExists[0].count > 0 ? [metaValue, userId, metaKey] : [userId, metaKey, metaValue]);
    },

    async updateUserMeta(userId: string, metaKey: string, updatedMetaValue: any, serializeData = true): Promise<[object, object]> {
        const currentMetaValue = await db.getUserMeta(userId, metaKey);
        const newMetaValue = typeof updatedMetaValue === 'object' ? deepMergeObjects(currentMetaValue, updatedMetaValue) : updatedMetaValue;
        await db.setUserMeta(userId, metaKey, newMetaValue, serializeData);
        return [currentMetaValue, newMetaValue];
    },

    async getOptionValue(optionName: string): Promise<any> {
        const res = await db.query(`SELECT option_value FROM ${DB_PREFIX}_options WHERE option_name = ?;`, [optionName]);
        return unserialize(res[0].option_value);
    },

    async setOptionValue(optionName: string, optionValue: any, serializeData: boolean = true): Promise<any> {
        optionValue = serializeData && !isSerialized(optionValue as string) ? serialize(optionValue) : optionValue;
        const query = `
            INSERT INTO ${DB_PREFIX}_options (option_id, option_name, option_value, autoload)
            VALUES (NULL, ?, ?, 'yes')
            ON DUPLICATE KEY UPDATE option_value = ?;
        `;
        return await db.query(query, [optionName, optionValue, optionValue]);
    },

    async updateOptionValue(optionName: string, updatedSettings: object | string, serializeData?: boolean): Promise<[any, any]> {
        const currentSettings = await db.getOptionValue(optionName);
        const newSettings = typeof updatedSettings === 'object' ? deepMergeObjects(currentSettings, updatedSettings) : updatedSettings;
        await db.setOptionValue(optionName, newSettings, serializeData);
        return [currentSettings, newSettings];
    },

    async updateQuoteRuleContent(quoteRuleId: string, updatedRuleContent: object) {
        const res = await db.query(`SELECT rule_contents FROM ${DB_PREFIX}_dokan_request_quote_rules WHERE id = ?`, [quoteRuleId]);
        const currentRuleContent = unserialize(res[0].rule_contents);
        const newRuleContent = deepMergeObjects(currentRuleContent, updatedRuleContent);
        await db.query(`UPDATE ${DB_PREFIX}_dokan_request_quote_rules SET rule_contents = ? WHERE id = ?`, [serialize(newRuleContent), quoteRuleId]);
    },
};

// ============================================
// API UTILITIES
// ============================================

const api = {
    request: null as APIRequestContext | null,

    async init(): Promise<void> {
        api.request = await playwrightRequest.newContext();
    },

    async dispose(): Promise<void> {
        if (api.request) {
            await api.request.dispose();
        }
    },

    adminAuth(): { Authorization: string } {
        return { Authorization: basicAuth(ADMIN!, ADMIN_PASSWORD!) };
    },

    userAuth(username: string, password: string = USER_PASSWORD!): { Authorization: string } {
        return { Authorization: basicAuth(username, password) };
    },

    async post(url: string, data: any, headers: any): Promise<any> {
        const response = await api.request!.post(url, { data, headers });
        expect(response.ok()).toBeTruthy();
        return await response.json();
    },

    async createStore(): Promise<[any, string, string, string]> {
        const payload = {
            user_login: `${faker.person.firstName()}_${faker.string.nanoid(5)}`,
            user_pass: String(USER_PASSWORD),
            email: faker.internet.email(),
            store_name: `${faker.person.firstName()}_store`,
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            role: 'seller',
            notify_vendor: 'yes',
            social: {
                fb: 'https://www.facebook.com/',
                twitter: 'https://www.twitter.com/',
                pinterest: 'https://www.pinterest.com/',
                linkedin: 'https://www.linkedin.com/',
                youtube: 'https://www.youtube.com/',
                instagram: 'https://www.instagram.com/',
                flickr: 'https://www.flickr.com/',
                threads: 'https://www.threads.net/',
            },
            phone: '0123456789',
            show_email: 'yes',
            address: {
                street_1: 'abc street',
                street_2: 'xyz street',
                city: 'New York',
                zip: '10003',
                state: 'NY',
                country: 'US',
            },
            location: '40.7127753,-74.0059728',
            banner_id: 0,
            gravatar_id: 0,
            enable_tnc: true,
            store_tnc: 'test Vendor terms and conditions',
            featured: true,
            enabled: true,
            trusted: true,
            payment: {
                paypal: { email: 'paypal@g.c' },
                bank: {
                    ac_name: 'account name',
                    ac_type: 'personal',
                    ac_number: '1234567',
                    bank_name: 'bank name',
                    bank_addr: 'bank address',
                    routing_number: '123456',
                    iban: '123456',
                    swift: '12345',
                },
            },
        };
        const responseBody = await api.post(`${SERVER_URL}/dokan/v1/stores`, payload, api.adminAuth());
        const sellerId = String(responseBody?.id);
        const storeName = String(responseBody?.store_name);
        const vendorName = String(responseBody?.user_login ?? payload.user_login);
        return [responseBody, sellerId, storeName, vendorName];
    },

    async createProduct(extraPayload?: any, auth?: any): Promise<[any, string, string]> {
        const payload = deepMergeObjects({
            name: `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Simple)`,
            type: 'simple',
            regular_price: faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([0, 2]) }),
            status: 'publish',
            categories: [{}],
            tags: [{}],
            featured: true,
            description: '<p>test description</p>',
            short_description: '<p>test short description</p>',
            meta_data: [
                { key: '_dokan_geolocation_use_store_settings', value: 'yes' },
                { key: 'dokan_geo_latitude', value: '40.7127753' },
                { key: 'dokan_geo_longitude', value: '-74.0059728' },
                { key: 'dokan_geo_public', value: '1' },
                { key: 'dokan_geo_address', value: 'New York, NY, USA' },
            ],
        }, extraPayload || {});
        const responseBody = await api.post(`${SERVER_URL}/dokan/v1/products`, payload, auth || api.adminAuth());
        const productId = String(responseBody?.id);
        const productName = String(responseBody?.name);
        return [responseBody, productId, productName];
    },

    async createQuoteRule(payload: any, auth?: any): Promise<[any, string, string]> {
        const responseBody = await api.post(`${SERVER_URL}/dokan/v1/request-for-quote/quote-rule`, payload, auth || api.adminAuth());
        const quoteRuleId = String(responseBody?.id);
        const quoteRuleName = responseBody?.rule_name;
        return [responseBody, quoteRuleId, quoteRuleName];
    },
};

// ============================================
// PAYLOADS
// ============================================

const catalogModeProductMeta = {
    meta_data: [
        {
            key: '_dokan_catalog_mode',
            value: {
                hide_add_to_cart_button: 'on',
                hide_product_price: 'on',
            },
        },
    ],
};

const catalogModeSetting = {
    hide_add_to_cart_button: 'on',
    hide_product_price: 'on',
    request_a_quote_enabled: 'on',
};

const createQuoteRulePayload = () => ({
    rule_name: `QR_${faker.string.nanoid(10)}`,
    selected_user_role: ['customer', 'guest'],
    category_ids: [],
    product_ids: [] as string[],
    expire_limit: '20',
    hide_price: '1',
    hide_price_text: 'Price is hidden',
    hide_cart_button: 'replace',
    button_text: 'Add to quote',
    apply_on_all_product: '0',
    rule_priority: '0',
    status: 'publish',
});

// ============================================
// EXPORTS
// ============================================

export { api, db, catalogModeProductMeta, catalogModeSetting, createQuoteRulePayload, basicAuth, slugify };

// ============================================
// PAGE CLASS
// ============================================

export class CatalogModePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ============================================
    // SELECTORS
    // ============================================

    admin = {
        settingsUrl: toPath(`wp-admin/admin.php?page=dokan#/settings`),
        sellingOptionsMenu: '//div[@class="nav-title" and contains(text(),"Selling Options")]',
        removeAddToCartButton: '.catalog_mode_hide_add_to_cart_button .switch',
        hideProductPrice: '.catalog_mode_hide_product_price .switch',
        saveChanges: '//input[@id="submit" and @value="Save Changes"]',
    };

    vendor = {
        settingsStoreUrl: toPath(`dashboard/settings/store`),
        catalogModeHideProductPrice: 'input#catalog_mode_hide_product_price',
    };

    customer = {
        singleProduct: {
            price: '//div[@class="summary entry-summary"]//p[@class="price"]',
            addToCart: 'button.single_add_to_cart_button',
            addToQuote: '.cart a.dokan_request_button',
        },
        singleStore: {
            searchInput: '.product-name-search',
            searchButton: '.search-store-products',
            productTitle: '.seller-items .product .woocommerce-loop-product__title',
            productPrice: '.seller-items .product .price',
            addToCart: '.seller-items .product .add_to_cart_button',
            addToQuote: '.seller-items .product .dokan_add_to_quote_button',
        },
        shop: {
            searchProductLite: '(//input[@class="search-field"])[1]',
            searchProductPro: 'input.dokan-form-control[placeholder="Search Products"]',
            searchButton: '.dokan-btn',
            productTitle: '#main .products .woocommerce-loop-product__title',
            productPrice: '#main .products .price',
            addToCart: '#main .products a.add_to_cart_button',
            addToQuote: '#main .products .dokan_add_to_quote_button',
        },
    };

    // ============================================
    // TEST DATA
    // ============================================

    testData = {
        colorCode: {
            blue: 'rgb(0, 144, 255)',
        },
        dokanOptionName: {
            selling: 'dokan_selling',
        },
    };

    // ============================================
    // HELPER METHODS
    // ============================================

    async goIfNotThere(subPath: string) {
        const url = toPath(`${subPath}`);
        const currentUrl = this.page.url().replace(/[/]$/, '');
        if (currentUrl !== url) {
            await this.page.goto(url, { waitUntil: 'domcontentloaded' });
        }
    }

    async click(selector: string) {
        // Settings page has a zero-sized `.loading` overlay + sticky header that
        // Playwright reports as intercepting pointer events. Force past the hit-test.
        await this.page.locator(selector).click({ force: true });
    }

    async getElementBackgroundColor(selector: string): Promise<string> {
        return await this.page.locator(selector).evaluate(el => window.getComputedStyle(el).getPropertyValue('background-color'));
    }

    async enableSwitcher(selector: string) {
        const spanSelector = /^(\/\/|\(\/\/)/.test(selector) ? `${selector}//span` : `${selector} span`;
        const value = await this.getElementBackgroundColor(spanSelector);
        if (!value.includes('rgb(0, 144, 255)')) {
            await this.click(spanSelector);
        }
    }

    async switcherHasColor(selector: string, color: string) {
        const spanSelector = /^(\/\/|\(\/\/)/.test(selector) ? `${selector}//span` : `${selector} span`;
        await expect(async () => {
            const value = await this.getElementBackgroundColor(spanSelector);
            expect(value).toBe(color);
        }).toPass();
    }

    async clickAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200) {
        const [, response] = await Promise.all([
            this.page.waitForLoadState('load'),
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).click(),
        ]);
        expect(response.status()).toBe(code);
        return response;
    }

    async toBeVisible(selector: string) {
        await expect(this.page.locator(selector)).toBeVisible();
    }

    async notToBeVisible(selector: string) {
        await expect(this.page.locator(selector)).toBeHidden();
    }

    async toContainText(selector: string, text: string) {
        await expect(this.page.locator(selector)).toContainText(text);
    }

    async clearAndType(selector: string, text: string) {
        await this.page.locator(selector).fill(text);
    }

    async pressAndWaitForLoadState(key: string) {
        await this.page.keyboard.press(key);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async waitForPageReady() {
        await this.page.waitForLoadState('load');
    }

    // ============================================
    // NAVIGATION METHODS
    // ============================================

    async goToDokanSettings() {
        await this.goIfNotThere('wp-admin/admin.php?page=dokan#/settings');
    }

    async goToSingleStore(storeName: string) {
        await this.goIfNotThere(`store/${slugify(storeName)}`);
    }

    async goToProductDetails(productName: string) {
        await this.goIfNotThere(`product/${slugify(productName)}`);
    }

    async goToShop() {
        await this.goIfNotThere('shop');
    }

    async singleStoreSearchProduct(storeName: string, productName: string) {
        await this.goToSingleStore(storeName);
        await this.clearAndType(this.customer.singleStore.searchInput, productName);
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(`store/${slugify(storeName)}`) && resp.status() === 200),
            this.click(this.customer.singleStore.searchButton),
        ]);
        await this.toContainText(this.customer.singleStore.productTitle, productName);
    }

    async shopSearchProduct(productName: string) {
        await this.goToShop();
        if (!DOKAN_PRO) {
            await this.clearAndType(this.customer.shop.searchProductLite, productName);
            await this.pressAndWaitForLoadState('Enter');
            await this.toContainText('.product_title.entry-title', productName);
        } else {
            await this.clearAndType(this.customer.shop.searchProductPro, productName);
            await Promise.all([
                this.page.waitForLoadState('domcontentloaded'),
                this.click(this.customer.shop.searchButton),
            ]);
            await this.toContainText(this.customer.shop.productTitle, productName);
        }
    }

    // ============================================
    // ADMIN METHODS
    // ============================================

    async addCatalogMode() {
        await this.goToDokanSettings();
        await this.click(this.admin.sellingOptionsMenu);

        await this.enableSwitcher(this.admin.removeAddToCartButton);
        await this.enableSwitcher(this.admin.hideProductPrice);

        await this.clickAndWaitForResponseAndLoadState('/admin-ajax.php', this.admin.saveChanges);

        await this.switcherHasColor(this.admin.removeAddToCartButton, this.testData.colorCode.blue);
        await this.switcherHasColor(this.admin.hideProductPrice, this.testData.colorCode.blue);
    }

    // ============================================
    // VENDOR METHODS
    // ============================================

    async accessCatalogModeSettings() {
        await this.goIfNotThere('dashboard/settings/store');
        await this.notToBeVisible(this.vendor.catalogModeHideProductPrice);
    }

    // ============================================
    // CUSTOMER METHODS
    // ============================================

    async viewRfqInCatalogMode(productName: string, storeName: string) {
        await this.goToProductDetails(productName);
        await this.toBeVisible(this.customer.singleProduct.addToQuote);

        await this.singleStoreSearchProduct(storeName, productName);
        await this.toBeVisible(this.customer.singleStore.addToQuote);

        if (DOKAN_PRO) {
            await this.shopSearchProduct(productName);
            await this.toBeVisible(this.customer.shop.addToQuote);
        }
    }

    async viewPriceInCatalogModeProduct(productName: string, storeName: string) {
        await this.goToProductDetails(productName);
        await this.toBeVisible(this.customer.singleProduct.price);

        await this.singleStoreSearchProduct(storeName, productName);
        await this.toBeVisible(this.customer.singleStore.productPrice);

        if (DOKAN_PRO) {
            await this.shopSearchProduct(productName);
            await this.toBeVisible(this.customer.shop.productPrice);
        }
    }

    async viewCatalogModeProduct(productName: string, storeName: string) {
        await this.goToProductDetails(productName);
        await this.notToBeVisible(this.customer.singleProduct.price);
        await this.notToBeVisible(this.customer.singleProduct.addToCart);

        await this.singleStoreSearchProduct(storeName, productName);
        await this.notToBeVisible(this.customer.singleStore.productPrice);
        await this.notToBeVisible(this.customer.singleStore.addToCart);

        if (DOKAN_PRO) {
            await this.shopSearchProduct(productName);
            await this.notToBeVisible(this.customer.shop.productPrice);
            await this.notToBeVisible(this.customer.shop.addToCart);
        }
    }
}
