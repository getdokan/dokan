import { expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { helpers } from '@utils/helpers';

const { DOKAN_PRO } = process.env;

let apiUtils: ApiUtils;

async function assertOrderCalculation(order: any, commissionRate: any) {
    apiUtils = new ApiUtils(await request.newContext());

    const [orderResponse, orderResponsebody, orderId] = order;
    expect(orderResponse.ok()).toBeTruthy();

    const parmeters = await getParameters(orderId, orderResponsebody, commissionRate);
    const calculatedData = await getCalculatedData(parmeters);
    const receivedData = await getReceivedData(orderId, parmeters);
    await assertData(orderId, calculatedData, receivedData);
}

async function getParameters(orderId: string, res: any, commissionRate: any): Promise<number[]> {
    const taxRate = res.tax_lines[0]?.rate_percent ?? 0;
    const discountTotal = res.discount_total ?? 0;
    const discountTax = res.discount_tax ?? 0;
    const shippingFee = res.shipping_total ?? 0;
    const shippingTax = res.shipping_tax ?? 0;
    const productTax = res.cart_tax ?? 0;
    const totalTax = res.total_tax ?? 0;
    const gatewayFee = 0;
    const gatewayFeeGiver = 'seller'; // todo: handle gatewayfeegiver
    const orderTotal = res.total;
    const lineItems = res.line_items;
    const couponLines = res.coupon_lines;
    const [, sinleOrderResponseBody] = await apiUtils.getSingleOrder(orderId);
    const feeRecipient = await apiUtils.getFeeRecipient(sinleOrderResponseBody);
    let [adminCommission, vendorEarning] = helpers.lineItemsToCommissionAndEarning(sinleOrderResponseBody.line_items);
    adminCommission = helpers.calculateCommissionOrEarning('commission', adminCommission!, productTax, shippingTax, shippingFee, gatewayFee, feeRecipient, gatewayFeeGiver);
    vendorEarning = helpers.calculateCommissionOrEarning('earning', vendorEarning!, productTax, shippingTax, shippingFee, gatewayFee, feeRecipient, gatewayFeeGiver);
    let applySequentially = await apiUtils.getSingleWcSettingOptions('general', 'woocommerce_calc_discounts_sequentially');
    applySequentially = applySequentially.value === 'yes' ? true : false;
    return [orderTotal, vendorEarning, adminCommission, gatewayFee, Number(shippingFee), shippingTax, productTax, totalTax, lineItems, commissionRate, feeRecipient, taxRate, discountTotal, discountTax, couponLines, applySequentially];
}

async function getCalculatedData(parmeters: any): Promise<number[]> {
    const [orderTotal, vendorEarning, adminCommission, gatewayFee, shippingFee, shippingTax, productTax, totalTax, lineItems, commissionRate, feeRecipient, taxRate, discountTotal, discountTax, couponLines, applySequentially] = parmeters;

    // todo: get multiple itmes from line items , instead of get them separately lineItemsToSubtotal, lineItemsToCartTax, lineTemsToDiscount, admincommission, vendorEarning
    // todo: implement above will resolve item quantity issue, only correct for single item

    const calculatedSubTotal = helpers.lineItemsToSubtotal(lineItems);
    const subtotalWithoutDiscount = helpers.lineItemsToSubtotalWithoutDiscount(lineItems);
    const calculatedDiscount = helpers.calculateTotalDiscount(subtotalWithoutDiscount, couponLines, applySequentially);
    const calculatedDiscountTax = helpers.percentageWithRound(calculatedDiscount, taxRate);
    const calculatedProductTax = helpers.lineItemsToCartTax(taxRate, lineItems);
    const calculatedShippingTax = helpers.shippingTax(taxRate, shippingFee);
    const calculatedTotalTax = helpers.roundToTwo(calculatedProductTax + calculatedShippingTax);
    const calculatedOrderTotal = helpers.orderTotal(calculatedSubTotal, calculatedProductTax, calculatedShippingTax, shippingFee);
    const [calculatedSubTotalCommission, calculatedAdminCommission] = helpers.adminCommission(calculatedSubTotal, commissionRate, calculatedProductTax, calculatedShippingTax, shippingFee, gatewayFee, feeRecipient);
    const calculatedVendorEarning = helpers.vendorEarning(calculatedSubTotal, calculatedSubTotalCommission!, calculatedProductTax, calculatedShippingTax, shippingFee, gatewayFee, feeRecipient);
    let calculatedData = [calculatedSubTotal, calculatedOrderTotal, calculatedVendorEarning, calculatedAdminCommission, gatewayFee, shippingFee, calculatedShippingTax, calculatedProductTax, calculatedTotalTax, calculatedDiscount, calculatedDiscountTax];
    calculatedData = calculatedData.map(Number);
    return calculatedData;
}

async function getReceivedData(orderId: any, parmeters: any): Promise<number[]> {
    const [orderTotal, vendorEarning, adminCommission, gatewayFee, shippingFee, shippingTax, productTax, totalTax, lineItems, commissionRate, feeRecipient, taxRate, discountTotal, discountTax, couponLines, applySequentially] = parmeters;
    let receivedData = [];
    if (DOKAN_PRO) {
        const orderlog = await apiUtils.getSingleOrderLog(String(orderId));
        const subTotal = helpers.roundToTwo(orderlog.order_total - orderlog.shipping_total - orderlog.shipping_total_tax - orderlog.tax_total + orderlog.dokan_gateway_fee);
        receivedData = [subTotal, orderlog.order_total, orderlog.vendor_earning, orderlog.commission, orderlog.dokan_gateway_fee, orderlog.shipping_total, orderlog.shipping_total_tax, orderlog.tax_total, totalTax, discountTotal, discountTax];
        receivedData = receivedData.map(Number);
    } else {
        const subTotal = helpers.roundToTwo(orderTotal - shippingFee - totalTax + gatewayFee);
        receivedData = [subTotal, orderTotal, vendorEarning, adminCommission, gatewayFee, shippingFee, shippingTax, productTax, totalTax, discountTotal, discountTax];
        receivedData = receivedData.map(Number);
    }
    return receivedData;
}

async function assertData(orderId: any, calculatedData: number[], receivedData: number[]) {
    const [calculatedSubTotal, calculatedOrderTotal, calculatedVendorEarning, calculatedAdminCommission, gatewayFee, shippingFee, calculatedShippingTax, calculatedProductTax, calculatedTotalTax, calculatedDiscount, calculatedDiscountTax] = calculatedData;
    const [receivedSubtotal, receivedOrderTotal, receivedVendorEarning, receivedAdminCommission, receivedGatewayFee, receivedShippingFee, receivedShippingTax, receivedProductTax, receivedTotalTax, receivedDiscountTotal, receivedDiscountTax] = receivedData;

    const orderlog = [
        [`OID: ${orderId}`, 'SubTotal', 'OrderTotal', 'Earning', 'Commission', 'GatewayFee', 'ShippingFee', 'ShippingTax', 'ProductTax', 'TotalTax', 'Discount', 'DiscountTax'],
        ['Expected', calculatedSubTotal, calculatedOrderTotal, calculatedVendorEarning, calculatedAdminCommission, gatewayFee, shippingFee, calculatedShippingTax, calculatedProductTax, calculatedTotalTax, calculatedDiscount, calculatedDiscountTax],
        ['Received', receivedSubtotal, receivedOrderTotal, receivedVendorEarning, receivedAdminCommission, receivedGatewayFee, receivedShippingFee, receivedShippingTax, receivedProductTax, receivedTotalTax, receivedDiscountTotal, receivedDiscountTax],
    ];
    // console.table(orderlog);

    // expect(receivedDiscountTotal).toEqual(calculatedDiscount);
    // expect(receivedDiscountTax).toEqual(calculatedDiscountTax);
    // expect(receivedSubtotal).toEqual(calculatedSubTotal);
    // expect(receivedOrderTotal).toEqual(calculatedOrderTotal);
    // expect(receivedAdminCommission).toEqual(calculatedAdminCommission);
    // expect(receivedVendorEarning).toEqual(calculatedVendorEarning);
    // expect(receivedProductTax).toEqual(calculatedProductTax);
    // expect(receivedShippingTax).toEqual(calculatedShippingTax);
    // expect(receivedTotalTax).toEqual(calculatedTotalTax);

    expect(receivedDiscountTotal).toBeApproximately(calculatedDiscount, 0.01, orderlog);
    expect(receivedDiscountTax).toBeApproximately(calculatedDiscountTax, 0.01, orderlog);
    expect(receivedSubtotal).toBeApproximately(calculatedSubTotal, 0, orderlog);
    expect(receivedOrderTotal).toBeApproximately(calculatedOrderTotal, 0.01, orderlog);
    expect(receivedAdminCommission).toBeApproximately(calculatedAdminCommission, 0.01, orderlog);
    expect(receivedVendorEarning).toBeApproximately(calculatedVendorEarning, 0.01, orderlog);
    expect(receivedProductTax).toBeApproximately(calculatedProductTax, 0, orderlog);
    expect(receivedShippingTax).toBeApproximately(calculatedShippingTax, 0, orderlog);
    expect(receivedTotalTax).toBeApproximately(calculatedTotalTax, 0, orderlog);
}

// export default assertOrderCalculation;
export { assertOrderCalculation, getParameters, getCalculatedData, getReceivedData, assertData };
