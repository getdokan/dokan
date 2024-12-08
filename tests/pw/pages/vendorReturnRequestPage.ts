import { Page } from '@playwright/test';
import { VendorPage } from '@pages/vendorPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { order } from '@utils/interfaces';
import { helpers } from '@utils/helpers';

// selectors
const returnRequestVendor = selector.vendor.vReturnRequest;
const returnRequestSettingsVendor = selector.vendor.vRmaSettings;

export class VendorReturnRequestPage extends VendorPage {
    constructor(page: Page) {
        super(page);
    }

    // return request

    // enable rma module
    async enableRmaModule() {
        // dokan settings
        await this.goto(data.subUrls.backend.dokan.settings);
        await this.toBeVisible(selector.admin.dokan.settings.menus.rma);

        // vendor dashboard menu
        await this.goto(data.subUrls.frontend.vDashboard.dashboard);
        await this.toBeVisible(selector.vendor.vDashboard.menus.primary.returnRequest);

        // vendor dashboard settings menu
        await this.hover(selector.vendor.vDashboard.menus.primary.settings);
        await this.toBeVisible(selector.vendor.vDashboard.menus.subMenus.rma);
    }

    // disable rma module
    async disableRmaModule() {
        // dokan settings
        await this.goto(data.subUrls.backend.dokan.settings);
        await this.notToBeVisible(selector.admin.dokan.settings.menus.rma);

        // vendor dashboard menu
        await this.goto(data.subUrls.frontend.vDashboard.dashboard);
        await this.notToBeVisible(selector.vendor.vDashboard.menus.primary.returnRequest);

        // vendor dashboard menu page
        await this.goto(data.subUrls.frontend.vDashboard.returnRequest);
        await this.notToBeVisible(selector.vendor.vDashboard.dashboardDiv);

        // vendor dashboard settings menu
        await this.hover(selector.vendor.vDashboard.menus.primary.settings);
        await this.notToBeVisible(selector.vendor.vDashboard.menus.subMenus.rma);

        // vendor dashboard settings menu page
        await this.goto(data.subUrls.frontend.vDashboard.settingsDeliveryTime);
        await this.notToBeVisible(returnRequestSettingsVendor.rmaSettingsDiv);
    }

    // vendor return request render properly
    async vendorReturnRequestRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.returnRequest);

        // return request menu elements are visible
        await this.toBeVisible(returnRequestVendor.menus.all);

        // return request table elements are visible
        await this.multipleElementVisible(returnRequestVendor.table);

        const noRequestsFound = await this.isVisible(returnRequestVendor.noRowsFound);
        if (noRequestsFound) {
            return;
        }

        await this.notToHaveCount(returnRequestVendor.numberOfRowsFound, 0);
    }

    // vendor rma settings render properly
    async vendorRmaSettingsRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsRma);

        // settings text is visible
        await this.toBeVisible(returnRequestSettingsVendor.returnAndWarrantyText);

        // visit store link is visible
        await this.toBeVisible(returnRequestSettingsVendor.visitStore);

        // rma elements are visible
        await this.toBeVisible(returnRequestSettingsVendor.label);
        await this.toBeVisible(returnRequestSettingsVendor.type);
        await this.notToHaveCount(returnRequestSettingsVendor.refundReasons, 0);
        await this.toBeVisible(returnRequestSettingsVendor.rmaPolicyIframe);

        // save changes is visible
        await this.toBeVisible(returnRequestSettingsVendor.saveChanges);
    }

    // vendor view rma details
    async vendorViewRmaDetails(orderNumber: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.returnRequest);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.returnRequest, returnRequestVendor.view(orderNumber));

        // back to list is visible
        await this.toBeVisible(returnRequestVendor.returnRequestDetails.backToList);

        // basic details elements are visible
        await this.multipleElementVisible(returnRequestVendor.returnRequestDetails.basicDetails);

        // additional details elements are visible
        await this.multipleElementVisible(returnRequestVendor.returnRequestDetails.additionalDetails);

        // status elements are visible
        const { sendRefund, ...status } = returnRequestVendor.returnRequestDetails.status;
        await this.multipleElementVisible(status);

        // conversations elements are visible
        await this.multipleElementVisible(returnRequestVendor.returnRequestDetails.conversations);
    }

    // vendor send rma message
    async vendorSendRmaMessage(orderNumber: string, message: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.returnRequest);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.returnRequest, returnRequestVendor.view(orderNumber));
        await this.clearAndType(returnRequestVendor.returnRequestDetails.conversations.message, message);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.returnRequest, returnRequestVendor.returnRequestDetails.conversations.sendMessage, 302);
        await this.toBeVisible(selector.customer.cWooSelector.wooCommerceSuccessMessage);
        await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, data.customer.rma.sendMessage);
    }

    // vendor update rma status
    async vendorUpdateRmaStatus(orderNumber: string, status: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.returnRequest);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.returnRequest, returnRequestVendor.view(orderNumber));
        await this.selectByValue(returnRequestVendor.returnRequestDetails.status.changeStatus, status);
        await this.clickAndWaitForResponse(data.subUrls.ajax, returnRequestVendor.returnRequestDetails.status.update);
    }

    // vendor send rma refund
    async vendorRmaRefund(orderNumber: string, productName: string, status: string) {
        // await this.goIfNotThere(data.subUrls.frontend.vDashboard.returnRequest); // todo: resolve this
        await this.goto(data.subUrls.frontend.vDashboard.returnRequest);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.returnRequest, returnRequestVendor.view(orderNumber));
        const sendRefundIsVisible = await this.isVisible(returnRequestVendor.returnRequestDetails.status.sendRefund);
        if (!sendRefundIsVisible) {
            await this.vendorUpdateRmaStatus(orderNumber, status);
        }
        await this.clickAndWaitForResponse(data.subUrls.ajax, returnRequestVendor.returnRequestDetails.status.sendRefund);
        const taxIsVisible = await this.isVisible(returnRequestVendor.returnRequestDetails.modal.taxRefundColumn);
        if (taxIsVisible) {
            const tax = (await this.getElementText(returnRequestVendor.returnRequestDetails.modal.taxAmount(productName))) as string;
            await this.type(returnRequestVendor.returnRequestDetails.modal.taxRefund(productName), helpers.removeCurrencySign(tax));
        }
        const subtotal = (await this.getElementText(returnRequestVendor.returnRequestDetails.modal.subTotal(productName))) as string;
        await this.type(returnRequestVendor.returnRequestDetails.modal.subTotalRefund(productName), helpers.removeCurrencySign(subtotal));
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, returnRequestVendor.returnRequestDetails.modal.sendRequest);
        await this.toContainText(returnRequestVendor.returnRequestDetails.modal.sendRequestSuccessMessage, 'Already send refund request. Wait for admin approval');
    }

    // vendor delete rma request
    async vendorDeleteRmaRequest(orderNumber: string) {
        // await this.goIfNotThere(data.subUrls.frontend.vDashboard.returnRequest); // todo: resolve this
        await this.goto(data.subUrls.frontend.vDashboard.returnRequest);
        await this.hover(returnRequestVendor.returnRequestCell(orderNumber));
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.returnRequest, returnRequestVendor.delete(orderNumber));
        await this.toBeVisible(selector.customer.cWooSelector.wooCommerceSuccessMessage);
        await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, 'Return Request has been deleted successfully');
    }

    // customer

    // customer return request render properly
    async customerReturnRequestRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.rmaRequests);

        // allRequestText is  visible
        await this.toBeVisible(selector.customer.cRma.allRequestText);

        // return request table elements are visible
        await this.multipleElementVisible(selector.customer.cRma.table);

        const noRequestsFound = await this.isVisible(selector.customer.cRma.noRowsFound);
        if (noRequestsFound) {
            console.log('No return request found');
            return;
        }

        await this.notToHaveCount(selector.customer.cRma.numberOfRowsFound, 0);
    }

    // customer request warranty
    async customerRequestWarranty(orderNumber: string, productName: string, refund: order['requestWarranty']) {
        await this.goIfNotThere(data.subUrls.frontend.myOrders);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.requestWarranty, selector.customer.cMyOrders.orderRequestWarranty(orderNumber));

        await this.click(selector.customer.cOrders.requestWarranty.warrantyRequestItemCheckbox(productName));
        await this.selectByValue(selector.customer.cOrders.requestWarranty.warrantyRequestItemQuantity(productName), refund.itemQuantity);
        await this.selectByValue(selector.customer.cOrders.requestWarranty.warrantyRequestType, refund.refundRequestType);
        const refundReasonIsVisible = await this.isVisible(selector.customer.cOrders.requestWarranty.warrantyRequestReason);
        if (refundReasonIsVisible) {
            await this.selectByValue(selector.customer.cOrders.requestWarranty.warrantyRequestReason, refund.refundRequestReasons);
        }
        await this.clearAndType(selector.customer.cOrders.requestWarranty.warrantyRequestDetails, refund.refundRequestDetails);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.requestWarranty, selector.customer.cOrders.requestWarranty.warrantySubmitRequest, 302);
        await this.toBeVisible(selector.customer.cWooSelector.wooCommerceSuccessMessage);
        await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, refund.refundSubmitSuccessMessage);
    }

    // customer send Rma message
    async customerSendRmaMessage(orderNumber: string, message: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.rmaRequests);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.viewRmaRequests, selector.customer.cRma.view(orderNumber));
        await this.clearAndType(selector.customer.cRma.message, message);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.viewRmaRequests, selector.customer.cRma.sendMessage);
        await this.toBeVisible(selector.customer.cWooSelector.wooCommerceSuccessMessage);
        await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, data.customer.rma.sendMessage);
    }
}
