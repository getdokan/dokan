import { test, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { helpers } from '@utils/helpers';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { commission, feeRecipient } from '@utils/interfaces';

test.describe('calculation test', () => {
    let apiUtils: ApiUtils;
    let taxRate: number;
    let commission: commission;
    let feeRecipient: feeRecipient;

    test.beforeAll(async ({ request }) => {
        apiUtils = new ApiUtils(request);
        taxRate = await apiUtils.setUpTaxRate(payloads.enableTaxRate, payloads.createTaxRate);
        // todo:  get tax rate instead of setup if possible
        [commission, feeRecipient] = await dbUtils.getSellingInfo();
    });

    test('calculation test @pro', async () => {
        // todo:  modify for lite as well
        const [, res, oid] = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder);
        // console.log( res );
        console.log('Cal: order id:', oid);

        // const discountTotal = res.discount_total;
        // const discountTax = res.discount_tax;
        const shippingFee = res.shipping_total;
        const shippingTax = res.shipping_tax;
        const cartTax = res.cart_tax;
        const totalTax = res.total_tax;
        const orderTotal = res.total;
        const gatewayFee = 0;
        // const paymentMethod = res.payment_method_ti;
        const productPrice = res.line_items[0].subtotal;
        const productQuantity = res.line_items[0].quantity;

        const orderReport = await apiUtils.getSingleOrderLog(String(oid));
        // console.log(orderReport);
        const adminCommission = orderReport.commission;
        const vendorEarning = orderReport.vendor_earning;
        // todo: compare with all order total
        // todo: add discount scenario

        const calculatedSubTotal = helpers.subtotal([productPrice], [productQuantity]); // todo:  update it for multiple products
        const calculatedProductTax = helpers.productTax(taxRate, calculatedSubTotal);
        const calculatedShippingTax = helpers.shippingTax(taxRate, shippingFee);
        const calculatedTotalTax = helpers.roundToTwo(calculatedProductTax + calculatedShippingTax);
        const calculatedOrderTotal = helpers.orderTotal(calculatedSubTotal, calculatedProductTax, calculatedShippingTax, shippingFee);
        const calculatedAdminCommission = helpers.adminCommission(calculatedSubTotal, commission, calculatedProductTax, calculatedShippingTax, shippingFee, gatewayFee, feeRecipient);
        const calculatedVendorEarning = helpers.vendorEarning(calculatedSubTotal, calculatedAdminCommission, calculatedProductTax, calculatedShippingTax, shippingFee, gatewayFee, feeRecipient);

        console.log(
            `\ncalculatedSubTotal:  ${calculatedSubTotal}\n  `,
            `calculatedOrderTotal:  ${calculatedOrderTotal} received: ${Number(orderTotal)}\n`,
            `calculatedVendorEarning:  ${calculatedVendorEarning} received: ${Number(vendorEarning)}\n`,
            `calculatedAdminCommission:  ${calculatedAdminCommission} received: ${Number(adminCommission)}\n`,
            `providedShippingFee:  ${shippingFee}\n`,
            `calculatedShippingTax:  ${calculatedShippingTax} received: ${Number(shippingTax)}}\n`,
            `calculatedProductTax:  ${calculatedProductTax} received: ${Number(cartTax)} \n`,
            `calculatedTotalTax:  ${calculatedTotalTax} received: ${Number(totalTax)}\n`,
        );

        expect(Number(cartTax)).toEqual(calculatedProductTax);
        expect(Number(shippingTax)).toEqual(calculatedShippingTax);
        expect(Number(totalTax)).toEqual(calculatedTotalTax);
        expect(Number(orderTotal)).toEqual(calculatedOrderTotal);
        expect(Number(adminCommission)).toEqual(calculatedAdminCommission);
        expect(Number(vendorEarning)).toEqual(calculatedVendorEarning);
    });
});

test.describe(' Marketplace Coupon calculation test', () => {
    let apiUtils: ApiUtils;
    let taxRate: number = 0;
    let commission: commission;
    let feeRecipient: feeRecipient;

    test.beforeAll(async ({ request }) => {
        apiUtils = new ApiUtils(request);
        taxRate = await apiUtils.setUpTaxRate(payloads.enableTaxRate, payloads.createTaxRate);
        [commission, feeRecipient] = await dbUtils.getSellingInfo();
    });

    test('coupon calculation test @pro', async () => {
        const [, , code1, amount1] = await apiUtils.createMarketPlaceCoupon({ ...payloads.createMarketPlaceCoupon(), discount_type: 'percent' }, payloads.adminAuth);
        const [, , code2, amount2] = await apiUtils.createMarketPlaceCoupon({ ...payloads.createMarketPlaceCoupon(), discount_type: 'percent' }, payloads.adminAuth);
        const discount = {
            type: 'coupon',
            coupon: {
                type: 'percentage',
                amount: [amount1, amount2],
                applySequentially: true,
            },
        };

        const [, res, oid] = await apiUtils.createOrder(payloads.createProduct(), { ...payloads.createOrder, coupon_lines: [{ code: code1 }, { code: code2 }] });
        // console.log(res);
        console.log('Order id:', oid);

        const discountTotal = res.discount_total;
        const discountTax = res.discount_tax;
        const shippingTotal = res.shipping_total;
        const shippingTax = res.shipping_tax;
        const cartTax = res.cart_tax;
        const totalTax = res.total_tax;
        const orderTotal = res.total;
        const gatewayFee = 0;
        // const paymentMethod = res.payment_method_ti;
        const productPrice = res.line_items[0].subtotal;
        const productQuantity = res.line_items[0].quantity;

        const orderReport = await apiUtils.getSingleOrderLog(String(oid));
        // console.log(orderReport);
        const adminCommission = orderReport.commission;
        const vendorEarning = orderReport.vendor_earning;

        const calculatedSubTotal = helpers.subtotal([productPrice], [productQuantity]); // todo:  update it for multiple products
        const calculatedDiscount = helpers.discount(calculatedSubTotal, discount);
        const calculatedDiscountedSubTotal = helpers.roundToTwo(calculatedSubTotal - calculatedDiscount);
        const calculatedProductTax = helpers.productTax(taxRate, calculatedDiscountedSubTotal);
        const calculatedShippingTax = helpers.shippingTax(taxRate, shippingTotal);
        const calculatedTotalTax = helpers.roundToTwo(calculatedProductTax + calculatedShippingTax);
        const calculatedOrderTotal = helpers.orderTotal(calculatedDiscountedSubTotal, calculatedProductTax, calculatedShippingTax, shippingTotal);
        const calculatedAdminCommission = helpers.adminCommission(calculatedDiscountedSubTotal, commission, calculatedProductTax, calculatedShippingTax, shippingTotal, gatewayFee, feeRecipient); // todo: calculatedSubTotal, if coupon deduct value is default
        const calculatedVendorEarning = helpers.vendorEarning(calculatedDiscountedSubTotal, calculatedAdminCommission, calculatedProductTax, calculatedShippingTax, shippingTotal, gatewayFee, feeRecipient);

        console.log(
            `\n calculatedSubTotal:  ${calculatedSubTotal}\n`,
            `calculatedDiscount:  ${calculatedDiscount} received: ${Number(discountTotal)}\n`,
            `calculatedOrderTotal:  ${calculatedOrderTotal} received: ${Number(orderTotal)}\n`,
            `calculatedVendorEarning:  ${calculatedVendorEarning} received: ${Number(vendorEarning)}\n`,
            `calculatedAdminCommission:  ${calculatedAdminCommission} received: ${Number(adminCommission)}\n`,
            `calculatedShippingTax:  ${calculatedShippingTax} received: ${Number(shippingTax)}\n`,
            `calculatedProductTax:  ${calculatedProductTax} received: ${Number(cartTax)} \n`,
            `calculatedTotalTax:  ${calculatedTotalTax} received: ${Number(totalTax)}\n`,
            `shippingTotal:  ${shippingTotal}\n`,
        );

        expect(Number(discountTotal)).toEqual(calculatedDiscount);
        expect(Number(cartTax)).toEqual(calculatedProductTax);
        expect(Number(shippingTax)).toEqual(calculatedShippingTax);
        expect(Number(totalTax)).toEqual(calculatedTotalTax);
        expect(Number(orderTotal)).toEqual(calculatedOrderTotal);
        expect(Number(adminCommission)).toEqual(calculatedAdminCommission);
        expect(Number(vendorEarning)).toEqual(calculatedVendorEarning);
    });
});
