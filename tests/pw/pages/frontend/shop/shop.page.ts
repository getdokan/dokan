import { BasePage } from '@pages/basePage';
import { Page } from '@playwright/test';

export default class ShopPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    productTitle() {
        return this.page.locator('.woocommerce-loop-product__title');
    }

    async clickOnProductWithTitle(productTitle: string) {
        await this.productTitle().getByText(productTitle).click();
    }
}
