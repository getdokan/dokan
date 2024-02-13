import { test, Page } from '@playwright/test';
import { VendorReportsPage } from '@pages/vendorReportsPage';
// import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
// import { payloads } from '@utils/payloads';

test.describe('Vendor analytics test', () => {
    let vendor: VendorReportsPage;
    let vPage: Page;
    // let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new VendorReportsPage(vPage);

        // apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await vPage.close();
        // await apiUtils.dispose();
    });

    test('vendor reports menu page is rendering properly @pro @exp @v', async () => {
        await vendor.vendorReportsRenderProperly();
    });

    test('vendor can export statement @pro @v', async () => {
        await vendor.exportStatement();
    });
});
