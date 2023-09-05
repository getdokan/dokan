import { Page } from '@playwright/test';
import { AdminPage } from 'pages/adminPage';
import { CustomerPage } from 'pages/customerPage';
import { MyOrdersPage } from 'pages/myOrdersPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
import { requestForQuotation } from 'utils/interfaces';


export class RequestForQuotationsPage extends AdminPage {

	constructor(page: Page) {
		super(page);
	}

	customerPage = new CustomerPage(this.page);
	customerMyOrders = new MyOrdersPage(this.page);


	// request for quote

	// quote rules

	// quote rules render properly
	async adminQuoteRulesRenderProperly(){
		await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuoteRules);

		// request for quote menus are visible
		await this.multipleElementVisible(selector.admin.dokan.requestForQuotation.menus);

		// quote rules text is visible
		await this.toBeVisible(selector.admin.dokan.requestForQuotation.quoteRules.quoteRulesText);

		// new quote rules is visible
		await this.toBeVisible(selector.admin.dokan.requestForQuotation.quoteRules.newQuoteRule);

		// nav tabs are visible
		await this.multipleElementVisible(selector.admin.dokan.requestForQuotation.quoteRules.navTabs);

		// bulk action elements are visible
		await this.multipleElementVisible(selector.admin.dokan.requestForQuotation.quoteRules.bulkActions);

		// quote rules table elements are visible
		await this.multipleElementVisible(selector.admin.dokan.requestForQuotation.quoteRules.table);
	}


	// update quote rule files
	async updateQuoteRuleFields(rule: requestForQuotation['quoteRule']){
		await this.clearAndType(selector.admin.dokan.requestForQuotation.quoteRules.addNewQuoteRule.ruleTitle, rule.title);
		await this.check(selector.admin.dokan.requestForQuotation.quoteRules.addNewQuoteRule.applyQuoteFor(rule.userRole));

		// products
		await this.click(selector.admin.dokan.requestForQuotation.quoteRules.addNewQuoteRule.applyOnAllProducts);
		// await this.click(selector.admin.dokan.requestForQuotation.quoteRules.addNewQuoteRule.selectProductsDropDown);
		// await this.typeAndWaitForResponse(data.subUrls.api.dokan.quoteRules, selector.admin.dokan.requestForQuotation.quoteRules.addNewQuoteRule.selectProductsInput, rule.product);
		// await this.press(data.key.enter);

		// category
		// await this.check(selector.admin.dokan.requestForQuotation.quoteRules.addNewQuoteRule.selectCategories(rule.category));

		await this.selectByValue(selector.admin.dokan.requestForQuotation.quoteRules.addNewQuoteRule.hidePrice, rule.hidePrice);
		await this.clearAndType(selector.admin.dokan.requestForQuotation.quoteRules.addNewQuoteRule.hidePriceText, rule.hidePriceText);
		await this.selectByValue(selector.admin.dokan.requestForQuotation.quoteRules.addNewQuoteRule.hideAddToCartButton, rule.hideAddToCartButton);
		await this.clearAndType(selector.admin.dokan.requestForQuotation.quoteRules.addNewQuoteRule.customButtonLabel, rule.customButtonLabel);

		// priority
		await this.clearAndType(selector.admin.dokan.requestForQuotation.quoteRules.addNewQuoteRule.priorityOrder, rule.order);

		// publish
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.quoteRules, selector.admin.dokan.requestForQuotation.quoteRules.addNewQuoteRule.publishRule);
	}


	// add quote rule
	async addQuoteRule(rule: requestForQuotation['quoteRule']){
		await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuoteRules);

		await Promise.all([
			this.page.waitForResponse((resp) => resp.url().includes(data.subUrls.api.dokan.quotes) && resp.status() === 200),
			this.page.waitForResponse((resp) => resp.url().includes(data.subUrls.api.dokan.products) && resp.status() === 200),
			this.page.locator(selector.admin.dokan.requestForQuotation.quoteRules.newQuoteRule).click()
		]);

		await this.updateQuoteRuleFields(rule);
	}


	// edit quote rule
	async editQuoteRule(rule: requestForQuotation['quoteRule']){
		await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuoteRules);
		// await this.goto(data.subUrls.backend.dokan.requestForQuoteRules);

		await this.hover(selector.admin.dokan.requestForQuotation.quoteRules.quoteRulesCell(rule.title));

		await Promise.all([
			this.page.waitForResponse((resp) => resp.url().includes(data.subUrls.api.dokan.quotes) && resp.status() === 200),
			this.page.waitForResponse((resp) => resp.url().includes(data.subUrls.api.dokan.products) && resp.status() === 200),
			this.page.locator(selector.admin.dokan.requestForQuotation.quoteRules.quoteRulesEdit(rule.title)).click()
		]);

		await this.updateQuoteRuleFields(rule);
	}


	// update quote rule
	async updateQuoteRule(quoteTitle: string, action: string){
		await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuoteRules);
		// await this.goto(data.subUrls.backend.dokan.requestForQuoteRules);

		switch (action) {

		case 'trash' :
			await this.hover(selector.admin.dokan.requestForQuotation.quoteRules.quoteRulesCell(quoteTitle));
			await this.clickAndWaitForResponse(data.subUrls.api.dokan.quoteRules, selector.admin.dokan.requestForQuotation.quoteRules.quoteRulesTrash(quoteTitle));
			break;

		case 'permanently-delete' :
			await this.clickAndWaitForResponse(data.subUrls.api.dokan.quoteRules, selector.admin.dokan.requestForQuotation.quoteRules.navTabs.trash);
			await this.hover(selector.admin.dokan.requestForQuotation.quoteRules.trashedQuoteRulesCell(quoteTitle));
			await this.clickAndWaitForResponse(data.subUrls.api.dokan.quoteRules, selector.admin.dokan.requestForQuotation.quoteRules.quoteRulesPermanentlyDelete(quoteTitle));
			break;

		case 'restore' :
			await this.clickAndWaitForResponse(data.subUrls.api.dokan.quoteRules, selector.admin.dokan.requestForQuotation.quoteRules.navTabs.trash);
			await this.hover(selector.admin.dokan.requestForQuotation.quoteRules.trashedQuoteRulesCell(quoteTitle));
			await this.clickAndWaitForResponse(data.subUrls.api.dokan.quoteRules, selector.admin.dokan.requestForQuotation.quoteRules.quoteRulesRestore(quoteTitle));
			break;

		default :
			break;
		}

	}


	// quote rules bulk action
	async quoteRulesBulkAction(action: string){
		await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuoteRules);
		// await this.goto(data.subUrls.backend.dokan.requestForQuoteRules);

		// ensure row exists
		await this.notToBeVisible(selector.admin.dokan.requestForQuotation.quoteRules.noRowsFound);

		await this.check(selector.admin.dokan.requestForQuotation.quoteRules.bulkActions.selectAll);

		// only to remove flakiness //todo: need diff soln and make generic , don't work need custom soln
		const isDisabled = await this.hasAttribute(selector.admin.dokan.requestForQuotation.quoteRules.bulkActions.applyAction, 'disabled');
		if(isDisabled){
			await this.uncheck(selector.admin.dokan.requestForQuotation.quoteRules.bulkActions.selectAll);
			await this.check(selector.admin.dokan.requestForQuotation.quoteRules.bulkActions.selectAll);
		}

		await this.selectByValue(selector.admin.dokan.requestForQuotation.quoteRules.bulkActions.selectAction, action);
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.quoteRules, selector.admin.dokan.requestForQuotation.quoteRules.bulkActions.applyAction);
	}


	// quotes


	// quotes render properly
	async adminQuotesRenderProperly(){
		await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuote);

		// request for quote menus are visible
		await this.multipleElementVisible(selector.admin.dokan.requestForQuotation.menus);

		// quotes text is visible
		await this.toBeVisible(selector.admin.dokan.requestForQuotation.quotesList.quotesText);

		// new quote is visible
		await this.toBeVisible(selector.admin.dokan.requestForQuotation.quotesList.newQuote);

		// nav tabs are visible
		await this.multipleElementVisible(selector.admin.dokan.requestForQuotation.quotesList.navTabs);

		// bulk action elements are visible
		await this.multipleElementVisible(selector.admin.dokan.requestForQuotation.quotesList.bulkActions);

		// quotes table elements are visible
		await this.multipleElementVisible(selector.admin.dokan.requestForQuotation.quotesList.table);
	}


	// update quote fields
	async updateQuoteFields(quote: requestForQuotation['quote'], action = 'create'){
		await this.clearAndType(selector.admin.dokan.requestForQuotation.quotesList.addNewQuote.quoteTitle, quote.title);

		// customer information
		await this.click(selector.admin.dokan.requestForQuotation.quotesList.addNewQuote.quoteUserDropDown);
		await this.typeAndWaitForResponse(data.subUrls.api.dokan.quotes, selector.admin.dokan.requestForQuotation.quotesList.addNewQuote.quoteUserInput, quote.user);
		await this.press(data.key.enter);
		// await this.clearAndType(selector.admin.dokan.requestForQuotation.quotesList.addNewQuote.fullName, quote.fullName);
		// await this.clearAndType(selector.admin.dokan.requestForQuotation.quotesList.addNewQuote.email, quote.email);
		await this.clearAndType(selector.admin.dokan.requestForQuotation.quotesList.addNewQuote.companyName, quote.companyName);
		await this.clearAndType(selector.admin.dokan.requestForQuotation.quotesList.addNewQuote.phoneNumber, quote.phoneNumber);

		// quote product
		if (action === 'create'){
			await this.click(selector.admin.dokan.requestForQuotation.quotesList.addNewQuote.addProducts);

			await this.click(selector.admin.dokan.requestForQuotation.quotesList.addNewQuote.quoteProductDropDown);
			await this.typeAndWaitForResponse(data.subUrls.api.dokan.products, selector.admin.dokan.requestForQuotation.quotesList.addNewQuote.quoteProductInput, quote.product);
			await this.press(data.key.enter);

			await this.clearAndType(selector.admin.dokan.requestForQuotation.quotesList.addNewQuote.quoteProductQuantity, quote.quantity);
			await this.click(selector.admin.dokan.requestForQuotation.quotesList.addNewQuote.addToQuote);
		}

		await this.clearAndType(selector.admin.dokan.requestForQuotation.quotesList.addNewQuote.offerPrice, quote.offerPrice);
		await this.clearAndType(selector.admin.dokan.requestForQuotation.quotesList.addNewQuote.offerProductQuantity, quote.offerProductQuantity);

		await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, selector.admin.dokan.requestForQuotation.quotesList.addNewQuote.publishQuote);

	}


	// add quote
	async addQuote(quote: requestForQuotation['quote']){
		await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuote);
		await this.click(selector.admin.dokan.requestForQuotation.quotesList.newQuote);
		await this.updateQuoteFields(quote, 'create');
	}


	// edit quote
	async editQuote(quote: requestForQuotation['quote']){
		await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuote);

		await this.hover(selector.admin.dokan.requestForQuotation.quotesList.quoteCell(quote.title));
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, selector.admin.dokan.requestForQuotation.quotesList.quoteEdit(quote.title));
		await this.updateQuoteFields(quote, 'update');
	}


	// update quote
	async updateQuote(quoteTitle: string, action: string){
		await this.goto(data.subUrls.backend.dokan.requestForQuote);
		// await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuote);

		switch (action) {

		case 'trash' :
			await this.hover(selector.admin.dokan.requestForQuotation.quotesList.quoteCell(quoteTitle));
			await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, selector.admin.dokan.requestForQuotation.quotesList.quoteTrash(quoteTitle));
			break;

		case 'permanently-delete' :
			await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, selector.admin.dokan.requestForQuotation.quotesList.navTabs.trash);
			await this.hover(selector.admin.dokan.requestForQuotation.quotesList.quoteCell(quoteTitle));
			await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, selector.admin.dokan.requestForQuotation.quotesList.quotePermanentlyDelete(quoteTitle));
			break;

		case 'restore' :
			await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, selector.admin.dokan.requestForQuotation.quotesList.navTabs.trash);
			await this.hover(selector.admin.dokan.requestForQuotation.quotesList.quoteCell(quoteTitle));
			await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, selector.admin.dokan.requestForQuotation.quotesList.quoteRestore(quoteTitle));
			break;

		default :
			break;
		}

	}


	// approve quote
	async approveQuote(quoteTitle: string){
		await this.goto(data.subUrls.backend.dokan.requestForQuote);
		// await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuote);
		await this.hover(selector.admin.dokan.requestForQuotation.quotesList.quoteCell(quoteTitle));
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, selector.admin.dokan.requestForQuotation.quotesList.quoteEdit(quoteTitle));
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, selector.admin.dokan.requestForQuotation.quotesList.approveQuote);
	}


	// convert quote to order
	async convertQuoteToOrder(quoteTitle: string){
		// await this.approveQuote(quoteTitle);
		await this.goto(data.subUrls.backend.dokan.requestForQuote);
		// await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuote);
		await this.hover(selector.admin.dokan.requestForQuotation.quotesList.quoteCell(quoteTitle));
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, selector.admin.dokan.requestForQuotation.quotesList.quoteEdit(quoteTitle));
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, selector.admin.dokan.requestForQuotation.quotesList.convertToOrder);

	}


	// quotes bulk action
	async quotesBulkAction(action: string){
		await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuote);

		// ensure row exists
		await this.notToBeVisible(selector.admin.dokan.requestForQuotation.quotesList.noRowsFound);

		await this.click(selector.admin.dokan.requestForQuotation.quotesList.bulkActions.selectAll);
		await this.selectByValue(selector.admin.dokan.requestForQuotation.quotesList.bulkActions.selectAction, action);
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, selector.admin.dokan.requestForQuotation.quotesList.bulkActions.applyAction);
	}


	// vendor


	// vendor request quotes render properly
	async vendorRequestQuotesRenderProperly(): Promise<void>{
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.requestQuotes);

		// request quotes text is visible
		await this.toBeVisible(selector.vendor.vRequestQuotes.requestQuotesText);

		const noQuoteRequests = await this.isVisible(selector.vendor.vRequestQuotes.noQuoteMessage);

		if (noQuoteRequests){
			// go to shop is visible
			await this.toBeVisible(selector.vendor.vRequestQuotes.goToShop);

		} else {
			// request quote table elements are visible
			await this.multipleElementVisible(selector.vendor.vRequestQuotes.table);
		}

	}


	// vendor view request quote details
	async vendorViewQuoteDetails(quoteTitle: string): Promise<void>{
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.requestQuotes);
		await this.clickAndWaitForLoadState(selector.vendor.vRequestQuotes.viewQuoteDetails(quoteTitle));

		// quote basic details elements are visible
		await this.multipleElementVisible(selector.vendor.vRequestQuotes.quoteDetails.basicDetails);

		// quote item details elements are visible
		await this.toBeVisible(selector.vendor.vRequestQuotes.quoteDetails.quoteItemDetails.quoteDetailsText);
		await this.multipleElementVisible(selector.vendor.vRequestQuotes.quoteDetails.quoteItemDetails.table);

		// quote total details elements are visible
		await this.multipleElementVisible(selector.vendor.vRequestQuotes.quoteDetails.quoteTotals);

		// update quote is visible
		await this.toBeVisible(selector.vendor.vRequestQuotes.quoteDetails.updateQuote);
		await this.toBeVisibleAnyOfThem([selector.vendor.vRequestQuotes.quoteDetails.approveThisQuote, selector.vendor.vRequestQuotes.quoteDetails.convertToOrder]);

	}


	// update quote
	async vendorUpdateQuoteRequest(quoteId: string, quote: requestForQuotation ['userQuote']){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.quoteDetails(quoteId));
		await this.clearAndType(selector.vendor.vRequestQuotes.quoteDetails.offeredPriceInput(quote.productName), quote.offeredPrice);
		await this.clearAndType(selector.vendor.vRequestQuotes.quoteDetails.quantityInput(quote.productName), quote.quantity);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.quoteDetails(quoteId), selector.vendor.vRequestQuotes.quoteDetails.updateQuote);
		await this.toContainText(selector.vendor.vRequestQuotes.quoteDetails.message, 'Your quote has been successfully updated.');
	}


	// approve quote
	async vendorApproveQuoteRequest(quoteId: string){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.quoteDetails(quoteId));
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.quoteDetails(quoteId), selector.vendor.vRequestQuotes.quoteDetails.approveThisQuote);
		await this.toContainText(selector.vendor.vRequestQuotes.quoteDetails.message, 'Your quote has been successfully updated.');
	}


	// convert quote to order
	async vendorConvertQuoteToOrder(quoteId: string){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.quoteDetails(quoteId));
		const needApproval = await this.isVisible(selector.vendor.vRequestQuotes.quoteDetails.approveThisQuote);
		needApproval && await this.vendorApproveQuoteRequest(quoteId);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.quoteDetails(quoteId), selector.vendor.vRequestQuotes.quoteDetails.convertToOrder);
		await this.toContainText(selector.vendor.vRequestQuotes.quoteDetails.message, `Your Quote# ${quoteId} has been converted to Order#`);
	}


	// customer


	// customer request for quote render properly
	async requestForQuoteRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.requestForQuote);

		await this.toBeVisible(selector.customer.cRequestForQuote.requestForQuote.requestForQuoteText);

		const noQuote = await this.isVisible(selector.customer.cRequestForQuote.requestForQuote.noQuotesFound);

		if (noQuote){
			await this.toContainText(selector.customer.cRequestForQuote.requestForQuote.noQuotesFound, 'Your quote is currently empty.');
			console.log('No quotes found on request for quote page');
			await this.toBeVisible(selector.customer.cRequestForQuote.requestForQuote.returnToShop);

		} else {

			// quote item table details elements are visible
			await this.multipleElementVisible(selector.customer.cRequestForQuote.requestForQuote.quoteItemDetails.table);


			// quote total details elements are visible
			await this.multipleElementVisible(selector.customer.cRequestForQuote.requestForQuote.quoteTotals);


			// update quote is visible
			await this.toBeVisible(selector.customer.cRequestForQuote.requestForQuote.updateQuote);

		}

	}


	// requested quotes render properly
	async requestedQuotesRenderProperly(): Promise<void>{
		await this.goIfNotThere(data.subUrls.frontend.requestedQuote);

		// request quotes text is visible
		await this.toBeVisible(selector.customer.cRequestForQuote.requestedQuote.requestedQuoteText);

		const noQuoteRequests = await this.isVisible(selector.customer.cRequestForQuote.requestedQuote.noQuoteMessage);

		if (noQuoteRequests){
			// go to shop is visible
			await this.toBeVisible(selector.customer.cRequestForQuote.requestedQuote.goToShop);

		} else {
			// request quote table elements are visible
			await this.multipleElementVisible(selector.customer.cRequestForQuote.requestedQuote.table);

			//pagination is visible
			// await this.toBeVisible(selector.customer.cRequestForQuote.requestedQuote.pagination);
		}

	}


	// customer view requested quote details
	async customerViewRequestedQuoteDetails(quoteTitle: string): Promise<void>{
		await this.goIfNotThere(data.subUrls.frontend.requestedQuote);

		await this.clickAndWaitForLoadState(selector.customer.cRequestForQuote.requestedQuote.viewQuoteDetails(quoteTitle));

		// quote basic details elements are visible
		await this.multipleElementVisible(selector.customer.cRequestForQuote.requestedQuote.requestedQuoteDetails.basicDetails);

		// quote item details elements are visible
		await this.toBeVisible(selector.customer.cRequestForQuote.requestedQuote.requestedQuoteDetails.quoteItemDetails.quoteDetailsText);
		await this.multipleElementVisible(selector.customer.cRequestForQuote.requestedQuote.requestedQuoteDetails.quoteItemDetails.table);

		// quote total details elements are visible
		await this.multipleElementVisible(selector.customer.cRequestForQuote.requestedQuote.requestedQuoteDetails.quoteTotals);

		// update quote is visible
		await this.toBeVisible(selector.customer.cRequestForQuote.requestedQuote.requestedQuoteDetails.updateQuote);

	}


	// customer update requested quote
	async customerUpdateRequestedQuote(quoteId: string, quote: requestForQuotation ['userQuote']){
		await this.goIfNotThere(data.subUrls.frontend.quoteDetails(quoteId));
		await this.clearAndType(selector.customer.cRequestForQuote.requestedQuote.requestedQuoteDetails.offeredPriceInput(quote.productName), quote.offeredPrice);
		await this.clearAndType(selector.customer.cRequestForQuote.requestedQuote.requestedQuoteDetails.quantityInput(quote.productName), quote.quantity);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.quoteDetails(quoteId), selector.customer.cRequestForQuote.requestedQuote.requestedQuoteDetails.updateQuote);
		await this.toContainText(selector.customer.cRequestForQuote.requestedQuote.requestedQuoteDetails.message, 'Your quote has been successfully updated.');
	}


	// customer pay converted quote
	async payConvertedQuote(quoteId: string){
		await this.goto(data.subUrls.frontend.quoteDetails(quoteId));
		await this.clickAndWaitForLoadState(selector.customer.cRequestForQuote.requestedQuote.requestedQuoteDetails.viewOrder);
		await this.toBeVisible(selector.customer.cRequestForQuote.orderDetails.quoteNoteOnOrderDetails);
		const orderId = await this.getElementText(selector.customer.cOrderDetails.orderDetails.orderNumber) as string;
		await this.customerMyOrders.payPendingOrder(orderId, 'bank');
	}


	// customer quote product
	async customerQuoteProduct( quote: requestForQuotation ['userQuote'], guest?: requestForQuotation['guest'] ): Promise<string | void>{
		await this.customerPage.goToProductDetails(quote.productName);

		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.customer.cRequestForQuote.singleProductDetails.addToQuote);
		const viewQuoteIsVisible = await this.isVisible(selector.customer.cRequestForQuote.singleProductDetails.viewQuote);
		if(viewQuoteIsVisible){
			await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.requestForQuote, selector.customer.cRequestForQuote.singleProductDetails.viewQuote);
		} else {
			await this.goIfNotThere(data.subUrls.frontend.requestForQuote);
		}
		await this.clearAndType(selector.customer.cRequestForQuote.requestForQuote.offeredPriceInput(quote.productName), quote.offeredPrice);
		await this.clearAndType(selector.customer.cRequestForQuote.requestForQuote.quantityInput(quote.productName), quote.quantity);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.customer.cRequestForQuote.requestForQuote.updateQuote);
		await this.toContainText(selector.customer.cRequestForQuote.requestForQuote.message, 'Quote updated');

		if (guest){
			await this.clearAndType(selector.customer.cRequestForQuote.requestForQuote.guest.fullName, guest.fullName);
			await this.clearAndType(selector.customer.cRequestForQuote.requestForQuote.guest.email, guest.email);
			await this.clearAndType(selector.customer.cRequestForQuote.requestForQuote.guest.companyName, guest.companyName);
			await this.clearAndType(selector.customer.cRequestForQuote.requestForQuote.guest.phoneNumber, guest.phoneNumber);
		}

		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.requestForQuote, selector.customer.cRequestForQuote.requestForQuote.placeQuote, 302);
		await this.toBeVisible(selector.customer.cRequestForQuote.requestedQuote.requestedQuoteDetails.requestedQuoteText);

		if(! guest){
			const quoteId = (await this.getElementText(selector.customer.cRequestForQuote.requestedQuote.requestedQuoteDetails.basicDetails.quoteNumberValue))?.trim() as string;
			return quoteId;
		}
	}


}
