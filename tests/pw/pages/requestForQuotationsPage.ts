import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { CustomerPage } from '@pages/customerPage';
import { MyOrdersPage } from '@pages/myOrdersPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { requestForQuotation } from '@utils/interfaces';

// selectors
const requestForQuotationAdmin = selector.admin.dokan.requestForQuotation;
const requestForQuotationVendor = selector.vendor.vRequestQuotes;
const requestForQuotationCustomer = selector.customer.cRequestForQuote;

export class RequestForQuotationsPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    customerPage = new CustomerPage(this.page);
    customerMyOrders = new MyOrdersPage(this.page);

    // request for quote

    // quote rules

    // quote rules render properly
    async adminQuoteRulesRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuoteRules);

        // request for quote menus are visible
        await this.multipleElementVisible(requestForQuotationAdmin.menus);

        // quote rules text is visible
        await this.toBeVisible(requestForQuotationAdmin.quoteRules.quoteRulesText);

        // new quote rules is visible
        await this.toBeVisible(requestForQuotationAdmin.quoteRules.newQuoteRule);

        // nav tabs are visible
        await this.multipleElementVisible(requestForQuotationAdmin.quoteRules.navTabs);

        // bulk action elements are visible
        await this.multipleElementVisible(requestForQuotationAdmin.quoteRules.bulkActions);

        // quote rules table elements are visible
        await this.multipleElementVisible(requestForQuotationAdmin.quoteRules.table);
    }

    // update quote rule files
    async updateQuoteRuleFields(rule: requestForQuotation['quoteRule']) {
        await this.clearAndType(requestForQuotationAdmin.quoteRules.addNewQuoteRule.ruleTitle, rule.title);
        await this.check(requestForQuotationAdmin.quoteRules.addNewQuoteRule.applyQuoteFor(rule.userRole));

        // products
        await this.click(requestForQuotationAdmin.quoteRules.addNewQuoteRule.applyOnAllProducts);
        // await this.click(requestForQuotationAdmin.quoteRules.addNewQuoteRule.selectProductsDropDown);
        // await this.typeAndWaitForResponse(data.subUrls.api.dokan.quoteRules, requestForQuotationAdmin.quoteRules.addNewQuoteRule.selectProductsInput, rule.product);
        // await this.press(data.key.enter);

        // category
        // await this.check(requestForQuotationAdmin.quoteRules.addNewQuoteRule.selectCategories(rule.category));

        await this.selectByValue(requestForQuotationAdmin.quoteRules.addNewQuoteRule.hidePrice, rule.hidePrice);
        await this.clearAndType(requestForQuotationAdmin.quoteRules.addNewQuoteRule.hidePriceText, rule.hidePriceText);
        await this.selectByValue(requestForQuotationAdmin.quoteRules.addNewQuoteRule.hideAddToCartButton, rule.hideAddToCartButton);
        await this.clearAndType(requestForQuotationAdmin.quoteRules.addNewQuoteRule.customButtonLabel, rule.customButtonLabel);

        // priority
        await this.clearAndType(requestForQuotationAdmin.quoteRules.addNewQuoteRule.priorityOrder, rule.order);

        // publish
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.quoteRules, requestForQuotationAdmin.quoteRules.addNewQuoteRule.publishRule);
    }

    // add quote rule
    async addQuoteRule(rule: requestForQuotation['quoteRule']) {
        await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuoteRules);
        //todo : move to base page
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(data.subUrls.api.dokan.quotes) && resp.status() === 200),
            this.page.waitForResponse(resp => resp.url().includes(data.subUrls.api.dokan.products) && resp.status() === 200),
            this.page.locator(requestForQuotationAdmin.quoteRules.newQuoteRule).click(),
        ]);

        await this.updateQuoteRuleFields(rule);
    }

    // edit quote rule
    async editQuoteRule(rule: requestForQuotation['quoteRule']) {
        await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuoteRules);

        await this.hover(requestForQuotationAdmin.quoteRules.quoteRulesCell(rule.title));

        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(data.subUrls.api.dokan.quotes) && resp.status() === 200),
            this.page.waitForResponse(resp => resp.url().includes(data.subUrls.api.dokan.products) && resp.status() === 200),
            this.page.locator(requestForQuotationAdmin.quoteRules.quoteRulesEdit(rule.title)).click(),
        ]);

        await this.updateQuoteRuleFields(rule);
    }

    // update quote rule
    async updateQuoteRule(quoteTitle: string, action: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuoteRules);

        switch (action) {
            case 'trash':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quoteRules, requestForQuotationAdmin.quoteRules.navTabs.published);
                await this.hover(requestForQuotationAdmin.quoteRules.quoteRulesCell(quoteTitle));
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quoteRules, requestForQuotationAdmin.quoteRules.quoteRulesTrash(quoteTitle));
                break;

            case 'permanently-delete':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quoteRules, requestForQuotationAdmin.quoteRules.navTabs.trash);
                await this.hover(requestForQuotationAdmin.quoteRules.trashedQuoteRulesCell(quoteTitle));
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quoteRules, requestForQuotationAdmin.quoteRules.quoteRulesPermanentlyDelete(quoteTitle));
                break;

            case 'restore':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quoteRules, requestForQuotationAdmin.quoteRules.navTabs.trash);
                await this.hover(requestForQuotationAdmin.quoteRules.trashedQuoteRulesCell(quoteTitle));
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quoteRules, requestForQuotationAdmin.quoteRules.quoteRulesRestore(quoteTitle));
                break;

            default:
                break;
        }
    }

    // quote rules bulk action
    async quoteRulesBulkAction(action: string) {
        await this.goto(data.subUrls.backend.dokan.requestForQuoteRules);

        // ensure row exists
        await this.notToBeVisible(requestForQuotationAdmin.quoteRules.noRowsFound);

        await this.check(requestForQuotationAdmin.quoteRules.bulkActions.selectAll);

        // only to remove flakiness // todo: need diff soln and make generic , don't work need custom soln
        // const isDisabled = await this.hasAttribute(requestForQuotationAdmin.quoteRules.bulkActions.applyAction, 'disabled');
        // if(isDisabled){
        // 	await this.uncheck(requestForQuotationAdmin.quoteRules.bulkActions.selectAll);
        // 	await this.check(requestForQuotationAdmin.quoteRules.bulkActions.selectAll);
        // }

        await this.selectByValue(requestForQuotationAdmin.quoteRules.bulkActions.selectAction, action);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.quoteRules, requestForQuotationAdmin.quoteRules.bulkActions.applyAction);
    }

    // quotes

    // quotes render properly
    async adminQuotesRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuote);

        // request for quote menus are visible
        await this.multipleElementVisible(requestForQuotationAdmin.menus);

        // quotes text is visible
        await this.toBeVisible(requestForQuotationAdmin.quotesList.quotesText);

        // new quote is visible
        await this.toBeVisible(requestForQuotationAdmin.quotesList.newQuote);

        // nav tabs are visible
        await this.multipleElementVisible(requestForQuotationAdmin.quotesList.navTabs);

        // bulk action elements are visible
        await this.multipleElementVisible(requestForQuotationAdmin.quotesList.bulkActions);

        // quotes table elements are visible
        await this.multipleElementVisible(requestForQuotationAdmin.quotesList.table);
    }

    // update quote fields
    async updateQuoteFields(quote: requestForQuotation['quote'], action = 'create') {
        await this.clearAndType(requestForQuotationAdmin.quotesList.addNewQuote.quoteTitle, quote.title);

        // customer information
        await this.click(requestForQuotationAdmin.quotesList.addNewQuote.quoteUserDropDown);
        await this.typeAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.addNewQuote.quoteUserInput, quote.user);
        await this.press(data.key.enter);
        // await this.clearAndType(requestForQuotationAdmin.quotesList.addNewQuote.fullName, quote.fullName);
        // await this.clearAndType(requestForQuotationAdmin.quotesList.addNewQuote.email, quote.email);
        await this.clearAndType(requestForQuotationAdmin.quotesList.addNewQuote.companyName, quote.companyName);
        await this.clearAndType(requestForQuotationAdmin.quotesList.addNewQuote.phoneNumber, quote.phoneNumber);

        // quote product
        if (action === 'create') {
            await this.click(requestForQuotationAdmin.quotesList.addNewQuote.addProducts);

            await this.click(requestForQuotationAdmin.quotesList.addNewQuote.quoteProductDropDown);
            await this.typeAndWaitForResponse(data.subUrls.api.dokan.products, requestForQuotationAdmin.quotesList.addNewQuote.quoteProductInput, quote.product);
            await this.press(data.key.enter);

            await this.clearAndType(requestForQuotationAdmin.quotesList.addNewQuote.quoteProductQuantity, quote.quantity);
            await this.click(requestForQuotationAdmin.quotesList.addNewQuote.addToQuote);
        }

        await this.clearAndType(requestForQuotationAdmin.quotesList.addNewQuote.offerPrice, quote.offerPrice);
        await this.clearAndType(requestForQuotationAdmin.quotesList.addNewQuote.offerProductQuantity, quote.offerProductQuantity);

        await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.addNewQuote.publishQuote);
    }

    // add quote
    async addQuote(quote: requestForQuotation['quote']) {
        await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuote);
        await this.click(requestForQuotationAdmin.quotesList.newQuote);
        await this.updateQuoteFields(quote, 'create');
    }

    // edit quote
    async editQuote(quote: requestForQuotation['quote']) {
        await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuote);

        await this.hover(requestForQuotationAdmin.quotesList.quoteCell(quote.title));
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.quoteEdit(quote.title));
        await this.updateQuoteFields(quote, 'update');
    }

    // update quote
    async updateQuote(quoteTitle: string, action: string) {
        await this.goto(data.subUrls.backend.dokan.requestForQuote);

        switch (action) {
            case 'trash':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.navTabs.pending);
                await this.hover(requestForQuotationAdmin.quotesList.quoteCell(quoteTitle));
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.quoteTrash(quoteTitle));
                break;

            case 'permanently-delete':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.navTabs.trash);
                await this.hover(requestForQuotationAdmin.quotesList.quoteCell(quoteTitle));
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.quotePermanentlyDelete(quoteTitle));
                break;

            case 'restore':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.navTabs.trash);
                await this.hover(requestForQuotationAdmin.quotesList.quoteCell(quoteTitle));
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.quoteRestore(quoteTitle));
                break;

            default:
                break;
        }
    }

    // approve quote
    async approveQuote(quoteTitle: string) {
        await this.goto(data.subUrls.backend.dokan.requestForQuote);
        await this.hover(requestForQuotationAdmin.quotesList.quoteCell(quoteTitle));
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.quoteEdit(quoteTitle));
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.approveQuote);
    }

    // convert quote to order
    async convertQuoteToOrder(quoteTitle: string) {
        await this.goto(data.subUrls.backend.dokan.requestForQuote);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.navTabs.approved);
        await this.hover(requestForQuotationAdmin.quotesList.quoteCell(quoteTitle));
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.quoteEdit(quoteTitle));
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.convertToOrder);
    }

    // quotes bulk action
    async quotesBulkAction(action: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuote);

        // ensure row exists
        await this.notToBeVisible(requestForQuotationAdmin.quotesList.noRowsFound);

        await this.click(requestForQuotationAdmin.quotesList.bulkActions.selectAll);
        await this.selectByValue(requestForQuotationAdmin.quotesList.bulkActions.selectAction, action);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.bulkActions.applyAction);
    }

    // vendor

    // vendor request quotes render properly
    async vendorRequestQuotesRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.requestQuotes);

        // request quotes text is visible
        await this.toBeVisible(requestForQuotationVendor.requestQuotesText);

        const noQuoteRequests = await this.isVisible(requestForQuotationVendor.noQuoteMessage);

        if (noQuoteRequests) {
            // go to shop is visible
            await this.toBeVisible(requestForQuotationVendor.goToShop);
        } else {
            // request quote table elements are visible
            await this.multipleElementVisible(requestForQuotationVendor.table);
        }
    }

    // vendor view request quote details
    async vendorViewQuoteDetails(quoteTitle: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.requestQuotes);
        await this.clickAndWaitForLoadState(requestForQuotationVendor.viewQuoteDetails(quoteTitle));

        // quote basic details elements are visible
        await this.multipleElementVisible(requestForQuotationVendor.quoteDetails.basicDetails);

        // quote item details elements are visible
        await this.toBeVisible(requestForQuotationVendor.quoteDetails.quoteItemDetails.quoteDetailsText);
        await this.multipleElementVisible(requestForQuotationVendor.quoteDetails.quoteItemDetails.table);

        // quote total details elements are visible
        await this.multipleElementVisible(requestForQuotationVendor.quoteDetails.quoteTotals);

        // update quote is visible
        await this.toBeVisible(requestForQuotationVendor.quoteDetails.updateQuote);
        await this.toBeVisibleAnyOfThem([requestForQuotationVendor.quoteDetails.approveThisQuote, requestForQuotationVendor.quoteDetails.convertToOrder]);
    }

    // update quote
    async vendorUpdateQuoteRequest(quoteId: string, quote: requestForQuotation['userQuote']) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.quoteDetails(quoteId));
        await this.clearAndType(requestForQuotationVendor.quoteDetails.offeredPriceInput(quote.productName), quote.offeredPrice);
        await this.clearAndType(requestForQuotationVendor.quoteDetails.quantityInput(quote.productName), quote.quantity);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.quoteDetails(quoteId), requestForQuotationVendor.quoteDetails.updateQuote);
        await this.toContainText(requestForQuotationVendor.quoteDetails.message, 'Your quote has been successfully updated.');
    }

    // approve quote
    async vendorApproveQuoteRequest(quoteId: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.quoteDetails(quoteId));
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.quoteDetails(quoteId), requestForQuotationVendor.quoteDetails.approveThisQuote);
        await this.toContainText(requestForQuotationVendor.quoteDetails.message, 'Your quote has been successfully updated.');
    }

    // convert quote to order
    async vendorConvertQuoteToOrder(quoteId: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.quoteDetails(quoteId));
        const needApproval = await this.isVisible(requestForQuotationVendor.quoteDetails.approveThisQuote);
        needApproval && (await this.vendorApproveQuoteRequest(quoteId));
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.quoteDetails(quoteId), requestForQuotationVendor.quoteDetails.convertToOrder);
        await this.toContainText(requestForQuotationVendor.quoteDetails.message, `Your Quote# ${quoteId} has been converted to Order#`);
    }

    // customer

    // customer request for quote render properly
    async requestForQuoteRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.requestForQuote);

        await this.toBeVisible(requestForQuotationCustomer.requestForQuote.requestForQuoteText);

        const noQuote = await this.isVisible(requestForQuotationCustomer.requestForQuote.noQuotesFound);

        if (noQuote) {
            await this.toContainText(requestForQuotationCustomer.requestForQuote.noQuotesFound, 'Your quote is currently empty.');
            console.log('No quotes found on request for quote page');
            await this.toBeVisible(requestForQuotationCustomer.requestForQuote.returnToShop);
        } else {
            // quote item table details elements are visible
            await this.multipleElementVisible(requestForQuotationCustomer.requestForQuote.quoteItemDetails.table);

            // quote total details elements are visible
            await this.multipleElementVisible(requestForQuotationCustomer.requestForQuote.quoteTotals);

            // update quote is visible
            await this.toBeVisible(requestForQuotationCustomer.requestForQuote.updateQuote);
        }
    }

    // requested quotes render properly
    async requestedQuotesRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.requestedQuote);

        // request quotes text is visible
        await this.toBeVisible(requestForQuotationCustomer.requestedQuote.requestedQuoteText);

        const noQuoteRequests = await this.isVisible(requestForQuotationCustomer.requestedQuote.noQuoteMessage);

        if (noQuoteRequests) {
            // go to shop is visible
            await this.toBeVisible(requestForQuotationCustomer.requestedQuote.goToShop);
        } else {
            // request quote table elements are visible
            await this.multipleElementVisible(requestForQuotationCustomer.requestedQuote.table);

            // pagination is visible
            // await this.toBeVisible(requestForQuotationCustomer.requestedQuote.pagination);
        }
    }

    // customer view requested quote details
    async customerViewRequestedQuoteDetails(quoteTitle: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.requestedQuote);

        await this.clickAndWaitForLoadState(requestForQuotationCustomer.requestedQuote.viewQuoteDetails(quoteTitle));

        // quote basic details elements are visible
        await this.multipleElementVisible(requestForQuotationCustomer.requestedQuote.requestedQuoteDetails.basicDetails);

        // quote item details elements are visible
        await this.toBeVisible(requestForQuotationCustomer.requestedQuote.requestedQuoteDetails.quoteItemDetails.quoteDetailsText);
        await this.multipleElementVisible(requestForQuotationCustomer.requestedQuote.requestedQuoteDetails.quoteItemDetails.table);

        // quote total details elements are visible
        await this.multipleElementVisible(requestForQuotationCustomer.requestedQuote.requestedQuoteDetails.quoteTotals);

        // update quote is visible
        await this.toBeVisible(requestForQuotationCustomer.requestedQuote.requestedQuoteDetails.updateQuote);
    }

    // customer update requested quote
    async customerUpdateRequestedQuote(quoteId: string, quote: requestForQuotation['userQuote']) {
        await this.goIfNotThere(data.subUrls.frontend.quoteDetails(quoteId));
        await this.clearAndType(requestForQuotationCustomer.requestedQuote.requestedQuoteDetails.offeredPriceInput(quote.productName), quote.offeredPrice);
        await this.clearAndType(requestForQuotationCustomer.requestedQuote.requestedQuoteDetails.quantityInput(quote.productName), quote.quantity);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.quoteDetails(quoteId), requestForQuotationCustomer.requestedQuote.requestedQuoteDetails.updateQuote);
        await this.toContainText(requestForQuotationCustomer.requestedQuote.requestedQuoteDetails.message, 'Your quote has been successfully updated.');
    }

    // customer pay converted quote
    async payConvertedQuote(quoteId: string) {
        await this.goto(data.subUrls.frontend.quoteDetails(quoteId));
        await this.clickAndWaitForLoadState(requestForQuotationCustomer.requestedQuote.requestedQuoteDetails.viewOrder);
        await this.toBeVisible(requestForQuotationCustomer.orderDetails.quoteNoteOnOrderDetails);
        const orderId = (await this.getElementText(selector.customer.cOrderDetails.orderDetails.orderNumber)) as string;
        await this.customerMyOrders.payPendingOrder(orderId, 'bank');
    }

    // customer quote product
    async customerQuoteProduct(quote: requestForQuotation['userQuote'], guest?: requestForQuotation['guest']): Promise<string | void> {
        await this.customerPage.goToProductDetails(quote.productName);

        await this.clickAndWaitForResponse(data.subUrls.ajax, requestForQuotationCustomer.singleProductDetails.addToQuote);
        const viewQuoteIsVisible = await this.isVisible(requestForQuotationCustomer.singleProductDetails.viewQuote);
        if (viewQuoteIsVisible) {
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.requestForQuote, requestForQuotationCustomer.singleProductDetails.viewQuote);
        } else {
            await this.goIfNotThere(data.subUrls.frontend.requestForQuote);
        }
        await this.clearAndType(requestForQuotationCustomer.requestForQuote.offeredPriceInput(quote.productName), quote.offeredPrice);
        await this.clearAndType(requestForQuotationCustomer.requestForQuote.quantityInput(quote.productName), quote.quantity);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, requestForQuotationCustomer.requestForQuote.updateQuote);
        await this.toContainText(requestForQuotationCustomer.requestForQuote.message, 'Quote updated');

        if (guest) {
            await this.clearAndType(requestForQuotationCustomer.requestForQuote.guest.fullName, guest.fullName);
            await this.clearAndType(requestForQuotationCustomer.requestForQuote.guest.email, guest.email);
            await this.clearAndType(requestForQuotationCustomer.requestForQuote.guest.companyName, guest.companyName);
            await this.clearAndType(requestForQuotationCustomer.requestForQuote.guest.phoneNumber, guest.phoneNumber);
        }

        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.requestForQuote, requestForQuotationCustomer.requestForQuote.placeQuote, 302);
        await this.toBeVisible(requestForQuotationCustomer.requestedQuote.requestedQuoteDetails.requestedQuoteText);

        if (!guest) {
            const quoteId = (await this.getElementText(requestForQuotationCustomer.requestedQuote.requestedQuoteDetails.basicDetails.quoteNumberValue))?.trim() as string;
            return quoteId;
        }
    }
}
