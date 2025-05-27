import { test, request, Page } from '@playwright/test';
import { SellerVacationPage } from '@pages/sellerVacationPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe('Seller vacation test', () => {
    let admin: SellerVacationPage;
    let aPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new SellerVacationPage(aPage);

        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.sellerVacation, payloads.adminAuth);
        await aPage.close();
        await apiUtils.dispose();
    });

    //admin

    test('admin can enable seller vacation module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enableSellerVacationModule();
    });

    test('admin can disable seller vacation module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.sellerVacation, payloads.adminAuth);
        await admin.disableSellerVacationModule();
    });
});
