import { test, request, Page } from '@playwright/test';
import { ProductQAPage } from '@pages/productQAPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

const { PRODUCT_ID } = process.env;

test.describe('Product QA functionality test', () => {
    let admin: ProductQAPage;
    let vendor: ProductQAPage;
    let customer: ProductQAPage;
    let aPage: Page, vPage: Page, cPage: Page;
    let apiUtils: ApiUtils;
    let questionId: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new ProductQAPage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new ProductQAPage(vPage);

        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new ProductQAPage(cPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, questionId] = await apiUtils.createProductQuestion({ ...payloads.createProductQuestion(), product_id: PRODUCT_ID }, payloads.customerAuth);
        await apiUtils.createProductQuestionAnswer({ ...payloads.createProductQuestionAnswer(), question_id: questionId }, payloads.adminAuth);
    });

    test.afterAll(async () => {
        // await apiUtils.deleteAllProductQuestions(payloads.adminAuth);
        await aPage.close();
        await vPage.close();
        await cPage.close();
        await apiUtils.dispose();
    });

    // admin

    test('admin product QA menu page renders properly', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await admin.adminProductQARenderProperly();
    });

    test('admin can view product question details', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await admin.viewQuestionDetails(questionId);
    });

    test('admin can filter questions by vendor', { tag: ['@pro', '@admin'] }, async () => {
        await admin.filterQuestions(data.questionAnswers.filter.byVendor, 'by-vendor');
    });

    test('admin can filter questions by product', { tag: ['@pro', '@admin'] }, async () => {
        await admin.filterQuestions(data.questionAnswers.filter.byProduct, 'by-product');
    });

    test('admin can edit question', { tag: ['@pro', '@admin'] }, async () => {
        await admin.editQuestion(questionId, data.questionAnswers);
    });

    test('admin can answer to question', { tag: ['@pro', '@admin'] }, async () => {
        const [, questionId] = await apiUtils.createProductQuestion({ ...payloads.createProductQuestion(), product_id: PRODUCT_ID }, payloads.customerAuth);
        await admin.answerQuestion(questionId, data.questionAnswers);
    });

    test('admin can edit answer', { tag: ['@pro', '@admin'] }, async () => {
        await admin.editAnswer(questionId, data.questionAnswers);
    });

    test('admin can delete answer', { tag: ['@pro', '@admin'] }, async () => {
        const [, questionId] = await apiUtils.createProductQuestion({ ...payloads.createProductQuestion(), product_id: PRODUCT_ID }, payloads.customerAuth);
        await apiUtils.createProductQuestionAnswer({ ...payloads.createProductQuestionAnswer(), question_id: questionId }, payloads.adminAuth);
        await admin.deleteAnswer(questionId);
    });

    test('admin can edit(hide) question visibility', { tag: ['@pro', '@admin'] }, async () => {
        await admin.editQuestionVisibility(questionId, 'hide');
    });

    test('admin can edit(show) question visibility', { tag: ['@pro', '@admin'] }, async () => {
        const [, questionId] = await apiUtils.createProductQuestion({ ...payloads.createProductQuestion(), product_id: PRODUCT_ID }, payloads.customerAuth);
        await apiUtils.updateProductQuestion(questionId, payloads.updateProductQuestion(), payloads.adminAuth);
        await admin.editQuestionVisibility(questionId, 'show');
    });

    test('admin can delete a question', { tag: ['@pro', '@admin'] }, async () => {
        const [, questionId] = await apiUtils.createProductQuestion({ ...payloads.createProductQuestion(), product_id: PRODUCT_ID }, payloads.customerAuth);
        await admin.deleteQuestion(questionId);
    });

    test('admin can perform bulk action on product QAs', { tag: ['@pro', '@admin'] }, async () => {
        await admin.productQuestionsBulkAction('read');
    });

    // vendor

    test('vendor can view product QA menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorProductQARenderProperly();
    });

    test('vendor can view product question details', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        const [, questionId] = await apiUtils.createProductQuestion({ ...payloads.createProductQuestion(), product_id: PRODUCT_ID }, payloads.customerAuth);
        await vendor.vendorViewQuestionDetails(questionId);
    });

    test('vendor can filter questions', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorFilterQuestions(data.predefined.simpleProduct.product1.name);
    });

    test('vendor can answer to question', { tag: ['@pro', '@vendor'] }, async () => {
        const [, questionId] = await apiUtils.createProductQuestion({ ...payloads.createProductQuestion(), product_id: PRODUCT_ID }, payloads.customerAuth);
        await vendor.vendorAnswerQuestion(questionId, data.questionAnswers);
    });

    test('vendor can edit answer', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorEditAnswer(questionId, data.questionAnswers);
    });

    test('vendor can delete a answer', { tag: ['@pro', '@vendor'] }, async () => {
        const [, questionId] = await apiUtils.createProductQuestion({ ...payloads.createProductQuestion(), product_id: PRODUCT_ID }, payloads.customerAuth);
        await apiUtils.createProductQuestionAnswer({ ...payloads.createProductQuestionAnswer(), question_id: questionId }, payloads.adminAuth);
        await vendor.vendorDeleteAnswer(questionId);
    });

    test('vendor can delete a question', { tag: ['@pro', '@vendor'] }, async () => {
        const [, questionId] = await apiUtils.createProductQuestion({ ...payloads.createProductQuestion(), product_id: PRODUCT_ID }, payloads.customerAuth);
        await vendor.vendorDeleteQuestion(questionId);
    });

    // customer

    test('customer can search question', { tag: ['@pro', '@customer'] }, async () => {
        await customer.searchQuestion(data.predefined.simpleProduct.product1.name, data.questionAnswers);
    });

    test('customer can post question', { tag: ['@pro', '@customer'] }, async () => {
        await customer.postQuestion(data.predefined.simpleProduct.product1.name, data.questionAnswers);
    });

    // guest

    test('guest customer need to signin/signup post question', { tag: ['@pro', '@guest'] }, async ({ page }) => {
        const guest = new ProductQAPage(page);
        await guest.postQuestion(data.predefined.simpleProduct.product1.name, data.questionAnswers, true);
    });
});
