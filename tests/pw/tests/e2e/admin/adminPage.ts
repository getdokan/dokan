import { Page, expect } from '@playwright/test';

declare const process: { env: Record<string, string | undefined> };

const BASE_URL = process.env.BASE_URL || 'http://localhost:9999';

export class AdminPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ============================================
    // SELECTORS
    // ============================================

    // Admin Selectors
    admin = {
        // URLs
        loginUrl: `${BASE_URL}/wp-admin`,
        dokanDashboardUrl: `${BASE_URL}/wp-admin/admin.php?page=dokan-dashboard`,

        // Login Page
        usernameInput: '#user_login',
        passwordInput: '#user_pass',
        loginButton: '#wp-submit',

        // Logout
        userMenu: 'li#wp-admin-bar-my-account',
        logoutLink: 'li#wp-admin-bar-logout a',
        logoutSuccessMessage: 'div#login-message p',

        // Dokan Dashboard
        dashboardText: "//h1[normalize-space()='Dashboard']",
        toDo: "//h3[normalize-space()='To-Do']",
        analytics: "//h3[normalize-space()='Analytics']",
        monthlyOverview: "//h3[normalize-space()='Monthly Overview']",
        dailySalesChart: "//h3[normalize-space()='Daily Sales Chart']",
        vendorMetrics: "//h3[normalize-space()='Vendor Metrics']",
        allTimeMarketplaceStats: "//h3[normalize-space()='All-Time Marketplace Stats']",
        topPerformingVendors: "//h3[normalize-space()='Top Performing Vendors']",
        mostReviewedProducts: "//h3[normalize-space()='Most Reviewed Products']",

        // Admin Notices
        promoNoticeHeading: "//h3[normalize-space()='Dokan came up with a new look!']",
        noticeItem: '.dokan-admin-notices .dokan-admin-notice',
        noticeTitle: '.dokan-message-title',
    };

    // Vendor Selectors
    vendor = {
    };

    // Customer Selectors
    customer = {
    };

    // ============================================
    // TEST DATA
    // ============================================

    testData = {
        admin: {
            username: process.env.ADMIN || 'admin',
            password: process.env.ADMIN_PASSWORD || 'password',
        },
        vendor: {
        },
        customer: {
        },
        adminNotice: {
            promoNoticesEndpoint: '**/dokan/v1/admin/notices/promo',
            mockNotices: [
                {
                    type: 'promotion',
                    title: 'Massive Price Fall - Up to 35% OFF!',
                    description: "Access to Dokan's premium modules and supercharge your business.",
                    priority: 10,
                    show_close_button: true,
                    ajax_data: {
                        action: 'dokan_dismiss_limited_time_promotional_notice',
                        nonce: '6c82d2aa00',
                        key: 'massive-price-fall-up-to-35-off-2',
                    },
                    actions: [
                        { type: 'primary', text: 'Get Now', action: 'https://dokan.co/wordpress/pricing', target: '_blank' },
                    ],
                },
                {
                    type: 'promotion',
                    title: 'Smart Saving Week is Live — Save Up to 30%',
                    description: "Don't miss your chance to grab powerful marketplace features at smart prices. Offer valid for a limited time!",
                    priority: 10,
                    show_close_button: true,
                    ajax_data: {
                        action: 'dokan_dismiss_limited_time_promotional_notice',
                        nonce: '6c82d2aa00',
                        key: 'smart-saving-week-is-live-save-up-to-30',
                    },
                    actions: [
                        { type: 'primary', text: 'Upgrade Now', action: 'https://dokan.co/wordpress/pricing/', target: '_blank' },
                    ],
                },
            ],
        },
    };

    // ============================================
    // HELPER METHODS
    // ============================================

    // Admin Methods
    async adminLogin(username: string, password: string) {
        await this.page.goto(this.admin.loginUrl);
        await this.page.waitForLoadState('load');
        const isLoginForm = await this.page.locator(this.admin.usernameInput).isVisible();
        if (isLoginForm) {
            await this.page.locator(this.admin.usernameInput).fill(username);
            await this.page.locator(this.admin.passwordInput).fill(password);
            await this.page.locator(this.admin.loginButton).click();
            await this.page.waitForLoadState('load');
        }
    }

    async adminLogout() {
        // Force the hover state on the user menu to expose the logout link
        await this.page.evaluate((selector: string) => {
            const el = document.querySelector(selector);
            if (el) el.classList.add('hover');
        }, this.admin.userMenu);
        await this.page.locator(this.admin.logoutLink).waitFor({ state: 'visible' });
        await this.page.locator(this.admin.logoutLink).click();
        await this.page.waitForLoadState('load');
    }

    async goToDokanDashboard() {
        await this.page.goto(this.admin.dokanDashboardUrl);
        await this.page.waitForLoadState('load');
    }

    async adminDashboardRenderProperly() {
        await this.goToDokanDashboard();

        // Verify each dashboard section heading is visible
        await expect(this.page.locator(this.admin.dashboardText)).toBeVisible();
        await expect(this.page.locator(this.admin.toDo)).toBeVisible();
        await expect(this.page.locator(this.admin.analytics)).toBeVisible();
        await expect(this.page.locator(this.admin.monthlyOverview)).toBeVisible();
        await expect(this.page.locator(this.admin.dailySalesChart)).toBeVisible();
        await expect(this.page.locator(this.admin.vendorMetrics)).toBeVisible();
        await expect(this.page.locator(this.admin.allTimeMarketplaceStats)).toBeVisible();
        await expect(this.page.locator(this.admin.topPerformingVendors)).toBeVisible();
        await expect(this.page.locator(this.admin.mostReviewedProducts)).toBeVisible();
    }

    async mockPromoNotices() {
        await this.page.route(this.testData.adminNotice.promoNoticesEndpoint, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(this.testData.adminNotice.mockNotices),
            });
        });
    }

    async expectTotalNotices() {
        await this.page.locator(this.admin.promoNoticeHeading).waitFor({ state: 'visible' });
    }

    async getVisibleNoticeTitle(): Promise<string> {
        const title = await this.page.evaluate(() => {
            const notices = Array.from(document.querySelectorAll('.dokan-admin-notices .dokan-admin-notice')) as HTMLElement[];
            const visible = notices.find(n => n.offsetParent !== null || window.getComputedStyle(n).display !== 'none');
            const titleEl = visible?.querySelector('.dokan-message-title') as HTMLElement | null;
            return titleEl?.textContent?.trim() ?? '';
        });
        return title;
    }

    async waitForPageReady() {
        await this.page.waitForLoadState('load');
    }

    // Wait/Utility Methods
    async waitForElement(selector: string) {
        await this.page.waitForSelector(selector);
    }

    async clickElement(selector: string) {
        await this.page.click(selector);
    }

    async fillInput(selector: string, value: string) {
        await this.page.fill(selector, value);
    }

    async getText(selector: string): Promise<string> {
        return await this.page.textContent(selector) ?? '';
    }
}
