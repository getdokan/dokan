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

    test('dokan help menu page renders properly', { tag: ['@lite', '@exploratory', '@admin'] }, async () => {
        await admin.adminHelpRenderProperly();
    });

    test('dokan get help dropdown is rendering properly', { tag: ['@lite', '@exploratory', '@admin'] }, async () => {
        await admin.adminGetHelpDropdownRenderProperly();
    });
});
