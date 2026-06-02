import { test, Page } from '@utils/test';
import { ToolsPage, ApiUtils, data, payloads, dbUtils } from './toolsPage';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');

test.describe('Tools test', () => {
    let admin: ToolsPage;
    let aPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new ToolsPage(aPage);
        apiUtils = new ApiUtils(null);
    });

    test.afterAll(async () => { await aPage?.close(); await apiUtils.dispose(); });

    test('admin can view tools menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => { await admin.adminToolsRenderProperly(); });

    test('admin can perform Dokan page installation', { tag: ['@pro', '@admin'] }, async () => {
        await dbUtils.setOptionValue('dokan_pages_created', '0', false);
        await admin.dokanPageInstallation();
    });

    test('admin can regenerate order commission', { tag: ['@pro', '@admin'] }, async () => { await admin.regenerateOrderCommission(); });
    test('admin can check for duplicate orders', { tag: ['@pro', '@admin'] }, async () => { await admin.checkForDuplicateOrders(); });
    test.skip('admin can set Dokan setup wizard', { tag: ['@lite', '@admin'] }, async () => { await admin.setDokanSetupWizard(data.dokanSetupWizard); });
    test('admin can regenerate variable product variations author IDs', { tag: ['@pro', '@admin'] }, async () => { await admin.regenerateVariableProductVariationsAuthorIds(); });

    test('admin can import dummy data', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.clearDummyData(payloads.adminAuth);
        await admin.importDummyData();
    });

    test('admin can clear dummy data', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.importDummyData(payloads.dummyData, payloads.adminAuth);
        await admin.clearDummyData();
    });

    test('admin can test distance matrix API', { tag: ['@pro', '@admin'] }, async () => { await admin.testDistanceMatrixApi(data.tools.distanceMatrixApi); });
});
