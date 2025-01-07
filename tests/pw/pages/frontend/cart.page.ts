import { BasePage } from '@pages/basePage';

export default class CartPage extends BasePage {
    quantityErrorElement() {
        return this.page.locator('//td[@class="product-quantity"]/div[@class="required"]');
    }

    woocommerceErrorMessage() {
        return this.page.locator('//div[@class="woocommerce-notices-wrapper"]/ul[@class="woocommerce-error"]/li');
    }

    async enterQuantityValue(productTitle: string, quantityValue: string) {
        await this.page.locator(`//div[@class="quantity"]/label[contains(text(), "${productTitle}")]/following-sibling::input`).fill(quantityValue);
    }

    async clickOnUpdateCartButton() {
        await this.page.locator('//button[@name="update_cart"]').click();
    }

    async removeProductByName(productName: string) {
        await this.page.locator(`//div[@class="quantity"]/label[contains(text(), "${productName}")]/../../../td[1]/a`).click();
    }
}
