import { test, request, Page, expect } from '@playwright/test';
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
    let qaModuleDisabled = false;

    test.beforeAll(async ({ browser }) => {
        await test.step('Initialize browser contexts and pages', async () => {
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
        });

        await test.step('Ensure Product Q&A module is enabled', async () => {
            await apiUtils.activateModules(payloads.moduleIds.productQa, payloads.adminAuth);
        });

        await test.step('Create a product question and admin answer', async () => {
            [, questionId] = await apiUtils.createProductQuestion(
                { ...payloads.createProductQuestion(), product_id: PRODUCT_ID },
                payloads.customerAuth
            );
            await apiUtils.createProductQuestionAnswer(
                { ...payloads.createProductQuestionAnswer(), question_id: questionId },
                payloads.adminAuth
            );
        });
    });

    test.afterAll(async () => {
        await test.step('Re-enable Product Q&A module if disabled', async () => {
            if (!qaModuleDisabled) {
                await apiUtils.activateModules(payloads.moduleIds.productQa, payloads.adminAuth);
            }
        });
        await test.step('Clean up resources', async () => {
            await aPage.close();
            await vPage.close();
            await cPage.close();
            await apiUtils.dispose();
        });
    });

    // ------------------ ADMIN TESTS ------------------
    test('admin can enable product Q&A module', { tag: ['@pro', '@admin'] }, async () => {
        await test.step('Verify Product Q&A module UI is accessible', async () => {
            await admin.enableProductQaModule(data.predefined.simpleProduct.product1.name);
        });
    });

    test('admin product QA menu page renders properly', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await test.step('Open Product Q&A menu page', async () => {
            await admin.adminProductQARenderProperly();
        });
    });

    test('admin can view product question details', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await test.step('View question details from admin dashboard', async () => {
            await admin.viewQuestionDetails(questionId);
        });
    });

    test('admin can filter questions by vendor', { tag: ['@pro', '@admin'] }, async () => {
        await test.step('Filter questions using vendor filter', async () => {
            await admin.filterQuestions(data.questionAnswers().filter.byVendor, 'by-vendor');
        });
    });

    test('admin can filter questions by product', { tag: ['@pro', '@admin'] }, async () => {
        await test.step('Filter questions using product filter', async () => {
            await admin.filterQuestions(data.questionAnswers().filter.byProduct, 'by-product');
        });
    });

    test('admin can edit question', { tag: ['@pro', '@admin'] }, async () => {
        await test.step('Edit existing product question', async () => {
            await admin.editQuestion(questionId, data.questionAnswers());
        });
    });

    test('admin can answer to question', { tag: ['@pro', '@admin'] }, async () => {
        await test.step('Create new question and answer as admin', async () => {
            const [, qId] = await apiUtils.createProductQuestion(
                { ...payloads.createProductQuestion(), product_id: PRODUCT_ID },
                payloads.customerAuth
            );
            await admin.answerQuestion(qId, data.questionAnswers());
        });
    });

    test('admin can edit answer', { tag: ['@pro', '@admin'] }, async () => {
        await test.step('Edit an answer to an existing question', async () => {
            await admin.editAnswer(questionId, data.questionAnswers());
        });
    });

    test('admin can delete answer', { tag: ['@pro', '@admin'] }, async () => {
        await test.step('Create new answer and delete it as admin', async () => {
            const [, qId] = await apiUtils.createProductQuestion(
                { ...payloads.createProductQuestion(), product_id: PRODUCT_ID },
                payloads.customerAuth
            );
            const [, , answer] = await apiUtils.createProductQuestionAnswer(
                { ...payloads.createProductQuestionAnswer(), question_id: qId },
                payloads.adminAuth
            );
            await admin.deleteAnswer(qId, answer);
        });
    });

    test('admin can edit(hide) question visibility', { tag: ['@pro', '@admin'] }, async () => {
        await test.step('Hide a product question', async () => {
            await admin.editQuestionVisibility(questionId, 'hide');
        });
    });

    test('admin can edit(show) question visibility', { tag: ['@pro', '@admin'] }, async () => {
        await test.step('Create hidden question then show it', async () => {
            const [, qId] = await apiUtils.createProductQuestion(
                { ...payloads.createProductQuestion(), product_id: PRODUCT_ID },
                payloads.customerAuth
            );
            await apiUtils.updateProductQuestion(qId, { status: 'hidden' }, payloads.adminAuth);
            await admin.editQuestionVisibility(qId, 'show');
        });
    });

    test('admin can delete a question', { tag: ['@pro', '@admin'] }, async () => {
        await test.step('Create new question and delete it as admin', async () => {
            const [, qId] = await apiUtils.createProductQuestion(
                { ...payloads.createProductQuestion(), product_id: PRODUCT_ID },
                payloads.customerAuth
            );
            await admin.deleteQuestion(qId);
        });
    });

    test('admin can perform bulk action on product QAs', { tag: ['@pro', '@admin'] }, async () => {
        await test.step('Perform bulk mark-as-read on questions', async () => {
            await admin.productQuestionsBulkAction('read');
        });
    });

    // ------------------ VENDOR TESTS ------------------
    test('vendor can view product QA menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await test.step('Open vendor Product Q&A menu', async () => {
            await vendor.vendorProductQARenderProperly();
        });
    });

    test('vendor can view product question details', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await test.step('Create question and view details as vendor', async () => {
            const [, qId] = await apiUtils.createProductQuestion(
                { ...payloads.createProductQuestion(), product_id: PRODUCT_ID },
                payloads.customerAuth
            );
            await vendor.vendorViewQuestionDetails(qId);
        });
    });

    test('vendor can filter questions', { tag: ['@pro', '@vendor'] }, async () => {
        await test.step('Filter vendor questions by product', async () => {
            await vendor.vendorFilterQuestions(data.predefined.simpleProduct.product1.name);
        });
    });

    test('vendor can answer to question', { tag: ['@pro', '@vendor'] }, async () => {
        await test.step('Create question and answer as vendor', async () => {
            const [, qId] = await apiUtils.createProductQuestion(
                { ...payloads.createProductQuestion(), product_id: PRODUCT_ID },
                payloads.customerAuth
            );
            await vendor.vendorAnswerQuestion(qId, data.questionAnswers());
        });
    });

    test('vendor can edit answer', { tag: ['@pro', '@vendor'] }, async () => {
        await test.step('Edit an existing vendor answer', async () => {
            await vendor.vendorEditAnswer(questionId, data.questionAnswers());
        });
    });

    test('vendor can delete a answer', { tag: ['@pro', '@vendor'] }, async () => {
        await test.step('Create answer and delete it as vendor', async () => {
            const [, qId] = await apiUtils.createProductQuestion(
                { ...payloads.createProductQuestion(), product_id: PRODUCT_ID },
                payloads.customerAuth
            );
            await apiUtils.createProductQuestionAnswer(
                { ...payloads.createProductQuestionAnswer(), question_id: qId },
                payloads.adminAuth
            );
            await vendor.vendorDeleteAnswer(qId);
        });
    });

    test('vendor can delete a question', { tag: ['@pro', '@vendor'] }, async () => {
        await test.step('Create question and delete it as vendor', async () => {
            const [, qId] = await apiUtils.createProductQuestion(
                { ...payloads.createProductQuestion(), product_id: PRODUCT_ID },
                payloads.customerAuth
            );
            await vendor.vendorDeleteQuestion(qId);
        });
    });

    // ------------------ CUSTOMER TESTS ------------------
    test('customer can search question', { tag: ['@pro', '@customer'] }, async () => {
        await test.step('Search question in product page', async () => {
            await customer.searchQuestion(data.predefined.simpleProduct.product1.name, data.questionAnswers());
        });
    });

    test('customer can post question', { tag: ['@pro', '@customer'] }, async () => {
        await test.step('Post new product question as customer', async () => {
            await customer.postQuestion(data.predefined.simpleProduct.product1.name, data.questionAnswers());
        });
    });

    // ------------------ GUEST TEST ------------------
    test('guest customer need to signIn/signUp to post question', { tag: ['@pro', '@guest'] }, async ({ page }) => {
        await test.step('Verify guest is redirected to login when posting question', async () => {
            const guest = new ProductQAPage(page);
            await guest.postQuestion(data.predefined.simpleProduct.product1.name, data.questionAnswers(), true);
        });
    });

    // ------------------ ADMIN DISABLE MODULE ------------------
    test('admin can disable product Q&A module', { tag: ['@pro', '@admin'] }, async () => {
        await test.step('Deactivate Product Q&A module via API', async () => {
            const [, modules] = await apiUtils.deactivateModules(payloads.moduleIds.productQa, payloads.adminAuth);
            const productQa = modules.find((m: { id: string; active: boolean; }) => m.id === 'product_qa');
            expect(productQa).toEqual(expect.objectContaining({
                id: 'product_qa',
                active: false
            }));
            qaModuleDisabled = true;
        });

        await test.step('Reload admin menu after module deactivation', async () => {
            await admin.goto(data.subUrls.backend.dokan.dokan);
            await admin.page.reload({ waitUntil: 'networkidle' });
            await admin.disableProductQaModule(data.predefined.simpleProduct.product1.name);
        });
    });
});
