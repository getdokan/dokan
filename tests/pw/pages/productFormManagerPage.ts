import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { block, field } from '@utils/interfaces';
// selectors
const settingsAdmin = selector.admin.dokan.settings;
const formManagerAdmin = selector.admin.dokan.settings.productFormManager;

export class ProductFormManager extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // navigation
    async goToProductFormManagerSettings(force = false) {
        if (force) {
            await this.reload();
        }
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
    async resetProductFormManagerSettings(blockLabel: string) {
        await this.goToProductFormManagerSettings(true);
        await this.click(formManagerAdmin.resetAll);
        await this.saveSettings();
        await this.notToBeVisible(formManagerAdmin.blockSection(blockLabel));
    }

    // admin can add custom block
    async addCustomBlock(block: block, edit = false) {
        await this.goToProductFormManagerSettings();
        if (!edit) {
            await this.click(formManagerAdmin.createCustomBlock);
        }
        // collapse field if expanded
        await this.clickIfVisible(formManagerAdmin.blockContents.cancel(block.currentLabel));

        await this.click(formManagerAdmin.editBlock(block.currentLabel));
        await this.clearAndType(formManagerAdmin.blockContents.label(block.currentLabel), block.label);
        await this.clearAndType(formManagerAdmin.blockContents.description(block.currentLabel), block.description);
        await this.click(formManagerAdmin.blockContents.specificProductTypeDropdown(block.currentLabel));
        await this.click(formManagerAdmin.blockContents.productType(block.productType));
        await this.toBeVisible(formManagerAdmin.blockContents.selectedProductType(block.currentLabel, block.productType));

        await this.click(formManagerAdmin.blockContents.specificProductCategoryDropdown(block.currentLabel));
        await this.clearAndType(formManagerAdmin.blockContents.inputProductCategory(block.currentLabel), block.productCategory);
        await this.click(formManagerAdmin.blockContents.searchedResult(block.currentLabel));
        await this.toBeVisible(formManagerAdmin.blockContents.selectedProductCategory(block.currentLabel, block.productCategory));
        await this.click(formManagerAdmin.blockContents.done(block.currentLabel));
        await this.saveSettings();

        await this.toBeVisible(formManagerAdmin.blockSection(block.label));
        await this.click(formManagerAdmin.editBlock(block.label));
        await this.toHaveValue(formManagerAdmin.blockContents.label(block.label), block.label);
        await this.toHaveValue(formManagerAdmin.blockContents.description(block.label), block.description);
        await this.toBeVisible(formManagerAdmin.blockContents.selectedProductType(block.label, block.productType));
        await this.toBeVisible(formManagerAdmin.blockContents.selectedProductCategory(block.label, block.productCategory));

        return block.label;
    }

    // admin can delete custom block
    async deleteCustomBlock(blockLabel: string) {
        await this.goToProductFormManagerSettings();
        await this.click(formManagerAdmin.deleteBlock(blockLabel));
        await this.click(formManagerAdmin.confirmRemove);
        await this.saveSettings();
        await this.notToBeVisible(formManagerAdmin.blockSection(blockLabel));
    }

    // admin can add custom field
    async toggleFieldActiveStatus(field: field, status: boolean) {
        await this.goToProductFormManagerSettings();

        if (status == true) {
            await this.enableSwitcher(formManagerAdmin.enableField(field.block, field.currentLabel));
        } else {
            await this.disableSwitcher(formManagerAdmin.enableField(field.block, field.currentLabel));
        }

        await this.saveSettings();
        if (status == true) {
            await this.toHaveBackgroundColor(formManagerAdmin.enableField(field.block, field.currentLabel) + '//span', 'rgb(33, 150, 243)');
        } else {
            await this.toHaveBackgroundColor(formManagerAdmin.enableField(field.block, field.currentLabel) + '//span', 'rgb(204, 204, 204)');
        }
    }

    // admin can add custom field
    async toggleFieldRequiredStatus(field: field, status: boolean) {
        await this.goToProductFormManagerSettings();

        if (status == true) {
            await this.enableSwitcher(formManagerAdmin.requireField(field.block, field.currentLabel));
        } else {
            await this.disableSwitcher(formManagerAdmin.requireField(field.block, field.currentLabel));
        }

        await this.saveSettings();
        if (status == true) {
            await this.toHaveBackgroundColor(formManagerAdmin.requireField(field.block, field.currentLabel) + '//span', 'rgb(33, 150, 243)');
        } else {
            await this.toHaveBackgroundColor(formManagerAdmin.requireField(field.block, field.currentLabel) + '//span', 'rgb(204, 204, 204)');
        }
    }

    // admin can add custom field
    async addCustomField(field: field, edit = false) {
        await this.goToProductFormManagerSettings();
        if (!edit) {
            await this.click(formManagerAdmin.addField(field.block));
        }
        // collapse field if expanded
        await this.clickIfVisible(formManagerAdmin.fieldContents.cancel(field.block, field.currentLabel));

        await this.click(formManagerAdmin.editField(field.block, field.currentLabel));
        await this.click(formManagerAdmin.editCustomField);
        await this.clearAndType(formManagerAdmin.fieldContents.label(field.block, field.currentLabel), field.label);
        await this.selectByValue(formManagerAdmin.fieldContents.type(field.block, field.currentLabel), field.type);
        await this.clearAndType(formManagerAdmin.fieldContents.placeholder(field.block, field.currentLabel), field.placeholder);
        await this.clearAndType(formManagerAdmin.fieldContents.helpContent(field.block, field.currentLabel), field.helpContent);
        await this.click(formManagerAdmin.fieldContents.done(field.block, field.currentLabel));
        await this.saveSettings();

        await this.toBeVisible(formManagerAdmin.fieldSection(field.block, field.label));
        await this.click(formManagerAdmin.editField(field.block, field.label));
        await this.click(formManagerAdmin.editCustomField);
        await this.toHaveValue(formManagerAdmin.fieldContents.label(field.block, field.label), field.label);
        await this.toHaveSelectedValue(formManagerAdmin.fieldContents.type(field.block, field.label), field.type);
        await this.toHaveValue(formManagerAdmin.fieldContents.placeholder(field.block, field.label), field.placeholder);
        await this.toHaveValue(formManagerAdmin.fieldContents.helpContent(field.block, field.label), field.helpContent);

        return field.label;
    }

    // admin can delete custom field
    async deleteCustomField(field: { block: string; label: any }) {
        await this.goToProductFormManagerSettings();
        // collapse field if expanded
        await this.clickIfVisible(formManagerAdmin.fieldContents.cancel(field.block, field.label));

        await this.click(formManagerAdmin.editField(field.block, field.label));
        await this.click(formManagerAdmin.deleteCustomField);
        await this.click(formManagerAdmin.confirmRemove);
        await this.saveSettings();
        await this.notToBeVisible(formManagerAdmin.fieldSection(field.block, field.label));
    }
}
