import { BasePage } from '@pages/basePage';

export default class ShopPage extends BasePage {
    async clickOnProductWithTitle(productTitle: string) {
        await this.page.locator('.woocommerce-loop-product__title').getByText(productTitle).click();
    }
}
