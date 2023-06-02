import { test, expect } from '@playwright/test';
import { ApiUtils } from '../../utils/apiUtils';
import { helpers } from '../../utils/helpers';
import { payloads } from '../../utils/payloads';
import { dbUtils } from '../../utils/dbUtils';

let apiUtils: ApiUtils;
let taxRate: number ;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	taxRate = await apiUtils.setUpTaxRate(payloads.enableTaxRate, payloads.createTaxRate); //TODO: get tax rate instead of setup if possible, need to make faster
});

test.describe('calculation test', () => {
	test('calculation test', async ({ request }) => {
		let discountTotal: any, discountTax: any, shippingFee: number , shippingTax: any, cartTax: any, totalTax: any, orderTotal: any, paymentMethod: any, productPrice: number, productQuantity: number, gatewayFee = 0;

		let [commission, feeRecipient] = await dbUtils.getSellingInfo();

		const [res, oid] = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder);
		// console.log( res );
		console.log( 'Cal: order id:', oid );

		discountTotal = res.discount_total;
		discountTax = res.discount_tax;
		shippingFee = res.shipping_total;
		shippingTax = res.shipping_tax;
		cartTax = res.cart_tax;
		totalTax = res.total_tax;
		orderTotal = res.total;
		paymentMethod = res.payment_method_ti;
		productPrice = res.line_items[0].subtotal;
		productQuantity = res.line_items[0].quantity;

		let orderReport = await apiUtils.getSingleOrderLog(String(oid))
		// console.log(orderReport);
		let adminCommission = orderReport.commission
		let vendorEarning = orderReport.vendor_earning
		//ToDo: compare with all order total
		//TODO: add discount scenario

		const calculatedSubTotal = helpers.subtotal([productPrice], [productQuantity]); //TODO: update it for multiple products
		const calculatedProductTax = helpers.productTax(taxRate, calculatedSubTotal);
		const calculatedShippingTax = helpers.shippingTax(taxRate, shippingFee);
		const calculatedTotalTax = helpers.roundToTwo(calculatedProductTax + calculatedShippingTax);
		const calculatedOrderTotal = helpers.orderTotal(calculatedSubTotal, calculatedProductTax, calculatedShippingTax,  shippingFee);
		const calculatedAdminCommission = helpers.adminCommission(calculatedSubTotal, commission, calculatedProductTax, calculatedShippingTax, shippingFee, gatewayFee, feeRecipient);
		const calculatedVendorEarning = helpers.vendorEarning(calculatedSubTotal, calculatedAdminCommission, calculatedProductTax, calculatedShippingTax, shippingFee, gatewayFee, feeRecipient);
		
		console.log(
			`\ncalculatedSubTotal:  ${calculatedSubTotal}\n`,
			`calculatedOrderTotal:  ${calculatedOrderTotal}\n`,
			`calculatedVendorEarning:  ${calculatedVendorEarning}\n`,
			`calculatedAdminCommission:  ${calculatedAdminCommission}\n`,
			`providedShippingFee:  ${shippingFee}\n`,
			`calculatedShippingTax:  ${calculatedShippingTax}\n`,
			`calculatedProductTax:  ${calculatedProductTax}\n`,
			`calculatedTotalTax:  ${calculatedTotalTax}\n`,

		);
	
		expect(calculatedProductTax).toEqual(Number(cartTax));
		expect(calculatedShippingTax).toEqual(Number(shippingTax));
		expect(calculatedTotalTax).toEqual(Number(totalTax));
		expect(calculatedOrderTotal).toEqual(Number(orderTotal));
		expect(calculatedAdminCommission).toEqual(Number(adminCommission));
		expect(calculatedVendorEarning).toEqual(Number(vendorEarning));
	});
});
