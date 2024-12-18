import { test, Page, request } from '@playwright/test';
import { MinMaxQuantitiesPage } from '@pages/minMaxQuantitiesPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe('Min max quantities test', () => {
    let admin: MinMaxQuantitiesPage;
    let aPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new MinMaxQuantitiesPage(aPage);

        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.minMaxQuantities, payloads.adminAuth);
        await aPage.close();
    });

    //admin

    test('admin can enable min max quantities module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enableMinMaxQuantitiesModule();
    });

    test('admin can disable min max quantities module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.minMaxQuantities, payloads.adminAuth);
        await admin.disableMinMaxQuantitiesModule();
    });
});
