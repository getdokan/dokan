import { test, Page } from '@playwright/test';
import { MenuManagerPage } from '@pages/menuManagerPage';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';

test.describe('Menu Manager test', () => {
    let admin: MenuManagerPage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new MenuManagerPage(aPage);
    });

    test.afterAll(async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.menuManager, dbData.dokan.menuManagerSettings);
        await aPage.close();
    });

    //admin

    test('admin can deactivate menu', { tag: ['@pro', '@admin'] }, async () => {
        await admin.updateMenuStatus('Analytics', 'deactivate', 'analytics');
        //reset
        // await dbUtils.setDokanSettings(dbData.dokan.optionName.menuManager, dbData.dokan.menuManagerSettings);
    });

    test('admin can activate menu', { tag: ['@pro', '@admin'] }, async () => {
        await updateMenuStatusByDB('user-subscription', 'false');
        await admin.updateMenuStatus('User Subscriptions', 'activate', 'userSubscriptions');
    });

    test('admin can rename menu', { tag: ['@pro', '@admin'] }, async () => {
        await admin.renameMenu('Withdraw', 'Withdraws');
        //reset
        // await dbUtils.setDokanSettings(dbData.dokan.optionName.menuManager, dbData.dokan.menuManagerSettings);
    });

    test("admin can't rename menu with more than 45 characters", { tag: ['@pro', '@admin'] }, async () => {
        await admin.cantRenameMenuBeyondLimit('Staff', 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz');
    });

    test("admin can't rename disabled menu", { tag: ['@pro', '@admin'] }, async () => {
        await admin.cantRenameMenu('Coupons');
    });

    test('admin can reorder menu', { tag: ['@pro', '@admin'] }, async () => {
        await admin.reorderMenu('Orders', 'Products');
    });

    test("admin can't reorder or toggle status of dashboard & store menu", { tag: ['@pro', '@admin'] }, async () => {
        await admin.cantAlterMenu('Dashboard');
        await admin.cantAlterMenu('Store', true);
    });

    test('admin can reset menu manager settings', { tag: ['@pro', '@admin'] }, async () => {
        await updateMenuStatusByDB('tools', 'false');
        await admin.resetMenuManagerSettings('Tools');
    });
});

// update menu switch status
async function updateMenuStatusByDB(key: string, value: string) {
    const menuManagerSettings = JSON.parse(JSON.stringify(dbData.dokan.menuManagerSettings));
    menuManagerSettings.dashboard_menu_manager.left_menus[key as keyof typeof menuManagerSettings.dashboard_menu_manager.left_menus].is_switched_on = value;
    await dbUtils.setDokanSettings(dbData.dokan.optionName.menuManager, menuManagerSettings);
}
