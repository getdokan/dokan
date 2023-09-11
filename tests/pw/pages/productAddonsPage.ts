import { Page } from '@playwright/test';
import { VendorPage } from 'pages/vendorPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
import { vendor } from 'utils/interfaces';


export class ProductAddonsPage extends VendorPage {


	constructor(page: Page) {
		super(page);
	}

	// product addons render properly
	async vendorProductAddonsSettingsRenderProperly(): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsAddon);

		// product addon text is visible
		await this.toBeVisible(selector.vendor.vAddonSettings.productAddonsText);

		// visit store link is visible
		await this.toBeVisible(selector.vendor.vAddonSettings.visitStore);

		// create new addon text is visible
		await this.toBeVisible(selector.vendor.vAddonSettings.createNewAddon);

		// create new  text is visible
		await this.toBeVisible(selector.vendor.vAddonSettings.createNew);

		// product addon table elements are visible
		await this.multipleElementVisible(selector.vendor.vAddonSettings.table);


		await this.click(selector.vendor.vAddonSettings.createNewAddon);
		await this.click(selector.vendor.vAddonSettings.addon.addField);
		await this.check(selector.vendor.vAddonSettings.addon.enableDescription);

		// product addon fields elements are visible
		const { addonFieldsRow, addonUpdateSuccessMessage, ...addonFields } = selector.vendor.vAddonSettings.addon;
		await this.multipleElementVisible(addonFields);

		await this.clickAndWaitForLoadState(selector.vendor.vAddonSettings.backToAddonLists);

	}

	// update addon fields
	async updateAddonFields(addon: vendor['addon'], add = true){
		await this.clearAndType(selector.vendor.vAddonSettings.addon.name, addon.name);
		await this.clearAndType(selector.vendor.vAddonSettings.addon.priority, addon.priority);

		// skipped category
		// await this.click(selector.vendor.vAddonSettings.addon.productCategories);
		// await this.clearAndType(selector.vendor.vAddonSettings.addon.productCategories, addon.category);
		// await this.press(data.key.enter);

		add ? await this.click(selector.vendor.vAddonSettings.addon.addField) : await this.click(selector.vendor.vAddonSettings.addon.addonFieldsRow('Add-on Title'));

		await this.selectByValue(selector.vendor.vAddonSettings.addon.type, addon.type);
		await this.selectByValue(selector.vendor.vAddonSettings.addon.displayAs, addon.displayAs);
		await this.clearAndType(selector.vendor.vAddonSettings.addon.titleRequired, addon.titleRequired);
		await this.selectByValue(selector.vendor.vAddonSettings.addon.formatTitle, addon.formatTitle);
		await this.check(selector.vendor.vAddonSettings.addon.enableDescription);
		await this.clearAndType(selector.vendor.vAddonSettings.addon.addDescription, addon.addDescription);
		// await this.click(selector.vendor.vAddonSettings.addon.requiredField);
		await this.clearAndType(selector.vendor.vAddonSettings.addon.enterAnOption, addon.enterAnOption);
		await this.selectByValue(selector.vendor.vAddonSettings.addon.optionPriceType, addon.optionPriceType);
		await this.clearAndType(selector.vendor.vAddonSettings.addon.optionPriceInput, addon.optionPriceInput);

		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.settingsAddon, selector.vendor.vAddonSettings.addon.publishOrUpdate);
		await this.toContainText(selector.vendor.vAddonSettings.addon.addonUpdateSuccessMessage, addon.saveSuccessMessage);
	}


	// add addon
	async addAddon(addon: vendor['addon']) {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsAddon);
		await this.click(selector.vendor.vAddonSettings.createNewAddon);
		await this.updateAddonFields(addon);
	}


	// edit addon
	async editAddon(addon: vendor['addon']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsAddon);
		await this.hover(selector.vendor.vAddonSettings.addonRow(addon.name));
		await this.clickAndWaitForLoadState(selector.vendor.vAddonSettings.editAddon(addon.name));
		await this.updateAddonFields(addon, false);
	}


	// delete addon
	async deleteAddon(addon: vendor['addon']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsAddon);
		await this.hover(selector.vendor.vAddonSettings.addonRow(addon.name));
		await this.clickAndWaitForLoadState(selector.vendor.vAddonSettings.deleteAddon(addon.name));
		await this.toContainText(selector.vendor.vAddonSettings.addon.addonUpdateSuccessMessage, addon.deleteSuccessMessage);
	}

}
