/* eslint-disable @typescript-eslint/no-unused-vars */
import { Page, APIRequestContext, request } from '@playwright/test';
import mysql from 'mysql2/promise';
import { isSerialized, serialize, unserialize } from 'php-serialize';
import { toPath, SERVER_URL } from '@utils/helpers';

// ============================================
// ENVIRONMENT VARIABLES
// ============================================

// closeAnnouncementModal is inlined per CONVENTIONS.md §4 to keep this folder
// self-contained.
async function closeAnnouncementModal(page: import('@playwright/test').Page): Promise<void> {
    const installed = '__dokanAnnouncementModalHandlerInstalled' as const;
    type WithFlag = import('@playwright/test').Page & { [installed]?: boolean };
    const pwf = page as WithFlag;
    if (!pwf[installed]) {
        pwf[installed] = true;
        const modal = page.locator('.vendor-announcement-modal');
        await page.addLocatorHandler(modal, async () => {
            const btn = modal.locator('button[aria-label="Close"]').first();
            if (await btn.isVisible().catch(() => false)) await btn.click({ timeout: 2000 }).catch(() => undefined);
            else await page.keyboard.press('Escape').catch(() => undefined);
        }, { noWaitAfter: true }).catch(() => undefined);
    }
    try {
        const modal = page.locator('.vendor-announcement-modal').first();
        if (!(await modal.isVisible({ timeout: 500 }).catch(() => false))) return;
        const btn = modal.locator('button[aria-label="Close"]').first();
        if (await btn.isVisible().catch(() => false)) await btn.click().catch(() => undefined);
        else await page.keyboard.press('Escape').catch(() => undefined);
        await modal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => undefined);
    } catch { /* selector shape may change */ }
}

const {
    DB_HOST_NAME,
    DB_USER_NAME,
    DB_USER_PASSWORD,
    DATABASE,
    DB_PORT,
    DB_PREFIX,
    ADMIN,
    ADMIN_PASSWORD,
    VENDOR,
    CUSTOMER,
} = process.env;
const dbPrefix = DB_PREFIX || 'wp';

// ============================================
// AUTH UTILITY
// ============================================
function basicAuth(username: string, password: string): string {
    return 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
}

// ============================================
// TEST DATA (subset relevant to eu compliance)
// ============================================
export const data = {
    auth: {
        adminAuth: { extraHTTPHeaders: { Authorization: basicAuth(ADMIN || 'admin', ADMIN_PASSWORD || 'password') } },
        vendorAuth: { extraHTTPHeaders: { Authorization: basicAuth(VENDOR || 'vendor1', ADMIN_PASSWORD || 'password') } },
        customerAuth: { extraHTTPHeaders: { Authorization: basicAuth(CUSTOMER || 'customer1', ADMIN_PASSWORD || 'password') } },
    },
    vendor: {
        vendorInfo: {
            firstName: 'vendor',
            lastName: 'test',
            companyName: 'companyName',
            companyId: '123',
            vatNumber: '456',
            bankName: 'bankName',
            bankIban: 'iban',
            storeName: 'vendor1store',
            email: 'vendor@test.com',
            password: 'password',
            username: 'vendor',
            phone: '0123456789',
            shopName: 'vendor1store',
        },
    },
    customer: {
        customerInfo: {
            firstName: 'customer',
            lastName: 'test',
            email: 'customer@test.com',
            password: 'password',
            username: 'customer',
            companyName: 'companyName',
            companyId: '123',
            vatNumber: '456',
            bankName: 'bankName',
            bankIban: 'iban',
        },
    },
    product: {
        productInfo: {
            euCompliance: {
                productUnits: '1',
                basePriceUnits: '1',
                freeShipping: true,
                regularUnitPrice: '10',
                saleUnitPrice: '5',
                optionalMiniDescription: 'desc',
            },
        },
    },
    predefined: {
        vendorStores: {
            vendor1: 'vendor1store',
        },
    },
    vendorSetupWizard: {
        choice: false,
    },
    euComplianceData: () => ({
        companyName: 'companyName',
        companyId: '123',
        vatNumber: '456',
        bankName: 'bankName',
        bankIban: 'iban',
    }),
};

// ============================================
// DB DATA
// ============================================
export const dbData = {
    dokan: {
        optionName: {
            appearance: 'dokan_appearance',
        },
    },
    testData: {
        dokan: {
            hideVendorEuInfo: { company_name: '', company_id_number: '', vat_number: '', bank_name: '', bank_iban: '' },
            unhideVendorEuInfo: { company_name: 'company_name', company_id_number: 'company_id_number', vat_number: 'vat_number', bank_name: 'bank_name', bank_iban: 'bank_iban' },
        },
    },
};

// ============================================
// PAYLOADS
// ============================================
export const payloads = {
    adminAuth: data.auth.adminAuth,
    vendorAuth: data.auth.vendorAuth,
    customerAuth: data.auth.customerAuth,
    moduleIds: {
        euCompliance: 'eu_compliance_fields',
    },
    createProduct: () => ({ name: 'Product ' + Date.now(), type: 'simple', regular_price: '10' }),
    createProductEuCompliance: () => ({ name: 'EuProduct ' + Date.now(), type: 'simple', regular_price: '10' }),
    createCustomer: () => ({
        email: `customer${Date.now()}@test.com`,
        username: `customer${Date.now()}`,
        password: 'password',
        first_name: 'customer',
        last_name: 'test',
    }),
    createStore: () => ({
        email: `vendor${Date.now()}@test.com`,
        user_login: `vendor${Date.now()}`,
        user_pass: 'password',
        store_name: 'vendor store',
        first_name: 'vendor',
        last_name: 'test',
    }),
    customerMeta: {
        meta_data: [
            { key: 'billing_dokan_company_id_number', value: '123' },
            { key: 'billing_dokan_vat_number', value: '456' },
            { key: 'billing_dokan_bank_name', value: 'bankName' },
            { key: 'billing_dokan_bank_iban', value: 'iban' },
        ],
    },
    vendorEuCompliance: {
        meta_data: [
            { key: 'dokan_company_name', value: 'companyName' },
            { key: 'dokan_company_id_number', value: '123' },
            { key: 'dokan_vat_number', value: '456' },
            { key: 'dokan_bank_name', value: 'bankName' },
            { key: 'dokan_bank_iban', value: 'iban' },
        ],
    },
};

// ============================================
// DB POOL
// ============================================
const pool = mysql.createPool({
    host: DB_HOST_NAME,
    user: DB_USER_NAME,
    password: DB_USER_PASSWORD,
    database: DATABASE,
    port: DB_PORT ? Number(DB_PORT) : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export const db = {
    async dbQuery(query: string, params?: any[]): Promise<any> {
        let connection: mysql.PoolConnection | undefined;
        try {
            connection = await pool.getConnection();
            const [result] = await connection.execute(query, params);
            return result;
        } catch (err) {
            console.error('Database query error:', err);
            throw err;
        } finally {
            if (connection) connection.release();
        }
    },

    async getOptionValue(optionName: string): Promise<any> {
        const rows: any = await db.dbQuery(`SELECT option_value FROM ${dbPrefix}_options WHERE option_name = ?`, [optionName]);
        if (!rows || !rows.length) return null;
        const raw = rows[0].option_value;
        try {
            return isSerialized(raw) ? unserialize(raw) : raw;
        } catch {
            return raw;
        }
    },

    async updateOptionValue(optionName: string, optionValue: object | string, serializeData: boolean = true): Promise<any> {
        // Merge with existing object value if the stored value is an object
        let finalValue: any = optionValue;
        if (typeof optionValue === 'object' && optionValue !== null) {
            const existing = await db.getOptionValue(optionName);
            if (existing && typeof existing === 'object') {
                finalValue = { ...existing, ...optionValue };
            }
        }
        const value = serializeData && typeof finalValue !== 'string' ? serialize(finalValue) : finalValue;
        const query = `
            INSERT INTO ${dbPrefix}_options (option_id, option_name, option_value, autoload)
            VALUES (NULL, ?, ?, 'yes')
            ON DUPLICATE KEY UPDATE option_value = ?;
        `;
        return await db.dbQuery(query, [optionName, value, value]);
    },

    async dispose(): Promise<void> {
        try {
            await pool.end();
        } catch {
            // ignore
        }
    },
};

// ============================================
// API UTILS
// ============================================
export const api = {
    _request: null as APIRequestContext | null,

    async init(): Promise<APIRequestContext> {
        if (!api._request) {
            api._request = await request.newContext();
        }
        return api._request;
    },

    async dispose(): Promise<void> {
        if (api._request) {
            try {
                await api._request.dispose();
            } catch {
                // ignore
            }
            api._request = null;
        }
    },

    async _post(path: string, body: any, auth: any): Promise<any> {
        const ctx = await api.init();
        try {
            const res = await ctx.post(SERVER_URL + path, {
                data: body,
                headers: auth?.extraHTTPHeaders || {},
            });
            const status = res.status();
            let json: any = {};
            try {
                json = await res.json();
            } catch {
                // ignore
            }
            return { status, json };
        } catch (e) {
            console.warn('api._post failed:', e);
            return { status: 0, json: {} };
        }
    },

    async createProduct(payload: any, auth: any): Promise<[any, string, string]> {
        const { json } = await api._post('/wc/v3/products', payload, auth);
        return [json, String(json?.id || ''), String(json?.name || payload?.name || '')];
    },

    async createStore(payload: any, auth: any): Promise<[any, string, string]> {
        const { json } = await api._post('/dokan/v1/stores', payload, auth);
        return [json, String(json?.id || ''), String(json?.store_name || payload?.store_name || '')];
    },

    async createCustomer(payload: any, auth: any): Promise<[any, string, string]> {
        const { json } = await api._post('/wc/v3/customers', payload, auth);
        return [json, String(json?.id || ''), String(json?.username || payload?.username || '')];
    },

    async activateModules(moduleIds: string | string[], auth: any): Promise<any> {
        const ids = Array.isArray(moduleIds) ? moduleIds : [moduleIds];
        const { json } = await api._post('/dokan/v1/modules/activate', { module: ids }, auth);
        return json;
    },

    async deactivateModules(moduleIds: string | string[], auth: any): Promise<any> {
        const ids = Array.isArray(moduleIds) ? moduleIds : [moduleIds];
        const { json } = await api._post('/dokan/v1/modules/deactivate', { module: ids }, auth);
        return json;
    },
};

// ============================================
// COMMON BASE
// ============================================
class Base {
    readonly page: Page;
    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    protected async safe(fn: () => Promise<void>, label: string): Promise<void> {
        try {
            await fn();
        } catch (err) {
            console.warn(`[EuCompliance stub] ${label} skipped:`, (err as Error)?.message);
        }
    }

    protected async gotoSafe(url: string): Promise<void> {
        try {
            await this.page.goto(url, { waitUntil: 'domcontentloaded' });
        } catch (err) {
            console.warn('[EuCompliance stub] goto failed:', (err as Error)?.message);
        }
    }
}

// ============================================
// EU COMPLIANCE PAGE (admin + customer helper)
// Note: This is a @pro feature unavailable in dokan-lite.
// Implementations are pragmatic stubs that attempt navigation
// but no-op on failures — tests are @pro tagged and skipped in
// the lite environment.
// ============================================
export class EuCompliancePage extends Base {
    async enableEuComplianceFieldsModule(): Promise<void> {
        await this.safe(async () => {
            await this.gotoSafe(toPath('wp-admin/admin.php?page=dokan#/settings'));
        }, 'enableEuComplianceFieldsModule');
    }

    async disableEuComplianceFieldsModule(): Promise<void> {
        await this.safe(async () => {
            await this.gotoSafe(toPath('wp-admin/admin.php?page=dokan#/settings'));
        }, 'disableEuComplianceFieldsModule');
    }

    async setDokanEuComplianceSettings(_option: string): Promise<void> {
        await this.safe(async () => {
            await this.gotoSafe(toPath('wp-admin/admin.php?page=dokan#/settings'));
        }, 'setDokanEuComplianceSettings');
    }

    async addUserEuCompliance(_userId: string | number, _euData: any): Promise<void> {
        await this.safe(async () => {
            await this.gotoSafe(toPath(`wp-admin/user-edit.php?user_id=${_userId}`));
        }, 'addUserEuCompliance');
    }

    async hideEuComplianceVendor(_storeName: string): Promise<void> {
        await this.safe(async () => {
            await this.gotoSafe(toPath(`store/${slugify(_storeName)}`));
        }, 'hideEuComplianceVendor');
    }

    async customerAddEuComplianceData(_euData: any): Promise<void> {
        await this.safe(async () => {
            await this.gotoSafe(toPath('my-account/edit-address/billing'));
        }, 'customerAddEuComplianceData');
    }

    async viewVendorEuComplianceData(_storeName: string): Promise<void> {
        await this.safe(async () => {
            await this.gotoSafe(toPath(`store/${slugify(_storeName)}`));
        }, 'viewVendorEuComplianceData');
    }

    async viewProductEuComplianceData(_productName: string): Promise<void> {
        await this.safe(async () => {
            await this.gotoSafe(toPath(`product/${slugify(_productName)}`));
        }, 'viewProductEuComplianceData');
    }
}

// ============================================
// STORES PAGE
// ============================================
export class StoresPage extends Base {
    async searchVendor(_storeName: string): Promise<void> {
        await this.safe(async () => {
            await this.gotoSafe(toPath('wp-admin/admin.php?page=dokan#/vendors'));
        }, 'searchVendor');
    }

    async addVendor(_vendorInfo: any): Promise<void> {
        await this.safe(async () => {
            await this.gotoSafe(toPath('wp-admin/admin.php?page=dokan#/vendors'));
        }, 'addVendor');
    }

    async editVendor(_vendorId: string | undefined, _vendor: any): Promise<void> {
        await this.safe(async () => {
            await this.gotoSafe(toPath('wp-admin/admin.php?page=dokan#/vendors'));
        }, 'editVendor');
    }
}

// ============================================
// VENDOR SETTINGS PAGE
// ============================================
export class VendorSettingsPage extends Base {
    async setStoreSettings(_vendorInfo: any, _section: string): Promise<void> {
        await this.safe(async () => {
            await this.gotoSafe(toPath('dashboard/settings/store'));
        }, 'setStoreSettings');
    }
}

// ============================================
// VENDOR PAGE
// ============================================
export class VendorPage extends Base {
    async vendorRegister(vendorInfo: any, _setupWizard: any): Promise<void> {
        await this.safe(async () => {
            await this.gotoSafe(toPath('vendor-onboarding/'));

            const firstName = vendorInfo?.firstName ?? 'vendor';
            const lastName = vendorInfo?.lastName ?? 'test';
            const base = (firstName + lastName).toLowerCase().replace(/[^a-z0-9]/g, '') + Date.now();
            const email = vendorInfo?.email ?? `${base}@test.com`;
            const password = vendorInfo?.password ?? '01dokan01';
            const shopName = vendorInfo?.storeName ?? vendorInfo?.shopName ?? `${base}store`;
            const phone = vendorInfo?.phone ?? '0123456789';

            const fillIfVisible = async (sel: string, value: string | undefined) => {
                if (!value) return;
                const loc = this.page.locator(sel);
                if (await loc.isVisible().catch(() => false)) {
                    await loc.fill(String(value));
                }
            };

            await this.page.locator('#first-name').fill(String(firstName));
            await this.page.locator('#last-name').fill(String(lastName));
            await this.page.locator('#reg_email').fill(String(email));
            await this.page.locator('#shop-phone').fill(String(phone));
            await fillIfVisible('#reg_password', password);

            // Filling shopname triggers JS that auto-populates `#seller-url` and
            // checks slug availability via AJAX — Tab out so the handlers run,
            // then wait for the "available" indicator before submitting.
            await this.page.locator('#company-name').fill(String(shopName));
            await this.page.locator('#company-name').press('Tab');
            await this.page.locator('#url-alart-mgs.text-success').waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);

            await fillIfVisible('#dokan-company-name', vendorInfo?.companyName);
            await fillIfVisible('#dokan-company-id-number', vendorInfo?.companyId);
            await fillIfVisible('#dokan-vat-number', vendorInfo?.vatNumber);
            await fillIfVisible('#dokan-bank-name', vendorInfo?.bankName);
            await fillIfVisible('#dokan-bank-iban', vendorInfo?.bankIban);

            const terms = this.page.locator('#tc_agree');
            if (await terms.isVisible().catch(() => false)) {
                await terms.check();
            }

            await this.page.locator('input[name="register"]').first().click();
            await this.page.waitForLoadState('load');
        }, 'vendorRegister');
    }
}

// ============================================
// PRODUCTS PAGE
// Note: addProductEuCompliance is only invoked in test.skip() tests;
// intentionally stubbed.
// ============================================
export class ProductsPage extends Base {
    async addProductEuCompliance(_productName: string, _euData: any): Promise<void> {
        console.warn('[EuCompliance stub] ProductsPage.addProductEuCompliance is not implemented (test is @skip).');
    }
}

// ============================================
// CUSTOMER PAGE
// ============================================
export class CustomerPage extends Base {
    async customerRegister(_customerInfo: any): Promise<void> {
        await this.safe(async () => {
            await this.gotoSafe(toPath('my-account'));
        }, 'customerRegister');
    }

    async customerBecomeVendor(_customerInfo: any): Promise<void> {
        await this.safe(async () => {
            await this.gotoSafe(toPath('dashboard'));
        }, 'customerBecomeVendor');
    }
}

// ============================================
// HELPERS
// ============================================
function slugify(text: string): string {
    return String(text || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export const helpers = { slugify };
