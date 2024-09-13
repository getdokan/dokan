import { BasePage } from '@pages/basePage';

export default class CartPage extends BasePage {
    quantityInputFieldFor(productTitle: string) {
        return this.page.locator(`//div[@class="quantity"]/label[contains(text(), "${productTitle}")]/following-sibling::input`);
    }

    updateCartButton() {
        return this.page.locator('//button[@name="update_cart"]');
    }

    quantityErrorElement() {
        return this.page.locator('//td[@class="product-quantity"]/div[@class="required"]');
    }

    woocommerceErrorMessage() {
        return this.page.locator('//div[@class="woocommerce-notices-wrapper"]/ul[@class="woocommerce-error"]/li');
    }

    async enterQuantityValue(productTitle: string, quantityValue: string) {
        await this.quantityInputFieldFor(productTitle).fill(quantityValue);
    }

    async clickOnUpdateCartButton() {
        await this.updateCartButton().click();
    }
}
