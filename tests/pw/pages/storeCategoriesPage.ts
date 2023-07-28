import { Page } from '@playwright/test';
import { AdminPage } from 'pages/adminPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
import { storeCategory } from 'utils/interfaces';

export class StoreCategoriesPage extends AdminPage {

	constructor(page: Page) {
		super(page);
	}


	// store categories

	// store categories render properly
	async adminStoreCategoryRenderProperly(){
		await this.goIfNotThere(data.subUrls.backend.dokan.vendors);
		await this.click(selector.admin.dokan.vendors.storeCategories);

		// add new category elements are visible
		await this.multipleElementVisible(selector.admin.dokan.vendors.storeCategory.addNewCategory);

		// search category input is visible
		await this.toBeVisible(selector.admin.dokan.vendors.storeCategory.search);

		// store category table elements are visible
		await this.multipleElementVisible(selector.admin.dokan.vendors.storeCategory.table);

	}


	// add store category
	async addStoreCategory(storeCategory: storeCategory) {
		await this.goIfNotThere(data.subUrls.backend.dokan.vendors);
		await this.click(selector.admin.dokan.vendors.storeCategories);

		await this.clearAndType(selector.admin.dokan.vendors.storeCategory.addNewCategory.name, storeCategory.name);
		await this.clearAndType(selector.admin.dokan.vendors.storeCategory.addNewCategory.description, storeCategory.description);
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeCategories, selector.admin.dokan.vendors.storeCategory.addNewCategory.addNewCategory);
	}


	// search store category
	async searchStoreCategory(categoryName: string){
		await this.goIfNotThere(data.subUrls.backend.dokan.storeCategories);
		// await this.click(selector.admin.dokan.vendors.storeCategories);

		await this.clearInputField(selector.admin.dokan.vendors.storeCategory.search);

		await this.typeAndWaitForResponse(data.subUrls.api.dokan.storeCategories, selector.admin.dokan.vendors.storeCategory.search, categoryName);
		await this.toBeVisible(selector.admin.dokan.vendors.storeCategory.storeCategoryCell(categoryName));

	}


	// edit store category
	async editStoreCategory(storeCategory: storeCategory) {
		await this.searchStoreCategory(storeCategory.name);

		await this.hover(selector.admin.dokan.vendors.storeCategory.storeCategoryCell(storeCategory.name));
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeCategories, selector.admin.dokan.vendors.storeCategory.storeCategoryEdit);
		await this.clearAndType(selector.admin.dokan.vendors.storeCategory.editCategory.name, storeCategory.name);
		await this.clearAndType(selector.admin.dokan.vendors.storeCategory.editCategory.description, storeCategory.description);
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeCategories, selector.admin.dokan.vendors.storeCategory.editCategory.update);

	}


	// update store category
	async updateStoreCategory(categoryName: string, action: string) {
		await this.searchStoreCategory(categoryName);

		await this.hover(selector.admin.dokan.vendors.storeCategory.storeCategoryCell(categoryName));

		switch(action){

		case 'set-default' :
			await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeCategories, selector.admin.dokan.vendors.storeCategory.storeCategorySetDefault);
			break;

		case 'delete' :
			await this.clickAndAcceptAndWaitForResponse(data.subUrls.api.dokan.storeCategories, selector.admin.dokan.vendors.storeCategory.storeCategoryDelete);
			break;

		default :
			break;

		}

	}


	// vendor

	//vendor update store category
	async vendorUpdateStoreCategory(category: string){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsStore);
		await this.clearAndType(selector.vendor.vStoreSettings.storeCategories.storeCategoriesInput, category);
		await this.toContainText(selector.vendor.vStoreSettings.storeCategories.result, category);
		await this.press(data.key.enter);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.vendor.vStoreSettings.updateSettings);
		await this.toContainText(selector.vendor.vStoreSettings.updateSettingsSuccessMessage, 'Your information has been saved successfully');

	}

}
