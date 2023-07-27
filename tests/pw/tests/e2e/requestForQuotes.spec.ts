import { test } from '@playwright/test';
import { RequestForQuotationsPage } from 'pages/requestForQuotationsPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


let admin: RequestForQuotationsPage;
let apiUtils: ApiUtils;
const productId: string[] = [];


test.beforeAll(async ({ browser, request }) => {
	const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
	const aPage = await adminContext.newPage();
	admin = new RequestForQuotationsPage(aPage);
	apiUtils = new ApiUtils(request);
	const [, pId,] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
	productId.push(pId);
});


test.afterAll(async ({ browser }) => {
	await browser.close();
});


test.describe('Request for quotation test', () => {

	// quotes

	test('admin quotes menu page is rendering properly @pro @explo', async ( ) => {
		await admin.adminQuotesRenderProperly();
	});

	test('admin can add quote @pro', async ( ) => {
		await admin.addQuote(data.requestForQuotation.quote);
	});

	test('admin can edit quote @pro', async ( ) => {
		await admin.editQuote(data.requestForQuotation.updateQuote);
	});

	test('admin can trash quote @pro', async ( ) => {
		await admin.updateQuote(data.requestForQuotation.quote.title, 'trash');
	});

	test('admin can restore quote @pro', async ( ) => {
		await admin.updateQuote(data.requestForQuotation.quote.title, 'restore');
	});

	test('admin can permanently delete quote @pro', async ( ) => {
		await apiUtils.createRequestQuote({ ...payloads.createRequestQuote(), product_ids: productId, quote_title: data.requestForQuotation.trashedQuote.title, status: 'trash' }, payloads.adminAuth);
		await admin.updateQuote(data.requestForQuotation.trashedQuote.title, 'permanently-delete');
	});

	test('admin can approve quote @pro', async ( ) => {
		await apiUtils.createRequestQuote({ ...payloads.createRequestQuote(), product_ids: productId, quote_title: data.requestForQuotation.convertedQuote.title }, payloads.adminAuth);
		await admin.approveQuote(data.requestForQuotation.convertedQuote.title);
	});

	test('admin can convert quote to order @pro', async ( ) => {
		await apiUtils.createRequestQuote({ ...payloads.createRequestQuote(), product_ids: productId, quote_title: data.requestForQuotation.convertedQuote.title, status: 'approve' }, payloads.adminAuth);
		await admin.convertQuoteToOrder(data.requestForQuotation.convertedQuote.title);
	});

	test('admin can perform quote bulk actions @pro', async ( ) => {
		await admin.quotesBulkAction('trash');
	});

});