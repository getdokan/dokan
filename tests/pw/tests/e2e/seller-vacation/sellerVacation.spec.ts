import { test, Page } from '@playwright/test';
import { SellerVacationPage, ApiUtils, payloads } from './sellerVacationPage';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');

test.describe('Seller vacation test', () => {
    let admin: SellerVacationPage;
    let aPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new SellerVacationPage(aPage);
        apiUtils = new ApiUtils(null);
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.sellerVacation, payloads.adminAuth);
        await aPage?.close();
        await apiUtils.dispose();
    });

    test('admin can enable seller vacation module', { tag: ['@pro', '@admin'] }, async () => { await admin.enableSellerVacationModule(); });
    test('admin can disable seller vacation module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.sellerVacation, payloads.adminAuth);
        await admin.disableSellerVacationModule();
    });
});
