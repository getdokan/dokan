import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { helpers } from '../utils/helpers';
import { payloads } from '../utils/payloads';

let apiUtils: any;
let taxRate: number;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);

	taxRate = await apiUtils.setUpTaxRate(payloads.enableTaxRate, payloads.createTaxRate);
});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe.skip('calculation test', () => {
	test('calculation test', async ({ request }) => {
		let discountTotal: any, discountTax: any, shippingTotal: number | undefined, shippingTax: any, cartTax: any, totalTax: any, orderTotal: any, paymentMethod: any, productPrice: number, productQuantity: number,
			gatewayFee = 0;

		const [res, oid] = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder);
		// console.log( res );
		console.log( 'Cal: order id:',oid );

		discountTotal = res.discount_total;
		discountTax = res.discount_tax;
		shippingTotal = res.shipping_total;
		shippingTax = res.shipping_tax;
		cartTax = res.cart_tax;
		totalTax = res.total_tax;
		orderTotal = res.total;
		paymentMethod = res.payment_method_ti;
		productPrice = res.line_items[0].subtotal;
		productQuantity = res.line_items[0].quantity;

		let orderReport = await apiUtils.getSingleOrderLog(String(oid))
		let adminCommission = orderReport.commission
		let vendorEarning = orderReport.vendor_earning

		const commissionRate = 10;

		const calculatedSubTotal = helpers.subtotal([productPrice], [productQuantity]);
		const calculatedTax = helpers.tax(taxRate, calculatedSubTotal, shippingTotal);
		const calculatedOrderTotal = helpers.orderTotal(calculatedSubTotal, calculatedTax, shippingTotal);
		const calculatedAdminCommission = helpers.adminCommission(calculatedSubTotal, commissionRate, calculatedTax, shippingTotal, gatewayFee);
		const calculatedVendorEarning = helpers.vendorEarning(calculatedSubTotal, calculatedAdminCommission, calculatedTax, shippingTotal, gatewayFee);
		// console.log(
		// 	`calculatedSubTotal:  ${calculatedSubTotal}\n`,
		// 	`calculatedTax:  ${calculatedTax}\n`,
		// 	`calculatedOrderTotal:  ${calculatedOrderTotal}\n`,
		// 	`calculatedAdminCommission:  ${calculatedAdminCommission}\n`,
		// 	`calculatedVendorEarning:  ${calculatedVendorEarning}\n`,
		// );
		expect(calculatedTax).toEqual(Number(totalTax));
		expect(calculatedOrderTotal).toEqual(Number(orderTotal));
		expect(calculatedAdminCommission).toEqual(Number(adminCommission));
		expect(calculatedVendorEarning).toEqual(Number(vendorEarning));
	});
});
