import { Page, expect } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { helpers } from '@utils/helpers';
import { data } from '@utils/testData';

export class RefundsPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // refunds

    // refunds render properly
    async adminRefundRequestsRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.refunds);

        // refund request text is visible
        await this.toBeVisible(selector.admin.dokan.refunds.refundRequestsText);

        // nav tabs are visible
        await this.multipleElementVisible(selector.admin.dokan.refunds.navTabs);

        // bulk action elements are visible
        await this.multipleElementVisible(
            selector.admin.dokan.refunds.bulkActions,
        );

        // refund request search is visible
        await this.toBeVisible(selector.admin.dokan.refunds.search);

        // refund table elements are visible
        await this.multipleElementVisible(selector.admin.dokan.refunds.table);
    }

    // search refund request
    async searchRefundRequests(orderOrStore: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.refunds);

        await this.clearInputField(selector.admin.dokan.refunds.search);

        await this.typeAndWaitForResponse(
            data.subUrls.api.dokan.refunds,
            selector.admin.dokan.refunds.search,
            String(orderOrStore),
        );
        const count = (
            await this.getElementText(
                selector.admin.dokan.refunds.numberOfRowsFound,
            )
        )?.split(' ')[0];
        if (!isNaN(Number(orderOrStore))) {
            await this.toBeVisible(
                selector.admin.dokan.refunds.refundCell(orderOrStore),
            );
            expect(Number(count)).toBe(1);
        } else {
            expect(Number(count)).toBeGreaterThan(0);
        }
    }

    // update refund request
    async updateRefundRequests(orderNumber: string, action: string) {
        await this.searchRefundRequests(orderNumber);

        await this.hover(selector.admin.dokan.refunds.refundCell(orderNumber));
        switch (action) {
            case 'approve':
                await this.clickAndWaitForResponse(
                    data.subUrls.api.dokan.refunds,
                    selector.admin.dokan.refunds.approveRefund(orderNumber),
                );
                break;

            case 'cancel':
                await this.clickAndWaitForResponse(
                    data.subUrls.api.dokan.refunds,
                    selector.admin.dokan.refunds.cancelRefund(orderNumber),
                );
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
        await this.notToBeVisible(selector.admin.dokan.refunds.noRowsFound);

        await this.click(selector.admin.dokan.refunds.bulkActions.selectAll);
        await this.selectByValue(
            selector.admin.dokan.refunds.bulkActions.selectAction,
            action,
        );
        await this.clickAndWaitForResponse(
            data.subUrls.api.dokan.refunds,
            selector.admin.dokan.refunds.bulkActions.applyAction,
        );
    }

    // vendor

    // search order
    async searchOrder(orderNumber: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.orders);

        await this.clearAndType(
            selector.vendor.orders.search.searchInput,
            orderNumber,
        );
        await this.clickAndWaitForResponse(
            data.subUrls.frontend.vDashboard.orders,
            selector.vendor.orders.search.searchBtn,
        );
        await this.toBeVisible(selector.vendor.orders.orderLink(orderNumber));
    }

    // go to order details
    async goToOrderDetails(orderNumber: string): Promise<void> {
        await this.searchOrder(orderNumber);
        await this.clickAndWaitForLoadState(
            selector.vendor.orders.view(orderNumber),
        );
        await this.toContainText(
            selector.vendor.orders.orderDetails.orderNumber,
            orderNumber,
        );
    }

    // vendor refund order
    async refundOrder(
        orderNumber: string,
        productName: string,
        partialRefund = false,
    ): Promise<void> {
        await this.goToOrderDetails(orderNumber);

        // request refund
        await this.click(selector.vendor.orders.refund.requestRefund);
        const productQuantity = (
            (await this.getElementText(
                selector.vendor.orders.refund.productQuantity(productName),
            )) as string
        ).trim();
        const productCost = helpers.price(
            (await this.getElementText(
                selector.vendor.orders.refund.productCost(productName),
            )) as string,
        );
        const productTax = helpers.price(
            (await this.getElementText(
                selector.vendor.orders.refund.productTax(productName),
            )) as string,
        );

        let shippingCost = 0;
        let shippingTax = 0;
        const isShipping = await this.isVisible(
            selector.vendor.orders.refund.shippingCost,
        );
        if (isShipping) {
            shippingCost = helpers.price(
                (await this.getElementText(
                    selector.vendor.orders.refund.shippingCost,
                )) as string,
            );
            shippingTax = helpers.price(
                (await this.getElementText(
                    selector.vendor.orders.refund.shippingTax,
                )) as string,
            );
        }
        await this.clearAndType(
            selector.vendor.orders.refund.refundProductQuantity(productName),
            productQuantity,
        );
        await this.click(selector.vendor.orders.refund.refundDiv);
        if (partialRefund) {
            await this.clearAndType(
                selector.vendor.orders.refund.refundProductCostAmount(
                    productName,
                ),
                helpers.priceString(helpers.roundToTwo(productCost / 2), 'ES'),
            ); // todo: price style is fixed, make it dynamic
            await this.clearAndType(
                selector.vendor.orders.refund.refundProductTaxAmount(
                    productName,
                ),
                helpers.priceString(helpers.roundToTwo(productTax / 2), 'ES'),
            );
            if (isShipping) {
                await this.clearAndType(
                    selector.vendor.orders.refund.refundShippingAmount,
                    helpers.priceString(
                        helpers.roundToTwo(shippingCost / 2),
                        'ES',
                    ),
                );
                await this.clearAndType(
                    selector.vendor.orders.refund.refundShippingTaxAmount,
                    helpers.priceString(
                        helpers.roundToTwo(shippingTax / 2),
                        'ES',
                    ),
                );
            }
        } else {
            await this.clearAndType(
                selector.vendor.orders.refund.refundProductCostAmount(
                    productName,
                ),
                helpers.priceString(productCost, 'ES'),
            );
            await this.clearAndType(
                selector.vendor.orders.refund.refundProductTaxAmount(
                    productName,
                ),
                helpers.priceString(productTax, 'ES'),
            );
            if (isShipping) {
                await this.clearAndType(
                    selector.vendor.orders.refund.refundShippingAmount,
                    helpers.priceString(shippingCost, 'ES'),
                );
                await this.clearAndType(
                    selector.vendor.orders.refund.refundShippingTaxAmount,
                    helpers.priceString(shippingTax, 'ES'),
                );
            }
        }

        await this.clearAndType(
            selector.vendor.orders.refund.refundReason,
            'Defective product',
        );
        await this.click(selector.vendor.orders.refund.refundManually);
        await this.click(selector.vendor.orders.refund.confirmRefund);

        await this.toContainText(
            selector.vendor.orders.refund.refundRequestSuccessMessage,
            'Refund request submitted.',
        );
        await this.click(
            selector.vendor.orders.refund.refundRequestSuccessMessageOk,
        );
    }
}
