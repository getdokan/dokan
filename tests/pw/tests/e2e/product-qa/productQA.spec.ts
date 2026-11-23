import { test, Page, request } from '@utils/test';
import { ProductQAPage, ApiUtils, data, payloads } from './productQAPage';
import path from 'path';


const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

const { PRODUCT_ID } = process.env;

test.describe('Product QA functionality test', () => {
    let admin: ProductQAPage;
    let vendor: ProductQAPage;
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
        apiUtils = new ApiUtils(await request.newContext());
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

    // LEGACY UI regression — revived 2026-07-09; new-UI parity in tests/e2e/product-qa/.
    // These vendor cases now drive the CLASSIC Vue vendor dashboard
    // (dashboard/product-questions-answers) through the real page object + real
    // @utils ApiUtils/payloads seeding (identical to product-qa/, only the
    // driving surface differs), replacing the former no-op stub / vacuous green.
    test.describe('vendor cases — ported to product-qa/', () => {
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
    });

});

