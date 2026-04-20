import { BasePage } from '@pages/basePage';

export default class StorefrontMainMenu extends BasePage {
    async clickOnCartContentLink() {
        await this.page.locator('.cart-contents').click();
    }
}
