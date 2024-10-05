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
    let productName: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new RequestForQuotationsPage(aPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, , productName] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        [, , quoteRuleTitle] = await apiUtils.createQuoteRule(payloads.createQuoteRule(), payloads.adminAuth); // todo: fix after api is updated
    });

    test.afterAll(async () => {
        // await apiUtils.deleteAllQuoteRules(payloads.adminAuth); //todo: remove in future
        await aPage.close();
        await apiUtils.dispose();
    });

    // quote rules

    //admin

    test('admin can view quote rules menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await admin.adminQuoteRulesRenderProperly();
    });

    test('admin can add quote rule', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addQuoteRule({ ...data.requestForQuotation.quoteRule(), includeProducts: productName });
    });

    test('admin can edit quote rule', { tag: ['@pro', '@admin'] }, async () => {
        await admin.editQuoteRule({ ...data.requestForQuotation.quoteRule(), title: quoteRuleTitle });
    });

    test('admin can trash quote rule', { tag: ['@pro', '@admin'] }, async () => {
        const [, , quoteRuleTitle] = await apiUtils.createQuoteRule(payloads.createQuoteRule(), payloads.adminAuth);
        await admin.updateQuoteRule(quoteRuleTitle, 'trash');
    });

    test('admin can restore quote rule', { tag: ['@pro', '@admin'] }, async () => {
        const [, , quoteRuleTitle] = await apiUtils.createQuoteRule({ ...payloads.createQuoteRule(), status: 'trash' }, payloads.adminAuth);
        await admin.updateQuoteRule(quoteRuleTitle, 'restore');
    });

    test('admin can permanently delete quote rule', { tag: ['@pro', '@admin'] }, async () => {
        const [, , quoteRuleTitle] = await apiUtils.createQuoteRule({ ...payloads.createQuoteRule(), status: 'trash' }, payloads.adminAuth);
        await admin.updateQuoteRule(quoteRuleTitle, 'permanently-delete');
    });

    test('admin can perform bulk action on quote rules', { tag: ['@pro', '@admin', '@serial'] }, async () => {
        await admin.quoteRulesBulkAction('trash');
    });
});
