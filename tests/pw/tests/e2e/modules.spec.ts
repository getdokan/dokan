import { test, Page } from '@playwright/test';
import { ModulesPage } from 'pages/modulesPage';
import { data } from 'utils/testData';

test.describe('Modules test', () => {
    let admin: ModulesPage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new ModulesPage(aPage);
    });

    test.afterAll(async () => {
        await aPage.close();
    });

    test('dokan modules menu page is rendering properly @pro @explo', async () => {
        await admin.adminModulesRenderProperly();
    });

    test('admin can search module @pro', async () => {
        await admin.searchModule(data.modules.modulesName.AuctionIntegration);
    });

    test('admin can filter modules by category @pro', async () => {
        await admin.filterModules(data.modules.moduleCategory.productManagement);
    });

    test('admin can deactivate module @pro', async () => {
        await admin.activateDeactivateModule(data.modules.modulesName.AuctionIntegration);
    });

    test('admin can activate module @pro', async () => {
        await admin.activateDeactivateModule(data.modules.modulesName.AuctionIntegration);
    });

    test('admin can perform module bulk action @pro', async () => {
        await admin.moduleBulkAction('activate');
    });

    test('admin can change module view layout @pro', async () => {
        await admin.moduleViewLayout(data.modules.layout.list);
    });
});
