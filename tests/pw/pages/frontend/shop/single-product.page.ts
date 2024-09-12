import { BasePage } from '@pages/basePage';
import { Page } from '@playwright/test';

export default class SingleProductPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

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
