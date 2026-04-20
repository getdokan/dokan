import { BasePage } from '@pages/basePage';

export default class CustomerOrderDetailsPage extends BasePage {
    trackingStatusByShipmentNumber(shipmentNumber: string) {
        return this.page.locator(`//h4[@class="shippments-tracking-title"]/strong[text()="Shipment ${shipmentNumber} "]/../../div[1]/p/strong`);
    }

    async markOrderAsReceived(shipmentNumber: string) {
        await this.page.locator(`//h4[@class="shippments-tracking-title"]/strong[text()="Shipment ${shipmentNumber} "]/../../div[1]/strong[@class="customer-status"]`).click();
    }

    async clickOnDialogBoxOkButton() {
        await this.page.locator('//div[@role="dialog"]/div[6]/button[text()="OK"]').click();
    }
}
