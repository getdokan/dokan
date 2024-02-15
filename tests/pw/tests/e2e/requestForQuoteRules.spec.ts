import { test, request, Page } from '@playwright/test';
import { RequestForQuotationsPage } from '@pages/requestForQuotationsPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe('Request for quotation Rules test', () => {
    let admin: RequestForQuotationsPage;
    let aPage: Page;
    let apiUtils: ApiUtils;
    let quoteRuleTitle: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new RequestForQuotationsPage(aPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, , quoteRuleTitle] = await apiUtils.createQuoteRule(payloads.createQuoteRule(), payloads.adminAuth);
    });

    test.afterAll(async () => {
        await apiUtils.deleteAllQuoteRules(payloads.adminAuth);
        await apiUtils.deleteAllQuoteRulesTrashed(payloads.adminAuth);
        await aPage.close();
        await apiUtils.dispose();
    });

    // quote rules

    //admin

    test('admin quote rules menu page is rendering properly @pro @exp @a', async () => {
        await admin.adminQuoteRulesRenderProperly();
    });

    test('admin can add quote rule @pro @a', async () => {
        await admin.addQuoteRule(data.requestForQuotation.quoteRule());
    });

    test('admin can edit quote rule @pro @a', async () => {
        await admin.editQuoteRule({ ...data.requestForQuotation.quoteRule(), title: quoteRuleTitle });
    });

    test('admin can trash quote rule @pro @a', async () => {
        const [, , quoteRuleTitle] = await apiUtils.createQuoteRule(payloads.createQuoteRule(), payloads.adminAuth);
        await admin.updateQuoteRule(quoteRuleTitle, 'trash');
    });

    test('admin can restore quote rule @pro @a', async () => {
        const [, , quoteRuleTitle] = await apiUtils.createQuoteRule({ ...payloads.createQuoteRule(), status: 'trash' }, payloads.adminAuth);
        await admin.updateQuoteRule(quoteRuleTitle, 'restore');
    });

    test('admin can permanently delete quote rule @pro @a', async () => {
        const [, , quoteRuleTitle] = await apiUtils.createQuoteRule({ ...payloads.createQuoteRule(), status: 'trash' }, payloads.adminAuth);
        await admin.updateQuoteRule(quoteRuleTitle, 'permanently-delete');
    });

    test.skip('admin can perform quote rule bulk actions @pro @a', async () => {
        // todo: might cause other tests to fail in parallel
        await admin.quoteRulesBulkAction('trash');
    });
});
