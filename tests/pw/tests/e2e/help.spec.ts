import { test, Page } from '@playwright/test';
import { HelpPage } from '@pages/helpPage';
import { data } from '@utils/testData';

test.describe('Dokan help test', () => {
    let admin: HelpPage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new HelpPage(aPage);
    });

    test.afterAll(async () => {
        await aPage.close();
    });

    test('admin can view help menu page', { tag: ['@lite', '@exploratory', '@admin'] }, async () => {
        await admin.adminHelpRenderProperly();
    });

    test('admin can view get help dropdown', { tag: ['@lite', '@exploratory', '@admin'] }, async () => {
        await admin.adminGetHelpDropdownRenderProperly();
    });
});
