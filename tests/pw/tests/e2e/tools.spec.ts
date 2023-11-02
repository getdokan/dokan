import { test, Page } from '@playwright/test';
import { ToolsPage } from '@pages/toolsPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { data } from '@utils/testData';

test.describe('Tools test', () => {
    let admin: ToolsPage;
    let aPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser, request }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new ToolsPage(aPage);

        apiUtils = new ApiUtils(request);
    });

    test.afterAll(async () => {
        await aPage.close();
    });

    test('dokan tools menu page is rendering properly @pro @explo', async () => {
        await admin.adminToolsRenderProperly();
    });

    test('admin can perform dokan page Installation @pro', async () => {
        await admin.dokanPageInstallation();
    });

    test('admin can check for duplicate orders @pro', async () => {
        await admin.checkForDuplicateOrders();
    });

    test('admin can set dokan setup wizard @lite', async () => {
        await admin.setDokanSetupWizard(data.dokanSetupWizard);
    });

    test('admin can regenerate variable product variations author IDs @pro', async () => {
        await admin.regenerateVariableProductVariationsAuthorIds();
    });

    // test.skip('admin can import dummy data @pro', async ( ) => {
    // 	await admin.importDummyData();
    // });

    test('admin can clear dummy data @pro', async () => {
        await apiUtils.importDummyData(payloads.dummyData, payloads.adminAuth);
        await admin.clearDummyData();
    });

    test('admin can test distance matrix API @pro', async () => {
        await admin.testDistanceMatrixApi(data.tools.distanceMatrixApi);
    });
});
