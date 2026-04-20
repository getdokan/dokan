import { BasePage } from '@pages/basePage';

export default class VendorEditOrderPage extends BasePage {
    async clickOnCreateNewShipmentButton() {
        await this.page.locator('#create-tracking-status-action').click();
    }

    async clickOnShipmentItemCheckboxByIndex(itemNumber: string) {
        await this.page.locator(`//form[@id="add-shipping-tracking-status-form"]/div/table/tbody[@id="order_line_items"]/tr[${itemNumber}]/td[1]/label/input`).click();
    }

    async selectShippingStatus(status: string) {
        await this.page.locator('#shipment-status').selectOption(status);
    }

    async selectShippingProvider(providerName: string) {
        await this.page.locator('#shipping_status_provider').selectOption(providerName);
    }

    async enterShippingDate(date: string) {
        await this.page.locator('#shipped_status_date').fill(date);
    }

    async enterShippingTrackingNumber(trackingNumber: string) {
        await this.page.locator('#tracking_status_number').fill(trackingNumber);
    }

    async clickOnCreateShipmentButton() {
        await this.page.locator('#add-tracking-status-details').click();
    }
}
