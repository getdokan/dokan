import { BasePage } from '@pages/basePage';

export default class CustomerOrderDetailsPage extends BasePage {
    orderReceivedButtonByShipmentNumber(shipmentNumber: string) {
        return this.page.locator(`//h4[@class="shippments-tracking-title"]/strong[text()="Shipment ${shipmentNumber} "]/../../div[1]/strong[@class="customer-status"]`);
    }

    trackingStatusByShipmentNumber(shipmentNumber: string) {
        return this.page.locator(`//h4[@class="shippments-tracking-title"]/strong[text()="Shipment ${shipmentNumber} "]/../../div[1]/p/strong`);
    }

    dialogueBoxOkButton() {
        return this.page.locator('//div[@role="dialog"]/div[6]/button[text()="OK"]');
    }

    async markOrderAsReceived(shipmentNumber: string) {
        await this.orderReceivedButtonByShipmentNumber(shipmentNumber).click();
    }

    async clickOnDialogBoxOkButton() {
        await this.dialogueBoxOkButton().click();
    }
}
