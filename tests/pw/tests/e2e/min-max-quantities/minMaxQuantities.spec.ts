import { test, Page } from '@playwright/test';
import { MinMaxQuantitiesPage, api, payloads } from './minMaxQuantitiesPage';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');

test.describe('Min max quantities test', () => {
    let admin: MinMaxQuantitiesPage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new MinMaxQuantitiesPage(aPage);
        await api.init();
    });

    test.afterAll(async () => {
        await api.activateModules(payloads.moduleIds.minMaxQuantities, payloads.adminAuth);
        await aPage?.close();
        await api.dispose();
    });

    test('admin can enable min max quantities module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enableMinMaxQuantitiesModule();
    });

    test('admin can disable min max quantities module', { tag: ['@pro', '@admin'] }, async () => {
        await api.deactivateModules(payloads.moduleIds.minMaxQuantities, payloads.adminAuth);
        await admin.disableMinMaxQuantitiesModule();
    });
});
