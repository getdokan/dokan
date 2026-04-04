import { test, Page } from '@playwright/test';
import { HelpPage } from './helpPage';
import path from 'path';

// ============================================
// SESSION STORAGE VARIABLES
// ============================================
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');

test.describe('Dokan help test', () => {
    let admin: HelpPage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new HelpPage(aPage);
    });

    test.afterAll(async () => {
        await aPage?.close();
    });

    test('admin can view help menu page', { tag: ['@lite', '@exploratory', '@admin'] }, async () => {
        await admin.adminHelpRenderProperly();
    });

    test.skip('admin can view get help dropdown', { tag: ['@lite', '@exploratory', '@admin'] }, async () => {
        await admin.adminGetHelpDropdownRenderProperly();
    });
});
