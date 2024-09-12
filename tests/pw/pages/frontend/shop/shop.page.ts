import { BasePage } from '@pages/basePage';

export default class ShopPage extends BasePage {
    productTitle() {
        return this.page.locator('.woocommerce-loop-product__title');
    }

    async clickOnProductWithTitle(productTitle: string) {
        await this.productTitle().getByText(productTitle).click();
    }
}
