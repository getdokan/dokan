import { BasePage } from '@pages/basePage';

export default class DokanShippingStatusPage extends BasePage {
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

    async clickOnShippingStatusTab() {
        await this.page.locator('//div[@class="nav-title"][text()="Shipping Status"]').click();
    }

    async clickOnAllowShipmentTrackingCheckbox() {
        await this.page.locator('(//p/../following-sibling::div/label/label)[1]').click();
    }

    async clickOnAllowMarkAsReceivedCheckbox() {
        await this.page.locator('(//p/../following-sibling::div/label/label)[2]').click();
    }

    async clickOnSaveChangesButton() {
        await this.page.locator('#submit').click();
    }
}
