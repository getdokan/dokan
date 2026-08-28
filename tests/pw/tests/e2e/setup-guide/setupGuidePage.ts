import { Page, expect } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';

const { ADMIN, ADMIN_PASSWORD } = process.env;

export const data = {
    admin: { username: ADMIN as string, password: ADMIN_PASSWORD as string },
    installWp: { siteInfo: { url: '' } },
};

export class LoginPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }

    private async isLoggedIn(): Promise<boolean> {
        return (await this.page.context().cookies()).some(c => c.name.startsWith('wordpress_logged_in_'));
    }

    async adminLogin(admin: { username: string; password: string }): Promise<void> {
        if (await this.isLoggedIn()) return;
        await this.page.goto(toPath('wp-login.php'), { waitUntil: 'domcontentloaded' });
        if (await this.isLoggedIn()) return;
        await this.page.locator('#user_login').fill(admin.username);
        await this.page.locator('#user_pass').fill(admin.password);
        // Submit but don't wait for the post-login navigation to settle — wp-admin
        // admin_init (wordpress.org update checks) can stall it on slow envs. Poll
        // the auth cookie, which is set as soon as login succeeds.
        await this.page.locator('#wp-submit').click({ noWaitAfter: true }).catch(() => undefined);
        await expect.poll(() => this.isLoggedIn(), { timeout: 30000 }).toBe(true);
    }
}

export class AdminDashboardPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }

    async adminDashboardRenderProperly(): Promise<void> {
        await this.page.goto('/wp-admin/admin.php?page=dokan-dashboard', { waitUntil: 'domcontentloaded' });
        await closeAnnouncementModal(this.page);
        // The React admin dashboard header (with its help-menu container) rendered.
        await expect(this.page.locator('[data-test-id="dokan-dashboard-header-help-menu-container"]')).toBeVisible({ timeout: 30000 });
    }
}
