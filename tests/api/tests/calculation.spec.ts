import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { helpers } from '../utils/helpers';
import { payloads } from '../utils/payloads';

let apiUtils: any;

test.beforeAll( async ( { request } ) => {
	apiUtils = new ApiUtils( request );
} );

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe.skip( 'calculation test', () => {
	test( 'calculation test', async ( { request } ) => {
		let discountTotal, discountTax, shippingTotal, shippingTax, cartTax, totalTax, orderTotal, paymentMethod, productPrice, productQuantity,
			gatewayFee = 0;

		const [ res, oid ] = await apiUtils.createOrder( payloads.createProduct(), payloads.createOrder );
		console.log( res );
		discountTotal = res.discount_total;
		discountTax = res.discount_tax;
		shippingTotal = res.shipping_total;
		shippingTax = res.shipping_tax;
		cartTax = res.cart_tax;
		totalTax = res.total_tax;
		orderTotal = res.total;
		paymentMethod = res.payment_method_ti;
		productPrice = res.line_items[ 0 ].subtotal;
		productQuantity = res.line_items[ 0 ].quantity;

		// let oRes = await apiUtils.getSingleOrder(oid)
		// let [, uid] = await apiUtils.getCurrentUser()
		// let sRes = await apiUtils.getSingleStore(uid)

		const commissionRate = 10;
		const taxRate = 5;

		const calculatedSubTotal = helpers.subtotal( [ productPrice ], [ productQuantity ] );
		const calculatedTax = helpers.tax( taxRate, calculatedSubTotal, shippingTotal );
		const calculatedOrderTotal = helpers.orderTotal( calculatedSubTotal, calculatedTax, shippingTotal );
		const calculatedAdminCommission = helpers.adminCommission( calculatedSubTotal, commissionRate, calculatedTax, shippingTotal, gatewayFee );
		const calculatedVendorEarning = helpers.vendorEarning( calculatedSubTotal, calculatedAdminCommission, calculatedTax, shippingTotal, gatewayFee );
		console.log(
			`calculatedSubTotal:  ${ calculatedSubTotal }\n`,
			`calculatedTax:  ${ calculatedTax }\n`,
			`calculatedOrderTotal:  ${ calculatedOrderTotal }\n`,
			`calculatedAdminCommission:  ${ calculatedAdminCommission }\n`,
			`calculatedVendorEarning:  ${ calculatedVendorEarning }\n`,
		);
		expect( calculatedTax ).toEqual( Number( totalTax ) );
		expect( calculatedOrderTotal ).toEqual( Number( orderTotal ) );
	} );
} );
