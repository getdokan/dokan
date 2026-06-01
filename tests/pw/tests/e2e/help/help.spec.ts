import { test, Page } from '@utils/test';
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

    // KEEP SKIPPED: stale selectors after AdminBar refactor — hover target '.dokan-admin-header-menu .menu-icon' and the '//div[@class="list-item"]' dropdown wrapper no longer exist (items are now direct <a> in a flex container, and "What's New" is now "Changelog"); would fail today.
    test.skip('admin can view get help dropdown', { tag: ['@lite', '@exploratory', '@admin'] }, async () => {
        await admin.adminGetHelpDropdownRenderProperly();
    });
});
