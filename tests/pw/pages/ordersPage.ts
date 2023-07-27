import { Page, expect } from '@playwright/test';
import { VendorPage } from 'pages/vendorPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
import { orderNote, orderTrackingDetails, orderShipmentDetails } from 'utils/interfaces';


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
		const { filterByCustomer,  ...filters } = selector.vendor.orders.filters;
		await this.multipleElementVisible(filters); //todo: add dropdown selector

		// order search elements are visible
		await this.multipleElementVisible(selector.vendor.orders.search);

		// bulk action elements are visible
		await this.multipleElementVisible(selector.vendor.orders.bulkActions);

		// table elements are visible
		await this.multipleElementVisible(selector.vendor.orders.table);
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
	}


	// filter orders
	async filterOrders(filterType: string, value: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.orders);

		switch(filterType){

		case 'by-customer' :
			await this.click(selector.vendor.orders.filters.filterByCustomer.dropDown);
			await this.typeAndWaitForResponse(data.subUrls.ajax, selector.vendor.orders.filters.filterByCustomer.input, value);
			await this.click(selector.vendor.orders.filters.filterByCustomer.searchedResult);
			break;

		case 'by-date' :
			// await this.selectByLabel(selector.vendor.orders.filters.filterByDate, value); //TODO
			break;

		default :
			break;
		}

		// await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.products, selector.vendor.product.filters.filter);
		await this.clickAndWaitForNavigation(selector.vendor.orders.filters.filter);
		await this.notToHaveCount(selector.vendor.orders.numberOfRows, 0);

	}


	// go to order details
	async goToOrderDetails(orderNumber: string): Promise<void> {
		await this.searchOrder(orderNumber);
		await this.clickAndWaitForNavigation(selector.vendor.orders.view(orderNumber));
		await this.toContainText(selector.vendor.orders.orderNumber, orderNumber);
	}


	// view order details
	async viewOrderDetails(orderNumber: string): Promise<void> {
		await this.goToOrderDetails(orderNumber);
		//todo:  add more files to assert
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
		await this.click(selector.vendor.orders.edit);
		await this.selectByValue(selector.vendor.orders.orderStatus, status);
		await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, selector.vendor.orders.updateOrderStatus);
		const currentStatus = await this.getElementText( selector.vendor.orders.currentOrderStatus);
		expect(currentStatus?.toLowerCase()).toBe(status.split('-').pop());
		// expect(currentOrderStatus?.toLowerCase()).toMatch((orderStatus.replace(/(^wc)|(\W)/g, '')).toLowerCase());
	}


	// add order note
	async addOrderNote(orderNumber: string, orderNote: orderNote): Promise<void> {
		await this.goToOrderDetails(orderNumber);
		await this.clearAndType(selector.vendor.orders.orderNote.orderNoteInput, orderNote.note);
		await this.selectByLabel(selector.vendor.orders.orderNote.orderNoteType, orderNote.noteType);
		await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, selector.vendor.orders.orderNote.addNote);
		//todo:  add new test customer can view order note
	}


	// add tracking details
	async addTrackingDetails(orderNumber: string, orderTrackingDetails: orderTrackingDetails): Promise<void> {
		await this.goToOrderDetails(orderNumber);
		await this.click(selector.vendor.orders.trackingDetails.addTrackingNumber);
		await this.clearAndType(selector.vendor.orders.trackingDetails.shippingProvider, orderTrackingDetails.shippingProvider);
		await this.clearAndType(selector.vendor.orders.trackingDetails.trackingNumber, orderTrackingDetails.trackingNumber);
		// await this.clearAndType(selector.vendor.orders.trackingDetails.dateShipped, orderTrackingDetails.dateShipped); //todo:  grab site date formate and based on that create date value
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
		// await this.clearAndType(selector.vendor.orders.shipment.dateShipped, shipmentDetails.dateShipped); //todo:  grab site date formate and based on that create date value
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
		await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, selector.vendor.orders.downloadableProductPermission.grantAccess); //todo:  need to fix
	}


	// add Downloadable Product
	async removeDownloadableProduct(orderNumber: string, downloadableProductName: string): Promise<void> {
		await this.addDownloadableProduct(orderNumber, downloadableProductName); // todo: do it via api
		await this.click(selector.vendor.orders.downloadableProductPermission.revokeAccess);
		await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, selector.vendor.orders.downloadableProductPermission.confirmAction);
	}


	// order bulk action
	async orderBulkAction(action: string, orderNumber?: string): Promise<void> {
		if(orderNumber){
			await this.searchOrder(orderNumber);
		} else {
			await this.goIfNotThere(data.subUrls.frontend.vDashboard.orders);
		}

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

		await this.clickAndAcceptAndWaitForResponse(data.subUrls.frontend.vDashboard.orders, selector.vendor.orders.bulkActions.applyAction);
		//todo: 
	}


}
