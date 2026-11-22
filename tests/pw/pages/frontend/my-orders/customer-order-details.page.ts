import { BasePage } from '@pages/basePage';
import { Page } from '@playwright/test';

export default class CustomerOrderDetailsPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

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
