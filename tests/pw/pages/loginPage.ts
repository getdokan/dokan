import { Page, expect } from '@playwright/test';
import { user } from '@utils/testData';
import { BasePage } from './basePage';

/**
 * Login page object.
 *
 * Self-contained: uses only Playwright primitives (no shared selector/helper
 * library) and resolves URLs against the `baseURL` from `playwright.config.ts`.
 * Mirrors the inlined login flow in `tests/e2e/_auth.setup.ts`.
 */
export class LoginPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    // Username of the currently logged-in WP user, or undefined when logged out.
    private async getCurrentUser(): Promise<string | undefined> {
        const cookies = await this.page.context().cookies();
        const cookie = cookies.find(c => c.name?.startsWith('wordpress_logged_in_'));
        if (!cookie?.value) {
            return undefined;
        }
        return decodeURIComponent(cookie.value).split('|')[0];
    }

    // Frontend (my-account) login.
    async login(user: user, storageState?: string): Promise<void> {
        if (!this.page.url().includes('my-account')) {
            await this.page.goto('my-account', { waitUntil: 'domcontentloaded' });
        }

        const current = await this.getCurrentUser();
        if (current === user.username) {
            return;
        }
        if (current) {
            await this.logout();
        }

        await this.page.locator('#username').fill(user.username);
        await this.page.locator('#password').fill(user.password);
        if (storageState) {
            await this.page.locator('#rememberme').check();
        }
        // Don't race on the login 302 — click, let the load settle, then verify
        // via the logged-in cookie.
        await this.page.locator('//button[@value="Log in"]').click();
        await this.page.waitForLoadState('load');
        await expect
            .poll(async () => await this.getCurrentUser(), { timeout: 15000 })
            .toBe(user.username);
        if (storageState) {
            await this.page.context().storageState({ path: storageState });
        }
    }

    // Frontend (my-account) logout.
    async logout(): Promise<void> {
        if (!this.page.url().includes('my-account')) {
            await this.page.goto('my-account', { waitUntil: 'domcontentloaded' });
        }
        await this.page.locator('.woocommerce-MyAccount-navigation-link--customer-logout > a').click();
        await this.page.waitForLoadState('load');
    }

    // Backend (wp-admin) login.
    async adminLogin(user: user, storageState?: string): Promise<void> {
        await this.page.goto('wp-admin', { waitUntil: 'domcontentloaded' });
        const hasLoginForm = await this.page.locator('#user_login').isVisible().catch(() => false);
        if (hasLoginForm) {
            await this.page.locator('#user_login').fill(user.username);
            await this.page.locator('#user_pass').fill(user.password);
            // Submit without auto-waiting on the post-login navigation: the
            // wp-admin dashboard render is slow on CI, so dispatch the click and
            // confirm via the logged-in cookie below.
            await this.page.locator('#wp-submit').dispatchEvent('click');
            // The submit starts a real navigation to wp-admin. The cookie poll
            // below can confirm the session before the browser commits it, and a
            // goto() issued inside that window is aborted by Playwright as
            // "interrupted by another navigation".
            await this.page
                .waitForURL(url => url.pathname.includes('/wp-admin/'), { waitUntil: 'domcontentloaded', timeout: 30000 })
                .catch(() => {});
        }
        await expect
            .poll(async () => await this.getCurrentUser(), { timeout: 30000 })
            .toBe(user.username);
        if (storageState) {
            await this.page.context().storageState({ path: storageState });
        }
    }
}
