import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

// selectors
const settingsAdmin = selector.admin.dokan.settings;
const formManagerAdmin = selector.admin.dokan.settings.productFormManager;
const productsVendor = selector.vendor.product;

export class ProductFormManager extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // navigation
    async goToProductFormManagerSettings() {
        await this.goIfNotThere(data.subUrls.backend.dokan.settings);
        await this.click(settingsAdmin.menus.productFormManager);
    }

    // save settings
    async saveSettings() {
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, settingsAdmin.saveChanges);
        await this.toContainText(settingsAdmin.dokanUpdateSuccessMessage, 'Setting has been saved successfully.');
    }

    // enable product form manager module
    async enableProductFormManagerModule() {
        // dokan settings
        await this.goto(data.subUrls.backend.dokan.settings);
        await this.toBeVisible(selector.admin.dokan.settings.menus.productFormManager);
    }

    // disable product form manager module
    async disableProductFormManagerModule() {
        // dokan settings
        await this.goto(data.subUrls.backend.dokan.settings, { waitUntil: 'domcontentloaded' }, true);
        await this.notToBeVisible(selector.admin.dokan.settings.menus.productFormManager);
    }

    // reset product form manager settings
    async resetProductFormManagerSettings() {
        await this.goToProductFormManagerSettings();
        await this.click(formManagerAdmin.resetAll);
        // await this.click(formManagerAdmin.confirmRemove);
        await this.saveSettings();
        // await this.notToBeVisible(formManagerAdmin.blockSection('Reset test block'));
    }

    // admin can add custom block
    async addCustomBlock(customBlock: { currentLabel: string; label: string; description: string; productType: string; productCategory: string }) {
        await this.goToProductFormManagerSettings();
        await this.click(formManagerAdmin.createCustomBlock);
        await this.click(formManagerAdmin.editBlock(customBlock.currentLabel));
        await this.clearAndType(formManagerAdmin.blockContents.label(customBlock.currentLabel), customBlock.label);
        await this.clearAndType(formManagerAdmin.blockContents.description(customBlock.currentLabel), customBlock.description);
        await this.click(formManagerAdmin.blockContents.specificProductTypeDropdown(customBlock.currentLabel));
        await this.click(formManagerAdmin.blockContents.productType(customBlock.productType));
        await this.toBeVisible(formManagerAdmin.blockContents.selectedProductType(customBlock.productType, customBlock.productType));
        
        await this.click(formManagerAdmin.blockContents.specificProductCategoryDropdown(customBlock.currentLabel));
        await this.clearAndType(formManagerAdmin.blockContents.inputProductCategory, customBlock.productCategory);
        await this.click(formManagerAdmin.blockContents.searchedResult(customBlock.productCategory));
        await this.toBeVisible(formManagerAdmin.blockContents.selectedProductCategory(customBlock.currentLabel, customBlock.productCategory));

        await this.click(formManagerAdmin.blockContents.done(customBlock.currentLabel));
        await this.saveSettings();
        await this.saveSettings();

        await this.toBeVisible(formManagerAdmin.blockSection(customBlock.label));
        await this.click(formManagerAdmin.editBlock(customBlock.label));
        await this.toHaveValue(formManagerAdmin.blockContents.label(customBlock.label), customBlock.label);
        await this.toHaveValue(formManagerAdmin.blockContents.label(customBlock.label), customBlock.description);
        await this.toBeVisible(formManagerAdmin.blockContents.selectedProductType(customBlock.productType, customBlock.productType));
        await this.toBeVisible(formManagerAdmin.blockContents.selectedProductCategory(customBlock.label, customBlock.productCategory));
    }
}
