import { BasePage } from '@pages/basePage';
import { Page } from '@playwright/test';

export default class WpAdminSidebar extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    sideMenu(title: string) {
        return this.page.locator('.wp-menu-name').getByText(title);
    }

    async clickOnProductsLink() {
        await this.sideMenu('Products').click();
    }

    async clickOnDokanLink() {
        await this.sideMenu('Dokan').click();
    }
}
