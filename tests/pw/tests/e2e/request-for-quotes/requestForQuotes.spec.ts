import { Page, expect, test } from '@utils/test';
import { RequestForQuotationsPage, ApiUtils, data, dbUtils, payloads } from './requestForQuotesPage';
import path from 'path';

import { toPath } from '@utils/helpers';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

const { CUSTOMER_ID } = process.env;

test.describe('Request for quotation test admin', () => {
    let admin: RequestForQuotationsPage;
    let aPage: Page;
    let apiUtils: ApiUtils;
    const productId: string[] = [];
    let quoteId: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new RequestForQuotationsPage(aPage);
        apiUtils = new ApiUtils(null);
        [, productId[0]] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        [, quoteId] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, user_id: CUSTOMER_ID }, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await aPage?.close();
        await apiUtils.dispose();
    });

    test('admin can view quotes menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => { await admin.adminQuotesRenderProperly(); });
    test('admin can add quote', { tag: ['@pro', '@admin'] }, async () => { await admin.addQuote(data.requestForQuotation.quote()); });
    // KEEP skipped: editQuote() page-object method is an empty stub (no real implementation).
    test.skip('admin can edit quote', { tag: ['@pro', '@admin'] }, async () => { await admin.editQuote({ ...data.requestForQuotation.quote(), id: quoteId }); });

    test('admin can trash quote', { tag: ['@pro', '@admin'] }, async () => {
        const [, qId] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, user_id: CUSTOMER_ID }, payloads.adminAuth);
        await admin.updateQuote(qId, 'trash');
    });

    test('admin can restore quote', { tag: ['@pro', '@admin'] }, async () => {
        const [, qId] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, status: 'trash', user_id: CUSTOMER_ID }, payloads.adminAuth);
        await admin.updateQuote(qId, 'restore');
    });

    test('admin can permanently delete quote', { tag: ['@pro', '@admin'] }, async () => {
        const [, qId] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, status: 'trash', user_id: CUSTOMER_ID }, payloads.adminAuth);
        await admin.updateQuote(qId, 'permanently-delete');
    });

    test('admin can approve quote', { tag: ['@pro', '@admin'] }, async () => {
        const [, qId] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, user_id: CUSTOMER_ID }, payloads.adminAuth);
        await admin.approveQuote(qId);
    });

    test('admin can convert quote to order', { tag: ['@pro', '@admin'] }, async () => {
        const [, qId] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, status: 'approve', user_id: CUSTOMER_ID }, payloads.adminAuth);
        await admin.convertQuoteToOrder(qId);
    });

    test('admin can perform quote bulk actions', { tag: ['@pro', '@admin', '@serial'] }, async () => { await admin.quotesBulkAction('trash'); });
});

test.describe('Request for quotation test vendor', () => {
    let vendor: RequestForQuotationsPage;
    let vPage: Page;
    let apiUtils: ApiUtils;
    const productId: string[] = [];
    let quoteId: string;
    let productName: string;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new RequestForQuotationsPage(vPage);
        apiUtils = new ApiUtils(null);
        [, productId[0], productName] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        [, quoteId] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, user_id: CUSTOMER_ID }, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await vPage?.close();
        await apiUtils.dispose();
    });

    test('vendor can view request quotes menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorRequestQuotesRenderProperly(); });
    test('vendor can view request quote details', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorViewQuoteDetails(quoteId); });
    test('vendor can update quote request', { tag: ['@pro', '@vendor'] }, async () => { await vendor.vendorUpdateQuoteRequest(quoteId, { ...data.requestForQuotation.vendorUpdateQuote, productName: productName }); });

    test('vendor can approve quote request', { tag: ['@pro', '@vendor'] }, async () => {
        const [, qId] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, user_id: CUSTOMER_ID }, payloads.adminAuth);
        await vendor.vendorApproveQuoteRequest(qId);
    });

    test('vendor can convert quote request to order', { tag: ['@pro', '@vendor'] }, async () => {
        const [, qId] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, status: 'approve', user_id: CUSTOMER_ID }, payloads.adminAuth);
        await vendor.vendorConvertQuoteToOrder(qId);
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
        const customerContext = await browser.newContext({ storageState: c1 });
        cPage = await customerContext.newPage();
        customer = new RequestForQuotationsPage(cPage);
        apiUtils = new ApiUtils(null);
        [, productId[0], productName] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        const [, quoteRuleId] = await apiUtils.createQuoteRule({ ...payloads.createQuoteRule(), product_ids: productId }, payloads.adminAuth);
        await dbUtils.updateQuoteRuleContent(quoteRuleId, { switches: { product_switch: 'true' } });
        [, quoteId] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId, user_id: CUSTOMER_ID }, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await cPage?.close();
        await apiUtils.dispose();
    });

    test('customer can view request for quote menu page', { tag: ['@pro', '@exploratory', '@customer'] }, async () => { await customer.requestForQuoteRenderProperly(); });
    test('customer can view requested quote page', { tag: ['@pro', '@exploratory', '@customer'] }, async () => { await customer.requestedQuotesRenderProperly(); });
    test('customer can view requested quote details', { tag: ['@pro', '@exploratory', '@customer'] }, async () => { await customer.customerViewRequestedQuoteDetails(quoteId); });
    // KEEP skipped: customerUpdateRequestedQuote() page-object method is an empty stub (no real implementation).
    test.skip('customer can update quote request', { tag: ['@pro', '@customer'] }, async () => { await customer.customerUpdateRequestedQuote(quoteId, { ...data.requestForQuotation.customerQuoteProduct, productName: productName }); });

    test('customer can pay for order converted from quote request', { tag: ['@pro', '@customer'] }, async () => {
        test.slow();
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

    test('guest customer can quote product', { tag: ['@pro', '@guest'] }, async ({ page }) => {
        guest = new RequestForQuotationsPage(page);
        await guest.customerQuoteProduct({ ...data.requestForQuotation.customerQuoteProduct, productName: productName }, data.requestForQuotation.guest());
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Request For Quotes (React) Tests @pro', () => {
    test('Test Case 1 - Vendor RFQ list page renders', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/requested-quotes/`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Admin RFQ page renders', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`wp-admin/admin.php?page=request_for_quote`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator(".notice-error, body.error-page").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 3 - Vendor RFQ page renders content', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/requested-quotes/`));
        await page.waitForLoadState('domcontentloaded');
        // Page may show a heading-only screen with "you haven't received any quotes" copy.
        await expect
            .poll(async () => (await page.locator('body').innerText()).trim().length, {
                timeout: 30_000,
                intervals: [500, 1000, 2000, 3000],
                message: 'RFQ page should render some content',
            })
            .toBeGreaterThan(50);
        await page.close();
        await ctx.close();
    });
});

