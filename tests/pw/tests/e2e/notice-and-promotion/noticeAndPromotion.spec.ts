import { test, Page } from '@utils/test';
import { NoticeAndPromotionPage } from './noticeAndPromotionPage';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');

test.describe('Dokan pro feature promo test', () => {
    let admin: NoticeAndPromotionPage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new NoticeAndPromotionPage(aPage);
    });

    test.afterAll(async () => {
        await aPage?.close();
    });

    test('admin can view Dokan notice', { tag: ['@lite', '@exploratory', '@admin'] }, async () => {
        await admin.dokanNoticeRenderProperly();
    });

    test('admin can view Dokan promotion', { tag: ['@lite', '@exploratory', '@admin'] }, async () => {
        await admin.dokanPromotionRenderProperly();
    });

    test.skip('admin can view Dokan premium features promotions', { tag: ['@lite', '@liteOnly', '@exploratory', '@admin'] }, async () => {
        await admin.dokanProPromotionRenderProperly();
    });
});
