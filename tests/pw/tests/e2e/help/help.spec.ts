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

    // NOTE: "admin can view get help dropdown" removed 2026-07 — the header help
    // menu (redesigned to an icon fly-out) is covered by setup-guide's
    // "should show all the header items in the help menu" test.
});
