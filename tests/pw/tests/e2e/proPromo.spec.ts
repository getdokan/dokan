import { test, Page } from '@playwright/test';
import { ProPromoPage } from '@pages/proPromoPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
// import { payloads } from '@utils/payloads';

test.describe('Dokan pro feature promo test', () => {
    let admin: ProPromoPage;
    let aPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser, request }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new ProPromoPage(aPage);

        apiUtils = new ApiUtils(request);
    });

    test.afterAll(async () => {
        await aPage.close();
    });

    test('dokan pro features promo @liteOnly', async () => {
        // await apiUtils.updatePlugin('dokan-pro/dokan-pro', { status:'inactive' }, payloads.adminAuth);
        await admin.dokanProPromo();
        // await apiUtils.updatePlugin('dokan-pro/dokan-pro', { status:'active' }, payloads.adminAuth);
    });
});
