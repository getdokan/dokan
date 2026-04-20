import { BasePage } from '@pages/basePage';

export default class VendorProductListPage extends BasePage {
    productTitle() {
        return this.page.locator(`//td[@data-title="Name"]/strong/a`);
    }

    async clickOnProductWithTitle(productTitle: string) {
        await this.productTitle().getByText(productTitle).click();
    }
}
