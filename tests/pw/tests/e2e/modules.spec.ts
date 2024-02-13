import { test, request, Page } from '@playwright/test';
import { ModulesPage } from '@pages/modulesPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { data } from '@utils/testData';

test.describe('Modules test', () => {
    let admin: ModulesPage;
    let aPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new ModulesPage(aPage);

        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await aPage.close();
        await apiUtils.dispose();
    });

    test('dokan modules menu page is rendering properly @pro @exp @a', async () => {
        await admin.adminModulesRenderProperly();
    });

    test('admin can search module @pro @a', async () => {
        await admin.searchModule(data.modules.modulesName.AuctionIntegration);
    });

    test('admin can filter modules by category @pro @a', async () => {
        await admin.filterModules(data.modules.moduleCategory.productManagement);
    });

    test('admin can deactivate module @pro @a', async () => {
        await admin.activateDeactivateModule(data.modules.modulesName.AuctionIntegration);
    });

    test('admin can activate module @pro @a', async () => {
        await apiUtils.deactivateModules([payloads.moduleids.auction]);
        await admin.activateDeactivateModule(data.modules.modulesName.AuctionIntegration);
    });

    test('admin can perform module bulk action @pro @a', async () => {
        await admin.moduleBulkAction('activate');
    });

    test('admin can change module view layout @pro @a', async () => {
        await admin.moduleViewLayout(data.modules.layout.list);
    });
});
