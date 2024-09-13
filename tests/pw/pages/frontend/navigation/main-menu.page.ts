import { BasePage } from '@pages/basePage';

export default class StorefrontMainMenu extends BasePage {
    cartContentLink() {
        return this.page.locator('.cart-contents');
    }

    async clickOnCartContentLink() {
        await this.cartContentLink().click();
    }
}
