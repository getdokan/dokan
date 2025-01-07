import { BasePage } from '@pages/basePage';

export default class VendorStoreSettingsPage extends BasePage {
    async enterMinimumOrderAmount(amount: string) {
        await this.page.locator('#min_amount_to_order').fill(amount);
    }

    async enterMaximumOrderAmount(amount: string) {
        await this.page.locator('#max_amount_to_order').fill(amount);
    }

    async clickOnUpdateSettingsButton() {
        await this.page.locator(`//input[@name="dokan_update_store_settings"]`).click();
    }
}
