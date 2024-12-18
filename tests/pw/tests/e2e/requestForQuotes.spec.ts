import { test, request, Page } from '@playwright/test';
import { RequestForQuotationsPage } from '@pages/requestForQuotationsPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';

const { CUSTOMER_ID } = process.env;

test.describe('Request for quotation test admin', () => {
    let admin: RequestForQuotationsPage;
    let aPage: Page;
    let apiUtils: ApiUtils;
    const productId: string[] = [];
    let quoteId: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new RequestForQuotationsPage(aPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, productId[0]] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        [, quoteId] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, user_id: CUSTOMER_ID }, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await aPage.close();
        await apiUtils.dispose();
    });

    // quotes

    //admin

    test('admin can view quotes menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await admin.adminQuotesRenderProperly();
    });

    test('admin can add quote', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addQuote(data.requestForQuotation.quote());
    });

    test.skip('admin can edit quote', { tag: ['@pro', '@admin'] }, async () => {
        await admin.editQuote({ ...data.requestForQuotation.quote(), id: quoteId });
    });

    test('admin can trash quote', { tag: ['@pro', '@admin'] }, async () => {
        const [, quoteId] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, user_id: CUSTOMER_ID }, payloads.adminAuth);
        await admin.updateQuote(quoteId, 'trash');
    });

    test('admin can restore quote', { tag: ['@pro', '@admin'] }, async () => {
        const [, quoteId] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, status: 'trash', user_id: CUSTOMER_ID }, payloads.adminAuth);
        await admin.updateQuote(quoteId, 'restore');
    });

    test('admin can permanently delete quote', { tag: ['@pro', '@admin'] }, async () => {
        const [, quoteId] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, status: 'trash', user_id: CUSTOMER_ID }, payloads.adminAuth);
        await admin.updateQuote(quoteId, 'permanently-delete');
    });

    test('admin can approve quote', { tag: ['@pro', '@admin'] }, async () => {
        const [, quoteId] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, user_id: CUSTOMER_ID }, payloads.adminAuth);
        await admin.approveQuote(quoteId);
    });

    test('admin can convert quote to order', { tag: ['@pro', '@admin'] }, async () => {
        const [, quoteId] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, status: 'approve', user_id: CUSTOMER_ID }, payloads.adminAuth);
        await admin.convertQuoteToOrder(quoteId);
    });

    test('admin can perform quote bulk actions', { tag: ['@pro', '@admin', '@serial'] }, async () => {
        await admin.quotesBulkAction('trash');
    });
});

test.describe('Request for quotation test vendor', () => {
    let vendor: RequestForQuotationsPage;
    let vPage: Page;
    let apiUtils: ApiUtils;
    const productId: string[] = [];
    let quoteId: string;
    let productName: string;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new RequestForQuotationsPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, productId[0], productName] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        [, quoteId] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, user_id: CUSTOMER_ID }, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await vPage.close();
        await apiUtils.dispose();
    });

    test('vendor can view request quotes menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorRequestQuotesRenderProperly();
    });

    test('vendor can view request quote details', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorViewQuoteDetails(quoteId);
    });

    test('vendor can update quote request', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorUpdateQuoteRequest(quoteId, { ...data.requestForQuotation.vendorUpdateQuote, productName: productName });
    });

    test('vendor can approve quote request', { tag: ['@pro', '@vendor'] }, async () => {
        const [, quoteId] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, user_id: CUSTOMER_ID }, payloads.adminAuth);
        await vendor.vendorApproveQuoteRequest(quoteId);
    });

    test('vendor can convert quote request to order', { tag: ['@pro', '@vendor'] }, async () => {
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
        const [, quoteRuleId] = await apiUtils.createQuoteRule({ ...payloads.createQuoteRule(), product_ids: productId }, payloads.adminAuth);
        await dbUtils.updateQuoteRuleContent(quoteRuleId, { switches: { product_switch: 'true' } }); // todo: remove after api fix
        [, quoteId] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, user_id: CUSTOMER_ID }, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await cPage.close();
        await apiUtils.dispose();
    });

    //customer

    test('customer can view request for quote menu page', { tag: ['@pro', '@exploratory', '@customer'] }, async () => {
        await customer.requestForQuoteRenderProperly();
    });

    test('customer can view requested quote page', { tag: ['@pro', '@exploratory', '@customer'] }, async () => {
        await customer.requestedQuotesRenderProperly();
    });

    test('customer can view requested quote details', { tag: ['@pro', '@exploratory', '@customer'] }, async () => {
        await customer.customerViewRequestedQuoteDetails(quoteId);
    });

    test.skip('customer can update quote request', { tag: ['@pro', '@customer'] }, async () => {
        await customer.customerUpdateRequestedQuote(quoteId, { ...data.requestForQuotation.customerQuoteProduct, productName: productName });
    });

    test('customer can pay for order converted from quote request', { tag: ['@pro', '@customer'] }, async () => {
        test.slow();
        // todo: remove payment gateway disable methods when this issue is fixed https://github.com/getdokan/dokan-pro/issues/4015
        await apiUtils.updatePaymentGateway('dokan-stripe-connect', { ...payloads.stripeConnect, enabled: false }, payloads.adminAuth);
        await apiUtils.updatePaymentGateway('dokan_paypal_marketplace', { ...payloads.payPal, enabled: false }, payloads.adminAuth);
        await apiUtils.updatePaymentGateway('dokan_mangopay', { ...payloads.mangoPay, enabled: false }, payloads.adminAuth);
        await apiUtils.updatePaymentGateway('dokan_razorpay', { ...payloads.razorpay, enabled: false }, payloads.adminAuth);
        await apiUtils.updatePaymentGateway('dokan_stripe_express', { ...payloads.stripeExpress, enabled: false }, payloads.adminAuth);
        await apiUtils.convertQuoteToOrder(quoteId, payloads.adminAuth);
        await customer.payConvertedQuote(quoteId);
    });

    test('customer can quote product', { tag: ['@pro', '@customer'] }, async () => {
        await customer.customerQuoteProduct({ ...data.requestForQuotation.customerQuoteProduct, productName: productName });
    });

    //guest

    test('guest customer can quote product', { tag: ['@pro', '@guest'] }, async ({ page }) => {
        guest = new RequestForQuotationsPage(page);
        await guest.customerQuoteProduct({ ...data.requestForQuotation.customerQuoteProduct, productName: productName }, data.requestForQuotation.guest());
    });
});
