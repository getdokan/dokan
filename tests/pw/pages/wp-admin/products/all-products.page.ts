import { BasePage } from '@pages/basePage';

export default class AllProductsPage extends BasePage {
    async clickOnProductTitleById(productId: string) {
        await this.page.locator(`//tr[@id="post-${productId}"]/td[2]/strong/a`).click();
    }
}
