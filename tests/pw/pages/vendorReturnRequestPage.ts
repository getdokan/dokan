import { Page } from '@playwright/test';
import { VendorPage } from 'pages/vendorPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
import { order } from 'utils/interfaces';
import { helpers } from 'utils/helpers';


export class VendorReturnRequestPage extends VendorPage {

	constructor(page: Page) {
		super(page);
	}


	// return request


	// vendor return request render properly
	async vendorReturnRequestRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.returnRequest);

		// return request menu elements are visible
		await this.toBeVisible(selector.vendor.vReturnRequest.menus.all);

		// return request table elements are visible
		await this.multipleElementVisible(selector.vendor.vReturnRequest.table);

		const noRequestsFound = await this.isVisible(selector.vendor.vReturnRequest.noRowsFound);
		if (noRequestsFound){
			return;
		}

		await this.notToHaveCount(selector.vendor.vReturnRequest.numberOfRowsFound, 0);

	}


	// vendor view rma details
	async vendorViewRmaDetails(orderNumber: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.returnRequest);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.returnRequest, selector.vendor.vReturnRequest.view(orderNumber));

		// back to list is visible
		await this.toBeVisible(selector.vendor.vReturnRequest.returnRequestDetails.backToList);

		// basic details elements are visible
		await this.multipleElementVisible(selector.vendor.vReturnRequest.returnRequestDetails.basicDetails);

		// additional details elements are visible
		await this.multipleElementVisible(selector.vendor.vReturnRequest.returnRequestDetails.additionalDetails);

		// status elements are visible
		
		const { sendRefund, ...status } = selector.vendor.vReturnRequest.returnRequestDetails.status;
		await this.multipleElementVisible(status);

		// conversations elements are visible
		await this.multipleElementVisible(selector.vendor.vReturnRequest.returnRequestDetails.conversations);

	}


	// vendor send rma message
	async vendorSendRmaMessage(orderNumber: string, message: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.returnRequest);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.returnRequest, selector.vendor.vReturnRequest.view(orderNumber));
		await this.clearAndType(selector.vendor.vReturnRequest.returnRequestDetails.conversations.message, message);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.returnRequest, selector.vendor.vReturnRequest.returnRequestDetails.conversations.sendMessage, 302);
		await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, data.customer.rma.sendMessage);
	}


	// vendor update rma status
	async vendorUpdateRmaStatus(orderNumber: string, status: string){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.returnRequest);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.returnRequest, selector.vendor.vReturnRequest.view(orderNumber));
		await this.selectByValue(selector.vendor.vReturnRequest.returnRequestDetails.status.changeStatus, status);
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vReturnRequest.returnRequestDetails.status.update);
	}


	// vendor send rma refund
	async vendorRmaRefund(orderNumber: string, productName: string, status: string){
		// await this.goIfNotThere(data.subUrls.frontend.vDashboard.returnRequest); //todo:
		await this.goto(data.subUrls.frontend.vDashboard.returnRequest);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.returnRequest, selector.vendor.vReturnRequest.view(orderNumber));
		const sendRefundIsVisible = await this.isVisible(selector.vendor.vReturnRequest.returnRequestDetails.status.sendRefund);
		!sendRefundIsVisible && await this.vendorUpdateRmaStatus(orderNumber, status);
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vReturnRequest.returnRequestDetails.status.sendRefund);
		const taxIsVisible = await this.isVisible(selector.vendor.vReturnRequest.returnRequestDetails.modal.taxRefundColumn);
		if (taxIsVisible) {
			const tax = await this.getElementText(selector.vendor.vReturnRequest.returnRequestDetails.modal.taxAmount(productName)) as string;
			await this.type(selector.vendor.vReturnRequest.returnRequestDetails.modal.taxRefund(productName), helpers.removeCurrencySign(tax));
		}
		const subtotal = await this.getElementText(selector.vendor.vReturnRequest.returnRequestDetails.modal.subTotal(productName)) as string;
		await this.type(selector.vendor.vReturnRequest.returnRequestDetails.modal.subTotalRefund(productName), helpers.removeCurrencySign(subtotal));
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.vendor.vReturnRequest.returnRequestDetails.modal.sendRequest);
		await this.toContainText(selector.vendor.vReturnRequest.returnRequestDetails.modal.sendRequestSuccessMessage, 'Already send refund request. Wait for admin approval');
	}


	// vendor delete rma request
	async vendorDeleteRmaRequest(orderNumber: string){
		// await this.goIfNotThere(data.subUrls.frontend.vDashboard.returnRequest); //todo:
		await this.goto(data.subUrls.frontend.vDashboard.returnRequest);
		await this.hover(selector.vendor.vReturnRequest.returnRequestCell(orderNumber));
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.returnRequest, selector.vendor.vReturnRequest.delete(orderNumber));
		await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, 'Return Request has been deleted successfully');
	}


	// customer

	// customer return request render properly
	async customerReturnRequestRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.rmaRequests);

		// allRequestText is  visible
		await this.toBeVisible(selector.customer.cRma.allRequestText);

		// return request table elements are visible
		await this.multipleElementVisible(selector.customer.cRma.table);

		const noRequestsFound = await this.isVisible(selector.customer.cRma.noRowsFound);
		if (noRequestsFound){
			console.log('No request found');
			return;
		}

		await this.notToHaveCount(selector.customer.cRma.numberOfRowsFound, 0);

	}


	// customer request warranty
	async customerRequestWarranty(orderNumber: string, productName: string, refund: order['requestWarranty']){
		await this.goIfNotThere(data.subUrls.frontend.myOrders);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.requestWarranty, selector.customer.cMyOrders.orderRequestWarranty(orderNumber));

		await this.click(selector.customer.cOrders.requestWarranty.warrantyRequestItemCheckbox(productName));
		await this.selectByValue(selector.customer.cOrders.requestWarranty.warrantyRequestItemQuantity(productName), refund.itemQuantity);
		await this.selectByValue(selector.customer.cOrders.requestWarranty.warrantyRequestType, refund.refundRequestType);
		const refundReasonIsVisible = await this.isVisible(selector.customer.cOrders.requestWarranty.warrantyRequestReason);
		refundReasonIsVisible && await this.selectByValue(selector.customer.cOrders.requestWarranty.warrantyRequestReason, refund.refundRequestReasons);
		await this.clearAndType(selector.customer.cOrders.requestWarranty.warrantyRequestDetails, refund.refundRequestDetails);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.requestWarranty, selector.customer.cOrders.requestWarranty.warrantySubmitRequest, 302);
		await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, refund.refundSubmitSuccessMessage);
	}


	// customer send Rma message
	async customerSendRmaMessage(orderNumber: string, message: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.rmaRequests);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.viewRmaRequests, selector.customer.cRma.view(orderNumber));
		await this.clearAndType(selector.customer.cRma.message, message);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.viewRmaRequests, selector.customer.cRma.sendMessage);
		await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, data.customer.rma.sendMessage);
	}

}
