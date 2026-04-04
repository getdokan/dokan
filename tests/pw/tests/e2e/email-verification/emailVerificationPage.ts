import { Page, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import mysql from 'mysql2/promise';
import { isSerialized, serialize } from 'php-serialize';

// ============================================
// ENVIRONMENT VARIABLES
// ============================================
const { BASE_URL, USER_PASSWORD, DB_HOST_NAME, DB_USER_NAME, DB_USER_PASSWORD, DATABASE, DB_PORT, DB_PREFIX } = process.env;
const dbPrefix = DB_PREFIX;

// ============================================
// URLS
// ============================================
export const subUrls = {
    myAccount: 'my-account',
};

// ============================================
// TEST DATA
// ============================================
export const emailVerificationTexts = {
    loginNotice: 'Please check your email and complete email verification to login.',
};

export const userData = {
    username: () => faker.person.firstName('male'),
    emailDomain: '@email.com',
    password: USER_PASSWORD || 'testPassword123',
};

// ============================================
// SELECTORS
// ============================================
const selectors = {
    registration: {
        regEmail: '#reg_email',
        regPassword: '#reg_password',
        regAsCustomer: '//input[@value="customer"]',
        register: '.woocommerce-Button',
    },
    login: {
        username: '#username',
        userPassword: '#password',
        logIn: '//button[@value="Log in"]',
    },
    woocommerceSuccessMessage: 'div.woocommerce-message',
};

// ============================================
// DB OPTION NAME + DEFAULTS
// ============================================
export const dbOptionName = 'dokan_email_verification';
export const emailVerificationSettings = {
    enabled: 'off',
    registration_notice: 'Please check your email and complete email verification to login.',
    login_notice: 'Please check your email and complete email verification to login.',
    dashboard_menu_manager: [] as any[],
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

    async setOptionValue(optionName: string, optionValue: object | string, serializeData: boolean = true): Promise<any> {
        const value = serializeData && !isSerialized(optionValue as string) ? serialize(optionValue) : optionValue;
        const query = `
            INSERT INTO ${dbPrefix}_options (option_id, option_name, option_value, autoload)
            VALUES (NULL, ?, ?, 'yes')
            ON DUPLICATE KEY UPDATE option_value = ?;
        `;
        return await db.dbQuery(query, [optionName, value, value]);
    },

    async dispose(): Promise<void> {
        await pool.end();
    },
};

// ============================================
// EMAIL VERIFICATIONS PAGE
// ============================================
export class EmailVerificationsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Navigation helpers

    private createUrl(subPath: string): string {
        return BASE_URL + '/' + subPath;
    }

    private getCurrentUrl(): string {
        return this.page.url();
    }

    private isCurrentUrl(subPath: string): boolean {
        const url = new URL(this.getCurrentUrl());
        const currentURL = url.href.replace(/[/]$/, '');
        return currentURL === this.createUrl(subPath);
    }

    private async goIfNotThere(subPath: string): Promise<void> {
        if (!this.isCurrentUrl(subPath)) {
            const url = this.createUrl(subPath);
            await expect(async () => {
                await this.page.goto(url, { waitUntil: 'domcontentloaded' });
                const currentUrl = this.getCurrentUrl();
                expect(currentUrl).toMatch(subPath);
            }).toPass();
        }
    }

    // Click / input helpers

    private async click(selector: string): Promise<void> {
        await this.page.locator(selector).click();
    }

    private async clearAndType(selector: string, text: string): Promise<void> {
        await this.page.locator(selector).fill(text);
    }

    private async clickAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200): Promise<void> {
        await Promise.all([
            this.page.waitForLoadState('load'),
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).click(),
        ]);
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

    private async toHaveValue(selector: string, value: string): Promise<void> {
        await expect(this.page.locator(selector)).toHaveValue(value);
    }

    private async toBeChecked(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeChecked();
    }

    // ===========================================
    // NAVIGATION
    // ===========================================
    async navigateToMyAccount(): Promise<void> {
        await this.goIfNotThere(subUrls.myAccount);
    }

    // ===========================================
    // REGISTRATION FORM ACTIONS
    // ===========================================
    async fillRegistrationEmail(email: string): Promise<void> {
        await this.clearAndType(selectors.registration.regEmail, email);
    }

    async fillRegistrationPassword(password: string): Promise<void> {
        await this.clearAndType(selectors.registration.regPassword, password);
    }

    async selectRegisterAsCustomer(): Promise<void> {
        await this.click(selectors.registration.regAsCustomer);
    }

    async clickRegisterButton(): Promise<void> {
        await this.clickAndWaitForResponseAndLoadState(subUrls.myAccount, selectors.registration.register, 302);
    }

    async clickRegisterButtonWithoutWaiting(): Promise<void> {
        await this.click(selectors.registration.register);
        await this.page.waitForTimeout(1000);
    }

    // ===========================================
    // REGISTRATION VALIDATIONS
    // ===========================================
    async validateRegistrationEmailField(expectedEmail: string): Promise<void> {
        await this.toHaveValue(selectors.registration.regEmail, expectedEmail);
    }

    async validateRegistrationPasswordField(expectedPassword: string): Promise<void> {
        await this.toHaveValue(selectors.registration.regPassword, expectedPassword);
    }

    async validateRegisterAsCustomerSelected(): Promise<void> {
        await this.toBeChecked(selectors.registration.regAsCustomer);
    }

    // ===========================================
    // LOGIN FORM ACTIONS
    // ===========================================
    async fillLoginUsername(username: string): Promise<void> {
        await this.clearAndType(selectors.login.username, username);
    }

    async fillLoginPassword(password: string): Promise<void> {
        await this.clearAndType(selectors.login.userPassword, password);
    }

    async clickLoginButton(): Promise<void> {
        await this.clickAndWaitForResponseAndLoadState(subUrls.myAccount, selectors.login.logIn, 302);
    }

    // ===========================================
    // LOGIN VALIDATIONS
    // ===========================================
    async validateLoginUsernameField(expectedUsername: string): Promise<void> {
        await this.toHaveValue(selectors.login.username, expectedUsername);
    }

    async validateLoginPasswordField(expectedPassword: string): Promise<void> {
        await this.toHaveValue(selectors.login.userPassword, expectedPassword);
    }

    // ===========================================
    // VERIFICATION ASSERTIONS
    // ===========================================
    async verifyRegistrationEmailVerificationNotice(): Promise<void> {
        await this.toBeVisible(selectors.woocommerceSuccessMessage);
        await this.toContainText(selectors.woocommerceSuccessMessage, emailVerificationTexts.loginNotice);
    }

    async verifyLoginEmailVerificationNotice(): Promise<void> {
        await this.toBeVisible(selectors.woocommerceSuccessMessage);
        await this.toContainText(selectors.woocommerceSuccessMessage, emailVerificationTexts.loginNotice);
    }

    async verifyNoSuccessMessage(): Promise<void> {
        await this.notToBeVisible(selectors.woocommerceSuccessMessage);
    }

    // ===========================================
    // UTILITIES
    // ===========================================
    async registerWithoutVerification(user: { username: string; password: string }): Promise<void> {
        await this.navigateToMyAccount();
        await this.fillRegistrationEmail(user.username);
        await this.fillRegistrationPassword(user.password);
        await this.selectRegisterAsCustomer();
        await this.clickRegisterButton();
    }
}
