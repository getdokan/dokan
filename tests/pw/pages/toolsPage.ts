import { Page } from '@playwright/test';
import { AdminPage } from 'pages/adminPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
import{ tools } from 'utils/interfaces';

export class ToolsPage extends AdminPage {

	constructor(page: Page) {
		super(page);
	}


	// tools

	// tools render properly
	async adminToolsRenderProperly(){
		await this.goIfNotThere(data.subUrls.backend.dokan.tools);

		// tools text is visible
		await this.toBeVisible(selector.admin.dokan.tools.toolsText);

		// Page Installation elements are visible
		await this.multipleElementVisible(selector.admin.dokan.tools.pageInstallation);

		// Check For Duplicate Orders are visible
		await this.multipleElementVisible(selector.admin.dokan.tools.checkForDuplicateOrders);

		// Dokan Setup Wizard elements are visible
		await this.multipleElementVisible(selector.admin.dokan.tools.dokanSetupWizard);

		// Regenerate Variable Product Variations Author Ids elements are visible elements are visible
		await this.multipleElementVisible(selector.admin.dokan.tools.regenerateVariableProductVariationsAuthorIds);

		//  Import Dummy Data elements are visible
		await this.multipleElementVisible(selector.admin.dokan.tools.importDummyData);

		//  Test Distance Matrix API (Google MAP) elements are visible
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { enabledSuccess, ...testDistanceMatrixApi } = selector.admin.dokan.tools.testDistanceMatrixApi;
		await this.multipleElementVisible(testDistanceMatrixApi);

	}


	// dokan page installation
	async dokanPageInstallation(){
		await this.goIfNotThere(data.subUrls.backend.dokan.tools);

		// all page created button should be disabled
		await this.hasClass(selector.admin.dokan.tools.pageInstallation.allPagesCreated, 'button-disabled');
		//todo:  enable the button then install pages again
		// await this.setAttributeValue(selector.admin.dokan.tools.pageInstallation.allPagesCreated, 'class',  'button button-primary');
		// await this.clickAndWaitForResponse(data.subUrls.ajax, selector.admin.dokan.tools.pageInstallation.allPagesCreated);

	}

	// check for duplicate order
	async checkForDuplicateOrders(){
		await this.goIfNotThere(data.subUrls.backend.dokan.tools);
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.admin.dokan.tools.checkForDuplicateOrders.checkOrders);
	}


	// regenerate variable product variations author IDs
	async regenerateVariableProductVariationsAuthorIds(){
		await this.goIfNotThere(data.subUrls.backend.dokan.tools);
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.admin.dokan.tools.regenerateVariableProductVariationsAuthorIds.regenerate);
	}


	// clear dummy data
	async clearDummyData(){
		await this.goIfNotThere(data.subUrls.backend.dokan.tools);
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.dummyData, selector.admin.dokan.tools.importDummyData.import);
		await this.click(selector.admin.dokan.dummyData.clearDummyData);
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.dummyData, selector.admin.dokan.dummyData.confirmClearDummyData);
	}


	// import dummy data
	async importDummyData(){
		await this.goIfNotThere(data.subUrls.backend.dokan.tools);
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.dummyData, selector.admin.dokan.tools.importDummyData.import);
		// await this.clickAndWaitForResponse(data.subUrls.api.dokan.dummyData, selector.admin.dokan.dummyData.runTheImporter);
		//todo:  wait for multiple request one after another
		// const subUrls = [[data.subUrls.api.dokan.dummyData], [data.subUrls.api.dokan.dummyData], [data.subUrls.api.dokan.dummyData], [data.subUrls.api.dokan.dummyData], [data.subUrls.api.dokan.dummyData]];
		// await this.clickAndWaitForResponses(subUrls, selector.admin.dokan.dummyData.runTheImporter);
		// await this.toBeVisible(selector.admin.dokan.dummyData.importComplete);
	}


	// test distance matrix API
	async testDistanceMatrixApi(address: tools['distanceMatrixApi']){
		await this.goIfNotThere(data.subUrls.backend.dokan.tools);

		await this.clearAndType(selector.admin.dokan.tools.testDistanceMatrixApi.address1, address.address3);
		await this.clearAndType(selector.admin.dokan.tools.testDistanceMatrixApi.address2, address.address4);
		await this.click(selector.admin.dokan.tools.testDistanceMatrixApi.getDistance);
		await this.toContainText(selector.admin.dokan.tools.testDistanceMatrixApi.enabledSuccess, 'Distance Matrix API is enabled.');
	}

}
