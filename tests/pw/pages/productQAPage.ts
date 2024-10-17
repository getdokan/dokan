import { Page } from '@playwright/test';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';
import { questionsAnswers } from '@utils/interfaces';
import { BasePage } from '@pages/basePage';

// selectors
const productQAAdmin = selector.admin.dokan.productQA;
const productQAVendor = selector.vendor.vProductQA;
const productQACustomer = selector.customer.cSingleProduct.questionsAnswers;

export class ProductQAPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    async goToProductDetails(productName: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.productDetails(helpers.slugify(productName)));
    }

    async goToProductQA(): Promise<void> {
        await this.gotoUntilNetworkidle(data.subUrls.backend.dokan.productQA);
    }

    async goToQuestionDetails(questionId: string): Promise<void> {
        await this.gotoUntilNetworkidle(data.subUrls.backend.dokan.questionDetails(questionId));
    }

    // admin

    // product question answers render properly
    async adminProductQARenderProperly() {
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
    async filterQuestions(input: string, filterBy: string) {
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
    async editQuestion(questionId: string, questionsAnswers: questionsAnswers): Promise<void> {
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
    async answerQuestion(questionId: string, questionsAnswers: questionsAnswers): Promise<void> {
        await this.goToQuestionDetails(questionId);
        await this.typeFrameSelector(productQAAdmin.questionDetails.answer.questionAnswerIframe, productQAAdmin.questionDetails.answer.questionAnswerHtmlBody, questionsAnswers.answer);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.productAnswers, productQAAdmin.questionDetails.answer.saveAnswer, 201);
        await this.toBeVisible(productQAAdmin.questionDetails.answerSaveSuccessMessage);
        await this.toContainText(productQAAdmin.questionDetails.answer.answerText, questionsAnswers.answer);
        await this.toBeVisible(productQAAdmin.questionDetails.answer.editAnswer);
    }

    // edit answer
    async editAnswer(questionId: string, questionsAnswers: questionsAnswers): Promise<void> {
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
        if (action == 'hide') {
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
    async productQuestionsBulkAction(action: string) {
        await this.goToProductQA();

        // ensure row exists
        await this.notToBeVisible(productQAAdmin.noRowsFound);

        await this.click(productQAAdmin.bulkActions.selectAll);
        await this.selectByValue(productQAAdmin.bulkActions.selectAction, action);
        if (action == 'delete') {
            await this.click(productQAAdmin.bulkActions.applyAction);
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.productQuestionsBulkActions, productQAAdmin.bulkActions.confirmAction);
        } else {
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.productQuestionsBulkActions, productQAAdmin.bulkActions.applyAction);
        }
        await this.toBeVisible(productQAAdmin.bulkActions.bulkActionSuccessMessage);
    }

    // vendor

    // product question answers render properly
    async vendorProductQARenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.productQA);

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
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.productQA);
        await this.click(productQAVendor.filters.filterByProducts);
        await this.typeAndWaitForResponse(data.subUrls.ajax, productQAVendor.filters.filterInput, productName);
        await this.toContainText(productQAVendor.filters.result, productName);
        await this.press(data.key.arrowDown);
        await this.press(data.key.enter);
        await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.productQA, productQAVendor.filters.filter);
    }

    // answer question
    async vendorAnswerQuestion(questionId: string, questionsAnswers: questionsAnswers): Promise<void> {
        await this.goto(data.subUrls.frontend.vDashboard.questionDetails(questionId));
        await this.typeFrameSelector(productQAVendor.questionDetails.answer.questionAnswerIframe, productQAVendor.questionDetails.answer.questionAnswerHtmlBody, questionsAnswers.answer);
        await this.clickAndWaitForResponse(data.subUrls.ajax, productQAVendor.questionDetails.answer.saveAnswer);
        await this.toBeVisible(productQAVendor.questionDetails.answerSaveSuccessMessage);
        await this.toContainText(productQAVendor.questionDetails.answerDetails, questionsAnswers.answer);
        await this.toBeVisible(productQAVendor.questionDetails.editAnswer);
    }

    // edit answer
    async vendorEditAnswer(questionId: string, questionsAnswers: questionsAnswers): Promise<void> {
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

    // customer

    //  search question
    async searchQuestion(productName: string, questionsAnswers: questionsAnswers): Promise<void> {
        await this.goToProductDetails(productName);
        await this.click(selector.customer.cSingleProduct.menus.questionsAnswers);
        await this.clearAndType(productQACustomer.searchInput, questionsAnswers.question);
        await this.toBeVisible(productQACustomer.clearResult);
        await this.toContainText(productQACustomer.matchingResult, /^Matching \d+ Q&A with/);
    }

    //  post question
    async postQuestion(productName: string, questionsAnswers: questionsAnswers, guest = false): Promise<void> {
        await this.goToProductDetails(productName);
        await this.click(selector.customer.cSingleProduct.menus.questionsAnswers);
        await this.clearAndType(productQACustomer.searchInput, '....');
        if (guest) {
            await this.click(productQACustomer.loginPostQuestion);
            await this.clearAndType(selector.frontend.username, questionsAnswers.guest.username);
            await this.clearAndType(selector.frontend.userPassword, questionsAnswers.guest.password);
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.myAccountToProductQA, selector.frontend.logIn, 302);

            await this.click(selector.customer.cSingleProduct.menus.questionsAnswers);
            await this.clearAndType(productQACustomer.searchInput, '....');
        }
        await this.clickAndWaitForLocatorToBeVisible(productQACustomer.postQuestion, productQACustomer.questionModal);
        await this.clearAndType(productQACustomer.questionInput, questionsAnswers.question);
        await this.removeAttribute(productQACustomer.post, 'disabled');
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.productQuestions, productQACustomer.post);
        await this.toBeVisible(productQACustomer.questionPosted(questionsAnswers.question));
    }
}
