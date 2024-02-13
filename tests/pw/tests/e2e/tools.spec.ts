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

    test('dokan tools menu page is rendering properly @pro @exp @a', async () => {
        await admin.adminToolsRenderProperly();
    });

    test.skip('admin can perform dokan page Installation @pro @a', async () => {
        await admin.dokanPageInstallation();
    });

    test('admin can regenerate order commission @pro @a', async () => {
        await admin.regenerateOrderCommission();
    });

    test('admin can check for duplicate orders @pro @a', async () => {
        await admin.checkForDuplicateOrders();
    });

    test('admin can set dokan setup wizard @lite @a', async () => {
        await admin.setDokanSetupWizard(data.dokanSetupWizard);
    });

    test('admin can regenerate variable product variations author IDs @pro @a', async () => {
        await admin.regenerateVariableProductVariationsAuthorIds();
    });

    // test.skip('admin can import dummy data @pro', async ( ) => {
    // 	await admin.importDummyData();
    // });

    test('admin can clear dummy data @pro @a', async () => {
        await apiUtils.importDummyData(payloads.dummyData, payloads.adminAuth);
        await admin.clearDummyData();
    });

    test('admin can test distance matrix API @pro @a', async () => {
        await admin.testDistanceMatrixApi(data.tools.distanceMatrixApi);
    });
});
