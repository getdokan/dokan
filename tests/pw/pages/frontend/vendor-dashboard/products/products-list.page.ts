import { BasePage } from '@pages/basePage';
import { Page } from '@playwright/test';

export default class VendorProductListPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    productTitle() {
        return this.page.locator(`//td[@data-title="Name"]/strong/a`);
    }

    async clickOnProductWithTitle(productTitle: string) {
        await this.productTitle().getByText(productTitle).click();
    }
}
