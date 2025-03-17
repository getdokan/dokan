import { Page } from '@playwright/test';
import { CustomerPage } from '@pages/customerPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

const { DOKAN_PRO } = process.env;

export class MyOrdersPage extends CustomerPage {
    constructor(page: Page) {
        super(page);
    }

    // navigation

    async goToMyOrders() {
        await this.goIfNotThere(data.subUrls.frontend.myOrders);
        await this.reload(); // todo: resolve this
    }

    // my orders

    // my orders render properly
    async myOrdersRenderProperly(link?: string) {
        if (link) {
            await this.goto(link);
        } else {
            await this.goIfNotThere(data.subUrls.frontend.myOrders);
            // my orders text is visible
            await this.toBeVisible(selector.customer.cMyOrders.myOrdersText);
        }

        const noOrders = await this.isVisible(selector.customer.cMyOrders.noOrdersFound);

        if (noOrders) {
            await this.toContainText(selector.customer.cMyOrders.noOrdersFound, 'No orders found!');
            console.log('No orders found on my order page');
        } else {
            // recent orders text is visible
            await this.toBeVisible(selector.customer.cMyOrders.recentOrdersText);

            // my orders table elements are visible
            await this.multipleElementVisible(selector.customer.cMyOrders.table);
        }
    }

    //  view order details
    async viewOrderDetails(orderId: string) {
        await this.goIfNotThere(data.subUrls.frontend.orderDetails(orderId));

        // order details are visible
        await this.multipleElementVisible(selector.customer.cOrderDetails.orderDetails);

        // customer details are visible
        await this.multipleElementVisible(selector.customer.cOrderDetails.customerDetails);

        if (DOKAN_PRO) {
            await this.toBeVisible(selector.customer.cOrderDetails.getSupport);
        }
    }

    // view order note
    async viewOrderNote(orderNumber: string, orderNote: string) {
        await this.goIfNotThere(data.subUrls.frontend.orderDetails(orderNumber));
        await this.toBeVisible(selector.customer.cOrderDetails.orderUpdates.orderNote(orderNote));
    }

    //  pay pending order
    async payPendingOrder(orderId: string, paymentMethod = 'bank') {
        await this.goToMyOrders();
        await this.clickAndWaitForResponse(data.subUrls.frontend.orderPay, selector.customer.cMyOrders.orderPay(orderId));
        await this.paymentOrder(paymentMethod);
    }

    //  cancel order
    async cancelPendingOrder(orderId: string) {
        await this.goToMyOrders();
        await this.clickAndWaitForResponse(data.subUrls.frontend.myAccount, selector.customer.cMyOrders.orderCancel(orderId));
        await this.toContainText(selector.customer.cWooSelector.wooCommerceInfo, 'Your order was cancelled.');
    }

    // order again
    async orderAgain(orderId: string, paymentMethod = 'bank') {
        await this.goIfNotThere(data.subUrls.frontend.orderDetails(orderId));
        await this.clickAndWaitForResponse(data.subUrls.frontend.cart, selector.customer.cOrderDetails.orderAgain);
        await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, 'The cart has been filled with the items from your previous order.');
        // await this.goToCheckoutFromCart(); //todo: skipped for flaky locator
        await this.goToCheckout();
        await this.paymentOrder(paymentMethod);
    }
}
