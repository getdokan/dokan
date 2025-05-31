import { BasePage } from '@pages/basePage';
import { Page } from '@playwright/test';

export default class AllProductsPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    productTitleById(productId: string) {
        return this.page.locator(`//tr[@id="post-${productId}"]/td[2]/strong/a`);
    }

    async clickOnProductTitleById(productId: string) {
        await this.productTitleById(productId).click();
    }
}
