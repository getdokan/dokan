import { Page, expect } from '@playwright/test';
import { AdminPage } from 'pages/adminPage';
import { CustomerPage } from 'pages/customerPage';
import { selector } from 'pages/selectors';
import { helpers } from 'utils/helpers';
import { data } from 'utils/testData';
import { customer, date } from 'utils/interfaces';


export class StoreSupportsPage extends AdminPage {

	constructor(page: Page) {
		super(page);
	}

	customerPage = new CustomerPage(this.page);


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
		const { filterInput, result, ...filters } = selector.admin.dokan.storeSupport.filters;
		await this.multipleElementVisible(filters);

		// search store support is visible
		await this.toBeVisible(selector.admin.dokan.storeSupport.searchTicket);

		// store support table elements are visible
		await this.multipleElementVisible(selector.admin.dokan.storeSupport.table);
	}


	// admin view support ticket details
	async adminViewSupportTicketDetails(supportTicketId: string,){
		await this.searchSupportTicket(supportTicketId);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.storeSupport, selector.admin.dokan.storeSupport.supportTicketLink(supportTicketId));

		await this.toBeVisible(selector.admin.dokan.storeSupport.supportTicketDetails.backToTickets);

		// chat elements are visible
		await this.toBeVisible(selector.admin.dokan.storeSupport.supportTicketDetails.ticketTitle);
		await this.toBeVisible(selector.admin.dokan.storeSupport.supportTicketDetails.chatStatus);
		await this.toBeVisible(selector.admin.dokan.storeSupport.supportTicketDetails.chatBox);
		await this.toBeVisible(selector.admin.dokan.storeSupport.supportTicketDetails.chatAuthor);
		await this.toBeVisible(selector.admin.dokan.storeSupport.supportTicketDetails.chatReply);
		await this.toBeVisible(selector.admin.dokan.storeSupport.supportTicketDetails.sendReply);

		// ticket summary elements are visible
		const { reopenTicket, ...ticketSummary } = selector.admin.dokan.storeSupport.supportTicketDetails.ticketSummary;
		await this.multipleElementVisible(ticketSummary);
	}


	// search support ticket
	async searchSupportTicket(idOrTitle: string, closed?: boolean){
		await this.goIfNotThere(data.subUrls.backend.dokan.storeSupport);
		closed && await this.clickAndWaitForLoadState(selector.admin.dokan.storeSupport.navTabs.closed); // go to closed tab

		await this.clearInputField(selector.admin.dokan.storeSupport.searchTicket);
		await this.typeAndWaitForResponseAndLoadState(data.subUrls.api.dokan.storeSupport, selector.admin.dokan.storeSupport.searchTicket, idOrTitle);
		const count = (await this.getElementText(selector.admin.dokan.storeSupport.numberOfRowsFound))?.split(' ')[0];
		if (!isNaN(Number(idOrTitle))){
			await this.toBeVisible(selector.admin.dokan.storeSupport.supportTicketCell(idOrTitle));
		} else {
			expect(Number(count)).toBeGreaterThan(0);
		}
	}

	// decrease unread support ticket count
	async decreaseUnreadSupportTicketCount(supportTicketId: string){
		await this.goIfNotThere(data.subUrls.backend.dokan.storeSupport);
		const getUnreadCount = Number(await this.getElementText(selector.admin.dokan.storeSupport.unreadTicketCount));
		await this.searchSupportTicket(supportTicketId);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.storeSupport, selector.admin.dokan.storeSupport.supportTicketLink(supportTicketId));
		const getNewUnreadCount = Number(await this.getElementText(selector.admin.dokan.storeSupport.unreadTicketCount));
		expect(getNewUnreadCount).toEqual( getUnreadCount - 1);
	}


	// filter store supports
	async filterSupportTickets(input: string, filterBy: string){
		await this.goIfNotThere(data.subUrls.backend.dokan.storeSupport);

		switch (filterBy){

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
		expect(Number(count)).toBeGreaterThan(0);
	}


	// reply to support ticket
	async replySupportTicket(supportTicketId: string, replyMessage: string, replier = 'admin'){
		await this.searchSupportTicket(supportTicketId);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.storeSupport, selector.admin.dokan.storeSupport.supportTicketLink(supportTicketId));

		if (replier === 'vendor'){
			await this.selectByValue(selector.admin.dokan.storeSupport.supportTicketDetails.chatAuthor, 'vendor');
		}

		await this.clearAndType(selector.admin.dokan.storeSupport.supportTicketDetails.chatReply, replyMessage);
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeSupport, selector.admin.dokan.storeSupport.supportTicketDetails.sendReply);

	}


	// update support ticket email notification
	async updateSupportTicketEmailNotification(supportTicketId: string, action: string){
		await this.searchSupportTicket(supportTicketId);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.storeSupport, selector.admin.dokan.storeSupport.supportTicketLink(supportTicketId));

		switch (action){

		case 'enable' :
			await this.enableSwitcherAndWaitForResponse(data.subUrls.api.dokan.storeSupport, selector.admin.dokan.storeSupport.supportTicketDetails.ticketSummary.emailNotification);
			break;

		case 'disable' :
			await this.disableSwitcherAndWaitForResponse(data.subUrls.api.dokan.storeSupport, selector.admin.dokan.storeSupport.supportTicketDetails.ticketSummary.emailNotification);
			break;

		default :
			break;

		}
	}


	// close support ticket
	async closeSupportTicket(supportTicketId: string){
		await this.searchSupportTicket(supportTicketId);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.storeSupport, selector.admin.dokan.storeSupport.supportTicketLink(supportTicketId));
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeSupport, selector.admin.dokan.storeSupport.supportTicketDetails.ticketSummary.closeTicket);
	}


	// reopen support ticket
	async reopenSupportTicket(supportTicketId: string){
		await this.searchSupportTicket(supportTicketId, true);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.storeSupport, selector.admin.dokan.storeSupport.supportTicketLink(supportTicketId));
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeSupport, selector.admin.dokan.storeSupport.supportTicketDetails.ticketSummary.reopenTicket);
	}


	// store support bulk action
	async storeSupportBulkAction(action: string, supportTicketId?: string){
		await this.goto(data.subUrls.backend.dokan.storeSupport); // not used ternary -> page need to reload before reflecting api update
		supportTicketId && await this.searchSupportTicket(supportTicketId);

		// ensure row exists
		await this.notToBeVisible(selector.admin.dokan.storeSupport.noRowsFound);

		await this.click(selector.admin.dokan.storeSupport.bulkActions.selectAll);
		await this.selectByValue(selector.admin.dokan.storeSupport.bulkActions.selectAction, action);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.storeSupport, selector.admin.dokan.storeSupport.bulkActions.applyAction);
	}


	// vendor


	// vendor store support render properly
	async vendorStoreSupportRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.storeSupport);

		// store support menu elements are visible
		await this.multipleElementVisible(selector.vendor.vSupport.menus);


		const { filterByCustomerInput, filterByDate, result, ...filters } = selector.vendor.vSupport.filters;
		await this.toBeVisible(selector.vendor.vSupport.filters.filterByDate.dateRangeInput);
		await this.multipleElementVisible(filters);


		const noSupportTicket = await this.isVisible(selector.vendor.vSupport.noSupportTicketFound);
		if (noSupportTicket) {
			console.log('No Support Tickets Found!!');
			return;
		}

		// store support table elements are visible
		await this.multipleElementVisible(selector.vendor.vSupport.table);

	}


	// vendor view support ticket details
	async vendorViewSupportTicketDetails(supportTicketId: string,){
		await this.vendorSearchSupportTicket('id', supportTicketId);
		await this.clickAndWaitForLoadState(selector.vendor.vSupport.storeSupportLink(supportTicketId));

		await this.toBeVisible(selector.vendor.vSupport.supportTicketDetails.backToTickets);

		// basic details elements are visible
		await this.multipleElementVisible(selector.vendor.vSupport.supportTicketDetails.basicDetails);

		// chat status is visible
		await this.toBeVisible(selector.vendor.vSupport.supportTicketDetails.chatStatus.status);

		// first chat is visible
		await this.toBeVisible(selector.vendor.vSupport.supportTicketDetails.chatBox.mainChat);

		// chat reply box elements are visible
		const ticketIsOpen = await this.isVisible(selector.vendor.vSupport.supportTicketDetails.chatStatus.open);
		const { addReplyText, closeTicketText, ...replyBox } = selector.vendor.vSupport.supportTicketDetails.replyBox;
		ticketIsOpen && await this.toBeVisible(addReplyText);
		!ticketIsOpen && await this.multipleElementVisible(closeTicketText);
		await this.multipleElementVisible(replyBox);
	}


	// vendor filter support tickets
	async vendorFilterSupportTickets( filterBy:string, inputValue: string | date['dateRange'] ){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.storeSupport);

		switch (filterBy){

		case 'by-customer' :
			await this.click(selector.vendor.vSupport.filters.filterByCustomer);
			// await this.clearAndType(selector.vendor.vSupport.filters.filterByCustomerInput, input);
			await this.typeAndWaitForResponse(data.subUrls.ajax, selector.vendor.vSupport.filters.filterByCustomerInput, inputValue as string);
			await this.toContainText(selector.vendor.vSupport.filters.result, inputValue as string);
			await this.clickAndWaitForLoadState(selector.vendor.vSupport.filters.search);
			await this.notToHaveCount(selector.vendor.vSupport.storeSupportsCellByCustomer(inputValue as string), 0);
			break;

		case 'by-date' :
			await this.setAttributeValue(selector.vendor.vSupport.filters.filterByDate.dateRangeInput, 'value', helpers.dateFormatFYJ(inputValue.startDate) + ' - ' + helpers.dateFormatFYJ(inputValue.endDate));
			await this.setAttributeValue(selector.vendor.vSupport.filters.filterByDate.startDateInput, 'value', inputValue.startDate); // todo: resolve this
			await this.setAttributeValue(selector.vendor.vSupport.filters.filterByDate.endDateInput, 'value', inputValue.endDate);
			await this.clickAndWaitForLoadState(selector.vendor.vSupport.filters.search);
			break;

		default :
			break;
		}
		await this.notToHaveCount(selector.vendor.vSupport.numOfRowsFound, 0);

	}


	// vendor search support ticket
	async vendorSearchSupportTicket(searchBy:string, input: string, closed?: boolean){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.storeSupport);
		if (closed){
			await this.clickAndWaitForLoadState(selector.vendor.vSupport.menus.closedTickets);
		}

		await this.clearAndType(selector.vendor.vSupport.filters.tickedIdOrKeyword, input);
		await this.clickAndWaitForLoadState(selector.vendor.vSupport.filters.search);

		switch (searchBy){

		case 'id' :
			await this.toBeVisible(selector.vendor.vSupport.storeSupportCellById(input));
			break;

		case 'title' :
			await this.notToHaveCount(selector.vendor.vSupport.storeSupportCellByTitle(input), 0);
			break;

		default :
			break;
		}

	}


	// vendor reply to support ticket
	async vendorReplySupportTicket(supportTicketId: string, replyMessage: string){
		await this.vendorSearchSupportTicket('id', supportTicketId);
		await this.clickAndWaitForLoadState(selector.vendor.vSupport.storeSupportLink(supportTicketId));
		await this.clearAndType(selector.vendor.vSupport.chatReply, replyMessage );
		await this.clickAndWaitForResponse('wp-comments-post.php', selector.vendor.vSupport.submitReply, 302);
	}


	// vendor close support ticket
	async vendorCloseSupportTicket( supportTicketId: string){
		await this.vendorSearchSupportTicket('id', supportTicketId);
		await this.click(selector.vendor.vSupport.closeTicket);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.storeSupport, selector.vendor.vSupport.confirmCloseTicket);
	}


	// vendor reopen support ticket
	async vendorReopenSupportTicket(supportTicketId: string){
		await this.vendorSearchSupportTicket('id', supportTicketId, true);
		await this.click(selector.vendor.vSupport.reOpenTicket);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.storeSupport, selector.vendor.vSupport.confirmCloseTicket);
	}


	// vendor close support ticket with a reply
	async vendorCloseSupportTicketWithReply(supportTicketId: string, replyMessage: string){
		await this.vendorSearchSupportTicket('id', supportTicketId);
		await this.clickAndWaitForLoadState(selector.vendor.vSupport.storeSupportLink(supportTicketId));
		await this.toContainText(selector.vendor.vSupport.ticketStatus, 'Open');
		await this.selectByValue(selector.vendor.vSupport.changeStatus, '1');
		await this.clearAndType(selector.vendor.vSupport.chatReply, replyMessage );
		await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.storeSupport, selector.vendor.vSupport.submitReply);
		await this.toContainText(selector.vendor.vSupport.ticketStatus, 'Closed');
	}


	// vendor reopen support ticket with a reply
	async vendorReopenSupportTicketWithReply(supportTicketId: string, replyMessage: string){
		await this.vendorSearchSupportTicket('id', supportTicketId, true);
		await this.clickAndWaitForLoadState(selector.vendor.vSupport.storeSupportLink(supportTicketId));
		await this.toContainText(selector.vendor.vSupport.ticketStatus, 'Closed');
		await this.clearAndType(selector.vendor.vSupport.chatReply, replyMessage );
		await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.storeSupport, selector.vendor.vSupport.submitReply);
		await this.toContainText(selector.vendor.vSupport.ticketStatus, 'Open');
	}


	// customer


	// customer store support render properly
	async customerStoreSupportRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.supportTickets);

		// menu elements are visible
		await this.multipleElementVisible(selector.customer.cSupportTickets.menus);
		const noSupportTicket = await this.isVisible(selector.customer.cSupportTickets.noSupportTicketFound);
		if (noSupportTicket) {
			console.log('No Support Tickets Found!!');
			return;
		}

		// store support table elements are visible
		await this.multipleElementVisible(selector.customer.cSupportTickets.table);

	}


	// customer view support ticket details
	async customerViewSupportTicketDetails(supportTicketId: string){
		await this.goIfNotThere(data.subUrls.frontend.supportTickets);
		const supportTicketIdIsVisible = await this.isVisible(selector.customer.cSupportTickets.supportTicketLink(supportTicketId));
		if (supportTicketIdIsVisible){
			await this.clickAndWaitForLoadState(selector.customer.cSupportTickets.supportTicketLink(supportTicketId));
		} else {
			await this.goIfNotThere(data.subUrls.frontend.supportTicketDetails(supportTicketId));
		}

		await this.toBeVisible(selector.customer.cSupportTickets.supportTicketDetails.backToTickets);

		// basic details elements are visible
		await this.multipleElementVisible(selector.customer.cSupportTickets.supportTicketDetails.basicDetails);

		// chat status is visible
		await this.toBeVisible(selector.customer.cSupportTickets.supportTicketDetails.chatStatus.status);

		// first chat is visible
		await this.toBeVisible(selector.customer.cSupportTickets.supportTicketDetails.chatBox.mainChat);

		// chat reply box elements are visible is ticket is open
		const ticketIsOpen = await this.isVisible(selector.customer.cSupportTickets.supportTicketDetails.chatStatus.open);
		ticketIsOpen && await this.multipleElementVisible(selector.customer.cSupportTickets.supportTicketDetails.replyBox);
		// closed ticket elements are visible is ticket is close
		!ticketIsOpen && await this.multipleElementVisible(selector.customer.cSupportTickets.supportTicketDetails.closedTicket);
	}


	// customer ask for store support
	async storeSupport(input: string, getSupport: customer['getSupport'], action: string): Promise<void> {

		switch (action){

		case 'store' :
			await this.goIfNotThere(data.subUrls.frontend.vendorDetails(helpers.slugify(input)));
			break;

		case 'product' :
			await this.goIfNotThere(data.subUrls.frontend.productDetails(helpers.slugify(input)));
			break;

		case 'order' :
			await this.goIfNotThere(data.subUrls.frontend.orderDetails(input));
			break;

		case 'order-received' :
			const [orderId, orderKey] = input.split(',');
			await this.goIfNotThere(data.subUrls.frontend.orderReceivedDetails(orderId as string, orderKey as string));
			break;

		default :
			break;

		}

		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.customer.cSingleStore.storeTabs.getSupport);
		const isGuest = await this.isVisible(selector.customer.cSingleStore.getSupport.userName);
		if (isGuest){
			await this.clearAndType(selector.customer.cSingleStore.getSupport.userName, getSupport.username);
			await this.clearAndType(selector.customer.cSingleStore.getSupport.userPassword, getSupport.userPassword);
			await this.clickAndWaitForResponse(data.subUrls.ajax, selector.customer.cSingleStore.getSupport.login);
		}
		await this.clearAndType(selector.customer.cSingleStore.getSupport.subject, getSupport.subject);
		getSupport.orderId && await this.selectByValue(selector.customer.cSingleStore.getSupport.orderId, getSupport.orderId);
		await this.clearAndType(selector.customer.cSingleStore.getSupport.message, getSupport.message);
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.customer.cSingleStore.getSupport.submit);
		await this.toContainText(selector.customer.cDokanSelector.dokanAlertSuccessMessage, getSupport.supportSubmitSuccessMessage);
		// close popup
		await this.click(selector.customer.cSingleStore.getSupport.close);
	}


	// customer cant send message to closed support ticket
	async viewOrderReferenceNumberOnSupportTicket(supportTicketId: string, orderId: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.supportTicketDetails(supportTicketId));
		await this.toBeVisible(selector.customer.cSupportTickets.supportTicketDetails.orderReference.orderReferenceSpan);
		await this.toBeVisible(selector.customer.cSupportTickets.supportTicketDetails.orderReference.orderReferenceText(orderId));
		await this.toBeVisible(selector.customer.cSupportTickets.supportTicketDetails.orderReference.orderReferenceLink(orderId));
	}


	// customer send message to  support ticket
	async sendMessageToSupportTicket(supportTicketId: string, supportTicket: customer['supportTicket']): Promise<void> {
		const message = supportTicket.message();
		await this.goIfNotThere(data.subUrls.frontend.supportTicketDetails(supportTicketId));
		await this.clearAndType(selector.customer.cSupportTickets.supportTicketDetails.replyBox.addReply, message);
		await this.clickAndWaitForResponse(data.subUrls.frontend.submitSupport, selector.customer.cSupportTickets.supportTicketDetails.replyBox.submitReply, 302);
		await this.toBeVisible(selector.customer.cSupportTickets.supportTicketDetails.chatText(message));
	}


	// customer can't send message to closed support ticket
	async cantSendMessageToSupportTicket(supportTicketId: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.supportTicketDetails(supportTicketId));
		await this.toBeVisible(selector.customer.cSupportTickets.supportTicketDetails.chatStatus.closed);
		await this.toBeVisible(selector.customer.cSupportTickets.supportTicketDetails.closedTicket.closedTicketHeading);
		await this.toContainText(selector.customer.cSupportTickets.supportTicketDetails.closedTicket.closedTicketMessage, 'This ticket has been closed. Open a new support ticket if you have any further query.');
	}

}
