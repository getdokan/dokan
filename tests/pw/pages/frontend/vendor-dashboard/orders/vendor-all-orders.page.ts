import { BasePage } from '@pages/basePage';
import { Page } from '@playwright/test';

export default class VendorAllOrdersPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    orderTitleById(orderId: string) {
        return this.page.locator(`//td[@data-title="Order"]/a/strong[text()="Order ${orderId}"]`);
    }

    async clickOnOrderById(orderId: string) {
        await this.orderTitleById(orderId).click();
    }
}
