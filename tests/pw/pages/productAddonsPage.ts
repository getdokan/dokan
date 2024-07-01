import { Page } from '@playwright/test';
import { VendorPage } from '@pages/vendorPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { vendor } from '@utils/interfaces';

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

        // create new text is visible
        await this.toBeVisible(addonsVendor.createNew);

        // product addon table elements are visible
        await this.multipleElementVisible(addonsVendor.table);

        await this.clickAndWaitForLoadState(addonsVendor.createNewAddon);
        await this.clickAndWaitForResponse(data.subUrls.ajax, addonsVendor.addon.addField);
        await this.check(addonsVendor.addon.enableDescription);

        // product addon fields elements are visible
        const { result, addonFieldsRow, addonUpdateSuccessMessage, ...addonFields } = addonsVendor.addon;
        await this.multipleElementVisible(addonFields);

        await this.clickAndWaitForLoadState(addonsVendor.backToAddonLists);
    }

    // update addon fields
    async updateAddonFields(addon: vendor['addon'], add = true) {
        await this.clearAndType(addonsVendor.addon.name, addon.name);
        await this.clearAndType(addonsVendor.addon.priority, addon.priority);

        // skipped category
        await this.click(addonsVendor.addon.productCategories);
        await this.clearAndType(addonsVendor.addon.productCategories, addon.category);
        await this.toContainText(addonsVendor.addon.result, addon.category);
        await this.press(data.key.enter);

        add ? await this.clickAndWaitForResponse(data.subUrls.ajax, addonsVendor.addon.addField) : await this.click(addonsVendor.addon.addonFieldsRow('Add-on Title'));

        await this.selectByValue(addonsVendor.addon.type, addon.type);
        await this.selectByValue(addonsVendor.addon.displayAs, addon.displayAs);
        await this.clearAndType(addonsVendor.addon.titleRequired, addon.title);
        await this.selectByValue(addonsVendor.addon.formatTitle, addon.formatTitle);
        await this.check(addonsVendor.addon.enableDescription);
        await this.clearAndType(addonsVendor.addon.addDescription, addon.addDescription);
        // await this.click(addonsVendor.addon.requiredField);
        await this.clearAndType(addonsVendor.addon.enterAnOption, addon.enterAnOption);
        await this.selectByValue(addonsVendor.addon.optionPriceType, addon.optionPriceType);
        await this.clearAndType(addonsVendor.addon.optionPriceInput, addon.optionPriceInput);

        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.settingsAddon, addonsVendor.addon.publishOrUpdate);
        await this.toContainText(addonsVendor.addon.addonUpdateSuccessMessage, addon.saveSuccessMessage);
    }

    // add addon
    async addAddon(addon: vendor['addon']) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsAddon);
        await this.clickAndWaitForLoadState(addonsVendor.createNewAddon);
        await this.updateAddonFields(addon);
    }

    // edit addon
    async editAddon(addon: vendor['addon']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsAddon);
        await this.hover(addonsVendor.addonRow(addon.name));
        await this.clickAndWaitForLoadState(addonsVendor.editAddon(addon.name));
        await this.updateAddonFields(addon, false);
    }

    // delete addon
    async deleteAddon(addon: vendor['addon']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsAddon);
        await this.hover(addonsVendor.addonRow(addon.name));
        await this.clickAndWaitForLoadState(addonsVendor.deleteAddon(addon.name));
        await this.toContainText(addonsVendor.addon.addonUpdateSuccessMessage, addon.deleteSuccessMessage);
    }
}
