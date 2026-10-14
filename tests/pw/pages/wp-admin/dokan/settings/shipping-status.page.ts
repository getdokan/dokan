import { BasePage } from '@pages/basePage';
import { Page } from '@playwright/test';

export default class DokanShippingStatusPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    shippingStatusTab() {
        return this.page.locator('//div[@class="nav-title"][text()="Shipping Status"]');
    }

    allowShipmentTrackingCheckbox() {
        return this.page.locator('(//p/../following-sibling::div/label/label)[1]');
    }

    allowMarkAsReceivedCheckbox() {
        return this.page.locator('(//p/../following-sibling::div/label/label)[2]');
    }

    async shippingStatusItem(status: string) {
        const list = this.page.locator('//ul[@class="dokan-settings-repeatable-list"]/li').all();

        let locator;
        for (const item of await list) {
            const text = await item.textContent();
            if (text?.includes(status)) {
                locator = item;
            }
        }

        return locator;
    }

    saveChangesButton() {
        return this.page.locator('#submit');
    }

    async clickOnShippingStatusTab() {
        await this.shippingStatusTab().click();
    }

    async clickOnAllowShipmentTrackingCheckbox() {
        await this.allowShipmentTrackingCheckbox().click();
    }

    async clickOnAllowMarkAsReceivedCheckbox() {
        await this.allowMarkAsReceivedCheckbox().click();
    }

    async clickOnSaveChangesButton() {
        await this.saveChangesButton().click();
    }
}
