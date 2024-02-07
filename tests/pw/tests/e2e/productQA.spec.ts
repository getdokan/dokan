import { test, request, Page } from '@playwright/test';
import { ProductQAPage } from '@pages/productQAPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

const { PRODUCT_ID } = process.env;

test.describe('Product QA functionality test', () => {
    test.skip(true, 'feature is not merged yet');
    let admin: ProductQAPage;
    let vendor: ProductQAPage;
    let customer: ProductQAPage;
    let guest: ProductQAPage;
    let aPage: Page, vPage: Page, cPage: Page, gPage: Page;
    let apiUtils: ApiUtils;
    let questionId: string;
    let answerId: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new ProductQAPage(aPage);

        // const vendorContext = await browser.newContext(data.auth.vendorAuth);
        // vPage = await vendorContext.newPage();
        // vendor = new ProductQAPage(vPage);

        // const customerContext = await browser.newContext(data.auth.customerAuth);
        // cPage = await customerContext.newPage();
        // customer = new ProductQAPage(cPage);

        // const guestContext = await browser.newContext(data.auth.noAuth);
        // gPage = await guestContext.newPage();
        // guest = new ProductQAPage(gPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, questionId] = await apiUtils.createProductQuestion({ ...payloads.createProductQuestion(), product_id: PRODUCT_ID }, payloads.customerAuth);
        [, answerId] = await apiUtils.createProductQuestionAnswer({ ...payloads.createProductQuestionAnswer(), question_id: questionId }, payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await aPage.close();
        // await vPage.close();
        // await cPage.close();
        // await gPage.close();
        await apiUtils.dispose();
    });

    // admin

    test('admin product QA menu page is rendering properly @pro @explo', async () => {
        await admin.adminProductQARenderProperly();
    });

    test('admin can view product question details @pro @explo', async () => {
        const [, questionId] = await apiUtils.createProductQuestion({ ...payloads.createProductQuestion(), product_id: PRODUCT_ID }, payloads.customerAuth);
        await admin.viewQuestionDetails(questionId);
    });

    // todo: admin receive notification for new question

    // test('unread count decrease after admin viewing a question @pro', async () => {
    //     await admin.decreaseUnreadQuestionCount();
    // });

    test('admin can filter questions by vendor @pro', async () => {
        await admin.filterQuestions(data.questionAnswers.filter.byVendor, 'by-vendor');
    });

    test('admin can filter questions by product @pro', async () => {
        await admin.filterQuestions(data.questionAnswers.filter.byProduct, 'by-product');
    });

    test('admin can edit question @pro', async () => {
        await admin.editQuestion(questionId, data.questionAnswers);
    });

    test('admin can answer to question @pro', async () => {
        const [, questionId] = await apiUtils.createProductQuestion({ ...payloads.createProductQuestion(), product_id: PRODUCT_ID }, payloads.customerAuth);
        await admin.answerQuestion(questionId, data.questionAnswers);
    });

    test('admin can edit answer @pro', async () => {
        await admin.editAnswer(questionId, data.questionAnswers);
    });

    test('admin can delete answer @pro', async () => {
        await admin.deleteAnswer(questionId);
    });

    test('admin can edit (hide) question visibility @pro', async () => {
        await admin.editQuestionVisibility(questionId, 'hide');
    });

    test('admin can edit (show) question visibility @pro', async () => {
        await apiUtils.updateProductQuestion(questionId, payloads.updateProductQuestion(), payloads.adminAuth);
        await admin.editQuestionVisibility(questionId, 'show');
    });

    test('admin can delete a question @pro', async () => {
        const [, questionId] = await apiUtils.createProductQuestion({ ...payloads.createProductQuestion(), product_id: PRODUCT_ID }, payloads.customerAuth);
        await admin.deleteQuestion(questionId);
    });

    test('admin can perform store support bulk action @pro', async () => {
        await admin.productQuestionsBulkAction('read');
    });

    // vendor

    test('vendor product QA menu page is rendering properly @pro @explo', async () => {
        await vendor.vendorProductQARenderProperly();
    });

    test('vendor can view product question details @pro @explo', async () => {
        const [, questionId] = await apiUtils.createProductQuestion({ ...payloads.createProductQuestion(), product_id: PRODUCT_ID }, payloads.customerAuth);
        await vendor.vendorViewQuestionDetails(questionId);
    });

    // todo: vendor receive notification for new question

    // test('unread count decrease after admin viewing a question @pro', async () => {
    //     await admin.decreaseUnreadQuestionCount();
    // });

    test('vendor can filter questions @pro', async () => {
        await vendor.vendorFilterQuestions(data.predefined.simpleProduct.product1.name);
    });

    test('vendor can answer to question @pro', async () => {
        const [, questionId] = await apiUtils.createProductQuestion({ ...payloads.createProductQuestion(), product_id: PRODUCT_ID }, payloads.customerAuth);
        await vendor.vendorAnswerQuestion(questionId, data.questionAnswers);
    });

    test('vendor can edit answer @pro', async () => {
        await vendor.vendorEditAnswer(questionId, data.questionAnswers);
    });

    test('vendor can delete a answer @pro', async () => {
        await vendor.vendorDeleteAnswer(questionId);
    });

    test('vendor can delete a question @pro', async () => {
        await vendor.vendorDeleteQuestion(questionId);
    });

    // customer

    test('customer can search question @pro', async () => {
        await customer.searchQuestion(data.predefined.simpleProduct.product1.name, data.questionAnswers);
    });

    test('customer can post question @pro', async () => {
        await customer.postQuestion(data.predefined.simpleProduct.product1.name, data.questionAnswers);
    });

    // guest

    test('guest customer need to sign-in/signup post question @pro', async () => {
        await guest.postQuestion(data.predefined.simpleProduct.product1.name, data.questionAnswers);
    });
});