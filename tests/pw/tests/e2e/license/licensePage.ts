import { Page, expect } from '@playwright/test';
import mysql from 'mysql2/promise';
import { serialize, unserialize } from 'php-serialize';
import { toPath } from '@utils/helpers';

// ============================================
// ENVIRONMENT VARIABLES
// ============================================
const {
    LICENSE_KEY,
    DB_HOST_NAME,
    DB_USER_NAME,
    DB_USER_PASSWORD,
    DATABASE,
    DB_PORT,
    DB_PREFIX,
} = process.env;

const dbPrefix = DB_PREFIX;

// ============================================
// URLS / DATA
// ============================================
export const subUrls = {
    license: 'wp-admin/admin.php?page=dokan-dashboard#/license',
};

export const testData = {
    optionName: 'dokan_pro_license',
    dokanLicense: {
        correctKey: LICENSE_KEY || '',
        incorrectKey: 'ABC-123-DEF-456-GHI-789',
    },
    dokanProLicense: {
        key: LICENSE_KEY,
        status: 'activate',
        remaining: 42,
        activation_limit: 50,
        expiry_days: 329,
        title: 'Business',
        source_id: 'dokan-business',
        recurring: 1,
    },
};

// ============================================
// SELECTORS
// ============================================
// Dokan moved the license UI into the new React admin dashboard (/#/license).
const selectors = {
    licenseText: 'h1:has-text("License")',
    activateSection: {
        licenseSection: 'h2:has-text("License Activation")',
        licenseKeyInput: 'input[name="license_key"]',
        activateLicense: 'button:has-text("Activate License")',
    },
    deactivateLicense: 'button:has-text("Deactivate License")',
    refreshLicense: 'button:has-text("Refresh")',
    activateLicenseInfo: 'button:has-text("Deactivate License")',
    successNotice: '[role="alert"], .notice-success, [class*="success"]',
    errorNotice: '[role="alert"], .notice-error, [class*="error"]',
    licenseStatusEndpoint: 'dokan-pro/v1/license/status',
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

    async dispose(): Promise<void> {
        await pool.end();
    },
};

// suppress unused import warning (unserialize kept for parity)
void unserialize;

// ============================================
// LICENSE PAGE
// ============================================
export class LicensePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private createUrl(subPath: string): string {
        return toPath(subPath);
    }

    private getCurrentUrl(): string {
        return this.page.url();
    }

    private isCurrentUrl(subPath: string): boolean {
        const url = new URL(this.getCurrentUrl());
        const currentURL = url.href.replace(/[/]$/, '');
        return currentURL === this.createUrl(subPath);
    }

    private async goto(subPath: string): Promise<void> {
        await this.page.goto(this.createUrl(subPath), { waitUntil: 'domcontentloaded' });
    }

    private async goIfNotThere(subPath: string): Promise<void> {
        if (!this.isCurrentUrl(subPath)) {
            await this.goto(subPath);
        }
    }

    private async toBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeVisible();
    }

    private async notToBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeHidden();
    }

    private async toContainText(selector: string, text: string): Promise<void> {
        await expect(this.page.locator(selector)).toContainText(text);
    }

    private async clearAndType(selector: string, text: string): Promise<void> {
        await this.page.locator(selector).fill(text);
    }

    private async isVisible(selector: string, timeoutMs = 2000): Promise<boolean> {
        try {
            await this.page.locator(selector).first().waitFor({ state: 'visible', timeout: timeoutMs });
            return true;
        } catch {
            return false;
        }
    }

    private async multipleElementVisible(sels: Record<string, any>): Promise<void> {
        for (const key in sels) {
            const v = sels[key];
            if (typeof v === 'string') await this.toBeVisible(v);
        }
    }

    private async clickAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<void> {
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).click(),
        ]);
    }

    // ===========================================
    // PAGE METHODS
    // ===========================================

    async adminLicenseRenderProperly(): Promise<void> {
        await this.goIfNotThere(subUrls.license);
        await this.toBeVisible(selectors.licenseText);

        // New React dashboard: when license is active the activation form is replaced
        // by Deactivate + Refresh buttons.
        await this.toBeVisible(selectors.deactivateLicense);
        await this.toBeVisible(selectors.refreshLicense);
    }

    async activateLicense(key: string, type: 'correct' | 'incorrect' = 'correct'): Promise<void> {
        await this.goto(subUrls.license);
        const alreadyActivated = await this.isVisible(selectors.deactivateLicense);
        if (!alreadyActivated) {
            await this.clearAndType(selectors.activateSection.licenseKeyInput, key);
            await this.clickAndWaitForResponse(subUrls.license, selectors.activateSection.activateLicense);
            if (type === 'correct') {
                await this.toContainText(selectors.successNotice, 'License activated successfully.');
                await this.toBeVisible(selectors.activateLicenseInfo);
                await this.toBeVisible(selectors.refreshLicense);
            } else {
                await this.toContainText(selectors.errorNotice, 'Invalid License Key');
            }
        } else {
            console.log('License already activated!!');
        }
    }

    async refreshLicense(): Promise<void> {
        await this.goto(subUrls.license);
        // The new UI hits /wp-json/dokan-pro/v1/license/status and doesn't show a toast;
        // a successful round-trip + Deactivate button still visible is the contract.
        await Promise.all([
            this.page.waitForResponse(r => r.url().includes(selectors.licenseStatusEndpoint) && r.status() === 200),
            this.page.locator(selectors.refreshLicense).click(),
        ]);
        await this.toBeVisible(selectors.deactivateLicense);
    }

    async deactivateLicense(): Promise<void> {
        await this.goto(subUrls.license);
        await this.clickAndWaitForResponse(subUrls.license, selectors.deactivateLicense);
        await this.toContainText(selectors.successNotice, 'License deactivated successfully.');
        await this.notToBeVisible(selectors.refreshLicense);
    }
}
