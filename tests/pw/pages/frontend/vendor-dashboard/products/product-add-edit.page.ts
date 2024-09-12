import { BasePage } from '@pages/basePage';

export default class VendorProductAddEditPage extends BasePage {
    simpleProductMinQtyInputField() {
        return this.page.locator('#dokan_simple_product_min_quantity');
    }

    simpleProductMaxQtyInputField() {
        return this.page.locator('#dokan_simple_product_max_quantity');
    }

    productStatusSelectField() {
        return this.page.locator('#post_status');
    }

    saveProductButton() {
        return this.page.locator('#publish');
    }

    async enterSimpleProductMinQty(quantity: string) {
        await this.simpleProductMinQtyInputField().fill(quantity);
    }

    async enterSimpleProductMaxQty(quantity: string) {
        await this.simpleProductMaxQtyInputField().fill(quantity);
    }

    async selectProductStatus(status: 'publish' | 'draft' | 'pending') {
        await this.productStatusSelectField().selectOption(status);
    }

    async clickOnSaveProduct() {
        await this.saveProductButton().click();
    }
}
