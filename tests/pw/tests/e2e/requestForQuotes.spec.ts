import { test, Page } from '@playwright/test';
import { RequestForQuotationsPage } from '@pages/requestForQuotationsPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

const { CUSTOMER_ID } = data.env;

test.describe('Request for quotation test admin', () => {
    let admin: RequestForQuotationsPage;
    let aPage: Page;
    let apiUtils: ApiUtils;
    const productId: string[] = [];
    let quoteTitle: string;

    test.beforeAll(async ({ browser, request }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new RequestForQuotationsPage(aPage);

        apiUtils = new ApiUtils(request);
        const [, pId] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        productId.push(pId);
        [, , quoteTitle] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, user_id: CUSTOMER_ID }, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await aPage.close();
    });

    // quotes

    test('admin quotes menu page is rendering properly @pro @explo', async () => {
        await admin.adminQuotesRenderProperly();
    });

    test('admin can add quote @pro', async () => {
        await admin.addQuote({ ...data.requestForQuotation.quote, title: data.requestForQuotation.quote.title() });
    });

    test('admin can edit quote @pro', async () => {
        await admin.editQuote({ ...data.requestForQuotation.quote, title: quoteTitle });
    });

    test('admin can trash quote @pro', async () => {
        await admin.updateQuote(quoteTitle, 'trash');
    });

    test('admin can restore quote @pro', async () => {
        const [, , quoteTitle] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, status: 'trash', user_id: CUSTOMER_ID }, payloads.adminAuth);
        await admin.updateQuote(quoteTitle, 'restore');
    });

    test('admin can permanently delete quote @pro', async () => {
        const [, , quoteTitle] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, status: 'trash', user_id: CUSTOMER_ID }, payloads.adminAuth);
        await admin.updateQuote(quoteTitle, 'permanently-delete');
    });

    test('admin can approve quote @pro', async () => {
        const [, , quoteTitle] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, user_id: CUSTOMER_ID }, payloads.adminAuth);
        await admin.approveQuote(quoteTitle);
    });

    test('admin can convert quote to order @pro', async () => {
        const [, , quoteTitle] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, status: 'approve', user_id: CUSTOMER_ID }, payloads.adminAuth);
        await admin.convertQuoteToOrder(quoteTitle);
    });

    test('admin can perform quote bulk actions @pro', async () => {
        await admin.quotesBulkAction('trash');
    });
});

test.describe('Request for quotation test vendor', () => {
    let vendor: RequestForQuotationsPage;
    let vPage: Page;
    let apiUtils: ApiUtils;
    const productId: string[] = [];
    let quoteTitle: string;
    let productName: string;
    let pId: string;
    let quoteId: string;

    test.beforeAll(async ({ browser, request }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new RequestForQuotationsPage(vPage);

        apiUtils = new ApiUtils(request);
        [, pId, productName] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        productId.push(pId);
        [, quoteId, quoteTitle] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, user_id: CUSTOMER_ID }, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await vPage.close();
    });

    test('vendor request quotes menu page is rendering properly @pro @explo', async () => {
        await vendor.vendorRequestQuotesRenderProperly();
    });

    test('vendor can view request quote details @pro @explo', async () => {
        await vendor.vendorViewQuoteDetails(quoteTitle);
    });

    test('vendor can update quote request @pro', async () => {
        await vendor.vendorUpdateQuoteRequest(quoteId, { ...data.requestForQuotation.vendorUpdateQuote, productName: productName });
    });

    test('vendor can approve quote request @pro', async () => {
        await vendor.vendorApproveQuoteRequest(quoteId);
    });

    test('vendor can convert quote request to order @pro', async () => {
        // const [, quoteId] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, status: 'approve', user_id: CUSTOMER_ID }, payloads.adminAuth);
        await vendor.vendorConvertQuoteToOrder(quoteId);
    });
});

test.describe('Request for quotation test customer', () => {
    let customer: RequestForQuotationsPage;
    let guest: RequestForQuotationsPage;
    let cPage: Page, uPage: Page;
    let apiUtils: ApiUtils;
    const productId: string[] = [];
    let productName: string;
    let pId: string;
    let quoteId: string;

    test.beforeAll(async ({ browser, request }) => {
        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new RequestForQuotationsPage(cPage);

        const guestContext = await browser.newContext(data.auth.noAuth);
        uPage = await guestContext.newPage();
        guest = new RequestForQuotationsPage(uPage);

        apiUtils = new ApiUtils(request);

        [, pId, productName] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        productId.push(pId);
        const [responseBody] = await apiUtils.createQuoteRule({ ...payloads.createQuoteRule(), product_ids: productId, apply_on_all_product: '0' }, payloads.adminAuth);
        // console.log(responseBody);
        // console.log(productName);
        [, quoteId] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, user_id: CUSTOMER_ID }, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await cPage.close();
        await uPage.close();
    });

    test('customer request for quote menu page is rendering properly @pro @explo', async () => {
        await customer.requestForQuoteRenderProperly();
    });

    test('customer requested quote page is rendering properly @pro @explo', async () => {
        await customer.requestedQuotesRenderProperly();
    });

    test('customer can view requested quote details @pro @explo', async () => {
        await customer.customerViewRequestedQuoteDetails(quoteId);
    });

    test('customer can update quote request @pro', async () => {
        await customer.customerUpdateRequestedQuote(quoteId, { ...data.requestForQuotation.customerQuoteProduct, productName: productName });
    });

    test('customer can pay order converted from quote request @pro', async () => {
        await apiUtils.convertQuoteToOrder(quoteId, payloads.adminAuth);
        await customer.payConvertedQuote(quoteId);
    });

    test.skip('customer can quote product @pro @explo', async () => {
        await customer.customerQuoteProduct({ ...data.requestForQuotation.customerQuoteProduct, productName: productName });
    });

    test.skip('guest customer can quote product @pro @explo', async () => {
        await guest.customerQuoteProduct({ ...data.requestForQuotation.customerQuoteProduct, productName: productName }, data.requestForQuotation.guest());
    });
});
