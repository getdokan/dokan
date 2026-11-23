import { test, Page } from '@utils/test';
import { MenuManagerPage, api, db, payloads, testData } from './menuManagerPage';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

test.describe('Menu Manager test', () => {
    let admin: MenuManagerPage;
    let vendor: MenuManagerPage;
    let aPage: Page, vPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new MenuManagerPage(aPage);

        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new MenuManagerPage(vPage);
    });

    test.afterAll(async () => {
        await db.setOptionValue(testData.optionName.menuManager, testData.menuManagerSettings);
        await aPage?.close();
        await vPage?.close();
    });

    test('admin can deactivate menu', { tag: ['@pro', '@admin'] }, async () => {
        await admin.updateMenuStatus('Analytics', 'deactivate', 'analytics', vendor);
    });

    test('admin can activate menu', { tag: ['@pro', '@admin'] }, async () => {
        await api.init();
        const activePlugins = await api.getAllPlugins({ status: 'active' }, payloads.adminAuth);
        const wooSubscriptionsActive = activePlugins.some((p: any) => p.plugin === 'woocommerce-subscriptions/woocommerce-subscriptions');
        if (wooSubscriptionsActive) {
            await updateMenuStatusByDB('user-subscription', 'false');
            await admin.updateMenuStatus('User Subscriptions', 'activate', 'userSubscriptions', vendor);
        } else {
            test.skip(true, 'WooCommerce Subscriptions plugin is not active');
        }
        await api.dispose();
    });

    test('admin can rename menu', { tag: ['@pro', '@admin'] }, async () => {
        await admin.renameMenu('Withdraw', 'Withdraws', vendor);
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

async function updateMenuStatusByDB(key: string, value: string) {
    const s = JSON.parse(JSON.stringify(testData.menuManagerSettings));
    s.dashboard_menu_manager.left_menus[key] = { is_switched_on: value };
    await db.setOptionValue(testData.optionName.menuManager, s);
}
