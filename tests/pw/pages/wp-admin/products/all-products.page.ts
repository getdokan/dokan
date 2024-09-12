import { BasePage } from '@pages/basePage';

export default class AllProductsPage extends BasePage {
    productTitleById(productId: string) {
        return this.page.locator(`//tr[@id="post-${productId}"]/td[2]/strong/a`);
    }

    async clickOnProductTitleById(productId: string) {
        await this.productTitleById(productId).click();
    }
}
