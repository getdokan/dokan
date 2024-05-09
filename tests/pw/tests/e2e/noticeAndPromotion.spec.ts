import { test, Page } from '@playwright/test';
import { NoticeAndPromotionPage } from '@pages/noticeAndPromotionPage';
import { data } from '@utils/testData';

test.describe('Dokan pro feature promo test', () => {
    let admin: NoticeAndPromotionPage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new NoticeAndPromotionPage(aPage);
    });

    test.afterAll(async () => {
        await aPage.close();
    });

    test('admin can view Dokan notice', { tag: ['@lite', '@exploratory', '@admin'] }, async () => {
        await admin.dokanNoticeRenderProperly();
    });

    test('admin can view Dokan promotion', { tag: ['@lite', '@exploratory', '@admin'] }, async () => {
        await admin.dokanPromotionRenderProperly();
    });

    test('admin can view Dokan premium features promotions', { tag: ['@lite', '@liteOnly', '@exploratory', '@admin'] }, async () => {
        await admin.dokanProPromotionRenderProperly();
    });
});
