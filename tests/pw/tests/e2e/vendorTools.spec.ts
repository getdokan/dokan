import { test, Page } from '@playwright/test';
import { VendorToolsPage } from '@pages/vendorToolsPage';
import { data } from '@utils/testData';

test.describe('Vendor tools test', () => {
    let vendor: VendorToolsPage;
    let vPage: Page;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new VendorToolsPage(vPage);
    });

    test.afterAll(async () => {
        await vPage.close();
    });

    test('vendor tools menu page is rendering properly @pro @exp @v', async () => {
        await vendor.vendorToolsRenderProperly();
    });

    test('vendor can export product as xml @pro @v', async () => {
        await vendor.exportProduct('xml');
    });

    test('vendor can export product as csv @pro @v', async () => {
        await vendor.exportProduct('csv');
    });

    test('vendor can import product as xml @pro @v', async () => {
        await vendor.importProduct('xml', 'utils/sampleData/products.xml');
    });

    test('vendor can import product as csv @pro @v', async () => {
        await vendor.importProduct('csv', 'utils/sampleData/products.csv');
    });
});
