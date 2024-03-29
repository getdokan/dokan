import { test, request, Page } from '@playwright/test';
import { RequestForQuotationsPage } from '@pages/requestForQuotationsPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

const { CUSTOMER_ID } = process.env;

test.describe('Request for quotation test admin', () => {
    let admin: RequestForQuotationsPage;
    let aPage: Page;
    let apiUtils: ApiUtils;
    const productId: string[] = [];
    let quoteTitle: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new RequestForQuotationsPage(aPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, productId[0]] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        [, , quoteTitle] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, user_id: CUSTOMER_ID }, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await aPage.close();
        await apiUtils.dispose();
    });

    // quotes

    test('admin quotes menu page is rendering properly @pro @exp @a', async () => {
        await admin.adminQuotesRenderProperly();
    });

    test('admin can add quote @pro @a', async () => {
        await admin.addQuote(data.requestForQuotation.quote());
    });

    test('admin can edit quote @pro @a', async () => {
        await admin.editQuote({ ...data.requestForQuotation.quote(), title: quoteTitle });
    });

    test('admin can trash quote @pro @a', async () => {
        const [, , quoteTitle] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, user_id: CUSTOMER_ID }, payloads.adminAuth);
        await admin.updateQuote(quoteTitle, 'trash');
    });

    test('admin can restore quote @pro @a', async () => {
        const [, , quoteTitle] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, status: 'trash', user_id: CUSTOMER_ID }, payloads.adminAuth);
        await admin.updateQuote(quoteTitle, 'restore');
    });

    test('admin can permanently delete quote @pro @a', async () => {
        const [, , quoteTitle] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, status: 'trash', user_id: CUSTOMER_ID }, payloads.adminAuth);
        await admin.updateQuote(quoteTitle, 'permanently-delete');
    });

    test('admin can approve quote @pro @a', async () => {
        const [, , quoteTitle] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, user_id: CUSTOMER_ID }, payloads.adminAuth);
        await admin.approveQuote(quoteTitle);
    });

    test('admin can convert quote to order @pro @a', async () => {
        const [, , quoteTitle] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, status: 'approve', user_id: CUSTOMER_ID }, payloads.adminAuth);
        await admin.convertQuoteToOrder(quoteTitle);
    });

    test.skip('admin can perform quote bulk actions @pro @a', async () => {
        // todo: might cause other tests to fail in parallel
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
    let quoteId: string;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new RequestForQuotationsPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, productId[0], productName] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        [, quoteId, quoteTitle] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, user_id: CUSTOMER_ID }, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await vPage.close();
        await apiUtils.dispose();
    });

    test('vendor request quotes menu page is rendering properly @pro @exp @v', async () => {
        await vendor.vendorRequestQuotesRenderProperly();
    });

    test('vendor can view request quote details @pro @exp @v', async () => {
        await vendor.vendorViewQuoteDetails(quoteTitle);
    });

    test('vendor can update quote request @pro @v', async () => {
        await vendor.vendorUpdateQuoteRequest(quoteId, { ...data.requestForQuotation.vendorUpdateQuote, productName: productName });
    });

    test('vendor can approve quote request @pro @v', async () => {
        const [, quoteId] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, user_id: CUSTOMER_ID }, payloads.adminAuth);
        await vendor.vendorApproveQuoteRequest(quoteId);
    });

    test('vendor can convert quote request to order @pro @v', async () => {
        const [, quoteId] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, status: 'approve', user_id: CUSTOMER_ID }, payloads.adminAuth);
        await vendor.vendorConvertQuoteToOrder(quoteId);
    });
});

test.describe('Request for quotation test customer', () => {
    let customer: RequestForQuotationsPage;
    let guest: RequestForQuotationsPage;
    let cPage: Page;
    let apiUtils: ApiUtils;
    const productId: string[] = [];
    let productName: string;
    let quoteId: string;

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new RequestForQuotationsPage(cPage);

        apiUtils = new ApiUtils(await request.newContext());

        [, productId[0], productName] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        await apiUtils.createQuoteRule({ ...payloads.createQuoteRule(), product_ids: productId, apply_on_all_product: '0' }, payloads.adminAuth);
        [, quoteId] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, user_id: CUSTOMER_ID }, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await cPage.close();
        await apiUtils.dispose();
    });

    //customer

    test('customer request for quote menu page is rendering properly @pro @exp @c', async () => {
        await customer.requestForQuoteRenderProperly();
    });

    test('customer requested quote page is rendering properly @pro @exp @c', async () => {
        await customer.requestedQuotesRenderProperly();
    });

    test('customer can view requested quote details @pro @exp @c', async () => {
        await customer.customerViewRequestedQuoteDetails(quoteId);
    });

    test('customer can update quote request @pro @c', async () => {
        await customer.customerUpdateRequestedQuote(quoteId, { ...data.requestForQuotation.customerQuoteProduct, productName: productName });
    });

    test('customer can pay for order converted from quote request @pro @c', async () => {
        await apiUtils.convertQuoteToOrder(quoteId, payloads.adminAuth);
        await customer.payConvertedQuote(quoteId);
    });

    test('customer can quote product @pro @c', async () => {
        await customer.customerQuoteProduct({ ...data.requestForQuotation.customerQuoteProduct, productName: productName });
    });

    //guest

    test('guest customer can quote product @pro @g', async ({ page }) => {
        guest = new RequestForQuotationsPage(page);
        await guest.customerQuoteProduct({ ...data.requestForQuotation.customerQuoteProduct, productName: productName }, data.requestForQuotation.guest());
    });
});
