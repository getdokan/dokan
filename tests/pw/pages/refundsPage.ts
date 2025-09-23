import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { helpers } from '@utils/helpers';
import { data } from '@utils/testData';

// selectors
const refundsAdmin = selector.admin.dokan.refunds;
const refundsVendor = selector.vendor.orders.refund;

export class RefundsPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // refunds

    // refunds render properly
    async adminRefundRequestsRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.refunds);

        // refund request text is visible
        await this.toBeVisible(refundsAdmin.refundRequestsText);

        // nav tabs are visible
        await this.multipleElementVisible(refundsAdmin.navTabs);

        // bulk action elements are visible
        await this.multipleElementVisible(refundsAdmin.bulkActions);

        // refund request search is visible
        await this.toBeVisible(refundsAdmin.search);

        // refund table elements are visible
        await this.multipleElementVisible(refundsAdmin.table);
    }

    // search refund request
    async searchRefundRequests(searchKey: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.refunds);

        await this.clearInputField(refundsAdmin.search);

        await this.typeAndWaitForResponse(data.subUrls.api.dokan.refunds, refundsAdmin.search, String(searchKey));
        if (!Number.isNaN(Number(searchKey))) {
            // searched by orderId
            await this.toHaveCount(refundsAdmin.numberOfRows, 1);
            await this.toBeVisible(refundsAdmin.refundCell(searchKey));
        } else {
            // searched by store
            await this.notToHaveCount(refundsAdmin.numberOfRows, 0);
        }
    }

    // update refund request
    async updateRefundRequests(orderNumber: string, action: string) {
        await this.searchRefundRequests(orderNumber);

        await this.hover(refundsAdmin.refundCell(orderNumber));
        switch (action) {
            case 'approve':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.refunds, refundsAdmin.approveRefund(orderNumber));
                break;

            case 'cancel':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.refunds, refundsAdmin.cancelRefund(orderNumber));
                break;

            default:
                break;
        }
    }

    // refund request bulk action
    async refundRequestsBulkAction(action: string) {
        await this.goto(data.subUrls.backend.dokan.refunds);
        // await this.goIfNotThere(data.subUrls.backend.dokan.refunds);

        // ensure row exists
        await this.notToBeVisible(refundsAdmin.noRowsFound);

        await this.click(refundsAdmin.bulkActions.selectAll);
        await this.selectByValue(refundsAdmin.bulkActions.selectAction, action);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.refunds, refundsAdmin.bulkActions.applyAction);
    }

    // vendor

    // search order
    async searchOrder(orderNumber: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.orders);

        await this.clearAndType(selector.vendor.orders.search.searchInput, orderNumber);
        await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.orders, selector.vendor.orders.search.searchBtn);
        await this.toBeVisible(selector.vendor.orders.orderLink(orderNumber));
    }

    // go to order details
    async goToOrderDetails(orderNumber: string): Promise<void> {
        await this.searchOrder(orderNumber);
        await this.clickAndWaitForLoadState(selector.vendor.orders.view(orderNumber));
        await this.toContainText(selector.vendor.orders.orderDetails.orderNumber, orderNumber);
    }

    // vendor refund order
    async refundOrder(orderNumber: string, productName: string, partialRefund = false): Promise<void> {
        await this.goToOrderDetails(orderNumber);

        // request refund
        await this.click(refundsVendor.requestRefund);
        const productQuantity = ((await this.getElementText(refundsVendor.productQuantity(productName))) as string).trim();
        const productCost = helpers.price((await this.getElementText(refundsVendor.productCost(productName))) as string);
        const productTax = helpers.price((await this.getElementText(refundsVendor.productTax(productName))) as string);

        let shippingCost = 0;
        let shippingTax = 0;
        const isShipping = await this.isVisible(refundsVendor.shippingCost);
        if (isShipping) {
            shippingCost = helpers.price((await this.getElementText(refundsVendor.shippingCost)) as string);
            shippingTax = helpers.price((await this.getElementText(refundsVendor.shippingTax)) as string);
        }
        await this.clearAndType(refundsVendor.refundProductQuantity(productName), productQuantity);
        await this.click(refundsVendor.refundDiv);
        if (partialRefund) {
            await this.clearAndType(refundsVendor.refundProductCostAmount(productName), helpers.priceString(helpers.roundToTwo(productCost / 2), 'ES')); // todo: price style is fixed, make it dynamic
            await this.clearAndType(refundsVendor.refundProductTaxAmount(productName), helpers.priceString(helpers.roundToTwo(productTax / 2), 'ES'));
            if (isShipping) {
                await this.clearAndType(refundsVendor.refundShippingAmount, helpers.priceString(helpers.roundToTwo(shippingCost / 2), 'ES'));
                await this.clearAndType(refundsVendor.refundShippingTaxAmount, helpers.priceString(helpers.roundToTwo(shippingTax / 2), 'ES'));
            }
        } else {
            await this.clearAndType(refundsVendor.refundProductCostAmount(productName), helpers.priceString(productCost, 'ES'));
            await this.clearAndType(refundsVendor.refundProductTaxAmount(productName), helpers.priceString(productTax, 'ES'));
            if (isShipping) {
                await this.clearAndType(refundsVendor.refundShippingAmount, helpers.priceString(shippingCost, 'ES'));
                await this.clearAndType(refundsVendor.refundShippingTaxAmount, helpers.priceString(shippingTax, 'ES'));
            }
        }

        await this.clearAndType(refundsVendor.refundReason, 'Defective product');
        await this.click(refundsVendor.refundManually);
        await this.click(refundsVendor.confirmRefund);

        await this.toContainText(refundsVendor.refundRequestSuccessMessage, 'Refund request submitted.');
        await this.click(refundsVendor.refundRequestSuccessMessageOk);
    }
}
