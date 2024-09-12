import { BasePage } from '@pages/basePage';

export default class VendorEditOrderPage extends BasePage {
    createNewShipmentButton() {
        return this.page.locator('#create-tracking-status-action');
    }

    shipmentItemCheckboxByIndex(itemNumber: string) {
        return this.page.locator(`//form[@id="add-shipping-tracking-status-form"]/div/table/tbody[@id="order_line_items"]/tr[${itemNumber}]/td[1]/label/input`);
    }

    shippingStatusDropdown() {
        return this.page.locator('#shipment-status');
    }

    shippingProviderDropdown() {
        return this.page.locator('#shipping_status_provider');
    }

    shippingDateField() {
        return this.page.locator('#shipped_status_date');
    }

    shippingTrackingNumberField() {
        return this.page.locator('#tracking_status_number');
    }

    createShipmentButton() {
        return this.page.locator('#add-tracking-status-details');
    }

    async clickOnCreateNewShipmentButton() {
        await this.createNewShipmentButton().click();
    }

    async clickOnShipmentItemCheckboxByIndex(itemNumber: string) {
        await this.shipmentItemCheckboxByIndex(itemNumber).click();
    }

    async selectShippingStatus(status: string) {
        await this.shippingStatusDropdown().selectOption(status);
    }

    async selectShippingProvider(providerName: string) {
        await this.shippingProviderDropdown().selectOption(providerName);
    }

    async enterShippingDate(date: string) {
        await this.shippingDateField().fill(date);
    }

    async enterShippingTrackingNumber(trackingNumber: string) {
        await this.shippingTrackingNumberField().fill(trackingNumber);
    }

    async clickOnCreateShipmentButton() {
        await this.createShipmentButton().click();
    }
}
