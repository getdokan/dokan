import { test, Page } from '@playwright/test';
import { AdminDashboardPage, VendorDashboardPage } from './dashboardPage';
import path from 'path';

// ============================================
// SESSION STORAGE VARIABLES
// ============================================
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

test.describe('Dashboard test', () => {
    let admin: AdminDashboardPage;
    let vendor: VendorDashboardPage;
    let aPage: Page, vPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new AdminDashboardPage(aPage);

        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new VendorDashboardPage(vPage);
    });

    test.afterAll(async () => {
        await aPage?.close();
        await vPage?.close();
    });

    // admin
    // TODO: need to fix
    test.skip('admin can view Dokan dashboard', { tag: ['@lite', '@exploratory', '@admin'] }, async () => {
        await admin.adminDashboardRenderProperly();
    });

    // vendor

    test('vendor can view vendor dashboard', { tag: ['@lite', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorDashboardRenderProperly();
    });

    test('vendor can view vendor dashboard menus', { tag: ['@lite', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorDashboardMenusRenderProperly();
    });
});
