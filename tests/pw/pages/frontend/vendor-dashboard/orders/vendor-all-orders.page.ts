import { BasePage } from '@pages/basePage';

export default class VendorAllOrdersPage extends BasePage {
    orderTitleById(orderId: string) {
        return this.page.locator(`//td[@data-title="Order"]/a/strong[text()="Order ${orderId}"]`);
    }

    async clickOnOrderById(orderId: string) {
        await this.orderTitleById(orderId).click();
    }
}
