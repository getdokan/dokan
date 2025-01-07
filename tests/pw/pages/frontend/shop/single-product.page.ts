import { BasePage } from '@pages/basePage';

export default class SingleProductPage extends BasePage {
    errorMessageElement() {
        return this.page.locator('//ul[@class="woocommerce-error"]/li');
    }

    async enterQuantityValue(productTitle: string, quantityValue: string) {
        await this.page.locator(`//div[@class="quantity"]/label[contains(text(), "${productTitle}")]/following-sibling::input`).fill(quantityValue);
    }

    async clickOnAddToCartButton() {
        await this.page.locator('.single_add_to_cart_button').click();
    }
}
