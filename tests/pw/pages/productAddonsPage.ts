import { Page, expect } from '@playwright/test';
import { VendorPage } from '@pages/vendorPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { addon } from '@utils/interfaces';
import { unserialize } from 'php-serialize';

// selectors
const addonsVendor = selector.vendor.vAddonSettings;

export class ProductAddonsPage extends VendorPage {
    constructor(page: Page) {
        super(page);
    }

    // product addons render properly
    async vendorProductAddonsSettingsRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsAddon);

        // product addon text is visible
        await this.toBeVisible(addonsVendor.productAddonsText);

        // visit store link is visible
        await this.toBeVisible(addonsVendor.visitStore);

        // create new addon text is visible
        await this.toBeVisible(addonsVendor.createNewAddon);

        // product addon table elements are visible
        await this.multipleElementVisible(addonsVendor.table);

        await this.clickAndWaitForLoadState(addonsVendor.createNewAddon);
        await this.clickAndWaitForResponse(data.subUrls.ajax, addonsVendor.addon.addField);
        await this.check(addonsVendor.addon.addDescription);

        // product addon fields elements are visible
        const { result, addonUpdateSuccessMessage, importInput, exportInput, addonRow, removeAddon, confirmRemove, option, ...addonFields } = addonsVendor.addon;
        await this.multipleElementVisible(addonFields);

        await this.clickAndWaitForLoadState(addonsVendor.backToAddonLists);
    }

    // goto addon edit
    async goToAddonEdit(addonName: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsAddonEdit(addonName));
    }

    // save addon
    async saveAddon(): Promise<void> {
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.settingsAddon, addonsVendor.addon.publishOrUpdate);
        await this.toContainText(addonsVendor.addon.addonUpdateSuccessMessage, 'Add-on saved successfully');
    }

    // update addon fields
    async updateAddonFields(addon: addon, add = true) {
        await this.clearAndType(addonsVendor.addon.name, addon.name);
        await this.clearAndType(addonsVendor.addon.priority, addon.priority);

        // skipped category
        await this.click(addonsVendor.addon.productCategories);
        await this.clearAndType(addonsVendor.addon.productCategories, addon.category);
        await this.toContainText(addonsVendor.addon.result, addon.category);
        await this.press(data.key.enter);

        if (add) {
            await this.clickAndWaitForResponse(data.subUrls.ajax, addonsVendor.addon.addField);
        } else {
            await this.click(addonsVendor.addon.addonRow(addon.title));
        }

        await this.selectByValue(addonsVendor.addon.type, addon.type);
        await this.selectByValue(addonsVendor.addon.displayAs, addon.displayAs);
        await this.clearAndType(addonsVendor.addon.titleRequired, addon.title);
        await this.selectByValue(addonsVendor.addon.formatTitle, addon.formatTitle);
        await this.check(addonsVendor.addon.addDescription);
        await this.clearAndType(addonsVendor.addon.descriptionInput, addon.addDescription);
        await this.uncheck(addonsVendor.addon.requiredField);
        await this.clearAndType(addonsVendor.addon.option.enterAnOption, addon.enterAnOption);
        await this.selectByValue(addonsVendor.addon.option.optionPriceType, addon.optionPriceType);
        await this.clearAndType(addonsVendor.addon.option.optionPriceInput, addon.optionPriceInput);

        await this.saveAddon();
    }

    // add addon
    async addAddon(addon: addon) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsAddon);
        await this.clickAndWaitForLoadState(addonsVendor.createNewAddon);
        await this.updateAddonFields(addon);
    }

    // edit addon
    async editAddon(addon: addon): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsAddon);
        await this.setElementCssStyle(addonsVendor.rowActions(addon.name), 'visibility', 'visible'); // forcing the row actions to be visible, to avoid flakiness
        await this.hover(addonsVendor.addonRow(addon.name));
        await this.clickAndWaitForLoadState(addonsVendor.editAddon(addon.name));
        await this.updateAddonFields(addon, false);
    }

    // export addon field
    async importAddonField(addonId: string, addon: string, addonTitle: string): Promise<void> {
        await this.goToAddonEdit(addonId);
        await this.click(addonsVendor.addon.import);
        await this.clearAndType(addonsVendor.addon.importInput, addon);
        await this.toBeVisible(addonsVendor.addon.addonRow(addonTitle));
        await this.saveAddon();
        await this.toBeVisible(addonsVendor.addon.addonRow(addonTitle));
    }

    // export addon field
    async exportAddonField(addonId: string, addon: any): Promise<void> {
        await this.goToAddonEdit(addonId);
        await this.click(addonsVendor.addon.export);
        const exportedAddon = unserialize((await this.getElementText(addonsVendor.addon.exportInput))!);
        exportedAddon[0].options.forEach((option: { min: any; max: any }) => {
            delete option.min;
            delete option.max;
        });
        expect(exportedAddon[0]).toEqual(expect.objectContaining(addon));
    }

    // remove addon field
    async removeAddonField(addonId: string, addonFieldTitle: string): Promise<void> {
        await this.goToAddonEdit(addonId);
        await this.click(addonsVendor.addon.removeAddon(addonFieldTitle));
        await this.click(addonsVendor.addon.confirmRemove);
        await this.notToBeVisible(addonsVendor.addon.addonRow(addonFieldTitle));
    }

    // remove addon
    async removeAddon(addon: addon): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsAddon);
        await this.hover(addonsVendor.addonRow(addon.name));
        await this.clickAndWaitForLoadState(addonsVendor.deleteAddon(addon.name));
        await this.toContainText(addonsVendor.addon.addonUpdateSuccessMessage, addon.deleteSuccessMessage);
    }
}
