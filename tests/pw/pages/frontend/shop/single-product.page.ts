import { BasePage } from '@pages/basePage';

export default class SingleProductPage extends BasePage {
    addToCartButton() {
        return this.page.locator('.single_add_to_cart_button');
    }

    errorMessageElement() {
        return this.page.locator('//ul[@class="woocommerce-error"]/li');
    }

    async clickOnAddToCartButton() {
        await this.addToCartButton().click();
    }
}
