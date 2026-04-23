import { Page, expect, request, APIRequestContext } from '@playwright/test';
import mysql from 'mysql2/promise';
import { isSerialized, serialize } from 'php-serialize';

// ============================================
// ENVIRONMENT VARIABLES
// ============================================
const {
    ADMIN,
    ADMIN_PASSWORD,
    BASE_URL,
    DB_HOST_NAME,
    DB_USER_NAME,
    DB_USER_PASSWORD,
    DATABASE,
    DB_PORT,
    DB_PREFIX,
} = process.env;

const SERVER_URL = process.env.SERVER_URL || BASE_URL + '/wp-json';
const dbPrefix = DB_PREFIX;

// ============================================
// HELPER FUNCTIONS
// ============================================
function basicAuth(username: string, password: string): string {
    return 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
}

function hexToRgb(hex: string): string {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
}

// ============================================
// TYPES
// ============================================
export interface PaletteValues {
    buttonText: string;
    buttonBackground: string;
    buttonBorder: string;
    buttonHoverText: string;
    buttonHoverBackground: string;
    buttonHoverBorder: string;
    dashboardSidebarMenuText: string;
    dashboardSidebarBackground: string;
    dashboardSidebarActiveMenuText: string;
    dashboardSidebarActiveMenuBackground: string;
}

// ============================================
// SELECTORS
// ============================================
const settingsAdmin = {
    menus: {
        colors: '//div[@class="nav-title" and contains(text(),"Colors")]',
    },
    colors: {
        predefineColorPalette: '//h3[normalize-space()="Pre-defined Color Palette"]/../..',
        customColorPalette: '//h3[normalize-space()="Custom Color Palette"]/../..',
        predefinedPalette: (paletteName: string) => `//label[text()='${paletteName}']/..//input[@name='store_color_pallete']`,
        openColorPicker: (option: string) => `//h4[text()='${option}']//..//div[@class='color-picker-container']`,
        colorInput: 'input.hex-input',
        saveColor: 'button.dashicons-saved',
    },
    saveChanges: '//input[@id="submit" and @value="Save Changes"]',
    dokanUpdateSuccessMessage: '#setting-message_updated > p > strong',
};

const settingsVendor = {
    updateSettingsTop: 'button.dokan-update-setting-top-button',
};

const dashboardVendor = {
    menus: {
        menus: '#primary ul.dokan-dashboard-menu',
        activeMenu: '#primary .dokan-dashboard-menu li.active',
        primary: {
            dashboard: 'ul.dokan-dashboard-menu li.dashboard a',
            settings: '(//ul[@class="dokan-dashboard-menu"]//li[contains(@class,"settings has-submenu")]//a)[1]',
        },
    },
};

// ============================================
// URL SUB-PATHS
// ============================================
const subUrls = {
    ajax: '/admin-ajax.php',
    backend: {
        dokan: {
            settings: 'wp-admin/admin.php?page=dokan#/settings',
        },
    },
    frontend: {
        vDashboard: {
            settingsStore: 'dashboard/settings/store',
        },
    },
};

// ============================================
// TEST DATA
// ============================================
export const colorsData = {
    predefinedPalette: {
        default: 'default',
        petalParty: 'petal party',
        pinky: 'pinky',
        ocean: 'ocean',
        sweety: 'sweety',
        summerSplash: 'summer splash',
        tree: 'tree',
    },

    paletteValues: {
        default: {
            buttonText: '#FFFFFF',
            buttonBackground: '#7047EB',
            buttonBorder: '#370EB1',
            buttonHoverText: '#FFFFFF',
            buttonHoverBackground: '#502BBF',
            buttonHoverBorder: '#370EB1',
            dashboardSidebarMenuText: '#DACEFF',
            dashboardSidebarBackground: '#322067',
            dashboardSidebarActiveMenuText: '#FFFFFF',
            dashboardSidebarActiveMenuBackground: '#7047EB',
        },
        tree: {
            buttonText: '#FFFFFF',
            buttonBackground: '#1CB6A7',
            buttonBorder: '#1AA89B',
            buttonHoverText: '#FFFFFF',
            buttonHoverBackground: '#1DADA0',
            buttonHoverBorder: '#148C81',
            dashboardSidebarMenuText: '#ABF5EE',
            dashboardSidebarBackground: '#1BAC9E',
            dashboardSidebarActiveMenuText: '#FFFFFF',
            dashboardSidebarActiveMenuBackground: '#167D7F',
        },
        custom: {
            buttonText: '#FFFFFF',
            buttonBackground: '#007BFF',
            buttonBorder: '#0056B3',
            buttonHoverText: '#FFFFFF',
            buttonHoverBackground: '#0056B3',
            buttonHoverBorder: '#004085',
            dashboardSidebarMenuText: '#DACEFF',
            dashboardSidebarBackground: '#343A40',
            dashboardSidebarActiveMenuText: '#FFFFFF',
            dashboardSidebarActiveMenuBackground: '#007BFF',
        },
        custom2: {
            buttonText: '#FFFFFF',
            buttonBackground: '#3498DB',
            buttonBorder: '#2980B9',
            buttonHoverText: '#FFFFFF',
            buttonHoverBackground: '#2980B9',
            buttonHoverBorder: '#1F618D',
            dashboardSidebarMenuText: '#555555',
            dashboardSidebarBackground: '#F2F2F2',
            dashboardSidebarActiveMenuText: '#FFFFFF',
            dashboardSidebarActiveMenuBackground: '#3498DB',
        },
    } satisfies Record<'default' | 'tree' | 'custom' | 'custom2', PaletteValues>,

    saveSuccessMessage: 'Setting has been saved successfully.',
};

// dbData default color settings (for reset)
export const defaultColorsSettings = {
    store_color_pallete: {
        value: 'default',
        btn_text: '#FFFFFF',
        btn_hover: '#502BBF',
        btn_primary: '#7047EB',
        dash_nav_bg: '#322067',
        dash_nav_text: '#DACEFF',
        pallete_status: 'template',
        btn_hover_text: '#FFFFFF',
        dash_active_link: '#7047EB',
        btn_hover_border: '#370EB1',
        btn_primary_border: '#370EB1',
        dash_nav_active_text: '#FFFFFF',
        color_options: {
            'color-1': '#322067',
            'color-2': '#7047EB',
            'color-3': '#DACEFF',
            'color-4': '#502BBF',
        },
    },
    dashboard_menu_manager: [],
};

export const colorsOptionName = 'dokan_colors';
export const moduleId = 'color_scheme_customizer';

// ============================================
// DB UTILITIES
// ============================================
const pool = mysql.createPool({
    host: DB_HOST_NAME,
    user: DB_USER_NAME,
    password: DB_USER_PASSWORD,
    database: DATABASE,
    port: Number(DB_PORT),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export const db = {
    async query(query: string, params?: any[]): Promise<any> {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute(query, params);
            return rows;
        } finally {
            connection.release();
        }
    },

    async setOptionValue(optionName: string, optionValue: object | string, serializeData: boolean = true): Promise<any> {
        optionValue = serializeData && !isSerialized(optionValue as string) ? serialize(optionValue) : optionValue;
        const query = `
            INSERT INTO ${dbPrefix}_options (option_id, option_name, option_value, autoload)
            VALUES (NULL, ?, ?, 'yes')
            ON DUPLICATE KEY UPDATE option_value = ?;
        `;
        return await this.query(query, [optionName, optionValue, optionValue]);
    },
};

// ============================================
// API UTILITIES
// ============================================
export const api = {
    _context: null as APIRequestContext | null,

    async init() {
        this._context = await request.newContext();
    },

    async dispose() {
        await this._context?.dispose();
    },

    adminAuth(): Record<string, string> {
        return { Authorization: basicAuth(ADMIN!, ADMIN_PASSWORD!) };
    },

    async put(endpoint: string, data: any, headers: Record<string, string>): Promise<any> {
        const response = await this._context!.put(`${SERVER_URL}${endpoint}`, {
            data,
            headers,
        });
        return response;
    },

    async activateModules(moduleIds: string | string[], auth: Record<string, string>): Promise<void> {
        const modules = (Array.isArray(moduleIds) ? moduleIds : [moduleIds]).filter(m => m?.trim());
        if (!modules.length) throw new Error('No valid module IDs provided');
        const response = await this._context!.put(`${SERVER_URL}/dokan/v1/admin/modules/activate`, {
            data: { module: modules },
            headers: auth,
        });
        if (!response.ok()) console.error(`Activate failed: ${response.status()}`);
    },

    async deactivateModules(moduleIds: string | string[], auth: Record<string, string>): Promise<void> {
        const modules = (Array.isArray(moduleIds) ? moduleIds : [moduleIds]).filter(m => m?.trim());
        if (!modules.length) throw new Error('No valid module IDs provided');
        const response = await this._context!.put(`${SERVER_URL}/dokan/v1/admin/modules/deactivate`, {
            data: { module: modules },
            headers: auth,
        });
        if (!response.ok()) console.error(`Deactivate failed: ${response.status()}`);
    },
};

// ============================================
// PAGE CLASS
// ============================================
export class ColorsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ---- Navigation helpers ----

    private isCurrentUrl(subPath: string): boolean {
        const url = new URL(this.page.url());
        const currentURL = url.href.replace(/[/]$/, '');
        return currentURL === BASE_URL + '/' + subPath;
    }

    async goIfNotThere(subPath: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' = 'domcontentloaded', force = false): Promise<void> {
        if (!this.isCurrentUrl(subPath)) {
            const url = BASE_URL + '/' + subPath;
            await this.toPass(async () => {
                await this.page.goto(url, { waitUntil });
                expect(this.page.url()).toMatch(subPath);
            });
        }
        if (force) await this.page.reload();
    }

    async goto(subPath: string, options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' }, force = false): Promise<void> {
        await this.page.goto(BASE_URL + '/' + subPath, options);
        if (force) await this.page.reload();
    }

    async goToDokanSettings(): Promise<void> {
        await this.goIfNotThere(subUrls.backend.dokan.settings);
    }

    // ---- Click helpers ----

    async click(selector: string): Promise<void> {
        // Settings page has a zero-sized `.loading` / sticky header that Playwright
        // reports as intercepting pointer events. Force past the hit-test.
        await this.page.locator(selector).click({ force: true });
    }

    async clickAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200): Promise<void> {
        const [, response] = await Promise.all([
            this.page.waitForLoadState('load'),
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).click(),
        ]);
        expect(response.status()).toBe(code);
    }

    // ---- Input helpers ----

    async clearAndType(selector: string, text: string): Promise<void> {
        await this.page.locator(selector).fill(text);
    }

    // ---- Element style helpers ----

    async getElementCssStyle(selector: string): Promise<CSSStyleDeclaration> {
        const element = this.page.locator(selector);
        return await element.evaluate(el => window.getComputedStyle(el));
    }

    async getElementBackgroundColor(selector: string): Promise<string> {
        const element = this.page.locator(selector);
        return await element.evaluate(el => window.getComputedStyle(el).getPropertyValue('background-color'));
    }

    async getElementColor(selector: string): Promise<string> {
        const element = this.page.locator(selector);
        return await element.evaluate(el => window.getComputedStyle(el).getPropertyValue('color'));
    }

    async addAttributeValue(selector: string, attribute: string, value: string): Promise<void> {
        await this.page.locator(selector).waitFor();
        const previousAttribute = await this.page.getAttribute(selector, attribute);
        const newValue = `${previousAttribute} ${value}`;
        await this.page.locator(selector).evaluate((el, [attr, val]) => el.setAttribute(attr as string, val as string), [attribute, newValue]);
    }

    // ---- Assertions ----

    async toBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeVisible();
    }

    async notToBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeHidden();
    }

    async toContainText(selector: string, text: string): Promise<void> {
        await expect(this.page.locator(selector)).toContainText(text);
    }

    async toPass(asyncFn: () => Promise<void>, options?: { timeout?: number; intervals?: number[] }): Promise<void> {
        await expect(async () => {
            await asyncFn();
        }).toPass(options);
    }

    // ============================================
    // COLORS-SPECIFIC METHODS
    // ============================================

    async enableColorSchemeCustomizerModule(): Promise<void> {
        await this.goto(subUrls.backend.dokan.settings);
        await this.toBeVisible(settingsAdmin.menus.colors);
    }

    async disableColorSchemeCustomizerModule(): Promise<void> {
        await this.goto(subUrls.backend.dokan.settings, { waitUntil: 'domcontentloaded' }, true);
        await this.notToBeVisible(settingsAdmin.menus.colors);
    }

    async addColorPalette(paletteName: string, paletteValues: PaletteValues, paletteChoice: string = 'predefined'): Promise<void> {
        await this.goToDokanSettings();
        await this.click(settingsAdmin.menus.colors);

        if (paletteChoice === 'predefined') {
            await this.click(settingsAdmin.colors.predefineColorPalette);
            await this.click(settingsAdmin.colors.predefinedPalette(paletteName));
        } else {
            const fieldNames: Record<keyof PaletteValues, string> = {
                buttonText: 'Button Text',
                buttonBackground: 'Button Background',
                buttonBorder: 'Button Border',
                buttonHoverText: 'Button Hover Text',
                buttonHoverBackground: 'Button Hover Background',
                buttonHoverBorder: 'Button Hover Border',
                dashboardSidebarMenuText: 'Dashboard Sidebar Menu Text',
                dashboardSidebarBackground: 'Dashboard Sidebar Background',
                dashboardSidebarActiveMenuText: 'Dashboard Sidebar Active/Hover Menu Text',
                dashboardSidebarActiveMenuBackground: 'Dashboard Sidebar Active Menu Background',
            };

            await this.click(settingsAdmin.colors.customColorPalette);

            for (const key of Object.keys(paletteValues) as (keyof PaletteValues)[]) {
                await this.click(settingsAdmin.colors.openColorPicker(fieldNames[key]));
                await this.clearAndType(settingsAdmin.colors.colorInput, paletteValues[key]);
                await this.click(settingsAdmin.colors.saveColor);
            }
        }

        // save settings
        await this.clickAndWaitForResponseAndLoadState(subUrls.ajax, settingsAdmin.saveChanges);
        await this.toContainText(settingsAdmin.dokanUpdateSuccessMessage, colorsData.saveSuccessMessage);

        // convert hex to rgb for assertions
        const rgbValues = {} as PaletteValues;
        for (const key of Object.keys(paletteValues) as (keyof PaletteValues)[]) {
            rgbValues[key] = hexToRgb(paletteValues[key]);
        }

        // assertions on vendor dashboard
        await this.goIfNotThere(subUrls.frontend.vDashboard.settingsStore, 'networkidle');

        // button color
        const beforeHover = await this.getElementCssStyle(settingsVendor.updateSettingsTop);
        // hovered button color
        await this.addAttributeValue(settingsVendor.updateSettingsTop, 'class', 'active');
        const afterHover = await this.getElementCssStyle(settingsVendor.updateSettingsTop);
        // sidebar color
        const dashboardSidebarMenuText = await this.getElementColor(dashboardVendor.menus.primary.dashboard);
        const dashboardSidebarBackground = await this.getElementBackgroundColor(dashboardVendor.menus.menus);
        const dashboardSidebarActiveMenuBackground = await this.getElementBackgroundColor(dashboardVendor.menus.activeMenu);
        const dashboardSidebarActiveHoverMenuText = await this.getElementColor(dashboardVendor.menus.primary.settings);

        expect(beforeHover.color).toEqual(rgbValues.buttonText);
        expect(beforeHover.backgroundColor).toEqual(rgbValues.buttonBackground);
        expect(beforeHover.borderColor).toEqual(rgbValues.buttonBorder);
        expect(afterHover.color).toEqual(rgbValues.buttonHoverText);
        expect(afterHover.backgroundColor).toEqual(rgbValues.buttonHoverBackground);
        expect(afterHover.borderColor).toEqual(rgbValues.buttonHoverBorder);
        expect(dashboardSidebarMenuText).toEqual(rgbValues.dashboardSidebarMenuText);
        expect(dashboardSidebarBackground).toEqual(rgbValues.dashboardSidebarBackground);
        expect(dashboardSidebarActiveHoverMenuText).toEqual(rgbValues.dashboardSidebarActiveMenuText);
        expect(dashboardSidebarActiveMenuBackground).toEqual(rgbValues.dashboardSidebarActiveMenuBackground);
    }
}
