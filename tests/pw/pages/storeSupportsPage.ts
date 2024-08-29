import { Page, expect } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { CustomerPage } from '@pages/customerPage';
import { selector } from '@pages/selectors';
import { helpers } from '@utils/helpers';
import { data } from '@utils/testData';
import { customer, date } from '@utils/interfaces';

// selectors
const storeSupportsAdmin = selector.admin.dokan.storeSupport;
const storeSupportsVendor = selector.vendor.vSupport;
const storeSupportsCustomer = selector.customer.cSingleStore.getSupport;
const supportsTicketsCustomer = selector.customer.cSupportTickets;

export class StoreSupportsPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    customerPage = new CustomerPage(this.page);

    // store support

    // store support render properly
    async adminStoreSupportRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.storeSupport);

        // store support text is visible
        await this.toBeVisible(storeSupportsAdmin.storeSupportText);

        // nav tabs are visible
        await this.multipleElementVisible(storeSupportsAdmin.navTabs);

        // bulk action elements are visible
        await this.multipleElementVisible(storeSupportsAdmin.bulkActions);

        // filter elements are visible
        const { filterInput, result, ...filters } = storeSupportsAdmin.filters;
        await this.multipleElementVisible(filters);

        // search store support is visible
        await this.toBeVisible(storeSupportsAdmin.searchTicket);

        // store support table elements are visible
        await this.multipleElementVisible(storeSupportsAdmin.table);
    }

    // admin view support ticket details
    async adminViewSupportTicketDetails(supportTicketId: string) {
        await this.searchSupportTicket(supportTicketId);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.storeSupport, storeSupportsAdmin.supportTicketLink(supportTicketId));

        await this.toBeVisible(storeSupportsAdmin.supportTicketDetails.backToTickets);

        // chat elements are visible
        await this.toBeVisible(storeSupportsAdmin.supportTicketDetails.ticketTitle);
        await this.toBeVisible(storeSupportsAdmin.supportTicketDetails.chatStatus);
        await this.toBeVisible(storeSupportsAdmin.supportTicketDetails.chatBox);
        await this.toBeVisible(storeSupportsAdmin.supportTicketDetails.chatAuthor);
        await this.toBeVisible(storeSupportsAdmin.supportTicketDetails.chatReply);
        await this.toBeVisible(storeSupportsAdmin.supportTicketDetails.sendReply);

        // ticket summary elements are visible
        const { reopenTicket, ...ticketSummary } = storeSupportsAdmin.supportTicketDetails.ticketSummary;
        await this.multipleElementVisible(ticketSummary);
    }

    // search support ticket
    async searchSupportTicket(searchKey: string, closed?: boolean) {
        await this.goIfNotThere(data.subUrls.backend.dokan.storeSupport);
        if (closed) {
            // go to closed tab
            await this.clickAndWaitForLoadState(storeSupportsAdmin.navTabs.closed);
        }

        await this.clearInputField(storeSupportsAdmin.searchTicket);
        await this.typeAndWaitForResponseAndLoadState(data.subUrls.api.dokan.storeSupport, storeSupportsAdmin.searchTicket, searchKey);
        if (!isNaN(Number(searchKey))) {
            // searched by id
            await this.toHaveCount(storeSupportsAdmin.numberOfRows, 1);
            await this.toBeVisible(storeSupportsAdmin.supportTicketCell(searchKey));
        } else {
            // searched by title
            await this.notToHaveCount(storeSupportsAdmin.numberOfRows, 0);
        }
    }

    // decrease unread support ticket count
    async decreaseUnreadSupportTicketCount(supportTicketId: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.storeSupport);
        const unreadCount = Number(await this.getElementText(storeSupportsAdmin.unreadTicketCount));
        await this.searchSupportTicket(supportTicketId);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.storeSupport, storeSupportsAdmin.supportTicketLink(supportTicketId));
        const getNewUnreadCount = Number(await this.getElementText(storeSupportsAdmin.unreadTicketCount));
        expect(getNewUnreadCount).toEqual(unreadCount - 1);
    }

    // filter store supports
    async filterSupportTickets(input: string, filterBy: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.storeSupport);

        switch (filterBy) {
            case 'by-vendor':
                await this.click(storeSupportsAdmin.filters.filterByVendors);
                await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, storeSupportsAdmin.filters.filterInput, input);
                await this.toContainText(storeSupportsAdmin.filters.result, input);
                await this.press(data.key.enter);
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeSupport, storeSupportsAdmin.filters.filterButton);
                break;

            case 'by-customer':
                await this.click(storeSupportsAdmin.filters.filterByCustomers);
                await this.typeAndWaitForResponse(data.subUrls.api.dokan.storeSupport, storeSupportsAdmin.filters.filterInput, input);
                await this.toContainText(storeSupportsAdmin.filters.result, input);
                await this.press(data.key.enter);
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeSupport, storeSupportsAdmin.filters.filterButton);
                break;

            default:
                break;
        }

        const count = (await this.getElementText(storeSupportsAdmin.numberOfRowsFound))?.split(' ')[0];
        expect(Number(count)).toBeGreaterThan(0);
    }

    // reply to support ticket
    async replySupportTicket(supportTicketId: string, replyMessage: string, replier = 'admin') {
        await this.searchSupportTicket(supportTicketId);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.storeSupport, storeSupportsAdmin.supportTicketLink(supportTicketId));

        if (replier === 'vendor') {
            await this.selectByValue(storeSupportsAdmin.supportTicketDetails.chatAuthor, 'vendor');
        }

        await this.clearAndType(storeSupportsAdmin.supportTicketDetails.chatReply, replyMessage);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeSupport, storeSupportsAdmin.supportTicketDetails.sendReply);
    }

    // update support ticket email notification
    async updateSupportTicketEmailNotification(supportTicketId: string, action: string) {
        await this.searchSupportTicket(supportTicketId);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.storeSupport, storeSupportsAdmin.supportTicketLink(supportTicketId));

        switch (action) {
            case 'enable':
                await this.enableSwitcherAndWaitForResponse(data.subUrls.api.dokan.storeSupport, storeSupportsAdmin.supportTicketDetails.ticketSummary.emailNotification);
                break;

            case 'disable':
                await this.disableSwitcherAndWaitForResponse(data.subUrls.api.dokan.storeSupport, storeSupportsAdmin.supportTicketDetails.ticketSummary.emailNotification);
                break;

            default:
                break;
        }
    }

    // close support ticket
    async closeSupportTicket(supportTicketId: string) {
        await this.searchSupportTicket(supportTicketId);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.storeSupport, storeSupportsAdmin.supportTicketLink(supportTicketId));
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeSupport, storeSupportsAdmin.supportTicketDetails.ticketSummary.closeTicket);
    }

    // reopen support ticket
    async reopenSupportTicket(supportTicketId: string) {
        await this.searchSupportTicket(supportTicketId, true);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.storeSupport, storeSupportsAdmin.supportTicketLink(supportTicketId));
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeSupport, storeSupportsAdmin.supportTicketDetails.ticketSummary.reopenTicket);
    }

    // store support bulk action
    async storeSupportBulkAction(action: string, supportTicketId?: string) {
        await this.goto(data.subUrls.backend.dokan.storeSupport); // not used ternary -> page need to reload before reflecting api update
        if (supportTicketId) await this.searchSupportTicket(supportTicketId);

        // ensure row exists
        await this.notToBeVisible(storeSupportsAdmin.noRowsFound);

        await this.click(storeSupportsAdmin.bulkActions.selectAll);
        await this.selectByValue(storeSupportsAdmin.bulkActions.selectAction, action);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.storeSupport, storeSupportsAdmin.bulkActions.applyAction);
    }

    // vendor

    // vendor store support render properly
    async vendorStoreSupportRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.storeSupport);

        // store support menu elements are visible
        await this.multipleElementVisible(storeSupportsVendor.menus);

        const { filterByCustomerInput, filterByDate, result, ...filters } = storeSupportsVendor.filters;
        await this.toBeVisible(storeSupportsVendor.filters.filterByDate.dateRangeInput);
        await this.multipleElementVisible(filters);

        const noSupportTicket = await this.isVisible(storeSupportsVendor.noSupportTicketFound);
        if (noSupportTicket) {
            console.log('No Support Tickets Found!!');
            return;
        }

        // store support table elements are visible
        await this.multipleElementVisible(storeSupportsVendor.table);
    }

    // vendor view support ticket details
    async vendorViewSupportTicketDetails(supportTicketId: string) {
        await this.vendorSearchSupportTicket('id', supportTicketId);
        await this.clickAndWaitForLoadState(storeSupportsVendor.storeSupportLink(supportTicketId));

        await this.toBeVisible(storeSupportsVendor.supportTicketDetails.backToTickets);

        // basic details elements are visible
        await this.multipleElementVisible(storeSupportsVendor.supportTicketDetails.basicDetails);

        // chat status is visible
        await this.toBeVisible(storeSupportsVendor.supportTicketDetails.chatStatus.status);

        // first chat is visible
        await this.toBeVisible(storeSupportsVendor.supportTicketDetails.chatBox.mainChat);

        // chat reply box elements are visible
        const ticketIsOpen = await this.isVisible(storeSupportsVendor.supportTicketDetails.chatStatus.open);
        const { addReplyText, closeTicketText, ...replyBox } = storeSupportsVendor.supportTicketDetails.replyBox;
        if (ticketIsOpen) {
            await this.toBeVisible(addReplyText);
        } else {
            await this.multipleElementVisible(closeTicketText);
        }
        await this.multipleElementVisible(replyBox);
    }

    // vendor filter support tickets
    async vendorFilterSupportTickets(filterBy: string, inputValue: string | date['dateRange']) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.storeSupport);

        switch (filterBy) {
            case 'by-customer':
                await this.click(storeSupportsVendor.filters.filterByCustomer);
                // await this.clearAndType(storeSupportsVendor.filters.filterByCustomerInput, input);
                await this.typeAndWaitForResponse(data.subUrls.ajax, storeSupportsVendor.filters.filterByCustomerInput, inputValue as string);
                await this.toContainText(storeSupportsVendor.filters.result, inputValue as string);
                await this.clickAndWaitForLoadState(storeSupportsVendor.filters.search);
                await this.notToHaveCount(storeSupportsVendor.storeSupportsCellByCustomer(inputValue as string), 0);
                break;

            case 'by-date':
                if (typeof inputValue !== 'string') {
                    await this.setAttributeValue(storeSupportsVendor.filters.filterByDate.dateRangeInput, 'value', helpers.dateFormatFYJ(inputValue.startDate) + ' - ' + helpers.dateFormatFYJ(inputValue.endDate));
                    await this.setAttributeValue(storeSupportsVendor.filters.filterByDate.startDateInput, 'value', inputValue.startDate);
                    await this.setAttributeValue(storeSupportsVendor.filters.filterByDate.endDateInput, 'value', inputValue.endDate);
                    await this.clickAndWaitForLoadState(storeSupportsVendor.filters.search);
                }
                break;

            default:
                break;
        }
        await this.notToHaveCount(storeSupportsVendor.numOfRowsFound, 0);
    }

    // vendor search support ticket
    async vendorSearchSupportTicket(searchBy: string, input: string, closed?: boolean) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.storeSupport);
        if (closed) {
            await this.clickAndWaitForLoadState(storeSupportsVendor.menus.closedTickets);
        }

        await this.clearAndType(storeSupportsVendor.filters.tickedIdOrKeyword, input);
        await this.clickAndWaitForLoadState(storeSupportsVendor.filters.search);

        switch (searchBy) {
            case 'id':
                await this.toBeVisible(storeSupportsVendor.storeSupportCellById(input));
                break;

            case 'title':
                await this.notToHaveCount(storeSupportsVendor.storeSupportCellByTitle(input), 0);
                break;

            default:
                break;
        }
    }

    // vendor reply to support ticket
    async vendorReplySupportTicket(supportTicketId: string, replyMessage: string) {
        await this.vendorSearchSupportTicket('id', supportTicketId);
        await this.clickAndWaitForLoadState(storeSupportsVendor.storeSupportLink(supportTicketId));
        await this.clearAndType(storeSupportsVendor.chatReply, replyMessage);
        await this.clickAndWaitForResponse('wp-comments-post.php', storeSupportsVendor.submitReply, 302);
    }

    // vendor close support ticket
    async vendorCloseSupportTicket(supportTicketId: string) {
        await this.vendorSearchSupportTicket('id', supportTicketId);
        await this.click(storeSupportsVendor.closeTicket);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.storeSupport, storeSupportsVendor.confirmCloseTicket);
    }

    // vendor reopen support ticket
    async vendorReopenSupportTicket(supportTicketId: string) {
        await this.vendorSearchSupportTicket('id', supportTicketId, true);
        await this.click(storeSupportsVendor.reOpenTicket);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.storeSupport, storeSupportsVendor.confirmCloseTicket);
    }

    // vendor close support ticket with a reply
    async vendorCloseSupportTicketWithReply(supportTicketId: string, replyMessage: string) {
        await this.vendorSearchSupportTicket('id', supportTicketId);
        await this.clickAndWaitForLoadState(storeSupportsVendor.storeSupportLink(supportTicketId));
        await this.toContainText(storeSupportsVendor.ticketStatus, 'Open');
        await this.selectByValue(storeSupportsVendor.changeStatus, '1');
        await this.clearAndType(storeSupportsVendor.chatReply, replyMessage);
        await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.storeSupport, storeSupportsVendor.submitReply);
        await this.toContainText(storeSupportsVendor.ticketStatus, 'Closed');
    }

    // vendor reopen support ticket with a reply
    async vendorReopenSupportTicketWithReply(supportTicketId: string, replyMessage: string) {
        await this.vendorSearchSupportTicket('id', supportTicketId, true);
        await this.clickAndWaitForLoadState(storeSupportsVendor.storeSupportLink(supportTicketId));
        await this.toContainText(storeSupportsVendor.ticketStatus, 'Closed');
        await this.clearAndType(storeSupportsVendor.chatReply, replyMessage);
        await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.storeSupport, storeSupportsVendor.submitReply);
        await this.toContainText(storeSupportsVendor.ticketStatus, 'Open');
    }

    // customer

    // customer store support render properly
    async customerStoreSupportRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.supportTickets);

        // menu elements are visible
        await this.multipleElementVisible(supportsTicketsCustomer.menus);
        const noSupportTicket = await this.isVisible(supportsTicketsCustomer.noSupportTicketFound);
        if (noSupportTicket) {
            console.log('No Support Tickets Found!!');
            return;
        }

        // store support table elements are visible
        await this.multipleElementVisible(supportsTicketsCustomer.table);
    }

    // customer view support ticket details
    async customerViewSupportTicketDetails(supportTicketId: string) {
        await this.goIfNotThere(data.subUrls.frontend.supportTickets);
        const supportTicketIdIsVisible = await this.isVisible(supportsTicketsCustomer.supportTicketLink(supportTicketId));
        if (supportTicketIdIsVisible) {
            await this.clickAndWaitForLoadState(supportsTicketsCustomer.supportTicketLink(supportTicketId));
        } else {
            await this.goIfNotThere(data.subUrls.frontend.supportTicketDetails(supportTicketId));
        }

        await this.toBeVisible(supportsTicketsCustomer.supportTicketDetails.backToTickets);

        // basic details elements are visible
        await this.multipleElementVisible(supportsTicketsCustomer.supportTicketDetails.basicDetails);

        // chat status is visible
        await this.toBeVisible(supportsTicketsCustomer.supportTicketDetails.chatStatus.status);

        // first chat is visible
        await this.toBeVisible(supportsTicketsCustomer.supportTicketDetails.chatBox.mainChat);

        // chat reply box elements are visible is ticket is open
        const ticketIsOpen = await this.isVisible(supportsTicketsCustomer.supportTicketDetails.chatStatus.open);
        if (ticketIsOpen) {
            await this.multipleElementVisible(supportsTicketsCustomer.supportTicketDetails.replyBox);
        } else {
            // closed ticket elements are visible is ticket is close
            await this.multipleElementVisible(supportsTicketsCustomer.supportTicketDetails.closedTicket);
        }
    }

    // customer ask for store support
    async storeSupport(input: string, getSupport: customer['getSupport'], action: string): Promise<void> {
        switch (action) {
            case 'store':
                await this.goIfNotThere(data.subUrls.frontend.vendorDetails(helpers.slugify(input)));
                break;

            case 'product':
                await this.goIfNotThere(data.subUrls.frontend.productDetails(helpers.slugify(input)));
                break;

            case 'order':
                await this.goIfNotThere(data.subUrls.frontend.orderDetails(input));
                break;

            case 'order-received': {
                const [orderId, orderKey] = input.split(',');
                await this.goIfNotThere(data.subUrls.frontend.orderReceivedDetails(orderId as string, orderKey as string));
                break;
            }

            default:
                break;
        }

        await this.clickAndWaitForResponse(data.subUrls.ajax, selector.customer.cSingleStore.storeTabs.getSupport);
        const isGuest = await this.isVisible(storeSupportsCustomer.userName);
        if (isGuest) {
            await this.clearAndType(storeSupportsCustomer.userName, getSupport.username);
            await this.clearAndType(storeSupportsCustomer.userPassword, getSupport.userPassword);
            await this.clickAndWaitForResponse(data.subUrls.ajax, storeSupportsCustomer.login);
        }
        await this.clearAndType(storeSupportsCustomer.subject, getSupport.subject);
        if (getSupport.orderId) {
            await this.selectByValue(storeSupportsCustomer.orderId, getSupport.orderId);
        }
        await this.clearAndType(storeSupportsCustomer.message, getSupport.message);
        await this.clickAndWaitForResponse(data.subUrls.ajax, storeSupportsCustomer.submit);
        await this.toContainText(selector.customer.cDokanSelector.dokanAlertSuccessMessage, getSupport.supportSubmitSuccessMessage);
        // close popup
        await this.click(storeSupportsCustomer.close);
    }

    // customer cant send message to closed support ticket
    async viewOrderReferenceNumberOnSupportTicket(supportTicketId: string, orderId: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.supportTicketDetails(supportTicketId));
        await this.toBeVisible(supportsTicketsCustomer.supportTicketDetails.orderReference.orderReferenceSpan);
        await this.toBeVisible(supportsTicketsCustomer.supportTicketDetails.orderReference.orderReferenceText(orderId));
        await this.toBeVisible(supportsTicketsCustomer.supportTicketDetails.orderReference.orderReferenceLink(orderId));
    }

    // customer send message to  support ticket
    async sendMessageToSupportTicket(supportTicketId: string, supportTicket: customer['supportTicket']): Promise<void> {
        const message = supportTicket.message();
        await this.goIfNotThere(data.subUrls.frontend.supportTicketDetails(supportTicketId));
        await this.clearAndType(supportsTicketsCustomer.supportTicketDetails.replyBox.addReply, message);
        await this.clickAndWaitForResponse(data.subUrls.frontend.submitSupport, supportsTicketsCustomer.supportTicketDetails.replyBox.submitReply, 302);
        await this.toBeVisible(supportsTicketsCustomer.supportTicketDetails.chatText(message));
    }

    // customer can't send message to closed support ticket
    async cantSendMessageToSupportTicket(supportTicketId: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.supportTicketDetails(supportTicketId));
        await this.toBeVisible(supportsTicketsCustomer.supportTicketDetails.chatStatus.closed);
        await this.toBeVisible(supportsTicketsCustomer.supportTicketDetails.closedTicket.closedTicketHeading);
        await this.toContainText(supportsTicketsCustomer.supportTicketDetails.closedTicket.closedTicketMessage, 'This ticket has been closed. Open a new support ticket if you have any further query.');
    }
}
