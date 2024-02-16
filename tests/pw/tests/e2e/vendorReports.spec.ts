import { test, Page } from '@playwright/test';
import { VendorReportsPage } from '@pages/vendorReportsPage';
import { data } from '@utils/testData';

test.describe('Vendor analytics test', () => {
    let vendor: VendorReportsPage;
    let vPage: Page;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new VendorReportsPage(vPage);
    });

    test.afterAll(async () => {
        await vPage.close();
    });

    test('vendor reports menu page is rendering properly @pro @exp @v', async () => {
        await vendor.vendorReportsRenderProperly();
    });

    test('vendor can export statement @pro @v', async () => {
        await vendor.exportStatement();
    });
});
