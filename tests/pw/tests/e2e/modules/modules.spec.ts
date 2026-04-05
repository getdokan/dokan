import { test, Page } from '@playwright/test';
import { ModulesPage, api, payloads, testData } from './modulesPage';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');

test.describe('Modules test', () => {
    let admin: ModulesPage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new ModulesPage(aPage);
        await api.init();
    });

    test.afterAll(async () => {
        await aPage?.close();
        await api.dispose();
    });

    test('admin can view modules menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await admin.adminModulesRenderProperly(testData.moduleStats);
    });

    test('admin can search module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.searchModule(testData.modulesName.auctionIntegration);
    });

    test('admin can filter modules by category', { tag: ['@pro', '@admin'] }, async () => {
        await admin.filterModules(testData.moduleCategory.productManagement);
    });

    test('admin can deactivate module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.activateDeactivateModule(testData.modulesName.auctionIntegration);
    });

    test('admin can activate module', { tag: ['@pro', '@admin'] }, async () => {
        await api.deactivateModules(payloads.moduleIds.auction, payloads.adminAuth);
        await admin.activateDeactivateModule(testData.modulesName.auctionIntegration);
    });

    test('admin can perform bulk action on modules', { tag: ['@pro', '@admin'] }, async () => {
        await admin.moduleBulkAction('activate');
    });

    test('admin can change module view layout', { tag: ['@pro', '@admin'] }, async () => {
        await admin.moduleViewLayout(testData.layout.list);
    });
});
