import { BasePage } from '@pages/basePage';

export default class AllMyOrdersPage extends BasePage {
    async clickOnViewButtonByOrderId(orderId: string) {
        await this.page.locator(`//td[@class="order-number"]/a[contains(text(), "${orderId}")]/../following-sibling::td[5]/a`).click();
    }
}
