import { test, Page } from '@utils/test';
import { NoticeAndPromotionPage, db } from './diagnosticNoticePage';
import path from 'path';

// ============================================
// SESSION STORAGE VARIABLES
// ============================================
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');

test.describe('Diagnostic notice test', () => {
    let admin: NoticeAndPromotionPage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new NoticeAndPromotionPage(aPage);
    });

    test.afterAll(async () => {
        await aPage?.close();
        await db.dispose();
    });

    // NOTE: "admin can view Dokan diagnostic notice" removed 2026-07 — the Appsero
    // data-collection notice (.dokan-lite-insights-data-we-collect) no longer renders
    // on the admin dashboard; the allow/disallow tracking tests below cover the feature.

    test('admin can allow Dokan diagnostic tracking', { tag: ['@lite', '@admin'] }, async () => {
        await admin.allowDiagnosticTracking();
    });

    test('admin can disallow Dokan diagnostic tracking [lite]', { tag: ['@lite', '@admin'] }, async () => {
        await db.deleteOptionRow(['dokan_tracking_notice', 'dokan_allow_tracking']);
        await admin.disallowDiagnosticTracking();
    });
});
