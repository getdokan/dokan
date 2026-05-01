import { Page, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import mysql from 'mysql2/promise';
import { isSerialized, serialize } from 'php-serialize';

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
        void closeAnnouncementModal(page);
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
        // Dokan Lite 5.0.0 turned the customer/vendor radio on the my-account
        // form into a hidden input (role defaults to "customer"; vendor signup
        // moved to a dedicated onboarding page). Click only when the control
        // is still rendered as a visible radio.
        const locator = this.page.locator(selectors.registration.regAsCustomer);
        if (await locator.isVisible().catch(() => false)) {
            await locator.click();
        }
    }

    async clickRegisterButton(): Promise<void> {
        // In Dokan Lite 5.0.0 the my-account register button click does not
        // reliably trigger native form submit (a JS handler swallows it).
        // Call form.submit() directly — bypasses the JS submit-event listeners
        // that the button click would fire and goes straight to the network POST.
        await Promise.all([
            this.page.waitForResponse(
                resp => resp.url().includes(subUrls.myAccount) && resp.status() === 302,
                { timeout: 30000 },
            ),
            this.page.evaluate(() => {
                const form =
                    (document.querySelector('form.woocommerce-form-register') as HTMLFormElement | null) ??
                    (document.querySelector('form.register') as HTMLFormElement | null);
                if (!form) {
                    throw new Error('Register form not found on /my-account');
                }
                // submit() doesn't include the button's name/value, but the
                // server-side handler dispatches on input[name=register] — so
                // inject one if it's missing.
                if (!form.querySelector('input[name="register"]')) {
                    const hidden = document.createElement('input');
                    hidden.type = 'hidden';
                    hidden.name = 'register';
                    hidden.value = 'Register';
                    form.appendChild(hidden);
                }
                form.submit();
            }),
        ]);
        await this.page.waitForLoadState('load');
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
        // 5.0.0+: hidden input is always set to "customer". Older templates use
        // a checked radio. Accept either: visible radio must be checked,
        // hidden input's value must equal "customer".
        const locator = this.page.locator(selectors.registration.regAsCustomer);
        const isHidden = await locator.evaluate(el => (el as HTMLInputElement).type === 'hidden').catch(() => false);
        if (isHidden) {
            await this.toHaveValue(selectors.registration.regAsCustomer, 'customer');
        } else {
            await this.toBeChecked(selectors.registration.regAsCustomer);
        }
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
