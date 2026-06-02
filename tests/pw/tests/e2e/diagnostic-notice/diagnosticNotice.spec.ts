import { test, Page } from '@utils/test';
import { NoticeAndPromotionPage, db, diagnosticNoticeData } from './diagnosticNoticePage';
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

    // TODO: need to fix
    test.skip('admin can view Dokan diagnostic notice', { tag: ['@lite', '@admin'] }, async () => {
        await admin.dokanDiagnosticNoticeRenderProperly(diagnosticNoticeData);
    });

    test('admin can allow Dokan diagnostic tracking', { tag: ['@lite', '@admin'] }, async () => {
        await admin.allowDiagnosticTracking();
    });

    test('admin can disallow Dokan diagnostic tracking [lite]', { tag: ['@lite', '@admin'] }, async () => {
        await db.deleteOptionRow(['dokan_tracking_notice', 'dokan_allow_tracking']);
        await admin.disallowDiagnosticTracking();
    });
});
