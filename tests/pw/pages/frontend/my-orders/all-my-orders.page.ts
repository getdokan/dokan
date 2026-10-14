import { BasePage } from '@pages/basePage';
import { Page } from '@playwright/test';

export default class AllMyOrdersPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    viewButtonByOrderId(orderId: string) {
        return this.page.locator(`//td[@class="order-number"]/a[contains(text(), "${orderId}")]/../following-sibling::td[5]/a`);
    }

    async clickOnViewButtonByOrderId(orderId: string) {
        await this.viewButtonByOrderId(orderId).click();
    }
}
