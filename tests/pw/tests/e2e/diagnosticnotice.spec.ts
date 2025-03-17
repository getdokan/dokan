import { test, Page } from '@playwright/test';
import { NoticeAndPromotionPage } from '@pages/noticeAndPromotionPage';
import { data } from '@utils/testData';
import { dbUtils } from '@utils/dbUtils';

test.describe('Diagnostic notice test', () => {
    let admin: NoticeAndPromotionPage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new NoticeAndPromotionPage(aPage);

        // delete previous settings if exists
        await dbUtils.deleteOptionRow(['dokan_tracking_notice', 'dokan_allow_tracking']);
    });

    test.afterAll(async () => {
        await aPage.close();
    });

    test('admin can view Dokan diagnostic notice', { tag: ['@lite', '@admin'] }, async () => {
        await admin.dokanDiagnosticNoticeRenderProperly(data.diagnosticNotice);
    });

    test('admin can allow Dokan diagnostic tracking', { tag: ['@lite', '@admin'] }, async () => {
        await admin.allowDiagnosticTracking();
    });

    test('admin can disallow Dokan diagnostic tracking [lite]', { tag: ['@lite', '@admin'] }, async () => {
        await dbUtils.deleteOptionRow(['dokan_tracking_notice', 'dokan_allow_tracking']);
        await admin.disallowDiagnosticTracking();
    });
});
