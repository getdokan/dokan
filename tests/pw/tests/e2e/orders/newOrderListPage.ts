import { Page } from '@playwright/test';

declare const process: { env: Record<string, string | undefined> };

const BASE_URL = process.env.BASE_URL || 'http://localhost:9999';

/**
 * Page object for the new vendor React order list (Dokan 5.0.0+) at
 * `/dashboard/new/#/orders`. Implementation:
 * `dokan-lite/src/dashboard/orders/OrderList.tsx` (DataViews).
 *
 * Prerequisite: enable the new vendor dashboard via Admin → Dokan →
 * Settings → Appearance → Vendor Dashboard Style: New UI
 * (`dokan_appearance.vendor_layout_style = 'latest'`).
 *
 * Self-contained per CONVENTIONS.md §4.
 */
export class NewOrderListPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void this.installAnnouncementModalHandler();
    }

    private async installAnnouncementModalHandler(): Promise<void> {
        const installed = '__dokanAnnouncementModalHandlerInstalled' as const;
        const pwf = this.page as Page & { [installed]?: boolean };
        if (pwf[installed]) return;
        pwf[installed] = true;
        const modal = this.page.locator('.vendor-announcement-modal');
        await this.page.addLocatorHandler(modal, async () => {
            const btn = modal.locator('button[aria-label="Close"]').first();
            if (await btn.isVisible().catch(() => false)) await btn.click({ timeout: 2000 }).catch(() => undefined);
            else await this.page.keyboard.press('Escape').catch(() => undefined);
        }, { noWaitAfter: true }).catch(() => undefined);
    }

    readonly url = `${BASE_URL}/dashboard/new/#/orders`;

    selectors = {
        reactRoot: '#dokan-vendor-dashboard-root',
        orderListWrapper: '.dokan-orders-wrapper, .dokan-react-orders',
        dataViewsTable: 'table',
        dataRow: 'table tbody tr',
        // Search input — DataViews header
        searchInput: 'input[type="search"], input[placeholder*="Search"]',
        // 3-dot row actions menu (in tbody only — toolbar Actions has same aria-label)
        rowActionsBtn: "//tbody//tr//button[@aria-label='Actions']",
        // Action menu items rendered by DataViews
        actionMenuItem: (label: string) =>
            `//*[@role='menuitem'][normalize-space()='${label}']`,
        // The View action redirects to a single-order page, so detection is
        // by URL navigation rather than dialog.
        // PHP fatal markers
        phpFatal: "text=/Fatal error|Parse error|There has been a critical error/i",
    };

    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async waitForReactReady(timeoutMs = 30000): Promise<void> {
        await this.page.locator(this.selectors.reactRoot).first().waitFor({ state: 'visible', timeout: timeoutMs });
        // Wait for either rows OR an empty banner.
        const start = Date.now();
        while (Date.now() - start < 15000) {
            const rows = await this.page.locator(this.selectors.dataRow).count();
            if (rows > 0) return;
            const empty = await this.page.locator("text=/no orders|no items|nothing to show|create your first/i").count();
            if (empty > 0) return;
            await this.page.waitForTimeout(250);
        }
    }

    async getRowCount(): Promise<number> {
        return await this.page.locator(this.selectors.dataRow).count();
    }

    async fillSearch(query: string): Promise<void> {
        const input = this.page.locator(this.selectors.searchInput).first();
        await input.waitFor({ state: 'visible', timeout: 10000 });
        await input.fill(query);
        await this.page.waitForTimeout(800);
    }

    async clearSearch(): Promise<void> {
        const input = this.page.locator(this.selectors.searchInput).first();
        if (await input.isVisible().catch(() => false)) {
            await input.fill('');
            await this.page.waitForTimeout(500);
        }
    }

    async openRowActionMenuByIndex(index: number): Promise<void> {
        const buttons = this.page.locator(this.selectors.rowActionsBtn);
        await buttons.nth(index).waitFor({ state: 'visible', timeout: 10000 });
        await buttons.nth(index).click();
        // Wait for any of the order menu items to render (View is always present).
        await this.page.locator(this.selectors.actionMenuItem('View')).first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
    }

    async clickActionMenuItem(label: string): Promise<void> {
        await this.page.locator(this.selectors.actionMenuItem(label)).first().click();
    }

    async hasNoServerError(): Promise<boolean> {
        const fatal = await this.page.locator(this.selectors.phpFatal).first().isVisible({ timeout: 1000 }).catch(() => false);
        return !fatal;
    }
}
