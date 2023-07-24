import { test, Page } from '@playwright/test';
import { RequestForQuotationsPage } from 'pages/requestForQuotationsPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


let requestForQuotationsPage: RequestForQuotationsPage;
let aPage: Page;
let apiUtils: ApiUtils;

test.beforeAll(async ({ browser, request }) => {
	const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
	aPage = await adminContext.newPage();
	requestForQuotationsPage = new RequestForQuotationsPage(aPage);
	apiUtils = new ApiUtils(request);
});

test.afterAll(async ( ) => {
	await aPage.close();
});

test.describe('Request for quotation test', () => {

	// test.use({ storageState: data.auth.adminAuthFile });

	// quote rules

	test('admin quote rules menu page is rendering properly @pro @explo', async ( ) => {
		await requestForQuotationsPage.adminQuoteRulesRenderProperly();
	});

	test('admin can add quote rule @pro', async ( ) => {
		await requestForQuotationsPage.addQuoteRule({ ...data.requestForQuotation.quoteRule, userRole:data.requestForQuotation.userRole.customer });
	});

	test('admin can edit quote rule @pro', async ( ) => {
		await requestForQuotationsPage.editQuoteRule({ ...data.requestForQuotation.updateQuoteRule, userRole:data.requestForQuotation.userRole.customer });
	});

	test('admin can trash quote rule @pro', async ( ) => {
		await requestForQuotationsPage.updateQuoteRule(data.requestForQuotation.quoteRule.title, 'trash');
	});

	test('admin can restore quote rule @pro', async ( ) => {
		await requestForQuotationsPage.updateQuoteRule(data.requestForQuotation.quoteRule.title, 'restore');
	});

	test('admin can permanently delete quote rule @pro', async ( ) => {
		await apiUtils.createQuoteRule({ ...payloads.createQuoteRule(), rule_name: data.requestForQuotation.trashedQuoteRule.title, status:data.requestForQuotation.trashedQuoteRule.status }, payloads.adminAuth);
		await requestForQuotationsPage.updateQuoteRule(data.requestForQuotation.trashedQuoteRule.title, 'permanently-delete');
	});

	test('admin can perform quote rule bulk actions @pro', async ( ) => {
		await requestForQuotationsPage.quoteRulesBulkAction('trash');
	});

});
