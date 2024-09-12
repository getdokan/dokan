import { BasePage } from '@pages/basePage';
import { Page } from '@playwright/test';

export default class VendorStoreSettingsPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    minimumOrderAmountInputField() {
        return this.page.locator('#min_amount_to_order');
    }

    maximumOrderAmountInputField() {
        return this.page.locator('#max_amount_to_order');
    }

    updateSettingsButton() {
        return this.page.locator(`//input[@name="dokan_update_store_settings"]`);
    }

    async enterMaximumOrderAmount(amount: string) {
        await this.maximumOrderAmountInputField().fill(amount);
    }

    async clickOnUpdateSettingsButton() {
        await this.updateSettingsButton().click();
    }
}
