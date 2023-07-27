import { Page, expect } from '@playwright/test';
import { AdminPage } from 'pages/adminPage';
import { selector } from 'pages/selectors';
import { helpers } from 'utils/helpers';
import { data } from 'utils/testData';
import { customer } from 'utils/interfaces';


export class StoreSupportsPage extends AdminPage {

	constructor(page: Page) {
		super(page);
	}


	// store support

	// store support render properly
	async adminStoreSupportRenderProperly(){
		await this.goIfNotThere(data.subUrls.backend.dokan.storeSupport);

		// store support text is visible
		await this.toBeVisible(selector.admin.dokan.storeSupport.storeSupportText);

		// nav tabs are visible
		await this.multipleElementVisible(selector.admin.dokan.storeSupport.navTabs);

		// bulk action elements are visible
		await this.multipleElementVisible(selector.admin.dokan.storeSupport.bulkActions);

		// filter elements are visible
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { filterInput, result, ...filters } = selector.admin.dokan.storeSupport.filters;
		await this.multipleElementVisible(filters);

		// search store support is visible
		await this.toBeVisible(selector.admin.dokan.storeSupport.searchTicket);

		// store support table elements are visible
		await this.multipleElementVisible(selector.admin.dokan.storeSupport.table);
	}


	// search support ticket
	async searchSupportTicket(title: string){
		await this.goIfNotThere(data.subUrls.backend.dokan.storeSupport);

		await this.clearInputField(selector.admin.dokan.storeSupport.searchTicket);
		await this.typeAndWaitForResponse(data.subUrls.api.dokan.storeSupport, selector.admin.dokan.storeSupport.searchTicket, title);
		// await this.toBeVisible(selector.admin.dokan.storeSupport.supportTicketLink(title));
		const count = (await this.getElementText(selector.admin.dokan.storeSupport.numberOfRowsFound))?.split(' ')[0];
		expect(Number(count)).not.toBe(0);
	}


	// filter store supports
	async filterStoreSupports(input: string, action: string){
		await this.goIfNotThere(data.subUrls.backend.dokan.storeSupport);
		// await this.clickIfVisible(selector.admin.dokan.storeSupport.filters.filterClear);

		switch(action){

		case 'by-vendor' :
			await this.click(selector.admin.dokan.storeSupport.filters.filterByVendors);
			await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, selector.admin.dokan.storeSupport.filters.filterInput, input);
			await this.toContainText(selector.admin.dokan.storeSupport.filters.result, input);
			await this.press(data.key.enter);
			await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeSupport, selector.admin.dokan.storeSupport.filters.filterButton);
			break;

		case 'by-customer' :
			await this.click(selector.admin.dokan.storeSupport.filters.filterByCustomers);
			await this.typeAndWaitForResponse(data.subUrls.api.dokan.storeSupport, selector.admin.dokan.storeSupport.filters.filterInput, input);
			await this.toContainText(selector.admin.dokan.storeSupport.filters.result, input);
			await this.press(data.key.enter);
			await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeSupport, selector.admin.dokan.storeSupport.filters.filterButton);
			break;

		default :
			break;
		}

		const count = (await this.getElementText(selector.admin.dokan.storeSupport.numberOfRowsFound))?.split(' ')[0];
		expect(Number(count)).not.toBe(0);
	}


	// reply to support ticket
	async replySupportTicket(replyMessage: string, replier = 'admin'){
		await this.goIfNotThere(data.subUrls.backend.dokan.storeSupport);
		await this.clickAndWaitForNavigation(selector.admin.dokan.storeSupport.supportTicketFirstCell);

		if(replier === 'vendor'){
			await this.selectByValue(selector.admin.dokan.storeSupport.supportTicketDetails.chatAuthor, 'vendor');
		}

		await this.clearAndType(selector.admin.dokan.storeSupport.supportTicketDetails.chatReply, replyMessage);
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeSupport, selector.admin.dokan.storeSupport.supportTicketDetails.sendReply);

	}


	// update support ticket email notification
	async updateSupportTicketEmailNotification(action: string){
		await this.goIfNotThere(data.subUrls.backend.dokan.storeSupport);
		// await this.clickAndWaitForNavigation(selector.admin.dokan.storeSupport.supportTicketFirstCell);
		await this.clickAndWaitForLoadState(selector.admin.dokan.storeSupport.supportTicketFirstCell);

		switch(action){

		case 'enable' :
			await this.enableSwitcherAndWaitForResponse(data.subUrls.api.dokan.storeSupport, selector.admin.dokan.storeSupport.supportTicketDetails.emailNotification);
			break;

		case 'disable' :
			await this.disableSwitcherAndWaitForResponse(data.subUrls.api.dokan.storeSupport, selector.admin.dokan.storeSupport.supportTicketDetails.emailNotification);
			break;

		default :
			break;

		}
	}


	// close support ticket
	async closeSupportTicket(){
		await this.goIfNotThere(data.subUrls.backend.dokan.storeSupport);
		// await this.clickAndWaitForNavigation(selector.admin.dokan.storeSupport.supportTicketFirstCell);
		await this.clickAndWaitForLoadState(selector.admin.dokan.storeSupport.supportTicketFirstCell);
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeSupport, selector.admin.dokan.storeSupport.supportTicketDetails.closeTicket);
	}


	// reopen support ticket
	async reopenSupportTicket(){
		await this.goIfNotThere(data.subUrls.backend.dokan.storeSupport);
		// await this.clickAndWaitForNavigation(selector.admin.dokan.storeSupport.navTabs.closed);
		await this.clickAndWaitForLoadState(selector.admin.dokan.storeSupport.navTabs.closed);
		// await this.clickAndWaitForNavigation(selector.admin.dokan.storeSupport.supportTicketFirstCell);
		await this.clickAndWaitForLoadState(selector.admin.dokan.storeSupport.supportTicketFirstCell);
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeSupport, selector.admin.dokan.storeSupport.supportTicketDetails.reopenTicket);
	}


	// store support bulk action
	async storeSupportBulkAction(action: string){
		// await this.goIfNotThere(data.subUrls.backend.dokan.storeSupport);
		await this.goto(data.subUrls.backend.dokan.storeSupport);

		// ensure row exists
		await this.notToBeVisible(selector.admin.dokan.storeSupport.noRowsFound);

		await this.click(selector.admin.dokan.storeSupport.bulkActions.selectAll);
		await this.selectByValue(selector.admin.dokan.storeSupport.bulkActions.selectAction, action);
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeSupport, selector.admin.dokan.storeSupport.bulkActions.applyAction);
		//todo:  add assertion
	}


	// customer ask for store support
	async storeSupport(input: string, getSupport: customer['customerInfo']['getSupport'], action: string): Promise<void> {

		switch(action){

		case 'store' :
			await this.goIfNotThere(data.subUrls.frontend.vendorDetails(helpers.slugify(input)));
			break;

		case 'product' :
			await this.goIfNotThere(data.subUrls.frontend.productDetails(helpers.slugify(input)));
			break;

		case 'order' :
			await this.goIfNotThere(data.subUrls.frontend.myOrderDetails(input));
			break;

		default :
			break;

		}

		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.customer.cSingleStore.storeTabs.getSupport);
		const isGuest = await this.isVisible(selector.customer.cSingleStore.getSupport.userName);
		if(isGuest){
			await this.clearAndType(selector.customer.cSingleStore.getSupport.userName, getSupport.username);
			await this.clearAndType(selector.customer.cSingleStore.getSupport.userPassword, getSupport.userPassword);
			await this.clickAndWaitForResponse(data.subUrls.ajax, selector.customer.cSingleStore.getSupport.login);
		}
		await this.clearAndType(selector.customer.cSingleStore.getSupport.subject, getSupport.subject);
		await this.clearAndType(selector.customer.cSingleStore.getSupport.message, getSupport.message);
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.customer.cSingleStore.getSupport.submit);
		await this.toContainText(selector.customer.cDokanSelector.dokanAlertSuccessMessage, getSupport.supportSubmitSuccessMessage);
		// close popup
		await this.click(selector.customer.cSingleStore.getSupport.close);

	}


	// customer add customer support ticket
	async sendMessageCustomerSupportTicket(supportTicket: customer['supportTicket']): Promise<void> {
		const message = supportTicket.message();
		await this.goIfNotThere(data.subUrls.frontend.supportTickets);
		await this.click(selector.customer.cSupportTickets.firstOpenTicket);
		await this.clearAndType(selector.customer.cSupportTickets.addReply, message);
		await this.clickAndWaitForResponse(data.subUrls.frontend.submitSupport, selector.customer.cSupportTickets.submitReply, 302);
		await this.toBeVisible(selector.customer.cSupportTickets.chatText(message));
	}

}
