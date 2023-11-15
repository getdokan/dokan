import { Page } from '@playwright/test';
import { CustomerPage } from '@pages/customerPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

const { DOKAN_PRO } = data.env;

export class MyOrdersPage extends CustomerPage {
    constructor(page: Page) {
        super(page);
    }

    // my orders

    // my orders render properly
    async myOrdersRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.myOrders);

        const noOrders = await this.isVisible(selector.customer.cMyOrders.noOrdersFound);

        if (noOrders) {
            await this.toContainText(selector.customer.cMyOrders.noOrdersFound, 'No orders found!');
            console.log('No orders found on my order page');
        } else {
            // my orders text is visible
            await this.toBeVisible(selector.customer.cMyOrders.myOrdersText);

            // recent orders text is visible
            await this.toBeVisible(selector.customer.cMyOrders.recentOrdersText);

            // my orders table elements are visible
            await this.multipleElementVisible(selector.customer.cMyOrders.table);
        }
    }

    //  view order details
    async viewOrderDetails(orderId: string) {
        await this.goIfNotThere(data.subUrls.frontend.myOrders);
        console.log('orderID:------------------------------------------->',orderId);
        await this.goIfNotThere(data.subUrls.frontend.orderDetails(orderId));

        // order details are visible
        await this.multipleElementVisible(selector.customer.cOrderDetails.orderDetails);

        // customer details are visible
        await this.multipleElementVisible(selector.customer.cOrderDetails.customerDetails);

        DOKAN_PRO && (await this.toBeVisible(selector.customer.cOrderDetails.getSupport));
    }

    async viewOrdertest(path: string) {
        await this.goIfNotThere(data.subUrls.frontend.myOrders);
        await this.getScreenshot('plawyright/testImages/'+ path+'.png');
    }

    // view order note
    async viewOrderNote(orderNumber: string, orderNote: string) {
        await this.goIfNotThere(data.subUrls.frontend.orderDetails(orderNumber));
        await this.toBeVisible(selector.customer.cOrderDetails.orderUpdates.orderNote(orderNote));
    }

    //  pay pending order
    async payPendingOrder(orderId: string, paymentMethod = 'bank') {
        await this.goIfNotThere(data.subUrls.frontend.myOrders);
        await this.clickAndWaitForResponse(data.subUrls.frontend.orderPay, selector.customer.cMyOrders.orderPay(orderId));
        await this.paymentOrder(paymentMethod);
    }

    //  cancel order
    async cancelPendingOrder(orderId: string) {
        await this.goIfNotThere(data.subUrls.frontend.myOrders);
        await this.clickAndWaitForResponse(data.subUrls.frontend.orderCancel, selector.customer.cMyOrders.orderCancel(orderId), 302);
        await this.toContainText(selector.customer.cWooSelector.wooCommerceInfo, 'Your order was cancelled.');
    }

    // order again
    async orderAgain(orderId: string, paymentMethod = 'bank') {
        await this.goIfNotThere(data.subUrls.frontend.orderDetails(orderId));
        await this.clickAndAcceptAndWaitForResponse(data.subUrls.frontend.orderAgain, selector.customer.cOrderDetails.orderAgain, 302);
        await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, 'The cart has been filled with the items from your previous order.');
        await this.goToCheckoutFromCart();
        await this.paymentOrder(paymentMethod);
    }
}
