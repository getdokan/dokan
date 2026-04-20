import { BasePage } from '@pages/basePage';

export default class VendorDashboardSidebarPage extends BasePage {
    sidebarMenu(title: string) {
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
