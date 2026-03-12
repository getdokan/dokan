import { Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:9999';

export class CustomerPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ============================================
    // SELECTORS
    // ============================================

    admin = {
        // Add admin-specific selectors for customer-related flows here
    };

    vendor = {
        // Add vendor-specific selectors for customer-related flows here
    };

    customer = {
        // Example: customer dashboard, orders, addresses, etc.
        // dashboardUrl: `${BASE_URL}/my-account/`,
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
    };

    // ============================================
    // HELPER METHODS
    // ============================================

    async navigateTo(url: string) {
        await this.page.goto(url);
    }

    // Admin Methods

    // Vendor Methods

    // Customer Methods
    async goToCustomerDashboard() {
        if (!this.customer['dashboardUrl']) {
            throw new Error('customer.dashboardUrl is not defined in CustomerPage.customer selectors.');
        }
        await this.page.goto(this.customer['dashboardUrl'] as string);
        await this.page.waitForLoadState('domcontentloaded');
    }

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
        return (await this.page.textContent(selector)) || '';
    }
}
