import { test, expect } from '@playwright/test';
import { ApiUtils } from 'utils/apiUtils';
import { helpers } from 'utils/helpers';
import { payloads } from 'utils/payloads';
import { dbUtils } from 'utils/dbUtils';


let apiUtils: ApiUtils;
let taxRate: number;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	taxRate = await apiUtils.setUpTaxRate(payloads.enableTaxRate, payloads.createTaxRate);
	//todo:  get tax rate instead of setup if possible
});

test.describe('calculation test', () => {
	test('calculation test @pro', async () => {
		//todo:  modify for lite as well
		const [commission, feeRecipient] = await dbUtils.getSellingInfo();

		const [, res, oid,] = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder);
		// console.log( res );
		console.log( 'Cal: order id:', oid );

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
		//ToDo: compare with all order total
		//todo:  add discount scenario

		const calculatedSubTotal = helpers.subtotal([productPrice], [productQuantity]); //todo:  update it for multiple products
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
