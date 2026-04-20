import { BasePage } from '@pages/basePage';

export default class WpAdminSidebar extends BasePage {
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
