import { expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { helpers } from '@utils/helpers';

const { DOKAN_PRO } = process.env;

let apiUtils: ApiUtils;

async function assertOrderCalculation(order: any) {
    apiUtils = new ApiUtils(await request.newContext());

    const [orderResponse, orderResponseBody, orderId] = order;
    expect(orderResponse.ok()).toBeTruthy();
    // console.log(orderResponseBody);

    const parameters = await getParameters(orderId, orderResponseBody);
    const calculatedData = await getCalculatedData(parameters);
    const receivedData = await getReceivedData(orderId, parameters);
    await assertData(orderId, calculatedData, receivedData);
    return [orderId, calculatedData, receivedData];
}

async function getParameters(orderId: string, orderResponseBody: any): Promise<(number | object)[]> {
    const [, singleOrderResponseBody] = await apiUtils.getSingleOrder(orderId);

    const taxRate = Number(orderResponseBody.tax_lines[0]?.rate_percent ?? 0);
    const discountTotal = Number(orderResponseBody.discount_total ?? 0);
    const discountTax = Number(orderResponseBody.discount_tax ?? 0);
    const shippingFee = Number(orderResponseBody.shipping_total ?? 0);
    const shippingTax = Number(orderResponseBody.shipping_tax ?? 0);
    const productTax = Number(orderResponseBody.cart_tax ?? 0);
    const totalTax = Number(orderResponseBody.total_tax ?? 0);
    const orderTotal = Number(orderResponseBody.total);
    const lineItems = orderResponseBody.line_items;
    const couponLines = orderResponseBody.coupon_lines;

    const gatewayDetails = helpers.getGatewayDetails(singleOrderResponseBody);
    const feeRecipient = await apiUtils.getFeeRecipient(singleOrderResponseBody);

    let applySequentially = await apiUtils.getSingleWcSettingOptions('general', 'woocommerce_calc_discounts_sequentially');
    applySequentially = applySequentially.value === 'yes';

    return [orderTotal, gatewayDetails, shippingFee, shippingTax, productTax, totalTax, lineItems, feeRecipient, taxRate, discountTotal, discountTax, couponLines, applySequentially];
}

async function getCalculatedData(parameters: any): Promise<number[]> {
    const [, gatewayDetails, shippingFee, , , , lineItems, feeRecipient, taxRate, , , couponLines, applySequentially] = parameters;

    const [calculatedSubtotal, calculatedProductTax, calculatedSubtotalCommission, calculatedSubtotalEarning] = helpers.lineItemsToSalesMetrics(lineItems, taxRate);
    const calculatedShippingTax = helpers.tax(shippingFee, taxRate);
    const calculatedSubtotalWithoutDiscount = helpers.lineItemsToSubtotalWithoutDiscount(lineItems);
    const calculatedDiscount = helpers.calculateDiscount(calculatedSubtotalWithoutDiscount, couponLines, applySequentially);
    const calculatedDiscountTax = helpers.tax(calculatedDiscount, taxRate);
    const calculatedTotalTax = helpers.roundToTwo(calculatedProductTax! + calculatedShippingTax);
    const calculatedOrderTotal = helpers.roundToTwo(calculatedSubtotal! + calculatedTotalTax + shippingFee);
    const calculatedAdminCommission = helpers.commissionOrEarning('commission', calculatedSubtotalCommission, calculatedProductTax, calculatedShippingTax, shippingFee, gatewayDetails, feeRecipient);
    const calculatedVendorEarning = helpers.commissionOrEarning('earning', calculatedSubtotalEarning, calculatedProductTax, calculatedShippingTax, shippingFee, gatewayDetails, feeRecipient);
    const calculatedData = [calculatedSubtotal, calculatedOrderTotal, calculatedVendorEarning, calculatedAdminCommission, gatewayDetails.gatewayFee, shippingFee, calculatedShippingTax, calculatedProductTax, calculatedTotalTax, calculatedDiscount, calculatedDiscountTax].map(Number);
    return calculatedData;
}

async function getReceivedData(orderId: string, parameters: any): Promise<number[]> {
    const [orderTotal, gatewayDetails, shippingFee, shippingTax, productTax, totalTax, lineItems, feeRecipient, , discountTotal, discountTax] = parameters;
    let receivedData = [];
    if (DOKAN_PRO) {
        const orderLog = await apiUtils.getSingleOrderLog(String(orderId));
        const subTotal = helpers.roundToTwo(orderLog.order_total - orderLog.shipping_total - orderLog.shipping_total_tax - orderLog.tax_total + orderLog.dokan_gateway_fee);
        receivedData = [subTotal, orderLog.order_total, orderLog.vendor_earning, orderLog.commission, orderLog.dokan_gateway_fee, orderLog.shipping_total, orderLog.shipping_total_tax, orderLog.tax_total, totalTax, discountTotal, discountTax].map(Number);
    } else {
        let [adminCommission, vendorEarning] = helpers.lineItemsToCommissionAndEarning(lineItems);
        adminCommission = helpers.commissionOrEarning('commission', adminCommission!, productTax, shippingTax, shippingFee, gatewayDetails, feeRecipient);
        vendorEarning = helpers.commissionOrEarning('earning', vendorEarning!, productTax, shippingTax, shippingFee, gatewayDetails, feeRecipient);
        const subTotal = helpers.roundToTwo(orderTotal - shippingFee - totalTax + gatewayDetails.gatewayFee);
        receivedData = [subTotal, orderTotal, vendorEarning, adminCommission, gatewayDetails.gatewayFee, shippingFee, shippingTax, productTax, totalTax, discountTotal, discountTax].map(Number);
    }
    return receivedData;
}

async function assertData(orderId: string, calculatedData: number[], receivedData: number[]) {
    const [calculatedSubTotal, calculatedOrderTotal, calculatedVendorEarning, calculatedAdminCommission, gatewayFee, shippingFee, calculatedShippingTax, calculatedProductTax, calculatedTotalTax, calculatedDiscount, calculatedDiscountTax] = calculatedData;
    const [receivedSubtotal, receivedOrderTotal, receivedVendorEarning, receivedAdminCommission, receivedGatewayFee, receivedShippingFee, receivedShippingTax, receivedProductTax, receivedTotalTax, receivedDiscountTotal, receivedDiscountTax] = receivedData;

    const orderLog = [
        [`OID: ${orderId}`, 'SubTotal', 'OrderTotal', 'Earning', 'Commission', 'GatewayFee', 'ShippingFee', 'ShippingTax', 'ProductTax', 'TotalTax', 'Discount', 'DiscountTax'],
        ['Expected', calculatedSubTotal, calculatedOrderTotal, calculatedVendorEarning, calculatedAdminCommission, gatewayFee, shippingFee, calculatedShippingTax, calculatedProductTax, calculatedTotalTax, calculatedDiscount, calculatedDiscountTax],
        ['Received', receivedSubtotal, receivedOrderTotal, receivedVendorEarning, receivedAdminCommission, receivedGatewayFee, receivedShippingFee, receivedShippingTax, receivedProductTax, receivedTotalTax, receivedDiscountTotal, receivedDiscountTax],
    ];

    // console.table(orderLog);

    expect(receivedSubtotal).toBeApproximately(calculatedSubTotal, 0.01, orderLog);
    expect(receivedOrderTotal).toBeApproximately(calculatedOrderTotal, 0.01, orderLog);
    expect(receivedVendorEarning).toBeApproximately(calculatedVendorEarning, 0.01, orderLog);
    expect(receivedAdminCommission).toBeApproximately(calculatedAdminCommission, 0.01, orderLog);
    expect(receivedProductTax).toBeApproximately(calculatedProductTax, 0.01, orderLog);
    expect(receivedShippingTax).toBeApproximately(calculatedShippingTax, 0.01, orderLog);
    expect(receivedTotalTax).toBeApproximately(calculatedTotalTax, 0.01, orderLog);
    expect(receivedDiscountTotal).toBeApproximately(calculatedDiscount, 0.01, orderLog);
    expect(receivedDiscountTax).toBeApproximately(calculatedDiscountTax, 0.01, orderLog);
}

async function assertParentOrderCalculation(parentOrder: any, childOrders: any, parentOrderId: string, childOrderIds: string[]) {
    const parentOrderData = [parentOrder.total, parentOrder.cart_tax, parentOrder.total_tax, parentOrder.discount_total, parentOrder.discount_tax].map(Number);

    let childOrderData = childOrders.map(([_, calculatedData]: [any, any]) => {
        const [, calculatedOrderTotal, , , , , , calculatedProductTax, calculatedTotalTax, calculatedDiscount, calculatedDiscountTax] = calculatedData;
        return [calculatedOrderTotal, calculatedProductTax, calculatedTotalTax, calculatedDiscount, calculatedDiscountTax];
    });

    let sumOfChildOrders = new Array(childOrderData[0].length).fill(0);

    // Sum the corresponding elements from all arrays, skipping the first element (orderId)
    childOrderData.forEach((childOrder: any[]) => {
        childOrder.forEach((value, index) => {
            sumOfChildOrders[index] += value;
        });
    });

    // Adding shipping fee and tax to the order total
    sumOfChildOrders[0] += Number(parentOrder.shipping_total) + Number(parentOrder.shipping_tax);
    // Adding shipping tax to the total tax
    sumOfChildOrders[2] += Number(parentOrder.shipping_tax);
    // round to two decimal places
    sumOfChildOrders = sumOfChildOrders.map(helpers.roundToTwo);

    childOrderData = childOrderIds.map((id, index) => [id, ...childOrderData[index]]);

    const orderLog = [['OrderId', 'OrderTotal', 'ProductTax', 'TotalTax', 'Discount', 'DiscountTax'], ...childOrderData, ['-', ...sumOfChildOrders], [Number(parentOrderId), ...parentOrderData]];

    console.table(orderLog);

    const [parentOrderTotal, parentProductTax, parentTotalTax, parentDiscount, parentDiscountTax] = parentOrderData;
    const [calculatedOrderTotal, calculatedProductTax, calculatedTotalTax, calculatedDiscount, calculatedDiscountTax] = sumOfChildOrders;

    expect(parentOrderTotal).toBeApproximately(calculatedOrderTotal, 0.01, orderLog);
    expect(parentProductTax).toBeApproximately(calculatedProductTax, 0.01, orderLog);
    expect(parentTotalTax).toBeApproximately(calculatedTotalTax, 0.01, orderLog);
    expect(parentDiscount).toBeApproximately(calculatedDiscount, 0.01, orderLog);
    expect(parentDiscountTax).toBeApproximately(calculatedDiscountTax, 0.01, orderLog);
}

export { assertOrderCalculation, assertParentOrderCalculation, getParameters, getCalculatedData, getReceivedData, assertData };
