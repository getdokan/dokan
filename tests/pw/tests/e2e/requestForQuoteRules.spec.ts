import { test, Page } from '@playwright/test';
import { RequestForQuotationsPage } from '@pages/requestForQuotationsPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe('Request for quotation Rules test', () => {
    let admin: RequestForQuotationsPage;
    let aPage: Page;
    let apiUtils: ApiUtils;
    const quoteRuleTitle = data.requestForQuotation.quoteRule.title();

    test.beforeAll(async ({ browser, request }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new RequestForQuotationsPage(aPage);
        apiUtils = new ApiUtils(request);
        await apiUtils.createQuoteRule({ ...payloads.createQuoteRule(), rule_name: quoteRuleTitle }, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await aPage.close();
    });

    // quote rules

    test('admin quote rules menu page is rendering properly @pro @explo', async () => {
        await admin.adminQuoteRulesRenderProperly();
    });

    test('admin can add quote rule @pro', async () => {
        await admin.addQuoteRule({
            ...data.requestForQuotation.quoteRule,
            title: data.requestForQuotation.quoteRule.title(),
        });
    });

    test('admin can edit quote rule @pro', async () => {
        await admin.editQuoteRule({
            ...data.requestForQuotation.quoteRule,
            title: quoteRuleTitle,
        });
    });

    test('admin can trash quote rule @pro', async () => {
        await admin.updateQuoteRule(quoteRuleTitle, 'trash');
    });

    test('admin can restore quote rule @pro', async () => {
        await admin.updateQuoteRule(quoteRuleTitle, 'restore');
    });

    test('admin can permanently delete quote rule @pro', async () => {
        await apiUtils.createQuoteRule(
            {
                ...payloads.createQuoteRule(),
                rule_name: data.requestForQuotation.trashedQuoteRule.title,
                status: data.requestForQuotation.trashedQuoteRule.status,
            },
            payloads.adminAuth,
        );
        await admin.updateQuoteRule(data.requestForQuotation.trashedQuoteRule.title, 'permanently-delete');
    });

    test('admin can perform quote rule bulk actions @pro', async () => {
        await admin.quoteRulesBulkAction('trash');
    });
});
