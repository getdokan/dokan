import { BasePage } from '@pages/basePage';
import { Page } from '@playwright/test';

export default class VendorDashboardSidebarPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    sidebarMenu(title: string) {
        // return this.page.locator(`//li[@class="${title}"]/a`);
        return this.page.locator(`//li[contains(@class, "${title}")]/a`);
    }

    async clickOnOrdersTab() {
        await this.sidebarMenu('orders').click();
    }

    async clickOnProductsTab() {
        await this.sidebarMenu('products').click();
    }

    async clickOnSettingsTab() {
        await this.sidebarMenu('settings').click();
    }
}
