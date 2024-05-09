import { test, request, Page } from '@playwright/test';
import { ToolsPage } from '@pages/toolsPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { data } from '@utils/testData';

test.describe('Tools test', () => {
    let admin: ToolsPage;
    let aPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new ToolsPage(aPage);

        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await aPage.close();
        await apiUtils.dispose();
    });

    //admin

    test('admin can view tools menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await admin.adminToolsRenderProperly();
    });

    test.skip('admin can perform Dokan page installation', { tag: ['@pro', '@admin'] }, async () => {
        await admin.dokanPageInstallation();
    });

    test('admin can regenerate order commission', { tag: ['@pro', '@admin'] }, async () => {
        await admin.regenerateOrderCommission();
    });

    test('admin can check for duplicate orders', { tag: ['@pro', '@admin'] }, async () => {
        await admin.checkForDuplicateOrders();
    });

    test('admin can set Dokan setup wizard', { tag: ['@lite', '@admin'] }, async () => {
        await admin.setDokanSetupWizard(data.dokanSetupWizard);
    });

    test('admin can regenerate variable product variations author IDs', { tag: ['@pro', '@admin'] }, async () => {
        await admin.regenerateVariableProductVariationsAuthorIds();
    });

    test.skip('admin can import dummy data', { tag: ['@pro'] }, async () => {
        // todo: need to fix
        await admin.importDummyData();
    });

    test('admin can clear dummy data', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.importDummyData(payloads.dummyData, payloads.adminAuth);
        await admin.clearDummyData();
    });

    test('admin can test distance matrix API', { tag: ['@pro', '@admin'] }, async () => {
        await admin.testDistanceMatrixApi(data.tools.distanceMatrixApi);
    });
});
