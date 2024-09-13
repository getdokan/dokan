import { BasePage } from '@pages/basePage';

export default class SingleProductPage extends BasePage {
    quantityInputFieldFor(productTitle: string) {
        return this.page.locator(`//div[@class="quantity"]/label[contains(text(), "${productTitle}")]/following-sibling::input`);
    }

    addToCartButton() {
        return this.page.locator('.single_add_to_cart_button');
    }

    errorMessageElement() {
        return this.page.locator('//ul[@class="woocommerce-error"]/li');
    }

    async enterQuantityValue(productTitle: string, quantityValue: string) {
        await this.quantityInputFieldFor(productTitle).fill(quantityValue);
    }

    async clickOnAddToCartButton() {
        await this.addToCartButton().click();
    }
}
