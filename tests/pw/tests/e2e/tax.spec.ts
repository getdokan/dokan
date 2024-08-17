import { test, Page } from '@playwright/test';
import { TaxPage } from '@pages/taxPage';
import { data } from '@utils/testData';

test.describe('Tax test', () => {
    let taxPage: TaxPage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        taxPage = new TaxPage(aPage);
    });

    test.afterAll(async () => {
        await aPage.close();
    });

    test('admin can enable tax', { tag: ['@lite', '@admin'] }, async () => {
        await taxPage.enableTax();
    });

    test('admin can add standard tax rate', { tag: ['@lite', '@admin'] }, async () => {
        await taxPage.addStandardTaxRate(data.tax);
    });
});
