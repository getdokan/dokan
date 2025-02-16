import { BasePage } from '@pages/basePage';

export default class VendorProductAddEditPage extends BasePage {
    async enterSimpleProductMinQty(quantity: string) {
        await this.page.locator('#min_quantity').fill(quantity);
    }

    async enterSimpleProductMaxQty(quantity: string) {
        await this.page.locator('#max_quantity').fill(quantity);
    }

    async selectProductStatus(status: 'publish' | 'draft' | 'pending') {
        await this.page.locator('#post_status').selectOption(status);
    }

    async clickOnSaveProduct() {
        await this.page.locator('#publish').click();
    }
}
