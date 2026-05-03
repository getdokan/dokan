import { test, Page } from '@playwright/test';
import { RequestForQuotationsPage, ApiUtils, data, payloads } from './requestForQuoteRulesPage';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');

test.describe('Request for quotation Rules test', () => {
    let admin: RequestForQuotationsPage;
    let aPage: Page;
    let apiUtils: ApiUtils;
    let quoteRuleTitle: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new RequestForQuotationsPage(aPage);
        apiUtils = new ApiUtils(null);
        [, , quoteRuleTitle] = await apiUtils.createQuoteRule(payloads.createQuoteRule(), payloads.adminAuth);
    });

    test.afterAll(async () => {
        await aPage?.close();
        await apiUtils.dispose();
    });

    test('admin can view quote rules menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => { await admin.adminQuoteRulesRenderProperly(); });

    test('admin can add quote rule', { tag: ['@pro', '@admin'] }, async () => {
        const [, , productName] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        await admin.addQuoteRule({ ...data.requestForQuotation.quoteRule(), includeProducts: productName });
    });

    test('admin can edit quote rule', { tag: ['@pro', '@admin'] }, async () => {
        await admin.editQuoteRule({ ...data.requestForQuotation.quoteRule(), title: quoteRuleTitle, specificProducts: false });
    });

    test('admin can trash quote rule', { tag: ['@pro', '@admin'] }, async () => {
        const [, , t] = await apiUtils.createQuoteRule(payloads.createQuoteRule(), payloads.adminAuth);
        await admin.updateQuoteRule(t, 'trash');
    });

    test('admin can restore quote rule', { tag: ['@pro', '@admin'] }, async () => {
        const [, , t] = await apiUtils.createQuoteRule({ ...payloads.createQuoteRule(), status: 'trash' }, payloads.adminAuth);
        await admin.updateQuoteRule(t, 'restore');
    });

    test('admin can permanently delete quote rule', { tag: ['@pro', '@admin'] }, async () => {
        const [, , t] = await apiUtils.createQuoteRule({ ...payloads.createQuoteRule(), status: 'trash' }, payloads.adminAuth);
        await admin.updateQuoteRule(t, 'permanently-delete');
    });

    test('admin can perform bulk action on quote rules', { tag: ['@pro', '@admin', '@serial'] }, async () => {
        await admin.quoteRulesBulkAction('trash');
    });
});
