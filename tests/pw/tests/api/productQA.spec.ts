//COVERAGE_TAG: GET /dokan/v1/product-questions
//COVERAGE_TAG: GET /dokan/v1/product-questions/(?P<id>[\d]+)
//COVERAGE_TAG: POST /dokan/v1/product-questions
//COVERAGE_TAG: PUT /dokan/v1/product-questions/(?P<id>[\d]+)
//COVERAGE_TAG: DELETE /dokan/v1/product-questions/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v1/product-questions/bulk_action
//COVERAGE_TAG: GET /dokan/v1/product-answers
//COVERAGE_TAG: GET /dokan/v1/product-answers/(?P<id>[\d]+)
//COVERAGE_TAG: POST /dokan/v1/product-answers
//COVERAGE_TAG: PUT /dokan/v1/product-answers/(?P<id>[\d]+)
//COVERAGE_TAG: DELETE /dokan/v1/product-answers/(?P<id>[\d]+)

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { schemas } from '@utils/schemas';

const { PRODUCT_ID } = process.env;

test.describe('product Q&A api test', () => {
    let apiUtils: ApiUtils;
    let questionId: string;
    let answerId: string;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        [, questionId] = await apiUtils.createProductQuestion({ ...payloads.createProductQuestion(), product_id: PRODUCT_ID }, payloads.customerAuth);
        [, answerId] = await apiUtils.createProductQuestionAnswer({ ...payloads.createProductQuestionAnswer(), question_id: questionId }, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await apiUtils.deleteAllProductQuestions(payloads.adminAuth);
        await apiUtils.dispose();
    });

    // questions

    test('get all product questions', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllProductQuestions, { headers: payloads.adminAuth });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.productQaSchema.productQuestionsSchema);
    });

    test('get single product question', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleProductQuestion(questionId), { headers: payloads.adminAuth });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.productQaSchema.productQuestionSchema);
    });

    test('create a product question', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createProductQuestion, { data: { ...payloads.createProductQuestion(), product_id: PRODUCT_ID }, headers: payloads.customerAuth });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.productQaSchema.productQuestionSchema);
    });

    test('update a product question', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.updateProductQuestion(questionId), { data: payloads.updateProductQuestion() });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.productQaSchema.productQuestionSchema);
    });

    test('delete a product question', { tag: ['@pro'] }, async () => {
        const [, questionId] = await apiUtils.createProductQuestion({ ...payloads.createProductQuestion(), product_id: PRODUCT_ID }, payloads.customerAuth);
        const [response] = await apiUtils.delete(endPoints.deleteProductQuestion(questionId));
        expect(response.ok()).toBeTruthy();
    });

    test('update batch product questions', { tag: ['@pro'] }, async () => {
        const allProductQuestionIds = (await apiUtils.getAllProductQuestions()).map((a: { id: unknown }) => a.id);

        const [response, responseBody] = await apiUtils.put(endPoints.updateBatchProductQuestions, { data: { action: 'read', ids: allProductQuestionIds } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.productQaSchema.batchUpdateProductQuestionsSchema);
    });

    // answers

    test('get all product question answers', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllProductQuestionAnswers, { headers: payloads.adminAuth });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.productQaSchema.productQuestionAnswersSchema);
    });

    test('get single product question answer', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleProductQuestionAnswer(answerId), { headers: payloads.adminAuth });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.productQaSchema.productQuestionAnswerSchema);
    });

    test('create a product question answer', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createProductQuestionAnswer, { data: { ...payloads.createProductQuestionAnswer(), question_id: questionId }, headers: payloads.adminAuth });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.productQaSchema.productQuestionAnswerSchema);
    });

    test('update a product question answer', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.updateProductQuestionAnswer(answerId), { data: payloads.updateProductQuestionAnswer() });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.productQaSchema.productQuestionAnswerSchema);
    });

    test('delete a product question answer', { tag: ['@pro'] }, async () => {
        const [response] = await apiUtils.delete(endPoints.deleteProductQuestionAnswer(answerId));
        expect(response.ok()).toBeTruthy();
    });
});
