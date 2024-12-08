import { Page } from '@playwright/test';
import { BasePage } from '@pages/basePage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

// selectors
const settingsVendor = selector.vendor.vStoreSettings;
const productsVendor = selector.vendor.product;
export class MinMaxQuantitiesPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    // enable enable min max quantities module
    async enableMinMaxQuantitiesModule() {
        await this.goto(data.subUrls.frontend.vDashboard.settingsStore);
        await this.multipleElementVisible(settingsVendor.minMax);

        await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);
        await this.clickAndWaitForLoadState(productsVendor.addNewProduct);
        await this.multipleElementVisible(productsVendor.minMax);
    }

    // disable enable min max quantities module
    async disableMinMaxQuantitiesModule() {
        await this.goto(data.subUrls.frontend.vDashboard.settingsStore);
        await this.multipleElementNotVisible(settingsVendor.minMax);

        await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);
        await this.clickAndWaitForLoadState(productsVendor.addNewProduct);
        await this.multipleElementNotVisible(productsVendor.minMax);
    }
}
