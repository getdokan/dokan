import { expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { helpers } from '@utils/helpers';

const { DOKAN_PRO } = process.env;

let apiUtils: ApiUtils;

async function assertOrderCalculation(order: any) {
    apiUtils = new ApiUtils(await request.newContext());

    const [orderResponse, orderResponsebody, orderId] = order;
    expect(orderResponse.ok()).toBeTruthy();
    // console.log(orderResponsebody);

    const parmeters = await getParameters(orderId, orderResponsebody);
    const calculatedData = await getCalculatedData(parmeters);
    const receivedData = await getReceivedData(orderId, parmeters);
    await assertData(orderId, calculatedData, receivedData);
}

async function getParameters(orderId: string, orderResponsebody: any): Promise<number[]> {
    const [, sinleOrderResponseBody] = await apiUtils.getSingleOrder(orderId);

    const taxRate = Number(orderResponsebody.tax_lines[0]?.rate_percent ?? 0);
    const discountTotal = Number(orderResponsebody.discount_total ?? 0);
    const discountTax = Number(orderResponsebody.discount_tax ?? 0);
    const shippingFee = Number(orderResponsebody.shipping_total ?? 0);
    const shippingTax = Number(orderResponsebody.shipping_tax ?? 0);
    const productTax = Number(orderResponsebody.cart_tax ?? 0);
    const totalTax = Number(orderResponsebody.total_tax ?? 0);
    const orderTotal = Number(orderResponsebody.total);
    const lineItems = orderResponsebody.line_items;
    const couponLines = orderResponsebody.coupon_lines;

    const gatewayDetails = helpers.getGatewayDetails(sinleOrderResponseBody);
    const feeRecipient = await apiUtils.getFeeRecipient(sinleOrderResponseBody);

    let applySequentially = await apiUtils.getSingleWcSettingOptions('general', 'woocommerce_calc_discounts_sequentially');
    applySequentially = applySequentially.value === 'yes';

    return [orderTotal, gatewayDetails, shippingFee, shippingTax, productTax, totalTax, lineItems, feeRecipient, taxRate, discountTotal, discountTax, couponLines, applySequentially];
}

async function getCalculatedData(parmeters: any): Promise<number[]> {
    const [orderTotal, gatewayDetails, shippingFee, shippingTax, productTax, totalTax, lineItems, feeRecipient, taxRate, discountTotal, discountTax, couponLines, applySequentially] = parmeters;

    const [calculatedSubtotal, calculatedProductTax, calculatedSubtotalCommission, calculatedSubtotalEarning] = helpers.lineItemsToSalesMetrics(lineItems, taxRate);
    const calculatedShippingTax = helpers.tax(taxRate, shippingFee);
    const calculatedSubtotalWithoutDiscount = helpers.lineItemsToSubtotalWithoutDiscount(lineItems);
    const calculatedDiscount = helpers.calculateDiscount(calculatedSubtotalWithoutDiscount, couponLines, applySequentially);
    const calculatedDiscountTax = helpers.tax(taxRate, calculatedDiscount);
    const calculatedTotalTax = helpers.roundToTwo(calculatedProductTax! + calculatedShippingTax);
    const calculatedOrderTotal = helpers.roundToTwo(calculatedSubtotal! + calculatedTotalTax + shippingFee);
    const calculatedAdminCommission = helpers.commissionOrEarning('commission', calculatedSubtotalCommission, calculatedProductTax, calculatedShippingTax, shippingFee, gatewayDetails, feeRecipient);
    const calculatedVendorEarning = helpers.commissionOrEarning('earning', calculatedSubtotalEarning, calculatedProductTax, calculatedShippingTax, shippingFee, gatewayDetails, feeRecipient);
    const calculatedData = [calculatedSubtotal, calculatedOrderTotal, calculatedVendorEarning, calculatedAdminCommission, gatewayDetails.gatewayFee, shippingFee, calculatedShippingTax, calculatedProductTax, calculatedTotalTax, calculatedDiscount, calculatedDiscountTax].map(Number);
    return calculatedData;
}

async function getReceivedData(orderId: string, parmeters: any): Promise<number[]> {
    const [orderTotal, gatewayDetails, shippingFee, shippingTax, productTax, totalTax, lineItems, feeRecipient, taxRate, discountTotal, discountTax] = parmeters;
    let receivedData = [];
    if (DOKAN_PRO) {
        const orderlog = await apiUtils.getSingleOrderLog(String(orderId));
        const subTotal = helpers.roundToTwo(orderlog.order_total - orderlog.shipping_total - orderlog.shipping_total_tax - orderlog.tax_total + orderlog.dokan_gateway_fee);
        receivedData = [subTotal, orderlog.order_total, orderlog.vendor_earning, orderlog.commission, orderlog.dokan_gateway_fee, orderlog.shipping_total, orderlog.shipping_total_tax, orderlog.tax_total, totalTax, discountTotal, discountTax].map(Number);
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

    const orderlog = [
        [`OID: ${orderId}`, 'SubTotal', 'OrderTotal', 'Earning', 'Commission', 'GatewayFee', 'ShippingFee', 'ShippingTax', 'ProductTax', 'TotalTax', 'Discount', 'DiscountTax'],
        ['Expected', calculatedSubTotal, calculatedOrderTotal, calculatedVendorEarning, calculatedAdminCommission, gatewayFee, shippingFee, calculatedShippingTax, calculatedProductTax, calculatedTotalTax, calculatedDiscount, calculatedDiscountTax],
        ['Received', receivedSubtotal, receivedOrderTotal, receivedVendorEarning, receivedAdminCommission, receivedGatewayFee, receivedShippingFee, receivedShippingTax, receivedProductTax, receivedTotalTax, receivedDiscountTotal, receivedDiscountTax],
    ];

    // console.table(orderlog);

    expect(receivedSubtotal).toBeApproximately(calculatedSubTotal, 0, orderlog);
    expect(receivedOrderTotal).toBeApproximately(calculatedOrderTotal, 0.01, orderlog);
    expect(receivedVendorEarning).toBeApproximately(calculatedVendorEarning, 0.01, orderlog);
    expect(receivedAdminCommission).toBeApproximately(calculatedAdminCommission, 0.01, orderlog);
    expect(receivedProductTax).toBeApproximately(calculatedProductTax, 0, orderlog);
    expect(receivedShippingTax).toBeApproximately(calculatedShippingTax, 0, orderlog);
    expect(receivedTotalTax).toBeApproximately(calculatedTotalTax, 0, orderlog);
    expect(receivedDiscountTotal).toBeApproximately(calculatedDiscount, 0.01, orderlog);
    expect(receivedDiscountTax).toBeApproximately(calculatedDiscountTax, 0.01, orderlog);
}

export { assertOrderCalculation, getParameters, getCalculatedData, getReceivedData, assertData };
