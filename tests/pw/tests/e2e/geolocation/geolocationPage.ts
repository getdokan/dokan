import { Page, expect, request, APIRequestContext } from '@playwright/test';
import mysql from 'mysql2/promise';
import { serialize, unserialize } from 'php-serialize';
import { toPath } from '@utils/helpers';

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
    SERVER_URL: SERVER_URL_ENV,
    ADMIN,
    ADMIN_PASSWORD,
    DB_HOST_NAME,
    DB_USER_NAME,
    DB_USER_PASSWORD,
    DATABASE,
    DB_PORT,
    DB_PREFIX,
} = process.env;

const SERVER_URL = SERVER_URL_ENV || toPath('wp-json');
const dbPrefix = DB_PREFIX;

// ============================================
// HELPERS
// ============================================
export function basicAuth(username: string, password: string): string {
    return 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
}

function isPlainObject(value: any): boolean {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function deepMergeArrays(targetArray: any[], sourceArray: any[]): any[] {
    if (
        targetArray.every((item: any) => item instanceof Object && !Array.isArray(item)) &&
        sourceArray.every(item => item instanceof Object && !Array.isArray(item))
    ) {
        const mergedArray = [...targetArray];
        sourceArray.forEach((item: { [key: string]: any }, index: number) => {
            if (index < mergedArray.length && item instanceof Object && !Array.isArray(item)) {
                mergedArray[index] = deepMergeObjects(mergedArray[index], item);
            } else {
                mergedArray.push(item);
            }
        });
        return mergedArray;
    }
    return [...sourceArray];
}

function deepMergeObjects(target: { [key: string]: any }, source: { [key: string]: any }): { [key: string]: any } {
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

export const helpers = {
    slugify(str: string): string {
        return str
            .toString()
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-')
            .replace(/-$/g, '');
    },
};

// ============================================
// URLS / DATA
// ============================================
export const subUrls = {
    dokanSettings: 'wp-admin/admin.php?page=dokan#/settings',
    shop: 'shop',
    storeListing: 'store-listing',
    productDetails: (productName: string) => `product/${productName}`,
};

export const testData = {
    geolocationOptionName: 'dokan_geolocation',
    geolocationSettings: {
        show_locations_map: 'top',
        show_location_map_pages: 'all',
        show_filters_before_locations_map: 'on',
        show_product_location_in_wc_tab: 'on',
        distance_unit: 'km',
        distance_min: '0',
        distance_max: '10',
        map_zoom: '11',
        location: {
            latitude: '40.7127753',
            longitude: '-74.0059728',
            address: 'New York, NY, USA',
            zoom: '10',
        },
        dashboard_menu_manager: [] as any[],
    },
    predefinedSimpleProduct1: 'p1_v1 (simple)',
};

// ============================================
// PAYLOADS
// ============================================
export const payloads = {
    moduleIds: { geolocation: 'geolocation' },
    adminAuth: { Authorization: basicAuth(ADMIN || '', ADMIN_PASSWORD || '') },
};

// ============================================
// SELECTORS
// ============================================
const selectors = {
    adminSettingsMenuGeolocation: '//div[@class="nav-title" and contains(text(),"Geolocation")]',
    cShop: {
        locationMap: '#dokan-geolocation-locations-map',
        filterDiv: 'form.dokan-geolocation-location-filters',
        radiusUnit: 'span.dokan-range-slider-value',
        slider: 'input.dokan-range-slider',
    },
    cStoreList: {
        locationMap: 'div#dokan-geolocation-locations-map',
    },
    cSingleProduct: {
        locationTab: '.tabs .geolocation_tab a',
    },
};

// ============================================
// DB UTILITIES
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

function isSerialized(value: any): boolean {
    if (typeof value !== 'string') return false;
    const data = value.trim();
    if (data === 'N;') return true;
    if (data.length < 4) return false;
    if (data[1] !== ':') return false;
    return /^[adObis]:/.test(data);
}

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
        const query = `Select option_value FROM ${dbPrefix}_options WHERE option_name = ?;`;
        const res = await db.dbQuery(query, [optionName]);
        if (!res?.length) return null;
        return unserialize(res[0].option_value);
    },

    async setOptionValue(
        optionName: string,
        optionValue: object | string,
        serializeData: boolean = true
    ): Promise<any> {
        const value = serializeData && !isSerialized(optionValue as any) ? serialize(optionValue) : optionValue;
        const query = `INSERT INTO ${dbPrefix}_options (option_id, option_name, option_value, autoload)
            VALUES (NULL, ?, ?, 'yes')
            ON DUPLICATE KEY UPDATE option_value = ?;`;
        return await db.dbQuery(query, [optionName, value, value]);
    },

    async updateOptionValue(
        optionName: string,
        updatedSettings: object | string,
        serializeData?: boolean
    ): Promise<[any, any]> {
        const currentSettings = await db.getOptionValue(optionName);
        const newSettings =
            typeof updatedSettings === 'object'
                ? deepMergeObjects(currentSettings || {}, updatedSettings as any)
                : updatedSettings;
        await db.setOptionValue(optionName, newSettings, serializeData);
        return [currentSettings, newSettings];
    },

    async dispose(): Promise<void> {
        await pool.end();
    },
};

// ============================================
// API UTILITIES
// ============================================
const endPoints = {
    activateModule: `${SERVER_URL}/dokan/v1/admin/modules/activate`,
    deactivateModule: `${SERVER_URL}/dokan/v1/admin/modules/deactivate`,
};

export const api = {
    ctx: null as APIRequestContext | null,

    async init(): Promise<void> {
        api.ctx = await request.newContext();
    },

    async dispose(): Promise<void> {
        if (api.ctx) {
            await api.ctx.dispose();
            api.ctx = null;
        }
    },

    async activateModules(moduleIds: string | string[], auth: Record<string, string>): Promise<void> {
        if (!api.ctx) throw new Error('api not initialized');
        const modules = (Array.isArray(moduleIds) ? moduleIds : [moduleIds]).filter(m => m?.trim());
        if (!modules.length) throw new Error('No valid module IDs provided');
        const res = await api.ctx.put(endPoints.activateModule, {
            data: { module: modules },
            headers: auth,
        });
        if (!res.ok()) console.error(`Activate failed: ${res.status()}`, await res.text());
    },

    async deactivateModules(moduleIds: string | string[], auth: Record<string, string>): Promise<void> {
        if (!api.ctx) throw new Error('api not initialized');
        const modules = (Array.isArray(moduleIds) ? moduleIds : [moduleIds]).filter(m => m?.trim());
        if (!modules.length) throw new Error('No valid module IDs provided');
        const res = await api.ctx.put(endPoints.deactivateModule, {
            data: { module: modules },
            headers: auth,
        });
        if (!res.ok()) console.error(`Deactivate failed: ${res.status()}`, await res.text());
    },
};

// ============================================
// GEOLOCATION PAGE
// ============================================
export class GeolocationPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // Navigation helpers

    private createUrl(subPath: string): string {
        return toPath(subPath);
    }

    private async goto(subPath: string): Promise<void> {
        await this.page.goto(this.createUrl(subPath), { waitUntil: 'domcontentloaded' });
    }

    private async gotoUntilNetworkidle(subPath: string): Promise<void> {
        await this.page.goto(this.createUrl(subPath), { waitUntil: 'load' });
    }

    // Assertion helpers

    private async toBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeVisible();
    }

    private async notToBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeHidden();
    }

    private async toContainText(selector: string, text: string): Promise<void> {
        await expect(this.page.locator(selector)).toContainText(text);
    }

    private async toHaveAttribute(selector: string, attribute: string, value: string): Promise<void> {
        await expect(this.page.locator(selector)).toHaveAttribute(attribute, value);
    }

    private async toHaveValue(selector: string, value: string): Promise<void> {
        await expect(this.page.locator(selector)).toHaveValue(value);
    }

    private async focus(selector: string): Promise<void> {
        await this.page.locator(selector).focus();
    }

    private async press(key: string): Promise<void> {
        await this.page.keyboard.press(key);
    }

    private async setAttributeValue(selector: string, attribute: string, value: string): Promise<void> {
        await this.page.locator(selector).evaluate((el, [a, v]) => el.setAttribute(a as string, v as string), [attribute, value]);
    }

    private async goToProductDetails(productName: string): Promise<void> {
        await this.gotoUntilNetworkidle(subUrls.productDetails(helpers.slugify(productName)));
    }

    // ===========================================
    // PAGE METHODS
    // ===========================================

    async enableGeolocationModule(): Promise<void> {
        await this.goto(subUrls.dokanSettings);
        await this.toBeVisible(selectors.adminSettingsMenuGeolocation);

        await this.goto(subUrls.shop);
        await this.toBeVisible(selectors.cShop.locationMap);

        await this.goto(subUrls.storeListing);
        await this.toBeVisible(selectors.cStoreList.locationMap);
    }

    async disableGeolocationModule(): Promise<void> {
        await this.goto(subUrls.dokanSettings);
        await this.notToBeVisible(selectors.adminSettingsMenuGeolocation);

        await this.goto(subUrls.shop);
        await this.notToBeVisible(selectors.cShop.locationMap);

        await this.goto(subUrls.storeListing);
        await this.notToBeVisible(selectors.cStoreList.locationMap);
    }

    async viewMapPosition(position: 'top' | 'left' | 'right'): Promise<void> {
        await this.gotoUntilNetworkidle(subUrls.storeListing);
        await this.toHaveAttribute(selectors.cStoreList.locationMap, 'class', `dokan-geolocation-locations-map-${position}`);
    }

    async viewMap(place: 'all' | 'store_listing' | 'shop'): Promise<void> {
        switch (place) {
            case 'all':
                await this.gotoUntilNetworkidle(subUrls.shop);
                await this.toBeVisible(selectors.cStoreList.locationMap);
                await this.gotoUntilNetworkidle(subUrls.storeListing);
                await this.toBeVisible(selectors.cStoreList.locationMap);
                break;
            case 'store_listing':
                await this.gotoUntilNetworkidle(subUrls.shop);
                await this.notToBeVisible(selectors.cStoreList.locationMap);
                await this.gotoUntilNetworkidle(subUrls.storeListing);
                await this.toBeVisible(selectors.cStoreList.locationMap);
                break;
            case 'shop':
                await this.gotoUntilNetworkidle(subUrls.shop);
                await this.toBeVisible(selectors.cStoreList.locationMap);
                await this.gotoUntilNetworkidle(subUrls.storeListing);
                await this.notToBeVisible(selectors.cStoreList.locationMap);
                break;
        }
    }

    async viewMapFilters(status: 'enable' | 'disable'): Promise<void> {
        await this.gotoUntilNetworkidle(subUrls.shop);
        if (status === 'enable') {
            await this.toBeVisible(selectors.cShop.filterDiv);
        } else {
            await this.notToBeVisible(selectors.cShop.filterDiv);
        }
    }

    async viewProductLocationTab(productName: string, status: 'enable' | 'disable'): Promise<void> {
        await this.goToProductDetails(productName);
        if (status === 'enable') {
            await this.toBeVisible(selectors.cSingleProduct.locationTab);
        } else {
            await this.notToBeVisible(selectors.cSingleProduct.locationTab);
        }
    }

    async viewMapRadiusSearchUnitAndDistance(unit: 'km' | 'miles', distance: { min: string; max: string }): Promise<void> {
        await this.gotoUntilNetworkidle(subUrls.shop);
        await this.toContainText(selectors.cShop.radiusUnit, `Radius ${distance.max}${unit}`);
    }

    async slideMapRadiusBar(slideUnit: string): Promise<void> {
        await this.gotoUntilNetworkidle(subUrls.shop);
        await this.focus(selectors.cShop.slider);
        await this.setAttributeValue(selectors.cShop.slider, 'value', '0');
        for (let i = 0; i < Number(slideUnit); i++) {
            await this.press('ArrowRight');
        }
        await this.toHaveValue(selectors.cShop.slider, slideUnit);
    }
}
