import { Page, expect } from '@playwright/test';
import { VendorPage } from 'pages/vendorPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
import { helpers } from 'utils/helpers';
import { orderNote, orderTrackingDetails, orderShipmentDetails, date } from 'utils/interfaces';


const { DOKAN_PRO } = process.env;


export class OrdersPage extends VendorPage {

	constructor(page: Page) {
		super(page);
	}


	// orders


	// orders render properly
	async vendorOrdersRenderProperly(): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.orders);

		// order nav menus are visible
		await this.multipleElementVisible(selector.vendor.orders.menus);

		// export elements are visible
		await this.multipleElementVisible(selector.vendor.orders.export);

		// order filters elements are visible
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { filterByCustomer, filterByDate, ...filters } = selector.vendor.orders.filters;
		await this.toBeVisible(selector.vendor.orders.filters.filterByCustomer.dropDown);
		await this.toBeVisible(selector.vendor.orders.filters.filterByDate.dateRangeInput);
		await this.multipleElementVisible(filters);

		// order search elements are visible
		await this.multipleElementVisible(selector.vendor.orders.search);

		// bulk action elements are visible
		await this.multipleElementVisible(selector.vendor.orders.bulkActions);

		// table elements are visible
		const { shipmentColumn, ...table } = selector.vendor.orders.table;
		await this.multipleElementVisible(table);
		DOKAN_PRO && await this.toBeVisible(shipmentColumn);
	}


	// export orders
	async exportOrders(type: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.orders);

		switch(type){

		case 'all' :
			// await this.clickAndAcceptAndWaitForResponse(data.subUrls.frontend.vDashboard.orders, selector.vendor.orders.export.exportAll );
			await this.clickAndWaitForDownload(selector.vendor.orders.export.exportAll );
			break;

		case 'filtered' :
			// await this.clickAndAcceptAndWaitForResponse(data.subUrls.frontend.vDashboard.orders, selector.vendor.orders.export.exportFiltered );
			await this.clickAndWaitForDownload(selector.vendor.orders.export.exportFiltered );
			break;

		default :
			break;
		}

	}


	// search order
	async searchOrder(orderNumber: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.orders);

		await this.clearAndType(selector.vendor.orders.search.searchInput, orderNumber);
		await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.orders, selector.vendor.orders.search.searchBtn);
		await this.toBeVisible(selector.vendor.orders.orderLink(orderNumber));
		await this.toHaveCount(selector.vendor.orders.numberOfRowsFound, 1);
	}


	// filter orders
	async filterOrders(filterBy: string, inputValue: string | date['dateRange']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.orders);

		switch(filterBy){

		case 'by-customer' :
			await this.click(selector.vendor.orders.filters.filterByCustomer.dropDown);
			await this.typeAndWaitForResponse(data.subUrls.ajax, selector.vendor.orders.filters.filterByCustomer.input, inputValue as string);
			await this.click(selector.vendor.orders.filters.filterByCustomer.searchedResult);
			break;

		case 'by-date' :
			await this.setAttributeValue(selector.vendor.orders.filters.filterByDate.dateRangeInput, 'value', helpers.dateFormatFYJ(inputValue.startDate) + ' - ' + helpers.dateFormatFYJ(inputValue.endDate));
			await this.setAttributeValue(selector.vendor.orders.filters.filterByDate.startDateInput, 'value', inputValue.startDate); //todo: resolve this
			await this.setAttributeValue(selector.vendor.orders.filters.filterByDate.endDateInput, 'value', inputValue.endDate);
			break;

		default :
			break;
		}

		await this.clickAndWaitForLoadState(selector.vendor.orders.filters.filter);
		await this.notToHaveCount(selector.vendor.orders.numberOfRowsFound, 0);

	}


	// go to order details
	async goToOrderDetails(orderNumber: string): Promise<void> {
		await this.searchOrder(orderNumber);
		await this.clickAndWaitForLoadState(selector.vendor.orders.view(orderNumber));
		await this.toContainText(selector.vendor.orders.orderDetails.orderNumber, orderNumber);
	}


	// view order details
	async viewOrderDetails(orderNumber: string): Promise<void> {
		await this.goToOrderDetails(orderNumber);

		// order details elements are visible
		await this.toBeVisible(selector.vendor.orders.orderDetails.orderNumber);
		await this.toBeVisible(selector.vendor.orders.orderDetails.orderDate);
		DOKAN_PRO ? await this.toBeVisible(selector.vendor.orders.orderDetails.orderTotal): await this.toBeVisible(selector.vendor.orders.orderDetails.total);
		//todo:  add more fields to assert

		// general details elements are visible
		await this.multipleElementVisible(selector.vendor.orders.generalDetails);

		await this.click(selector.vendor.orders.status.edit);

		// status elements are visible
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { selectedOrderStatus, edit, ...status } = selector.vendor.orders.status;
		await this.multipleElementVisible(status);

		// order note elements are visible
		await this.multipleElementVisible(selector.vendor.orders.orderNote);

		await this.click(selector.vendor.orders.trackingDetails.addTrackingNumber);

		// tracking detail elements are visible
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { addTrackingNumber,  ...trackingDetails } = selector.vendor.orders.trackingDetails;
		await this.multipleElementVisible(trackingDetails);

		if (DOKAN_PRO){
			await this.click(selector.vendor.orders.shipment.createNewShipment);

			// shipment elements are visible
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { createNewShipment, shipmentOrderItem, shipmentOrderItemQty,  ...shipment } = selector.vendor.orders.shipment;
			await this.multipleElementVisible(shipment);
		}

		// downloadable product elements are visible
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { revokeAccess, confirmAction, cancelAction,  ...downloadableProductPermission } = selector.vendor.orders.downloadableProductPermission;
		await this.multipleElementVisible(downloadableProductPermission);
	}


	// update order status on table
	async updateOrderStatusOnTable(orderNumber: string, status: string): Promise<void> {
		await this.searchOrder(orderNumber);
		switch(status){

		case 'processing' :
			await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, selector.vendor.orders.processing(orderNumber), 302);
			await this.notToBeVisible(selector.vendor.orders.processing(orderNumber));
			break;

		case 'complete' :
			await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, selector.vendor.orders.complete(orderNumber), 302);
			await this.notToBeVisible(selector.vendor.orders.complete(orderNumber));
			break;

		default :
			break;
		}
	}


	// update order status
	async updateOrderStatus(orderNumber: string, status: string): Promise<void> {
		await this.goToOrderDetails(orderNumber);
		await this.click(selector.vendor.orders.status.edit);
		await this.selectByValue(selector.vendor.orders.status.orderStatus, status);
		await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, selector.vendor.orders.status.updateOrderStatus);
		const currentStatus = await this.getElementText( selector.vendor.orders.status.currentOrderStatus);
		expect(currentStatus?.toLowerCase()).toBe(status.split('-').pop());
		// expect(currentOrderStatus?.toLowerCase()).toMatch((orderStatus.replace(/(^wc)|(\W)/g, '')).toLowerCase());
	}


	// add order note
	async addOrderNote(orderNumber: string, orderNote: orderNote): Promise<void> {
		await this.goToOrderDetails(orderNumber);
		await this.clearAndType(selector.vendor.orders.orderNote.orderNoteInput, orderNote.note);
		await this.selectByLabel(selector.vendor.orders.orderNote.orderNoteType, orderNote.noteType);
		await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, selector.vendor.orders.orderNote.addNote);
	}


	// add tracking details
	async addTrackingDetails(orderNumber: string, orderTrackingDetails: orderTrackingDetails): Promise<void> {
		await this.goToOrderDetails(orderNumber);
		await this.click(selector.vendor.orders.trackingDetails.addTrackingNumber);
		await this.clearAndType(selector.vendor.orders.trackingDetails.shippingProvider, orderTrackingDetails.shippingProvider);
		await this.clearAndType(selector.vendor.orders.trackingDetails.trackingNumber, orderTrackingDetails.trackingNumber);
		await this.setAttributeValue(selector.vendor.orders.trackingDetails.dateShipped, 'value', helpers.dateFormatFYJ(orderTrackingDetails.dateShipped));
		await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, selector.vendor.orders.trackingDetails.addTrackingDetails);
	}


	// add shipment
	async addShipment(orderNumber: string, shipmentDetails: orderShipmentDetails): Promise<void> {
		await this.goToOrderDetails(orderNumber);
		await this.click(selector.vendor.orders.shipment.createNewShipment);
		await this.click(selector.vendor.orders.shipment.shipmentOrderItem(shipmentDetails.shipmentOrderItem));
		await this.clearAndType(selector.vendor.orders.shipment.shipmentOrderItemQty(shipmentDetails.shipmentOrderItem), shipmentDetails.shipmentOrderItemQty );
		await this.selectByValue(selector.vendor.orders.shipment.shippingStatus, shipmentDetails.shippingStatus);
		await this.selectByValue(selector.vendor.orders.shipment.shippingProvider, shipmentDetails.shippingProvider);
		await this.setAttributeValue(selector.vendor.orders.shipment.dateShipped, 'value', helpers.dateFormatFYJ(shipmentDetails.dateShipped));
		await this.clearAndType(selector.vendor.orders.shipment.trackingNumber, shipmentDetails.shippingProvider);
		await this.clearAndType(selector.vendor.orders.shipment.comments, shipmentDetails.trackingNumber);
		await this.click(selector.vendor.orders.shipment.notifyCustomer);
		await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, selector.vendor.orders.shipment.createShipment);
		//todo: add more assertion, success message, or short shipment description div
		//todo: also assert on my order details or add new test
	}

	//todo:  update shipment test, shipment updates timeline


	// add Downloadable Product
	async addDownloadableProduct(orderNumber: string, downloadableProductName: string): Promise<void> {
		await this.goToOrderDetails(orderNumber);
		await this.clearAndType(selector.vendor.orders.downloadableProductPermission.downloadableProductInput, downloadableProductName);
		await this.press(data.key.enter);
		await this.clickAndAcceptAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.vendor.orders.downloadableProductPermission.grantAccess); //todo:  need to fix
	}


	// add Downloadable Product
	async removeDownloadableProduct(orderNumber: string, downloadableProductName: string): Promise<void> {
		await this.addDownloadableProduct(orderNumber, downloadableProductName); //todo: do it via api
		await this.click(selector.vendor.orders.downloadableProductPermission.revokeAccess);
		await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, selector.vendor.orders.downloadableProductPermission.confirmAction);
	}


	// order bulk action
	async orderBulkAction(action: string, orderNumber?: string): Promise<void> {
		orderNumber ? await this.searchOrder(orderNumber) : await this.goIfNotThere(data.subUrls.frontend.vDashboard.orders);

		await this.click(selector.vendor.orders.bulkActions.selectAll);
		switch(action){

		case 'onhold' :
			await this.selectByValue(selector.vendor.orders.bulkActions.selectAction, 'wc-on-hold');
			break;

		case 'processing' :
			await this.selectByValue(selector.vendor.orders.bulkActions.selectAction, 'wc-processing');
			break;

		case 'completed' :
			await this.selectByValue(selector.vendor.orders.bulkActions.selectAction, 'wc-completed');
			break;

		default :
			break;
		}

		await this.clickAndAcceptAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.orders, selector.vendor.orders.bulkActions.applyAction);
	}


}
