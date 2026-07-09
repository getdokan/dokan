import { Page, expect } from '@playwright/test';
import { closeAnnouncementModal, helpers, toPath } from '@utils/helpers';
import { data } from '@utils/testData';

// ============================================
// LEGACY Product Q&A page object — REVIVED 2026-07-09.
//
// Drives the CLASSIC (Vue/PHP) surfaces:
//   - vendor:   dashboard/product-questions-answers        (Vue vendor dashboard)
//   - admin:    wp-admin/admin.php?page=dokan#/product-qa  (legacy Vue admin SPA)
//   - customer: single-product "Questions & Answers" tab   (storefront)
//
// This file was a no-op stub after the #3173 conversion; its green was vacuous.
// It is now REAL: selectors + method bodies ported from the pre-#3173 page object
// (git e2ec507de:tests/pw/pages/productQAPage.ts + pages/selectors.ts), and the
// ApiUtils / payloads / data the spec seeds with are the REAL @utils
// implementations (identical seeding + REST oracles to tests/e2e/new-product-qa/;
// the ONLY difference is the driving surface — legacy vs React).
//
// Self-contained per the revived-legacy convention: the BasePage helper bodies
// (goIfNotThere, toBeVisible, multipleElementVisible, clearAndType,
// clickAndWaitForResponse, click, clickAndWaitForResponseAndLoadState, …) are
// inlined verbatim from the pre-#3173 BasePage; only cross-folder @pages imports
// are removed. New-UI parity lives in tests/e2e/new-product-qa/.
// ============================================

// Re-export the REAL utilities under the names the spec imports.
export { ApiUtils } from '@utils/apiUtils';
export { payloads } from '@utils/payloads';
export { data };

type QuestionAnswers = ReturnType<typeof data.questionAnswers>;

// ============================================
// SELECTORS — recovered from git e2ec507de:tests/pw/pages/selectors.ts
// ============================================

// selector.admin.dokan.productQa
const productQAAdmin = {
    productQaDiv: 'div.product-questions-answers',
    productQuestionAnswersText: '.product-questions-answers h1',

    unreadQuestionCount: '//a[contains(text(),"Product Q&A")]/..//span[@class="pending-count"]',

    // Nav Tabs
    navTabs: {
        all: '//ul[@class="subsubsub"]//li//a[contains(text(),"All")]',
        unread: '//ul[@class="subsubsub"]//li//a[contains(text(),"Unread")]',
        read: '//ul[@class="subsubsub"]//li//a[contains(text(),"Read")]',
        unanswered: '//ul[@class="subsubsub"]//li//a[contains(text(),"Unanswered")]',
        answered: '//ul[@class="subsubsub"]//li//a[contains(text(),"Answered")]',
    },

    // Bulk Actions
    bulkActions: {
        selectAll: 'thead .manage-column input',
        selectAction: '.tablenav.top #bulk-action-selector-top', // read, unread, delete
        applyAction: '.tablenav.top .button.action',
        confirmAction: '.swal2-actions .swal2-confirm',
        bulkActionSuccessMessage: '//h2[text()="Bulk action successful."]',
    },

    // Filters
    filters: {
        filterByVendors: '(//select[@id="filter-vendors"]/..//span[@class="select2-selection__arrow"])[1]',
        filterByProducts: '(//select[@id="filter-products"]/..//span[@class="select2-selection__arrow"])[2]',
        resetFilterByVendors: '//select[@id="filter-products"]/..//button[@class="button"]',
        filterInput: '.select2-search.select2-search--dropdown .select2-search__field',
        result: 'li.select2-results__option.select2-results__option--highlighted',
    },

    // Table
    table: {
        questionColumn: 'thead th.question',
        productColumn: 'thead th.product',
        vendorColumn: 'thead th.vendor',
        dateColumn: 'thead th.created',
        statusColumn: 'thead th.status',
    },

    numberOfRowsFound: '.tablenav.top .displaying-num',
    numberOfRows: 'div.product-questions-answers table tbody tr',
    noRowsFound: '//td[normalize-space()="No question found."]',
    productQuestionCell: (input: string): string => `//strong[contains(text(), '${input}')]/..`,
    productQuestionFirstCell: '(//tbody//tr//td//a)[1]',

    // question details
    questionDetails: {
        productQuestionAnswersText: '//h2[text()="Product Questions & Answers"]',

        goBack: '//a[contains(text(),"← Go Back")]',

        questionDetails: {
            editQuestion: '(//button[normalize-space()="Edit"])[1]',
            questionInput: 'textarea#comment.block',
            saveQuestion: '(//button[normalize-space()="Save"])[1]',
            questionText: '//div[ contains(@class, "break-words") and not(contains(@class, "prose")) ]',
        },

        status: {
            visibleStatus: '//dd[text()[normalize-space()="Visible"]]',
            hiddenStatus: '//dd[text()[normalize-space()="Hidden"]]',
            hideFromProductPage: '//button[normalize-space()="Hide From Product Page"]',
            showInProductPage: '//button[normalize-space()="Show In Product Page"]',
            deleteQuestion: '(//button[normalize-space()="Delete"])[1]',
        },

        answer: {
            questionAnswerIframe: '//iframe[contains(@id, "dokan-product-qa-admin-answer-editor")]',
            questionAnswerHtmlBody: '#tinymce',
            saveAnswer: '//button[normalize-space()="Save"]',
            editAnswer: '(//button[normalize-space()="Edit"])[2]',
            answerText: 'div.prose p',
            deleteAnswer: '(//button[normalize-space()="Delete"])[2]',
        },

        confirmAction: '.swal2-actions .swal2-confirm',

        visibilityStatusSaveSuccessMessage: '//h2[text()="Visibility status changed successfully."]',
        questionSaveSuccessMessage: '//h2[text()="Question updated successfully."]',
        answerSaveSuccessMessage: '//h2[text()="Answer created successfully."]',
        answerUpdateSuccessMessage: '//h2[text()="Answer updated successfully."]',
        answerDeleteSuccessMessage: '//h2[text()="Answer deleted successfully."]',
        questionDeleteSuccessMessage: '//h2[text()="Question deleted successfully."]',
    },
};

// selector.vendor.vProductQA
const productQAVendor = {
    productQuestionAnswersText: '.dokan-dashboard-header h1.entry-title',

    // filters
    filters: {
        filterByProducts: '.dokan-product-qa-filter-form span.select2-selection__arrow',
        filterInput: '.select2-search.select2-search--dropdown .select2-search__field',
        result: 'li.select2-results__option.select2-results__option--highlighted',
        filter: 'input[value="Filter"]',
        reset: '.dokan-product-qa-filter-form a',
    },

    // table
    table: {
        table: '.product-qa-listing-table',
        questionColumn: '//th[normalize-space()="Question"]',
        productsColumn: '//th[normalize-space()="Products"]',
        dateColumn: '//th[normalize-space()="Date"]',
        actionColumn: '//th[normalize-space()="Action"]',
    },

    noQuestionFound: '//td[contains(text(), "No question found.")]',
    questionLink: (question: string): string => `//a[contains(.,'${question}')]`,
    firstQuestionLink: '(//table[contains(@class,"product-qa-listing-table")]//tbody//tr//a)[1]',
    questionCell: (question: string): string => `//a[contains(.,'${question}')]/..`,
    questionDetailsView: (question: string): string => `//a[contains(.,'${question}')]/../..//a[@data-original-title='View']`,

    questionDetails: {
        questionDetails: {
            questionDetailsDiv: '.dokan-product-qa-single-left-content .dokan-panel',
            questionDetailsTitle: '//div[normalize-space()="Question Details"]',
            ProductTitle: '//strong[text()="Product:"]',
            QuestionerTitle: '//strong[text()="Questioner:"]',
            QuestionTitle: '//strong[text()="Question:"]',

            ProductValue: '//strong[text()="Product:"]/../..//td[2]',
            QuestionerValue: '//strong[text()="Questioner:"]/../..//td[2]',
            QuestionValue: '//strong[text()="Question:"]/../..//td[2]',
        },

        status: {
            statusDiv: '.dokan-product-qa-single-right-content .dokan-panel',
            statusTitle: '//div[normalize-space()="Status"]',
            statusDetails: '.dokan-product-qa-single-right-content .dokan-panel .dokan-panel-body p',

            deleteQuestion: 'button.dokan-product-qa-delete-question',
        },

        answer: {
            answerDiv: '//div[normalize-space()="Answer"]/..',
            answerTitle: '//div[normalize-space()="Answer"]',
            questionAnswerIframe: 'iframe#dokan-product-qa-answer_ifr',
            questionAnswerHtmlBody: '#tinymce',
            saveAnswer: 'button#dokan_product_qa_save_answer',
        },

        editAnswer: 'button#dokan_product_qa_edit_answer',
        answerDetails: 'div.details-value p',
        deleteAnswer: 'button#dokan_product_qa_delete_answer',
        confirmAction: '.swal2-actions .swal2-confirm',
        answerSaveSuccessMessage: '//div[text()="Answer saved successfully."]',
        answerDeleteSuccessMessage: '//div[text()="Answer deleted successfully."]',
        questionDeleteSuccessMessage: '//div[text()="Question deleted successfully."]',
    },
};

// selector.customer.cSingleProduct.questionsAnswers
const productQACustomer = {
    searchInput: 'input[placeholder="Search Questions & Answers"]',
    loginPostQuestion: '//button[text()="Login to post your Question"]',
    postQuestion: '//button[text()="Post your Question"]',

    questionModal: '//h3[normalize-space(text())="Post your question"]/../../..',
    questionInput: 'textarea#comment.block',
    cancelButton: '//span[text()="Close"]//..',
    cancelPost: '//button[text()="Cancel"]',
    post: '//button[text()="Post"]',
    questionPosted: (question: string): string => `//p[normalize-space(text())='${question}' and @class="text-base"]`,
    clearResult: '//button[text()="Clear Result"]',
    matchingResult: 'h3.text-black.text-base',
};

// Standalone menu / login selectors (recovered).
const menus = {
    adminProductQA: '//li[contains(@class,"toplevel_page_dokan")]//a[normalize-space(text())="Product Q&A"]',
    vendorProductQa: 'ul.dokan-dashboard-menu li.product-questions-answers a',
    vendorDashboardDiv: 'div.dokan-dashboard-wrap',
    customerQuestionsAnswers: '.tabs .product_qa_tab a',
};

const frontend = {
    username: '#username',
    userPassword: '#password',
    logIn: '//button[@value="Log in"]',
};

// ============================================
// PRODUCT Q&A PAGE
// ============================================
export class ProductQAPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---------------------------------------------------------------
    // Navigation helpers (inlined from pre-#3173 BasePage)
    // ---------------------------------------------------------------
    private createUrl(subPath: string): string {
        return toPath(subPath);
    }

    private getCurrentUrl(): string {
        return this.page.url();
    }

    private isCurrentUrl(subPath: string): boolean {
        const url = new URL(this.getCurrentUrl());
        const currentURL = url.href.replace(/[/]$/, '');
        return currentURL === this.createUrl(subPath);
    }

    async goto(subPath: string, options: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' } = { waitUntil: 'domcontentloaded' }): Promise<void> {
        await this.page.goto(this.createUrl(subPath), options);
    }

    private async gotoUntilNetworkidle(subPath: string): Promise<void> {
        await this.goto(subPath, { waitUntil: 'networkidle' });
    }

    private async goIfNotThere(subPath: string): Promise<void> {
        if (!this.isCurrentUrl(subPath)) {
            const url = this.createUrl(subPath);
            await this.toPass(async () => {
                await this.page.goto(url, { waitUntil: 'domcontentloaded' });
                expect(this.getCurrentUrl()).toMatch(subPath);
            });
        }
    }

    private async waitForLoadState(state: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'): Promise<void> {
        await this.page.waitForLoadState(state);
    }

    // ---------------------------------------------------------------
    // Action helpers
    // ---------------------------------------------------------------
    private async click(selector: string): Promise<void> {
        await this.page.locator(selector).click();
    }

    private async press(key: string): Promise<void> {
        await this.page.keyboard.press(key);
    }

    private async clearAndType(selector: string, text: string): Promise<void> {
        await this.page.locator(selector).fill(text);
    }

    private async selectByValue(selector: string, value: string): Promise<string[]> {
        return await this.page.selectOption(selector, { value });
    }

    private async removeAttribute(selector: string, attribute: string): Promise<void> {
        await this.page.locator(selector).evaluate((element, attr) => element.removeAttribute(attr), attribute);
    }

    private async typeFrameSelector(frame: string, frameSelector: string, text: string): Promise<void> {
        await this.page.frameLocator(frame).locator(frameSelector).fill(text);
    }

    private async clickAndWaitForLocatorToBeVisible(selector: string, selector2: string): Promise<void> {
        await Promise.all([this.toBeVisible(selector2), this.page.locator(selector).click()]);
    }

    private async clickAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<void> {
        await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).click()]);
    }

    private async clickAndWaitForResponseWithType(subUrl: string, selector: string, requestType: string, code = 200): Promise<void> {
        await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.request().method().toLowerCase() === requestType.toLowerCase() && resp.status() === code), this.page.locator(selector).click()]);
    }

    private async clickAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200): Promise<void> {
        const [, response] = await Promise.all([this.waitForLoadState('load'), this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).click()]);
        expect(response.status()).toBe(code);
    }

    private async typeAndWaitForResponse(subUrl: string, selector: string, text: string, code = 200): Promise<void> {
        await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).fill(text)]);
    }

    private async pressAndWaitForResponse(subUrl: string, key: string, code = 200): Promise<void> {
        await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.press(key)]);
    }

    // ---------------------------------------------------------------
    // Assertion helpers
    // ---------------------------------------------------------------
    private async toBeVisible(selector: string, options?: { timeout?: number; visible?: boolean }): Promise<void> {
        await expect(this.page.locator(selector)).toBeVisible(options);
    }

    private async notToBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeHidden();
    }

    private async toContainText(selector: string, text: string | RegExp, options?: { ignoreCase?: boolean; timeout?: number; useInnerText?: boolean }): Promise<void> {
        await expect(this.page.locator(selector)).toContainText(text, options);
    }

    private async notToHaveText(selector: string, text: string | RegExp): Promise<void> {
        await expect(this.page.locator(selector)).not.toHaveText(text);
    }

    private async multipleElementVisible(sels: { [key: string]: any }): Promise<void> {
        for (const key in sels) {
            const value = sels[key];
            if (helpers.isPlainObject(value)) {
                await this.multipleElementVisible(value);
            } else if (typeof value === 'function') {
                continue;
            } else {
                await this.toBeVisible(value);
            }
        }
    }

    private async toPass(asyncFn: () => Promise<void>, options?: { timeout?: number; intervals?: number[] }): Promise<void> {
        await expect(async () => {
            await asyncFn();
        }).toPass(options);
    }

    // ---------------------------------------------------------------
    // Shared navigation
    // ---------------------------------------------------------------
    private async goToProductDetails(productName: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.productDetails(helpers.slugify(productName)));
    }

    private async goToProductQA(): Promise<void> {
        await this.gotoUntilNetworkidle(data.subUrls.backend.dokan.productQA);
    }

    private async goToQuestionDetails(questionId: string): Promise<void> {
        await this.gotoUntilNetworkidle(data.subUrls.backend.dokan.questionDetails(questionId));
    }

    // ===============================================================
    // ADMIN
    // ===============================================================

    // enable product QA module
    async enableProductQaModule(productName: string): Promise<void> {
        // dokan menu
        await this.goto(data.subUrls.backend.dokan.dokan);
        await this.toBeVisible(menus.adminProductQA);

        // vendor dashboard menu
        await this.goto(data.subUrls.frontend.vDashboard.dashboard);
        await this.toBeVisible(menus.vendorProductQa);

        // single product page
        await this.goto(data.subUrls.frontend.productDetails(helpers.slugify(productName)));
        await this.toBeVisible(menus.customerQuestionsAnswers);
    }

    // disable product QA module
    async disableProductQaModule(productName: string): Promise<void> {
        // dokan menu
        await this.goto(data.subUrls.backend.dokan.dokan);
        await this.notToBeVisible(menus.adminProductQA);

        // dokan menu page
        await this.goto(data.subUrls.backend.dokan.productQA);
        await this.notToBeVisible(productQAAdmin.productQaDiv);

        // vendor dashboard menu
        await this.goto(data.subUrls.frontend.vDashboard.dashboard);
        await this.notToBeVisible(menus.vendorProductQa);

        // vendor dashboard menu page
        await this.goto(data.subUrls.frontend.vDashboard.productQa);
        await this.notToBeVisible(menus.vendorDashboardDiv);

        // single product page
        await this.goto(data.subUrls.frontend.productDetails(helpers.slugify(productName)));
        await this.notToBeVisible(menus.customerQuestionsAnswers);
    }

    // product question answers render properly
    async adminProductQARenderProperly(): Promise<void> {
        await this.goToProductQA();

        // product question answers text is visible
        await this.toBeVisible(productQAAdmin.productQuestionAnswersText);

        // nav tabs are visible
        await this.multipleElementVisible(productQAAdmin.navTabs);

        // bulk action elements are visible
        const { confirmAction, bulkActionSuccessMessage, ...bulkActions } = productQAAdmin.bulkActions;
        await this.multipleElementVisible(bulkActions);

        // filter elements are visible
        const { filterInput, result, resetFilterByVendors, ...filters } = productQAAdmin.filters;
        await this.multipleElementVisible(filters);

        // product question & answers table elements are visible
        await this.multipleElementVisible(productQAAdmin.table);
    }

    // admin view question details
    async viewQuestionDetails(questionId: string): Promise<void> {
        await this.goToQuestionDetails(questionId);

        // product question answers text is visible
        await this.toBeVisible(productQAAdmin.questionDetails.productQuestionAnswersText);

        // go back is visible
        await this.toBeVisible(productQAAdmin.questionDetails.goBack);

        // question details elements are visible
        const { questionInput, saveQuestion, ...questionDetails } = productQAAdmin.questionDetails.questionDetails;
        await this.multipleElementVisible(questionDetails);

        // status elements are visible
        const { hiddenStatus, showInProductPage, ...status } = productQAAdmin.questionDetails.status;
        await this.multipleElementVisible(status);

        // answer elements are visible
        const { questionAnswerIframe, questionAnswerHtmlBody, saveAnswer, ...answer } = productQAAdmin.questionDetails.answer;
        await this.multipleElementVisible(answer);
    }

    // filter questions
    async filterQuestions(input: string, filterBy: string): Promise<void> {
        await this.goToProductQA();

        switch (filterBy) {
            case 'by-vendor':
                await this.click(productQAAdmin.filters.filterByVendors);
                await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, productQAAdmin.filters.filterInput, input);
                await this.toContainText(productQAAdmin.filters.result, input);
                await this.pressAndWaitForResponse(data.subUrls.api.dokan.productQuestions, data.key.enter);
                break;

            case 'by-product':
                await this.click(productQAAdmin.filters.filterByProducts);
                await this.typeAndWaitForResponse(data.subUrls.api.wc.products, productQAAdmin.filters.filterInput, input);
                await this.toContainText(productQAAdmin.filters.result, input);
                await this.pressAndWaitForResponse(data.subUrls.api.dokan.productQuestions, data.key.enter);
                break;

            default:
                break;
        }
        await this.notToHaveText(productQAAdmin.numberOfRowsFound, '0 items');
        await this.notToBeVisible(productQAAdmin.noRowsFound);
    }

    // edit question
    async editQuestion(questionId: string, questionsAnswers: QuestionAnswers): Promise<void> {
        await this.goToQuestionDetails(questionId);
        await this.click(productQAAdmin.questionDetails.questionDetails.editQuestion);
        await this.toPass(async () => {
            await this.clearAndType(productQAAdmin.questionDetails.questionDetails.questionInput, questionsAnswers.editQuestion);
            await this.clickAndWaitForResponse(data.subUrls.api.dokan.productQuestions, productQAAdmin.questionDetails.questionDetails.saveQuestion);
            await this.toBeVisible(productQAAdmin.questionDetails.questionSaveSuccessMessage, { timeout: 5000 });
        });
        await this.toContainText(productQAAdmin.questionDetails.questionDetails.questionText, questionsAnswers.editQuestion);
    }

    // answer question
    async answerQuestion(questionId: string, questionsAnswers: QuestionAnswers): Promise<void> {
        await this.goToQuestionDetails(questionId);
        await this.typeFrameSelector(productQAAdmin.questionDetails.answer.questionAnswerIframe, productQAAdmin.questionDetails.answer.questionAnswerHtmlBody, questionsAnswers.answer);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.productAnswers, productQAAdmin.questionDetails.answer.saveAnswer, 201);
        await this.toBeVisible(productQAAdmin.questionDetails.answerSaveSuccessMessage);
        await this.toContainText(productQAAdmin.questionDetails.answer.answerText, questionsAnswers.answer);
        await this.toBeVisible(productQAAdmin.questionDetails.answer.editAnswer);
    }

    // edit answer
    async editAnswer(questionId: string, questionsAnswers: QuestionAnswers): Promise<void> {
        await this.goToQuestionDetails(questionId);
        await this.click(productQAAdmin.questionDetails.answer.editAnswer);
        await this.toBeVisible(productQAAdmin.questionDetails.answer.questionAnswerIframe);
        await this.typeFrameSelector(productQAAdmin.questionDetails.answer.questionAnswerIframe, productQAAdmin.questionDetails.answer.questionAnswerHtmlBody, questionsAnswers.editAnswer);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.productAnswers, productQAAdmin.questionDetails.answer.saveAnswer);
        await this.toBeVisible(productQAAdmin.questionDetails.answerUpdateSuccessMessage);
        await this.toContainText(productQAAdmin.questionDetails.answer.answerText, questionsAnswers.editAnswer);
    }

    // edit question visibility
    async editQuestionVisibility(questionId: string, action: string): Promise<void> {
        await this.goToQuestionDetails(questionId);
        if (action === 'hide') {
            await this.toPass(async () => {
                await this.click(productQAAdmin.questionDetails.status.hideFromProductPage);
                await this.clickAndWaitForResponseWithType(data.subUrls.api.dokan.productQuestions, productQAAdmin.questionDetails.confirmAction, 'GET');
                await this.toBeVisible(productQAAdmin.questionDetails.visibilityStatusSaveSuccessMessage);
                await this.toBeVisible(productQAAdmin.questionDetails.status.hiddenStatus, { timeout: 5000 });
            });
            await this.toBeVisible(productQAAdmin.questionDetails.status.showInProductPage);
        } else {
            await this.toPass(async () => {
                await this.click(productQAAdmin.questionDetails.status.showInProductPage);
                await this.clickAndWaitForResponseWithType(data.subUrls.api.dokan.productQuestions, productQAAdmin.questionDetails.confirmAction, 'GET');
                await this.toBeVisible(productQAAdmin.questionDetails.visibilityStatusSaveSuccessMessage);
                await this.toBeVisible(productQAAdmin.questionDetails.status.visibleStatus, { timeout: 5000 });
            });
            await this.toBeVisible(productQAAdmin.questionDetails.status.hideFromProductPage);
        }
    }

    // delete answer
    async deleteAnswer(questionId: string, answer: string): Promise<void> {
        await this.goToQuestionDetails(questionId);
        await this.toContainText(productQAAdmin.questionDetails.answer.answerText, answer); // only to remove flakiness
        await this.click(productQAAdmin.questionDetails.answer.deleteAnswer);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.productAnswers, productQAAdmin.questionDetails.confirmAction, 204);
        await this.toBeVisible(productQAAdmin.questionDetails.answerDeleteSuccessMessage);
    }

    // delete question
    async deleteQuestion(questionId: string): Promise<void> {
        await this.goToQuestionDetails(questionId);
        await this.click(productQAAdmin.questionDetails.status.deleteQuestion);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.productQuestions, productQAAdmin.questionDetails.confirmAction, 204);
    }

    // product questions bulk action
    async productQuestionsBulkAction(action: string): Promise<void> {
        await this.goToProductQA();

        // ensure row exists
        await this.notToBeVisible(productQAAdmin.noRowsFound);

        await this.click(productQAAdmin.bulkActions.selectAll);
        await this.selectByValue(productQAAdmin.bulkActions.selectAction, action);
        if (action === 'delete') {
            await this.click(productQAAdmin.bulkActions.applyAction);
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.productQuestionsBulkActions, productQAAdmin.bulkActions.confirmAction);
        } else {
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.productQuestionsBulkActions, productQAAdmin.bulkActions.applyAction);
        }
        await this.toBeVisible(productQAAdmin.bulkActions.bulkActionSuccessMessage);
    }

    // ===============================================================
    // VENDOR — legacy dashboard/product-questions-answers (Vue)
    // ===============================================================

    // product question answers render properly
    async vendorProductQARenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.productQa);

        // product question answers text is visible
        await this.toBeVisible(productQAVendor.productQuestionAnswersText);

        // filter elements are visible
        const { filterInput, result, ...filters } = productQAVendor.filters;
        await this.multipleElementVisible(filters);

        // product question & answers table elements are visible
        await this.multipleElementVisible(productQAVendor.table);
    }

    // vendor view question details
    async vendorViewQuestionDetails(questionId: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.questionDetails(questionId));

        // product question answers text is visible
        await this.toBeVisible(productQAVendor.productQuestionAnswersText);

        // question details elements are visible
        await this.multipleElementVisible(productQAVendor.questionDetails.questionDetails);

        // status elements are visible
        await this.multipleElementVisible(productQAVendor.questionDetails.status);

        // answer elements are visible
        const { questionAnswerHtmlBody, ...answer } = productQAVendor.questionDetails.answer;
        await this.multipleElementVisible(answer);
    }

    // filter questions
    async vendorFilterQuestions(productName: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.productQa);
        await this.click(productQAVendor.filters.filterByProducts);
        await this.typeAndWaitForResponse(data.subUrls.ajax, productQAVendor.filters.filterInput, productName);
        await this.toContainText(productQAVendor.filters.result, productName);
        await this.press(data.key.arrowDown);
        await this.press(data.key.enter);
        await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.productQa, productQAVendor.filters.filter);
    }

    // answer question
    async vendorAnswerQuestion(questionId: string, questionsAnswers: QuestionAnswers): Promise<void> {
        await this.goto(data.subUrls.frontend.vDashboard.questionDetails(questionId));
        await this.typeFrameSelector(productQAVendor.questionDetails.answer.questionAnswerIframe, productQAVendor.questionDetails.answer.questionAnswerHtmlBody, questionsAnswers.answer);
        await this.clickAndWaitForResponse(data.subUrls.ajax, productQAVendor.questionDetails.answer.saveAnswer);
        await this.toBeVisible(productQAVendor.questionDetails.answerSaveSuccessMessage);
        await this.toContainText(productQAVendor.questionDetails.answerDetails, questionsAnswers.answer);
        await this.toBeVisible(productQAVendor.questionDetails.editAnswer);
    }

    // edit answer
    async vendorEditAnswer(questionId: string, questionsAnswers: QuestionAnswers): Promise<void> {
        await this.goto(data.subUrls.frontend.vDashboard.questionDetails(questionId));
        await this.click(productQAVendor.questionDetails.editAnswer);
        await this.typeFrameSelector(productQAVendor.questionDetails.answer.questionAnswerIframe, productQAVendor.questionDetails.answer.questionAnswerHtmlBody, questionsAnswers.editAnswer);
        await this.clickAndWaitForResponse(data.subUrls.ajax, productQAVendor.questionDetails.answer.saveAnswer);
        await this.toBeVisible(productQAVendor.questionDetails.answerSaveSuccessMessage);
        await this.toContainText(productQAVendor.questionDetails.answerDetails, questionsAnswers.editAnswer);
    }

    // delete answer
    async vendorDeleteAnswer(questionId: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.questionDetails(questionId));
        await this.click(productQAVendor.questionDetails.deleteAnswer);
        await this.clickAndWaitForResponse(data.subUrls.ajax, productQAVendor.questionDetails.confirmAction);
        await this.toBeVisible(productQAVendor.questionDetails.answerDeleteSuccessMessage);
    }

    // delete question
    async vendorDeleteQuestion(questionId: string): Promise<void> {
        await this.goto(data.subUrls.frontend.vDashboard.questionDetails(questionId));
        await this.click(productQAVendor.questionDetails.status.deleteQuestion);
        await this.clickAndWaitForResponse(data.subUrls.ajax, productQAVendor.questionDetails.confirmAction);
        await this.toBeVisible(productQAVendor.questionDetails.questionDeleteSuccessMessage);
    }

    // ===============================================================
    // CUSTOMER — storefront single-product Q&A tab
    // ===============================================================

    // search question
    async searchQuestion(productName: string, questionsAnswers: QuestionAnswers): Promise<void> {
        await this.goToProductDetails(productName);
        await this.click(menus.customerQuestionsAnswers);
        await this.clearAndType(productQACustomer.searchInput, questionsAnswers.question);
        await this.toBeVisible(productQACustomer.clearResult);
        await this.toContainText(productQACustomer.matchingResult, /^Matching \d+ Q&A with/);
    }

    // post question
    async postQuestion(productName: string, questionsAnswers: QuestionAnswers, guest = false): Promise<void> {
        await this.goToProductDetails(productName);
        await this.click(menus.customerQuestionsAnswers);
        await this.clearAndType(productQACustomer.searchInput, '....');
        if (guest) {
            await this.click(productQACustomer.loginPostQuestion);
            await this.clearAndType(frontend.username, questionsAnswers.guest.username);
            await this.clearAndType(frontend.userPassword, questionsAnswers.guest.password);
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.myAccountToProductQA, frontend.logIn, 302);

            await this.click(menus.customerQuestionsAnswers);
            await this.clearAndType(productQACustomer.searchInput, '....');
        }
        await this.clickAndWaitForLocatorToBeVisible(productQACustomer.postQuestion, productQACustomer.questionModal);
        await this.clearAndType(productQACustomer.questionInput, questionsAnswers.question);
        await this.removeAttribute(productQACustomer.post, 'disabled');
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.productQuestions, productQACustomer.post);
        await this.toBeVisible(productQACustomer.questionPosted(questionsAnswers.question));
    }
}
