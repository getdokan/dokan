import { Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:9999';

export class CommissionPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ============================================
    // SELECTORS
    // ============================================

    // Admin Selectors
    admin = {
        commissionsUrl: `${BASE_URL}/wp-admin/admin.php?page=dokan-dashboard#/commissions`,
        settingsUrl: `${BASE_URL}/wp-admin/admin.php?page=dokan#/settings`,
        // Add more admin selectors here
    };

    // Vendor Selectors
    vendor = {
        // Add vendor selectors here
    };

    // Customer Selectors
    customer = {
        // Add customer selectors here
    };

    // Commission Specific Selectors
    commission = {
        // Add commission-specific selectors here
    };

    // ============================================
    // TEST DATA
    // ============================================

    testData = {
        admin: {
            // Add admin test data here
        },
        vendor: {
            // Add vendor test data here
        },
        customer: {
            // Add customer test data here
        },
        commission: {
            // Add commission test data here
        }
    };

    // ============================================
    // HELPER METHODS
    // ============================================

    // Navigation Methods
    async navigateTo(url: string) {
        await this.page.goto(url);
    }

    // Admin Methods
    async goToCommissionsPage() {
        await this.page.goto(this.admin.commissionsUrl);
        await this.page.waitForLoadState('networkidle');
    }

    async goToSettingsPage() {
        await this.page.goto(this.admin.settingsUrl);
        await this.page.waitForLoadState('networkidle');
    }

    // Add more admin methods here

    // Vendor Methods
    // Add vendor methods here

    // Customer Methods
    // Add customer methods here

    // Commission Methods
    // Add commission-specific methods here

    // Wait/Utility Methods
    async waitForPageReady() {
        await this.page.waitForLoadState('networkidle');
    }

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
        return await this.page.textContent(selector) || '';
    }

    async isTextVisible(text: string): Promise<boolean> {
        return await this.page.locator(`:text-is("${text}")`).first().isVisible();
    }
}
