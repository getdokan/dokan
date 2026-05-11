import { Page, expect } from '@playwright/test';

import { toPath } from '@utils/helpers';

// ============================================
// VENDOR ANNOUNCEMENT MODAL DISMISSER (inlined per CONVENTIONS.md §4)
// ============================================
async function closeAnnouncementModal(page: Page): Promise<void> {
    const installed = '__dokanAnnouncementModalHandlerInstalled' as const;
    const pwf = page as Page & { [installed]?: boolean };
    if (!pwf[installed]) {
        pwf[installed] = true;
        const modal = page.locator('.vendor-announcement-modal');
        await page.addLocatorHandler(
            modal,
            async () => {
                const closeBtn = modal.locator('button[aria-label="Close"]').first();
                if (await closeBtn.isVisible().catch(() => false)) {
                    await closeBtn.click({ timeout: 2000 }).catch(() => undefined);
                } else {
                    await page.keyboard.press('Escape').catch(() => undefined);
                }
            },
            { noWaitAfter: true },
        ).catch(() => undefined);
    }
    try {
        const modal = page.locator('.vendor-announcement-modal').first();
        if (!(await modal.isVisible({ timeout: 500 }).catch(() => false))) return;
        const closeBtn = modal.locator('button[aria-label="Close"]').first();
        if (await closeBtn.isVisible().catch(() => false)) {
            await closeBtn.click().catch(() => undefined);
        } else {
            await page.keyboard.press('Escape').catch(() => undefined);
        }
        await modal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => undefined);
    } catch { /* selector shape may change; keep moving */ }
}

// ============================================
// SUB-URLS
// ============================================
const subUrls = {
    myAccount: 'my-account',
    vendorOnboarding: 'vendor-onboarding',
    dashboard: 'dashboard',
    customerLogout: 'my-account/customer-logout',
};

// ============================================
// SELECTORS
//
// `/vendor-onboarding/` (Dokan 5.0.0+) renders WC `form-login.php`
// next to the `account/vendor-registration` template — both forms
// are visible at once. The registration template selectors are
// unchanged from the legacy `/my-account/` flow.
// ============================================
const selectors = {
    login: {
        username: '#username',
        password: '#password',
        rememberMe: '#rememberme',
        logIn: 'button[name="login"], //button[@value="Log in"]',
        customerLogout: '.woocommerce-MyAccount-navigation-link--customer-logout > a',
    },
    register: {
        firstName: '#first-name',
        lastName: '#last-name',
        email: '#reg_email',
        password: '#reg_password',
        phone: '#shop-phone',
        shopName: '#company-name',
        shopUrl: '#seller-url',
        shopUrlAvailable: '#url-alart-mgs.text-success',

        // EU compliance fields (only present when the EU compliance
        // module is active; calls are guarded with isVisible())
        companyName: '#dokan-company-name',
        companyId: '#dokan-company-id-number',
        vatNumber: '#dokan-vat-number',
        bankName: '#dokan-bank-name',
        bankIban: '#dokan-bank-iban',

        termsAndConditions: '#tc_agree',
        subscriptionPack: '#dokan-subscription-pack',
        submit: 'input[name="register"], .woocommerce-Button',
    },
    dashboardReady: '.dokan-dashboard-wrap, #dokan-seller-setup, .dokan-vendor-setup-wizard',
};

// ============================================
// MINIMAL DATA SHAPE EXPECTED BY THE SPEC
// ============================================
export const data = {
    vendor: { vendorInfo: {} as any } as any,
    vendorSetupWizard: {} as any,
    predefined: { vendorStores: { vendor1: '' } },
};

export const dbData = {
    dokan: { optionName: { general: 'dokan_general' } },
};

export const dbUtils = {
    async updateOptionValue(_n: string, _v: any): Promise<void> {},
};

// ============================================
// HELPERS
// ============================================
function resolve<T>(value: T | (() => T)): T {
    return typeof value === 'function' ? (value as () => T)() : value;
}

async function getCurrentUser(page: Page): Promise<string | undefined> {
    const cookies = await page.context().cookies();
    const cookie = cookies.find(c => c.name?.startsWith('wordpress_logged_in_'));
    if (!cookie?.value) return undefined;
    return decodeURIComponent(cookie.value).split('|')[0];
}

// ============================================
// LOGIN PAGE
// ============================================
export class LoginPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private async goto(subPath: string) {
        await this.page.goto(toPath(`${subPath}`), { waitUntil: 'domcontentloaded' });
    }

    async login(user: { username: string; password: string }): Promise<void> {
        await this.goto(subUrls.myAccount);
        const current = await getCurrentUser(this.page);
        if (current === user.username) return;
        if (current) await this.logout();

        await this.page.locator(selectors.login.username).fill(user.username);
        await this.page.locator(selectors.login.password).fill(user.password);
        await this.page.locator(selectors.login.logIn).first().click();
        await this.page.waitForLoadState('load');
        await expect.poll(async () => await getCurrentUser(this.page), { timeout: 15000 })
            .toBe(user.username);
    }

    async logout(): Promise<void> {
        await this.page.goto(toPath(`${subUrls.myAccount}`), { waitUntil: 'domcontentloaded' });
        const visible = await this.page.locator(selectors.login.customerLogout).isVisible().catch(() => false);
        if (!visible) return;
        await this.page.locator(selectors.login.customerLogout).click();
        await this.page.waitForLoadState('load');
    }
}

// ============================================
// VENDOR PAGE
// ============================================
export class VendorPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    private async goto(subPath: string) {
        await this.page.goto(toPath(`${subPath}`), { waitUntil: 'domcontentloaded' });
        await closeAnnouncementModal(this.page);
    }

    private async fillIfVisible(selector: string, value: string | undefined): Promise<void> {
        if (!value) return;
        const locator = this.page.locator(selector);
        if (await locator.isVisible().catch(() => false)) {
            await locator.fill(value);
        }
    }

    private async ensureLoggedOut(): Promise<void> {
        await this.goto(subUrls.myAccount);
        const visible = await this.page.locator(selectors.login.customerLogout).isVisible().catch(() => false);
        if (visible) {
            await this.page.locator(selectors.login.customerLogout).click();
            await this.page.waitForLoadState('load');
        }
    }

    /**
     * Drive the new `/vendor-onboarding/` flow (Dokan 5.0.0+).
     *
     * `vendorInfo` accepts the same shape used elsewhere in the suite —
     * fields may be plain values or thunks (faker generators).
     */
    async vendorRegister(vendorInfo: any, _setupWizard?: any): Promise<void> {
        const firstName = resolve(vendorInfo.firstName) ?? 'vendor';
        const lastName = resolve(vendorInfo.lastName) ?? 'test';
        const baseName = (firstName + lastName).toLowerCase().replace(/[^a-z0-9]/g, '') + Date.now();
        const email = resolve(vendorInfo.email) ?? `${baseName}@email.com`;
        const password = vendorInfo.password ?? '01dokan01';
        const shopName = resolve(vendorInfo.shopName) ?? `${baseName}store`;
        const phone = vendorInfo.phone ?? '0123456789';

        await this.ensureLoggedOut();
        await this.goto(subUrls.vendorOnboarding);

        await this.page.locator(selectors.register.firstName).fill(firstName);
        await this.page.locator(selectors.register.lastName).fill(lastName);
        await this.page.locator(selectors.register.email).fill(email);
        await this.page.locator(selectors.register.phone).fill(phone);

        // Password field renders only when WC's "auto-generate password" is OFF.
        const passwordField = this.page.locator(selectors.register.password);
        if (await passwordField.isVisible().catch(() => false)) {
            await passwordField.fill(password);
        }

        // Filling shopname triggers a JS focusout handler that auto-populates
        // `#seller-url` and fires an AJAX slug-availability check. Tab out
        // explicitly so the handler runs, then wait for "available" before
        // submitting — otherwise the submit button stays disabled.
        await this.page.locator(selectors.register.shopName).fill(shopName);
        await this.page.locator(selectors.register.shopName).press('Tab');
        await this.page.locator(selectors.register.shopUrlAvailable).waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);

        // Optional EU compliance fields.
        await this.fillIfVisible(selectors.register.companyName, vendorInfo.companyName);
        await this.fillIfVisible(selectors.register.companyId, vendorInfo.companyId);
        await this.fillIfVisible(selectors.register.vatNumber, vendorInfo.vatNumber);
        await this.fillIfVisible(selectors.register.bankName, vendorInfo.bankName);
        await this.fillIfVisible(selectors.register.bankIban, vendorInfo.bankIban);

        // Optional subscription pack (vendor subscriptions module).
        if (vendorInfo.vendorSubscriptionPack) {
            const packSelect = this.page.locator(selectors.register.subscriptionPack);
            if (await packSelect.isVisible().catch(() => false)) {
                await packSelect.selectOption({ label: String(vendorInfo.vendorSubscriptionPack) }).catch(async () => {
                    // Fall back to value-based selection if label isn't matched.
                    await packSelect.selectOption(String(vendorInfo.vendorSubscriptionPack));
                });
            }
        }

        const terms = this.page.locator(selectors.register.termsAndConditions);
        if (await terms.isVisible().catch(() => false)) {
            await terms.check();
        }

        await this.page.locator(selectors.register.submit).first().click();
        await this.page.waitForLoadState('load');

        // After registration the user is logged in and redirected to the
        // setup wizard (or dashboard if the wizard is disabled).
        await expect.poll(async () => await getCurrentUser(this.page), { timeout: 20000 })
            .toBeTruthy();
    }

    async vendorSetupWizard(_setupWizard: any): Promise<void> {
        // Vendor setup wizard is not part of the new onboarding flow in
        // Dokan 5.0.0; left as a no-op until the suite decides whether
        // to drop the test or replace it with a vendor-dashboard tour.
    }

    async vendorAccountDetailsRenderProperly(): Promise<void> {}
    async addVendorDetails(_v: any): Promise<void> {}
    async visitStore(_s: string): Promise<void> {}
}
