import { test, Page, expect } from '@playwright/test';
import { ProductQAPage, ApiUtils, data, payloads } from './productQAPage';
import path from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:9999';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

const { PRODUCT_ID } = process.env;

test.describe('Product QA functionality test', () => {
    let admin: ProductQAPage;
    let vendor: ProductQAPage;
    let customer: ProductQAPage;
    let aPage: Page, vPage: Page, cPage: Page;
    let apiUtils: ApiUtils;
    let questionId: string;
    let qaModuleDisabled = false;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new ProductQAPage(aPage);
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new ProductQAPage(vPage);
        const customerContext = await browser.newContext({ storageState: c1 });
        cPage = await customerContext.newPage();
        customer = new ProductQAPage(cPage);
        apiUtils = new ApiUtils(null);
        await apiUtils.activateModules(payloads.moduleIds.productQa, payloads.adminAuth);
        [, questionId] = await apiUtils.createProductQuestion({ ...payloads.createProductQuestion(), product_id: PRODUCT_ID }, payloads.customerAuth);
        await apiUtils.createProductQuestionAnswer({ ...payloads.createProductQuestionAnswer(), question_id: questionId }, payloads.adminAuth);
    });

    test.afterAll(async () => {
        if (!qaModuleDisabled) {
            await apiUtils.activateModules(payloads.moduleIds.productQa, payloads.adminAuth);
        }
        await aPage?.close();
        await vPage?.close();
        await cPage?.close();
        await apiUtils.dispose();
    });

    test('admin can enable product Q&A module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enableProductQaModule(data.predefined.simpleProduct.product1.name);
    });

    test('admin product QA menu page renders properly', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await admin.adminProductQARenderProperly();
    });

    test('admin can view product question details', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await admin.viewQuestionDetails(questionId);
    });

    test('admin can filter questions by vendor', { tag: ['@pro', '@admin'] }, async () => {
        await admin.filterQuestions(data.questionAnswers().filter.byVendor, 'by-vendor');
    });

    test('admin can filter questions by product', { tag: ['@pro', '@admin'] }, async () => {
        await admin.filterQuestions(data.questionAnswers().filter.byProduct, 'by-product');
    });

    test('admin can edit question', { tag: ['@pro', '@admin'] }, async () => {
        await admin.editQuestion(questionId, data.questionAnswers());
    });

    test('admin can answer to question', { tag: ['@pro', '@admin'] }, async () => {
        const [, qId] = await apiUtils.createProductQuestion({ ...payloads.createProductQuestion(), product_id: PRODUCT_ID }, payloads.customerAuth);
        await admin.answerQuestion(qId, data.questionAnswers());
    });

    test('admin can edit answer', { tag: ['@pro', '@admin'] }, async () => {
        await admin.editAnswer(questionId, data.questionAnswers());
    });

    test('admin can delete answer', { tag: ['@pro', '@admin'] }, async () => {
        const [, qId] = await apiUtils.createProductQuestion({ ...payloads.createProductQuestion(), product_id: PRODUCT_ID }, payloads.customerAuth);
        const [, , answer] = await apiUtils.createProductQuestionAnswer({ ...payloads.createProductQuestionAnswer(), question_id: qId }, payloads.adminAuth);
        await admin.deleteAnswer(qId, answer);
    });

    test('admin can edit(hide) question visibility', { tag: ['@pro', '@admin'] }, async () => {
        await admin.editQuestionVisibility(questionId, 'hide');
    });

    test('admin can edit(show) question visibility', { tag: ['@pro', '@admin'] }, async () => {
        const [, qId] = await apiUtils.createProductQuestion({ ...payloads.createProductQuestion(), product_id: PRODUCT_ID }, payloads.customerAuth);
        await apiUtils.updateProductQuestion(qId, { status: 'hidden' }, payloads.adminAuth);
        await admin.editQuestionVisibility(qId, 'show');
    });

    test('admin can delete a question', { tag: ['@pro', '@admin'] }, async () => {
        const [, qId] = await apiUtils.createProductQuestion({ ...payloads.createProductQuestion(), product_id: PRODUCT_ID }, payloads.customerAuth);
        await admin.deleteQuestion(qId);
    });

    test('admin can perform bulk action on product QAs', { tag: ['@pro', '@admin'] }, async () => {
        await admin.productQuestionsBulkAction('read');
    });

    test('vendor can view product QA menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorProductQARenderProperly();
    });

    test('vendor can view product question details', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        const [, qId] = await apiUtils.createProductQuestion({ ...payloads.createProductQuestion(), product_id: PRODUCT_ID }, payloads.customerAuth);
        await vendor.vendorViewQuestionDetails(qId);
    });

    test('vendor can filter questions', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorFilterQuestions(data.predefined.simpleProduct.product1.name);
    });

    test('vendor can answer to question', { tag: ['@pro', '@vendor'] }, async () => {
        const [, qId] = await apiUtils.createProductQuestion({ ...payloads.createProductQuestion(), product_id: PRODUCT_ID }, payloads.customerAuth);
        await vendor.vendorAnswerQuestion(qId, data.questionAnswers());
    });

    test('vendor can edit answer', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorEditAnswer(questionId, data.questionAnswers());
    });

    test('vendor can delete a answer', { tag: ['@pro', '@vendor'] }, async () => {
        const [, qId] = await apiUtils.createProductQuestion({ ...payloads.createProductQuestion(), product_id: PRODUCT_ID }, payloads.customerAuth);
        await apiUtils.createProductQuestionAnswer({ ...payloads.createProductQuestionAnswer(), question_id: qId }, payloads.adminAuth);
        await vendor.vendorDeleteAnswer(qId);
    });

    test('vendor can delete a question', { tag: ['@pro', '@vendor'] }, async () => {
        const [, qId] = await apiUtils.createProductQuestion({ ...payloads.createProductQuestion(), product_id: PRODUCT_ID }, payloads.customerAuth);
        await vendor.vendorDeleteQuestion(qId);
    });

    test('customer can search question', { tag: ['@pro', '@customer'] }, async () => {
        await customer.searchQuestion(data.predefined.simpleProduct.product1.name, data.questionAnswers());
    });

    test('customer can post question', { tag: ['@pro', '@customer'] }, async () => {
        await customer.postQuestion(data.predefined.simpleProduct.product1.name, data.questionAnswers());
    });

    test('guest customer need to signIn/signUp to post question', { tag: ['@pro', '@guest'] }, async ({ page }) => {
        const guest = new ProductQAPage(page);
        await guest.postQuestion(data.predefined.simpleProduct.product1.name, data.questionAnswers(), true);
    });

    test('admin can disable product Q&A module', { tag: ['@pro', '@admin'] }, async () => {
        const [, modules] = await apiUtils.deactivateModules(payloads.moduleIds.productQa, payloads.adminAuth);
        const productQa = modules.find((m: { id: string; active: boolean }) => m.id === 'product_qa');
        expect(productQa).toEqual(expect.objectContaining({ id: 'product_qa', active: false }));
        qaModuleDisabled = true;
        await admin.goto(data.subUrls.backend.dokan.dokan);
        await admin.page.reload({ waitUntil: 'networkidle' });
        await admin.disableProductQaModule(data.predefined.simpleProduct.product1.name);
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Product Q&A (React) Tests @pro', () => {
    test('Test Case 1 - Vendor Q&A page renders', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/dashboard/product-questions-answers/`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Q&A page renders content', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/dashboard/product-questions-answers/`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.trim().length).toBeGreaterThan(50);
        await page.close();
        await ctx.close();
    });
});

