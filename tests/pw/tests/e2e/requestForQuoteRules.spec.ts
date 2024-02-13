import { test, request, Page } from '@playwright/test';
import { RequestForQuotationsPage } from '@pages/requestForQuotationsPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe('Request for quotation Rules test', () => {
    let admin: RequestForQuotationsPage;
    let aPage: Page;
    let apiUtils: ApiUtils;
    const quoteRuleTitle = data.requestForQuotation.quoteRule.title();

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new RequestForQuotationsPage(aPage);
        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.createQuoteRule({ ...payloads.createQuoteRule(), rule_name: quoteRuleTitle }, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await aPage.close();
        await apiUtils.dispose();
    });

    // quote rules

    test('admin quote rules menu page is rendering properly @pro @exp @a', async () => {
        await admin.adminQuoteRulesRenderProperly();
    });

    test('admin can add quote rule @pro @a', async () => {
        await admin.addQuoteRule({ ...data.requestForQuotation.quoteRule, title: data.requestForQuotation.quoteRule.title() });
    });

    test('admin can edit quote rule @pro @a', async () => {
        await admin.editQuoteRule({ ...data.requestForQuotation.quoteRule, title: quoteRuleTitle });
    });

    test('admin can trash quote rule @pro @a', async () => {
        await admin.updateQuoteRule(quoteRuleTitle, 'trash');
    });

    test('admin can restore quote rule @pro @a', async () => {
        await admin.updateQuoteRule(quoteRuleTitle, 'restore');
    });

    test('admin can permanently delete quote rule @pro @a', async () => {
        await apiUtils.createQuoteRule({ ...payloads.createQuoteRule(), rule_name: data.requestForQuotation.trashedQuoteRule.title, status: data.requestForQuotation.trashedQuoteRule.status }, payloads.adminAuth);
        await admin.updateQuoteRule(data.requestForQuotation.trashedQuoteRule.title, 'permanently-delete');
    });

    // todo: need order for this type of test for whole project , will fail others tests while running parallel
    test('admin can perform quote rule bulk actions @pro @a', async () => {
        await admin.quoteRulesBulkAction('trash');
    });
});
