import { BasePage } from '@pages/basePage';
import { Page } from '@playwright/test';

export default class VendorDashboardSidebarPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    sidebarMenu(title: string) {
        return this.page.locator(`//li[@class="${title}"]/a`);
    }

    async clickOnOrdersTab() {
        await this.sidebarMenu('orders').click();
    }
}
