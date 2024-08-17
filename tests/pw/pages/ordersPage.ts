import { Page, expect } from '@playwright/test';
import { VendorPage } from '@pages/vendorPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';
import { orderNote, orderTrackingDetails, orderShipmentDetails, date } from '@utils/interfaces';

const { DOKAN_PRO } = process.env;

// selectors
const ordersVendor = selector.vendor.orders;

export class OrdersPage extends VendorPage {
    constructor(page: Page) {
        super(page);
    }

    // orders

    // orders render properly
    async vendorOrdersRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.orders);

        // order nav menus are visible
        await this.multipleElementVisible(ordersVendor.menus);

        // export elements are visible
        await this.multipleElementVisible(ordersVendor.export);

        // order filters elements are visible
        const { filterByCustomer, filterByDate, ...filters } = ordersVendor.filters;
        await this.toBeVisible(ordersVendor.filters.filterByCustomer.dropDown);
        await this.toBeVisible(ordersVendor.filters.filterByDate.dateRangeInput);
        await this.multipleElementVisible(filters);

        // order search elements are visible
        await this.multipleElementVisible(ordersVendor.search);

        // bulk action elements are visible
        await this.multipleElementVisible(ordersVendor.bulkActions);

        // table elements are visible
        const { shipmentColumn, ...table } = ordersVendor.table;
        await this.multipleElementVisible(table);
        if (DOKAN_PRO) await this.toBeVisible(shipmentColumn);
    }

    // export orders
    async exportOrders(type: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.orders);

        switch (type) {
            case 'all':
                // await this.clickAndAcceptAndWaitForResponse(data.subUrls.frontend.vDashboard.orders, ordersVendor.export.exportAll );
                await this.clickAndWaitForDownload(ordersVendor.export.exportAll);
                break;

            case 'filtered':
                // await this.clickAndAcceptAndWaitForResponse(data.subUrls.frontend.vDashboard.orders, ordersVendor.export.exportFiltered );
                await this.clickAndWaitForDownload(ordersVendor.export.exportFiltered);
                break;

            default:
                break;
        }
    }

    // search order
    async searchOrder(orderNumber: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.orders);

        await this.clearAndType(ordersVendor.search.searchInput, orderNumber);
        await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.orders, ordersVendor.search.searchBtn);
        await this.toBeVisible(ordersVendor.orderLink(orderNumber));
        await this.toHaveCount(ordersVendor.numberOfRowsFound, 1);
    }

    // filter orders
    async filterOrders(filterBy: string, inputValue: string | date['dateRange']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.orders);

        switch (filterBy) {
            case 'by-customer':
                await this.click(ordersVendor.filters.filterByCustomer.dropDown);
                await this.typeAndWaitForResponse(data.subUrls.ajax, ordersVendor.filters.filterByCustomer.input, inputValue as string);
                await this.click(ordersVendor.filters.filterByCustomer.searchedResult);
                break;

            case 'by-date':
                if (typeof inputValue !== 'string') {
                    await this.setAttributeValue(ordersVendor.filters.filterByDate.dateRangeInput, 'value', helpers.dateFormatFYJ(inputValue.startDate) + ' - ' + helpers.dateFormatFYJ(inputValue.endDate));
                    await this.setAttributeValue(ordersVendor.filters.filterByDate.startDateInput, 'value', inputValue.startDate);
                    await this.setAttributeValue(ordersVendor.filters.filterByDate.endDateInput, 'value', inputValue.endDate);
                }
                break;

            default:
                break;
        }

        await this.clickAndWaitForLoadState(ordersVendor.filters.filter);
        await this.notToHaveCount(ordersVendor.numberOfRowsFound, 0);
    }

    // go to order details
    async goToOrderDetails(orderNumber: string): Promise<void> {
        await this.searchOrder(orderNumber);
        await this.clickAndWaitForLoadState(ordersVendor.view(orderNumber));
        await this.toContainText(ordersVendor.orderDetails.orderNumber, orderNumber);
    }

    // view order details
    async viewOrderDetails(orderNumber: string): Promise<void> {
        await this.goToOrderDetails(orderNumber);

        // order details elements are visible
        await this.toBeVisible(ordersVendor.orderDetails.orderNumber);
        await this.toBeVisible(ordersVendor.orderDetails.orderDate);
        if (DOKAN_PRO) {
            await this.toBeVisible(ordersVendor.orderDetails.orderTotal);
        } else {
            await this.toBeVisible(ordersVendor.orderDetails.total);
        }
        // todo:  add more fields to assert

        // general details elements are visible
        await this.multipleElementVisible(ordersVendor.generalDetails);

        await this.click(ordersVendor.status.edit);

        // status elements are visible
        const { selectedOrderStatus, edit, ...status } = ordersVendor.status;
        await this.multipleElementVisible(status);

        // order note elements are visible
        await this.multipleElementVisible(ordersVendor.orderNote);

        if (DOKAN_PRO) {
            await this.click(ordersVendor.shipment.createNewShipment);
            // shipment elements are visible
            const { createNewShipment, shipmentOrderItem, shipmentOrderItemQty, ...shipment } = ordersVendor.shipment;
            await this.multipleElementVisible(shipment);
        } else {
            await this.click(ordersVendor.trackingDetails.addTrackingNumber);
            // tracking detail elements are visible
            const { addTrackingNumber, ...trackingDetails } = ordersVendor.trackingDetails;
            await this.multipleElementVisible(trackingDetails);
        }

        // downloadable product elements are visible
        const { revokeAccess, confirmAction, cancelAction, ...downloadableProductPermission } = ordersVendor.downloadableProductPermission;
        await this.multipleElementVisible(downloadableProductPermission);
    }

    // update order status on table
    async updateOrderStatusOnTable(orderNumber: string, status: string): Promise<void> {
        await this.searchOrder(orderNumber);
        switch (status) {
            case 'processing':
                await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, ordersVendor.processing(orderNumber), 302);
                await this.notToBeVisible(ordersVendor.processing(orderNumber));
                break;

            case 'complete':
                await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, ordersVendor.complete(orderNumber), 302);
                await this.notToBeVisible(ordersVendor.complete(orderNumber));
                break;

            default:
                break;
        }
    }

    // update order status
    async updateOrderStatus(orderNumber: string, status: string): Promise<void> {
        await this.goToOrderDetails(orderNumber);
        await this.click(ordersVendor.status.edit);
        await this.selectByValue(ordersVendor.status.orderStatus, status);
        await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, ordersVendor.status.updateOrderStatus);
        const currentStatus = await this.getElementText(ordersVendor.status.currentOrderStatus);
        expect(currentStatus?.toLowerCase()).toBe(status.split('-').pop());
        // expect(currentOrderStatus?.toLowerCase()).toMatch((orderStatus.replace(/(^wc)|(\W)/g, '')).toLowerCase());
    }

    // add order note
    async addOrderNote(orderNumber: string, orderNote: orderNote): Promise<void> {
        await this.goToOrderDetails(orderNumber);
        await this.clearAndType(ordersVendor.orderNote.orderNoteInput, orderNote.note);
        await this.selectByLabel(ordersVendor.orderNote.orderNoteType, orderNote.noteType);
        await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, ordersVendor.orderNote.addNote);
    }

    // add tracking details
    async addTrackingDetails(orderNumber: string, orderTrackingDetails: orderTrackingDetails): Promise<void> {
        await this.goToOrderDetails(orderNumber);
        await this.click(ordersVendor.trackingDetails.addTrackingNumber);
        await this.clearAndType(ordersVendor.trackingDetails.shippingProvider, orderTrackingDetails.shippingProvider);
        await this.clearAndType(ordersVendor.trackingDetails.trackingNumber, orderTrackingDetails.trackingNumber);
        await this.setAttributeValue(ordersVendor.trackingDetails.dateShipped, 'value', helpers.dateFormatFYJ(orderTrackingDetails.dateShipped));
        await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, ordersVendor.trackingDetails.addTrackingDetails);
    }

    // add shipment
    async addShipment(orderNumber: string, shipmentDetails: orderShipmentDetails): Promise<void> {
        await this.goToOrderDetails(orderNumber);
        await this.click(ordersVendor.shipment.createNewShipment);
        await this.click(ordersVendor.shipment.shipmentOrderItem(shipmentDetails.shipmentOrderItem));
        await this.clearAndType(ordersVendor.shipment.shipmentOrderItemQty(shipmentDetails.shipmentOrderItem), shipmentDetails.shipmentOrderItemQty);
        await this.selectByValue(ordersVendor.shipment.shippingStatus, shipmentDetails.shippingStatus);
        await this.selectByValue(ordersVendor.shipment.shippingProvider, shipmentDetails.shippingProvider);
        await this.setAttributeValue(ordersVendor.shipment.dateShipped, 'value', helpers.dateFormatFYJ(shipmentDetails.dateShipped));
        await this.clearAndType(ordersVendor.shipment.trackingNumber, shipmentDetails.shippingProvider);
        await this.clearAndType(ordersVendor.shipment.comments, shipmentDetails.trackingNumber);
        await this.click(ordersVendor.shipment.notifyCustomer);
        await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, ordersVendor.shipment.createShipment);
        // todo: add more assertion, success message, or short shipment description div
        // todo: also assert on my order details or add new test
    }

    // todo:  update shipment test, shipment updates timeline

    // add Downloadable Product
    async addDownloadableProduct(orderNumber: string, downloadableProductName: string): Promise<void> {
        await this.goToOrderDetails(orderNumber);
        await this.clearAndType(ordersVendor.downloadableProductPermission.downloadableProductInput, downloadableProductName);
        await this.press(data.key.enter);
        await this.clickAndAcceptAndWaitForResponseAndLoadState(data.subUrls.ajax, ordersVendor.downloadableProductPermission.grantAccess); // todo:  need to fix
    }

    // add Downloadable Product
    async removeDownloadableProduct(orderNumber: string, downloadableProductName: string): Promise<void> {
        await this.addDownloadableProduct(orderNumber, downloadableProductName); // todo: do it via api
        await this.click(ordersVendor.downloadableProductPermission.revokeAccess);
        await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, ordersVendor.downloadableProductPermission.confirmAction);
    }

    // order bulk action
    async orderBulkAction(action: string, orderNumber?: string): Promise<void> {
        if (orderNumber) {
            await this.searchOrder(orderNumber);
        } else {
            await this.goIfNotThere(data.subUrls.frontend.vDashboard.orders);
        }

        await this.click(ordersVendor.bulkActions.selectAll);
        switch (action) {
            case 'onhold':
                await this.selectByValue(ordersVendor.bulkActions.selectAction, 'wc-on-hold');
                break;

            case 'processing':
                await this.selectByValue(ordersVendor.bulkActions.selectAction, 'wc-processing');
                break;

            case 'completed':
                await this.selectByValue(ordersVendor.bulkActions.selectAction, 'wc-completed');
                break;

            default:
                break;
        }

        await this.clickAndAcceptAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.orders, ordersVendor.bulkActions.applyAction);
    }
}
