import { Page, expect } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
// import { VendorPage } from '@pages/vendorPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';
import { product, questionsAnswers } from '@utils/interfaces';
import { BasePage } from '@pages/basePage';

export class ProductQAPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    async goToProductDetails(productName: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.productDetails(helpers.slugify(productName)));
    }

    // admin

    // product question answers render properly
    async adminProductQARenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.productQA);

        // product question answers text is visible
        await this.toBeVisible(selector.admin.dokan.productQA.productQuestionAnswersText);

        // nav tabs are visible
        await this.multipleElementVisible(selector.admin.dokan.productQA.navTabs);

        // bulk action elements are visible
        const { confirmAction, bulkActionSuccessMessage, ...bulkActions } = selector.admin.dokan.productQA.bulkActions;
        await this.multipleElementVisible(bulkActions);

        // filter elements are visible
        const { filterInput, result, resetFilterByVensors, ...filters } = selector.admin.dokan.productQA.filters;
        await this.multipleElementVisible(filters);

        // product question & answers table elements are visible
        await this.multipleElementVisible(selector.admin.dokan.productQA.table);
    }

    // admin view question details
    async viewQuestionDetails(questionId: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.questionDetails(questionId));

        // product question answers text is visible
        await this.toBeVisible(selector.admin.dokan.productQA.questionDetails.productQuestionAnswersText);

        // go back is visible
        await this.toBeVisible(selector.admin.dokan.productQA.questionDetails.goBack);

        // question details elements are visible
        const { questionInput, saveQuestion, questionText, ...questionDetails } = selector.admin.dokan.productQA.questionDetails.questionDetails; // todo: need to add questiontext
        await this.multipleElementVisible(questionDetails);

        // status elements are visible
        const { hiddenStatus, showInProductPage, ...status } = selector.admin.dokan.productQA.questionDetails.status;
        await this.multipleElementVisible(status);

        // answer elements are visible
        const { questionAnswerHtmlBody, editAnswer, ...answer } = selector.admin.dokan.productQA.questionDetails.answer;
        await this.multipleElementVisible(answer);
    }

    // decrease unread question count
    async decreaseUnreadQuestionCount() {
        await this.goto(data.subUrls.backend.dokan.productQA);
        const unreadCount = Number(await this.getElementText(selector.admin.dokan.productQA.unreadQuestionCount));
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.productQuestions, selector.admin.dokan.productQA.productQuestionFirstCell);
        const getNewUnreadCount = Number(await this.getElementText(selector.admin.dokan.productQA.unreadQuestionCount));
        expect(getNewUnreadCount).toEqual(unreadCount - 1);
    }

    // filter questions
    async filterQuestions(input: string, filterBy: string) {
        await this.goto(data.subUrls.backend.dokan.productQA);

        switch (filterBy) {
            case 'by-vendor':
                await this.click(selector.admin.dokan.productQA.filters.filterByVendors);
                await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, selector.admin.dokan.productQA.filters.filterInput, input);
                await this.toContainText(selector.admin.dokan.productQA.filters.result, input);
                await this.pressAndWaitForResponse(data.subUrls.api.dokan.productQuestions, data.key.enter);
                break;

            case 'by-product':
                await this.click(selector.admin.dokan.productQA.filters.filterByProducts);
                await this.typeAndWaitForResponse(data.subUrls.api.wc.wcProducts, selector.admin.dokan.productQA.filters.filterInput, input);
                await this.toContainText(selector.admin.dokan.productQA.filters.result, input);
                await this.pressAndWaitForResponse(data.subUrls.api.dokan.productQuestions, data.key.enter);
                break;

            default:
                break;
        }

        const count = (await this.getElementText(selector.admin.dokan.productQA.numberOfRowsFound))?.split(' ')[0];
        expect(Number(count)).toBeGreaterThan(0);
    }

    // edit question
    async editQuestion(questionId: string, questionsAnswers: questionsAnswers): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.questionDetails(questionId));
        await this.click(selector.admin.dokan.productQA.questionDetails.questionDetails.editQuestion);
        await this.clearAndType(selector.admin.dokan.productQA.questionDetails.questionDetails.questionInput, questionsAnswers.editQuestion);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.productQuestions, selector.admin.dokan.productQA.questionDetails.questionDetails.saveQuestion);
        await this.toBeVisible(selector.admin.dokan.productQA.questionDetails.questionSaveSuccessMessage);
        await this.toContainText(selector.admin.dokan.productQA.questionDetails.questionDetails.questionText, questionsAnswers.editQuestion);
    }

    // answer question
    async answerQuestion(questionId: string, questionsAnswers: questionsAnswers): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.questionDetails(questionId));
        await this.typeFrameSelector(selector.admin.dokan.productQA.questionDetails.answer.questionAnswerIframe, selector.admin.dokan.productQA.questionDetails.answer.questionAnswerHtmlBody, questionsAnswers.answer);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.productAnswers, selector.admin.dokan.productQA.questionDetails.answer.saveAnswer, 201);
        await this.toBeVisible(selector.admin.dokan.productQA.questionDetails.answerSaveSuccessMessage);
        await this.toContainText(selector.admin.dokan.productQA.questionDetails.answer.answerText, questionsAnswers.answer);
        await this.toBeVisible(selector.admin.dokan.productQA.questionDetails.answer.editAnswer);
    }

    // edit answer
    async editAnswer(questionId: string, questionsAnswers: questionsAnswers): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.questionDetails(questionId));
        await this.click(selector.admin.dokan.productQA.questionDetails.answer.editAnswer);
        await this.typeFrameSelector(selector.admin.dokan.productQA.questionDetails.answer.questionAnswerIframe, selector.admin.dokan.productQA.questionDetails.answer.questionAnswerHtmlBody, questionsAnswers.editAnswer);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.productAnswers, selector.admin.dokan.productQA.questionDetails.answer.saveAnswer);
        await this.toBeVisible(selector.admin.dokan.productQA.questionDetails.answerUpdateSuccessMessage);
        await this.toContainText(selector.admin.dokan.productQA.questionDetails.answer.answerText, questionsAnswers.answer);
    }

    // edit question visibility
    async editQuestionVisibility(questionId: string, action: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.questionDetails(questionId));
        action == 'hide' ? await this.click(selector.admin.dokan.productQA.questionDetails.status.hideFromProductPage) : await this.click(selector.admin.dokan.productQA.questionDetails.status.showInProductPage);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.productQuestions, selector.admin.dokan.productQA.questionDetails.confirmAction);
        await this.toBeVisible(selector.admin.dokan.productQA.questionDetails.visibilityStatusSaveSuccessMessage);
        action == 'hide' ? await this.toBeVisible(selector.admin.dokan.productQA.questionDetails.status.hiddenStatus) : await this.toBeVisible(selector.admin.dokan.productQA.questionDetails.status.visibleStatus);
        action == 'hide'
            ? await this.toBeVisible(selector.admin.dokan.productQA.questionDetails.status.showInProductPage)
            : await this.toBeVisible(selector.admin.dokan.productQA.questionDetails.status.hideFromProductPage);
    }

    // delete answer
    async deleteAnswer(questionId: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.questionDetails(questionId));
        await this.click(selector.admin.dokan.productQA.questionDetails.answer.deleteAnswer);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.productAnswers, selector.admin.dokan.productQA.questionDetails.confirmAction, 204);
        await this.toBeVisible(selector.admin.dokan.productQA.questionDetails.answerDeleteSuccessMessage);
        await this.toBeVisible(selector.admin.dokan.productQA.questionDetails.answer.saveAnswer);
    }

    // delete question
    async deleteQuestion(questionId: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.questionDetails(questionId));
        await this.click(selector.admin.dokan.productQA.questionDetails.status.deleteQuestion);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.productQuestions, selector.admin.dokan.productQA.questionDetails.confirmAction, 204);
        // await this.toBeVisible(selector.admin.dokan.productQA.questionDetails.questionDeleteSuccessMessage); //todo: needed or not
    }

    // product questions bulk action
    async productQuestionsBulkAction(action: string) {
        await this.goto(data.subUrls.backend.dokan.productQA);

        // ensure row exists
        await this.notToBeVisible(selector.admin.dokan.productQA.noRowsFound);

        await this.click(selector.admin.dokan.productQA.bulkActions.selectAll);
        await this.selectByValue(selector.admin.dokan.productQA.bulkActions.selectAction, action);
        if (action == 'delete') {
            await this.click(selector.admin.dokan.productQA.bulkActions.applyAction);
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.productQuestionsBulkActions, selector.admin.dokan.productQA.bulkActions.confirmAction);
        }
        {
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.productQuestionsBulkActions, selector.admin.dokan.productQA.bulkActions.applyAction);
        }
        await this.toBeVisible(selector.admin.dokan.productQA.bulkActions.bulkActionSuccessMessage);
    }

    // vendor

    // product question answers render properly
    async vendorProductQARenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.productQA);

        // product question answers text is visible
        await this.toBeVisible(selector.vendor.vProductQA.productQuestionAnswersText);

        // filter elements are visible
        const { filterInput, result, ...filters } = selector.vendor.vProductQA.filters;
        await this.multipleElementVisible(filters);

        // product question & answers table elements are visible
        await this.multipleElementVisible(selector.vendor.vProductQA.table);
    }

    // vendor view question details
    async vendorViewQuestionDetails(questionId: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.questionDetails(questionId));

        // product question answers text is visible
        await this.toBeVisible(selector.vendor.vProductQA.productQuestionAnswersText);

        // question details elements are visible
        await this.multipleElementVisible(selector.vendor.vProductQA.questionDetails.questionDetails);

        // status elements are visible
        await this.multipleElementVisible(selector.vendor.vProductQA.questionDetails.status);

        // answer elements are visible
        const { questionAnswerHtmlBody, ...answer } = selector.vendor.vProductQA.questionDetails.answer;
        await this.multipleElementVisible(answer);
    }

    // filter questions
    async vendorFilterQuestions(productName: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.productQA);
        await this.click(selector.vendor.vProductQA.filters.filterByProducts);
        await this.typeAndWaitForResponse(data.subUrls.ajax, selector.vendor.vProductQA.filters.filterInput, productName);
        await this.toContainText(selector.vendor.vProductQA.filters.result, productName);
        await this.press(data.key.arrowDown);
        await this.press(data.key.enter);
        await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.productQA, selector.vendor.vProductQA.filters.filter);
    }

    // answer question
    async vendorAnswerQuestion(questionId: string, questionsAnswers: questionsAnswers): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.questionDetails(questionId));
        await this.typeFrameSelector(selector.vendor.vProductQA.questionDetails.answer.questionAnswerIframe, selector.vendor.vProductQA.questionDetails.answer.questionAnswerHtmlBody, questionsAnswers.answer);
        await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vProductQA.questionDetails.answer.saveAnswer);
        await this.toBeVisible(selector.vendor.vProductQA.questionDetails.answerSaveSuccessMessage);
        await this.toContainText(selector.vendor.vProductQA.questionDetails.answerDetails, questionsAnswers.answer);
        await this.toBeVisible(selector.vendor.vProductQA.questionDetails.editAnswer);
    }

    // edit answer
    async vendorEditAnswer(questionId: string, questionsAnswers: questionsAnswers): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.questionDetails(questionId));
        await this.click(selector.vendor.vProductQA.questionDetails.editAnswer);
        await this.typeFrameSelector(selector.vendor.vProductQA.questionDetails.answer.questionAnswerIframe, selector.vendor.vProductQA.questionDetails.answer.questionAnswerHtmlBody, questionsAnswers.editAnswer);
        await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vProductQA.questionDetails.answer.saveAnswer);
        await this.toBeVisible(selector.vendor.vProductQA.questionDetails.answerSaveSuccessMessage);
        await this.toContainText(selector.vendor.vProductQA.questionDetails.answerDetails, questionsAnswers.answer);
    }

    // delete answer
    async vendorDeleteAnswer(questionId: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.questionDetails(questionId));
        await this.click(selector.vendor.vProductQA.questionDetails.deleteAnswer);
        await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vProductQA.questionDetails.confirmAction);
        await this.toBeVisible(selector.vendor.vProductQA.questionDetails.answerDeleteSuccessMessage);
    }

    // delete question
    async vendorDeleteQuestion(questionId: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.questionDetails(questionId));
        await this.click(selector.vendor.vProductQA.questionDetails.status.deleteQuestion);
        await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vProductQA.questionDetails.confirmAction);
        await this.toBeVisible(selector.vendor.vProductQA.questionDetails.questionDeleteSuccessMessage);
    }

    // customer

    //  search question
    async searchQuestion(productName: string, questionsAnswers: questionsAnswers): Promise<void> {
        await this.goToProductDetails(productName);
        await this.click(selector.customer.cSingleProduct.menus.questionsAnswers);
        await this.clearAndType(selector.customer.cSingleProduct.questionsAnswers.searchInput, questionsAnswers.question);
        await this.toBeVisible(selector.customer.cSingleProduct.questionsAnswers.clearResult);
        await this.toContainText(selector.customer.cSingleProduct.questionsAnswers.matchingResult, /^Matching \d+ Q&A with/);
    }

    //  post question
    async postQuestion(productName: string, questionsAnswers: questionsAnswers): Promise<void> {
        await this.goToProductDetails(productName);
        await this.click(selector.customer.cSingleProduct.menus.questionsAnswers);
        await this.clearAndType(selector.customer.cSingleProduct.questionsAnswers.searchInput, '...');
        const isGuest = await this.isVisible(selector.customer.cSingleProduct.questionsAnswers.loginPostQuestion);
        if (isGuest) {
            await this.click(selector.customer.cSingleProduct.questionsAnswers.loginPostQuestion);
            await this.clearAndType(selector.frontend.username, questionsAnswers.user.username);
            await this.clearAndType(selector.frontend.userPassword, questionsAnswers.user.password);
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.myAccountToProductQA, selector.frontend.logIn, 302);

            await this.click(selector.customer.cSingleProduct.menus.questionsAnswers);
            await this.clearAndType(selector.customer.cSingleProduct.questionsAnswers.searchInput, '...');
        }
        await this.click(selector.customer.cSingleProduct.questionsAnswers.postQuestion);
        await this.clearAndType(selector.customer.cSingleProduct.questionsAnswers.questionInput, questionsAnswers.question);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.productQuestions, selector.customer.cSingleProduct.questionsAnswers.post);
    }
}
