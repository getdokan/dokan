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

    //admin

    test('admin can view modules menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await admin.adminModulesRenderProperly(data.modules.moduleStats);
    });

    test('admin can search module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.searchModule(data.modules.modulesName.AuctionIntegration);
    });

    test('admin can filter modules by category', { tag: ['@pro', '@admin'] }, async () => {
        await admin.filterModules(data.modules.moduleCategory.productManagement);
    });

    test('admin can deactivate module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.activateDeactivateModule(data.modules.modulesName.AuctionIntegration);
    });

    test('admin can activate module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules([payloads.moduleIds.auction], payloads.adminAuth);
        await admin.activateDeactivateModule(data.modules.modulesName.AuctionIntegration);
    });

    test('admin can perform bulk action on modules', { tag: ['@pro', '@admin'] }, async () => {
        await admin.moduleBulkAction('activate');
    });

    test('admin can change module view layout', { tag: ['@pro', '@admin'] }, async () => {
        await admin.moduleViewLayout(data.modules.layout.list);
    });
});
