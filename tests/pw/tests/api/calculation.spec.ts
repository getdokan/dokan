import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { helpers } from '@utils/helpers';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';
import { commission, feeRecipient } from '@utils/interfaces';

const { DOKAN_PRO } = process.env;

test.use({ extraHTTPHeaders: { Authorization: payloads.adminAuth.Authorization } });

test.describe.skip('calculation test', () => {
    let apiUtils: ApiUtils;
    let taxRate: number;
    let commission: commission;
    let feeRecipient: feeRecipient;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        taxRate = await apiUtils.setUpTaxRate(payloads.enableTaxRate, payloads.createTaxRate);
        // todo:  get tax rate instead of setup if possible
        [commission, feeRecipient] = await dbUtils.getSellingInfo();
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('calculation test', { tag: ['@pro'] }, async () => {
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
            `\ncalculatedSubTotal:  ${calculatedSubTotal}\n`,
            `calculatedOrderTotal:  ${calculatedOrderTotal} received: ${Number(orderTotal)}\n`,
            `calculatedVendorEarning:  ${calculatedVendorEarning} received: ${Number(vendorEarning)}\n`,
            `calculatedAdminCommission:  ${calculatedAdminCommission} received: ${Number(adminCommission)}\n`,
            `providedShippingFee:  ${shippingFee}\n`,
            `calculatedShippingTax:  ${calculatedShippingTax} received: ${Number(shippingTax)}\n`,
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

test.describe.skip('Marketplace Coupon calculation test', () => {
    let apiUtils: ApiUtils;
    let taxRate: number = 5;
    let commission: commission;
    let feeRecipient: feeRecipient;
    let sequentialCoupon: { value: string } | boolean;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        taxRate = await apiUtils.setUpTaxRate(payloads.enableTaxRate, payloads.createTaxRate);
        // taxRate = await apiUtils.updateSingleWcSettingOptions('general', 'woocommerce_calc_discounts_sequentially', { value: 'no' });
        sequentialCoupon = await apiUtils.getSingleWcSettingOptions('general', 'woocommerce_calc_discounts_sequentially');
        sequentialCoupon = sequentialCoupon?.value === 'yes' ? true : false;
        // console.log('applySequentially:', sequentialCoupon);
        [commission, feeRecipient] = await dbUtils.getSellingInfo();
    });

    test('coupon calculation test', { tag: ['@pro'] }, async () => {
        //todo: apply single coupon, multiple coupon, sequential coupon with options and make separate test
        const [, , code1, amount1] = await apiUtils.createMarketPlaceCoupon({ ...payloads.createMarketPlaceCoupon(), discount_type: 'percent' }, payloads.adminAuth);
        const [, , code2, amount2] = await apiUtils.createMarketPlaceCoupon({ ...payloads.createMarketPlaceCoupon(), discount_type: 'percent' }, payloads.adminAuth);
        const discount = {
            type: 'coupon',
            coupon: {
                type: 'percentage',
                amount: [amount1, amount2],
                // amount: [5, 8],
                applySequentially: sequentialCoupon,
            },
        };
        const [, res, oid] = await apiUtils.createOrder(payloads.createProduct(), { ...payloads.createOrder, coupon_lines: [{ code: code1 }, { code: code2 }] });
        // const [, res, oid] = await apiUtils.createOrder('997', { ...payloads.createOrder, coupon_lines: [{ code: 'ac_66iu9e4awq' }, { code: 'ac_05taq2zkqo' }] });
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
        const calculatedAdminCommission = helpers.adminCommission(calculatedDiscountedSubTotal, commission, calculatedProductTax, calculatedShippingTax, shippingTotal, gatewayFee, feeRecipient);
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

test.describe.skip('commission test', () => {
    let apiUtils: ApiUtils;
    const taxRate: number = 10;
    let commission: commission;
    let feeRecipient: feeRecipient;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        // taxRate = await apiUtils.setUpTaxRate(payloads.enableTaxRate, { ...payloads.createTaxRate, rate: '10' });
    });

    test.afterAll(async () => {
        // await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
        await apiUtils.dispose();
    });

    test('percentage commission (global) test', { tag: ['@lite'] }, async () => {
        // await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, commission_type: 'percentage' });
        // const [commission, feeRecipient] = await dbUtils.getSellingInfo();
        const [, res, oid] = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder);
        console.log(res);
    });

    test('flat commission test (global)', { tag: ['@lite'] }, async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, commission_type: 'flat' });
    });

    test('combined commission (global) test', { tag: ['@lite'] }, async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, commission_type: 'combine' });
    });

    // //todo: add vendor-wise, category-wise, product-wise commission

    test('shipping fee recipient test', { tag: ['@pro'] }, async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, shipping_fee_recipient: 'seller' });
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, shipping_fee_recipient: 'admin' });
    });

    test('product tax fee recipient test', { tag: ['@pro'] }, async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, tax_fee_recipient: 'seller' });
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, tax_fee_recipient: 'admin' });
    });

    test('shipping tax fee recipient test', { tag: ['@pro'] }, async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, shipping_tax_fee_recipient: 'seller' });
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, shipping_tax_fee_recipient: 'admin' });
    });

    test('calculation test', { tag: ['@lite'] }, async () => {
        // provided data
        const [commission, feeRecipient] = await dbUtils.getSellingInfo();
        const providedShippingFee = Number(payloads.createOrder.shipping_lines[0]?.total);

        const [, res, oid] = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder);

        // received data
        const shippingFee = res.shipping_total;
        const shippingTax = res.shipping_tax;
        const cartTax = res.cart_tax;
        const totalTax = res.total_tax;
        const orderTotal = res.total;
        const gatewayFee = 0;
        const lineItems = res.line_items;

        const calculatedSubTotal = helpers.lineItemsToSubtotal(lineItems);
        const calculatedProductTax = helpers.productTax(taxRate, calculatedSubTotal);
        const calculatedShippingTax = helpers.shippingTax(taxRate, providedShippingFee);
        const calculatedTotalTax = calculatedProductTax + calculatedShippingTax;
        const calculatedOrderTotal = helpers.orderTotal(calculatedSubTotal, calculatedProductTax, calculatedShippingTax, providedShippingFee);
        const calculatedAdminCommission = helpers.adminCommission(calculatedSubTotal, commission, calculatedProductTax, calculatedShippingTax, providedShippingFee, gatewayFee, feeRecipient);
        const calculatedVendorEarning = helpers.vendorEarning(calculatedSubTotal, calculatedAdminCommission, calculatedProductTax, calculatedShippingTax, providedShippingFee, gatewayFee, feeRecipient);

        if (DOKAN_PRO) {
            const singleOrderLog = await apiUtils.getSingleOrderLog(String(oid));
            const order_total = singleOrderLog.order_total;
            const vendor_earning = singleOrderLog.vendor_earning;
            const admin_commission = singleOrderLog.commission;
            const gateway_fee = singleOrderLog.dokan_gateway_fee;
            const shipping_fee = singleOrderLog.shipping_total;
            const shipping_tax = singleOrderLog.shipping_total_tax;
            const tax_total = singleOrderLog.tax_total;
            // todo: add discount scenario

            const table = [
                [`OID: ${oid}`, 'OrderTotal', 'VendorEarning', 'AdminCommission', 'GatewayFee', 'ShippingFee', 'ShippingTax', 'ProductTax'],
                ['Expected', calculatedOrderTotal, calculatedVendorEarning, calculatedAdminCommission, gatewayFee, providedShippingFee, calculatedShippingTax, calculatedProductTax],
                ['Received', order_total, vendor_earning, admin_commission, gateway_fee, shipping_fee, shipping_tax, tax_total],
            ];
            console.table(table);
        } else {
            // todo:  modify for lite as well
            const table = [
                [`OID: ${oid}`, 'OrderTotal', 'VendorEarning', 'AdminCommission', 'GatewayFee', 'ShippingFee', 'ShippingTax', 'ProductTax'],
                ['Expected', calculatedOrderTotal, calculatedVendorEarning, calculatedAdminCommission, gatewayFee, providedShippingFee, calculatedShippingTax, calculatedProductTax],
                ['Received', orderTotal, '-', '-', gatewayFee, shippingFee, shippingTax, cartTax],
            ];
            console.table(table);
        }

        expect(Number(orderTotal)).toEqual(calculatedOrderTotal);
        expect(Number(vendor_earning)).toEqual(calculatedVendorEarning);
        expect(Number(admin_commission)).toEqual(calculatedAdminCommission);
        expect(Number(shippingFee)).toEqual(providedShippingFee);
        expect(Number(shippingTax)).toEqual(calculatedShippingTax);
        expect(Number(cartTax)).toEqual(calculatedProductTax);
        expect(Number(totalTax)).toEqual(calculatedTotalTax);
    });
});
