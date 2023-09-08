import { Page, expect } from '@playwright/test';
import { AdminPage } from 'pages/adminPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
import { productAdvertisement  } from 'utils/interfaces';

export class ProductAdvertisingPage extends AdminPage {

	constructor(page: Page) {
		super(page);
	}

	// product advertising

	// regenerate product advertisement payment product
	async recreateProductAdvertisementPaymentViaSettingsSave(){
		await this.goToDokanSettings();
		await this.click(selector.admin.dokan.settings.menus.productAdvertising);
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.admin.dokan.settings.productAdvertising.productAdvertisingSaveChanges);
		await this.toContainText(selector.admin.dokan.settings.dokanUpdateSuccessMessage, 'Setting has been saved successfully.');
	}


	// product advertising render properly
	async adminProductAdvertisingRenderProperly(){
		await this.goIfNotThere(data.subUrls.backend.dokan.productAdvertising);

		// product advertising text is visible
		await this.toBeVisible(selector.admin.dokan.productAdvertising.productAdvertisingText);

		// add new Advertisement is visible
		await this.toBeVisible(selector.admin.dokan.productAdvertising.addNewProductAdvertising);

		// nav tabs are visible
		await this.multipleElementVisible(selector.admin.dokan.productAdvertising.navTabs);

		// bulk action elements are visible
		await this.multipleElementVisible(selector.admin.dokan.productAdvertising.bulkActions);

		// filter elements are visible
		const { filterByStoreInput, filterByCreatedVia, ...filters } = selector.admin.dokan.productAdvertising.filters;
		await this.multipleElementVisible(filters);

		// product advertising search is visible
		await this.toBeVisible(selector.admin.dokan.productAdvertising.search);

		// product advertising table elements are visible
		await this.multipleElementVisible(selector.admin.dokan.productAdvertising.table);

		// product advertising modal elements are visible
		await this.click(selector.admin.dokan.productAdvertising.addNewProductAdvertising);
		await this.toBeVisible(selector.admin.dokan.productAdvertising.addNewAdvertisement.selectStoreDropdown);
		await this.toBeVisible(selector.admin.dokan.productAdvertising.addNewAdvertisement.selectProductDropdown);
		await this.click(selector.admin.dokan.productAdvertising.addNewAdvertisement.closeModal);

	}


	// add new product advertisement
	async addNewProductAdvertisement(advertising: productAdvertisement){
		await this.goIfNotThere(data.subUrls.backend.dokan.productAdvertising);

		await this.click(selector.admin.dokan.productAdvertising.addNewProductAdvertising);

		await this.click(selector.admin.dokan.productAdvertising.addNewAdvertisement.selectStoreDropdown);
		await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, selector.admin.dokan.productAdvertising.addNewAdvertisement.selectStoreInput, advertising.advertisedProductStore);
		await this.toContainText(selector.admin.dokan.productAdvertising.addNewAdvertisement.selectedStore, advertising.advertisedProductStore);
		await this.press(data.key.enter);

		await this.click(selector.admin.dokan.productAdvertising.addNewAdvertisement.selectProductDropdown);
		await this.typeAndWaitForResponse(data.subUrls.api.dokan.products, selector.admin.dokan.productAdvertising.addNewAdvertisement.selectProductInput, advertising.advertisedProduct);
		await this.toContainText(selector.admin.dokan.productAdvertising.addNewAdvertisement.selectedProduct, advertising.advertisedProduct);
		await this.press(data.key.enter);

		await this.clickAndWaitForResponse(data.subUrls.api.dokan.productAdvertising, selector.admin.dokan.productAdvertising.addNewAdvertisement.addNew);
		await this.click(selector.admin.dokan.productAdvertising.actionSuccessful);

		//close modal
		await this.click(selector.admin.dokan.productAdvertising.addNewAdvertisement.closeModal);
	}


	// search advertised product
	async searchAdvertisedProduct(productOrOrder: string | number){
		await this.goIfNotThere(data.subUrls.backend.dokan.productAdvertising);

		await this.clearInputField(selector.admin.dokan.productAdvertising.search);

		await this.typeAndWaitForResponseAndLoadState(data.subUrls.api.dokan.productAdvertising, selector.admin.dokan.productAdvertising.search, String(productOrOrder));
		if (typeof(productOrOrder) != 'number'){
			await this.toBeVisible(selector.admin.dokan.productAdvertising.advertisedProductCell(productOrOrder));
		} else {
			await this.toBeVisible(selector.admin.dokan.productAdvertising.advertisedProductOrderIdCell(productOrOrder));
		}
	}


	// filter advertised product
	async filterAdvertisedProduct(input: string, action: string){
		await this.goIfNotThere(data.subUrls.backend.dokan.productAdvertising);

		switch (action) {

		case 'by-store' :
			await this.click(selector.admin.dokan.productAdvertising.filters.allStoresDropdown);
			await this.typeAndWaitForResponse(data.subUrls.api.dokan.productAdvertising, selector.admin.dokan.productAdvertising.filters.filterByStoreInput, input);
			await this.pressAndWaitForResponse(data.subUrls.api.dokan.productAdvertising, data.key.enter);
			break;

		case 'by-creation' :
			await this.click(selector.admin.dokan.productAdvertising.filters.createdViaDropdown);
			await this.clickAndWaitForResponse(data.subUrls.api.dokan.productAdvertising, selector.admin.dokan.productAdvertising.filters.filterByCreatedVia(input));
			break;

		default :
			break;
		}

		const count = (await this.getElementText(selector.admin.dokan.productAdvertising.numberOfRowsFound))?.split(' ')[0];
		expect(Number(count)).toBeGreaterThan(0);

		//clear filter
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.productAdvertising, selector.admin.dokan.productAdvertising.filters.clearFilter);
	}


	// update advertised product
	async updateAdvertisedProduct(productName: string, action: string){
		await this.searchAdvertisedProduct(productName);

		await this.hover(selector.admin.dokan.productAdvertising.advertisedProductCell(productName));
		switch (action) {

		case 'expire' :
			await this.click(selector.admin.dokan.productAdvertising.advertisedProductExpire(productName));
			break;

		case 'delete' :
			await this.click(selector.admin.dokan.productAdvertising.advertisedProductDelete(productName));
			break;

		default :
			break;
		}

		await this.clickAndWaitForResponse(data.subUrls.api.dokan.productAdvertising, selector.admin.dokan.productAdvertising.confirmAction);
		await this.click(selector.admin.dokan.productAdvertising.actionSuccessful);

		// refresh table by clicking filter
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.productAdvertising, selector.admin.dokan.productAdvertising.filters.clearFilter);
	}


	// product advertising bulk action
	async productAdvertisingBulkAction(action: string, productName?: string){
		productName ? await this.searchAdvertisedProduct(productName) : await this.goIfNotThere(data.subUrls.backend.dokan.productAdvertising);

		// ensure row exists
		await this.notToBeVisible(selector.admin.dokan.productAdvertising.noRowsFound);

		await this.click(selector.admin.dokan.productAdvertising.bulkActions.selectAll);
		await this.selectByValue(selector.admin.dokan.productAdvertising.bulkActions.selectAction, action);
		await this.click(selector.admin.dokan.productAdvertising.bulkActions.applyAction);
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.productAdvertising, selector.admin.dokan.productAdvertising.confirmAction);
		await this.click(selector.admin.dokan.productAdvertising.actionSuccessful);
	}

}
