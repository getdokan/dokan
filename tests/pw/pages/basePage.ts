import { Page } from '@playwright/test';

/**
 * Minimal base page object for the admin-settings suite.
 *
 * Holds the shared Playwright `page` handle plus the small set of navigation
 * helpers the settings page objects rely on. Sub-paths are resolved against the
 * `baseURL` configured in `playwright.config.ts`, so callers pass relative URLs
 * (e.g. `wp-admin/admin.php?page=dokan#/settings`).
 */
export class BasePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Navigate to a sub-path unless the browser is already on it.
    async goIfNotThere(
        subPath: string,
        waitUntil: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' = 'domcontentloaded',
    ): Promise<void> {
        if (this.page.url().includes(subPath)) {
            return;
        }
        await this.page.goto(subPath, { waitUntil });
    }

    // Wait for the page to reach a given load state.
    async waitForLoadState(
        state: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded',
        options?: { timeout?: number },
    ): Promise<void> {
        await this.page.waitForLoadState(state, options);
    }

    // Reload the current page.
    async reload(): Promise<void> {
        await this.page.reload();
    }
}
