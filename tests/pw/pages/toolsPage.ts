import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { tools } from '@utils/interfaces';

// selectors
const toolsAdmin = selector.admin.dokan.tools;

export class ToolsPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // tools

    // tools render properly
    async adminToolsRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.tools);

        // tools text is visible
        await this.toBeVisible(toolsAdmin.toolsText);

        // Page Installation elements are visible
        const { installDokanPages, pageCreatedSuccessMessage, ...pageInstallation } = toolsAdmin.pageInstallation;
        await this.multipleElementVisible(pageInstallation);

        // Check For Regenerate Order commission are visible
        const { regenerateOrderCommissionSuccessMessage, ...regenerateOrderCommission } = toolsAdmin.regenerateOrderCommission;
        await this.multipleElementVisible(regenerateOrderCommission);

        // Check For Duplicate Orders are visible
        await this.multipleElementVisible(toolsAdmin.checkForDuplicateOrders);

        // Dokan Setup Wizard elements are visible
        await this.multipleElementVisible(toolsAdmin.dokanSetupWizard);

        // Regenerate Variable Product Variations Author Ids elements are visible elements are visible
        await this.multipleElementVisible(toolsAdmin.regenerateVariableProductVariationsAuthorIds);

        //  Import Dummy Data elements are visible
        await this.multipleElementVisible(toolsAdmin.importDummyData);

        //  Test Distance Matrix API (Google MAP) elements are visible
        const { enabledSuccess, ...testDistanceMatrixApi } = toolsAdmin.testDistanceMatrixApi;
        await this.multipleElementVisible(testDistanceMatrixApi);
    }

    // dokan page installation
    async dokanPageInstallation() {
        await this.goto(data.subUrls.backend.dokan.tools);
        await this.reload(); // todo: fix this
        await this.clickAndWaitForResponse(data.subUrls.ajax, toolsAdmin.pageInstallation.installDokanPages, 201);
        await this.toBeVisible(toolsAdmin.pageInstallation.pageCreatedSuccessMessage);
        await this.toBeVisible(toolsAdmin.pageInstallation.allPagesCreated);
    }

    // regenerate variable product variations author IDs
    async regenerateOrderCommission() {
        await this.goIfNotThere(data.subUrls.backend.dokan.tools);
        await this.clickAndWaitForResponse(data.subUrls.ajax, toolsAdmin.regenerateOrderCommission.regenerate);
        await this.toBeVisible(toolsAdmin.regenerateOrderCommission.regenerateOrderCommissionSuccessMessage);
    }

    // check for duplicate order
    async checkForDuplicateOrders() {
        await this.goIfNotThere(data.subUrls.backend.dokan.tools);
        await this.clickAndWaitForResponse(data.subUrls.ajax, toolsAdmin.checkForDuplicateOrders.checkOrders);
    }

    // regenerate variable product variations author IDs
    async regenerateVariableProductVariationsAuthorIds() {
        await this.goIfNotThere(data.subUrls.backend.dokan.tools);
        await this.clickAndWaitForResponse(data.subUrls.ajax, toolsAdmin.regenerateVariableProductVariationsAuthorIds.regenerate);
    }

    // clear dummy data
    async clearDummyData() {
        await this.goIfNotThere(data.subUrls.backend.dokan.tools);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.dummyData, toolsAdmin.importDummyData.import);
        await this.click(selector.admin.dokan.dummyData.clearDummyData);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.dummyData, selector.admin.dokan.dummyData.confirmClearDummyData);
    }

    // import dummy data
    async importDummyData() {
        await this.goIfNotThere(data.subUrls.backend.dokan.tools);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.dummyData, toolsAdmin.importDummyData.import);
        // await this.clickAndWaitForResponse(data.subUrls.api.dokan.dummyData, selector.admin.dokan.dummyData.runTheImporter);
        // todo:  wait for multiple request one after another
        // const subUrls = [[data.subUrls.api.dokan.dummyData], [data.subUrls.api.dokan.dummyData], [data.subUrls.api.dokan.dummyData], [data.subUrls.api.dokan.dummyData], [data.subUrls.api.dokan.dummyData]];
        // await this.clickAndWaitForResponses(subUrls, selector.admin.dokan.dummyData.runTheImporter);
        // await this.toBeVisible(selector.admin.dokan.dummyData.importComplete);
    }

    // test distance matrix API
    async testDistanceMatrixApi(address: tools['distanceMatrixApi']) {
        await this.goIfNotThere(data.subUrls.backend.dokan.tools);

        await this.clearAndType(toolsAdmin.testDistanceMatrixApi.address1, address.address3);
        await this.clearAndType(toolsAdmin.testDistanceMatrixApi.address2, address.address4);
        await this.click(toolsAdmin.testDistanceMatrixApi.getDistance);
        await this.toContainText(toolsAdmin.testDistanceMatrixApi.enabledSuccess, 'Distance Matrix API is enabled.');
    }
}
