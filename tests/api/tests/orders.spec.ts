import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';
import { helpers } from '../utils/helpers';

let apiUtils: any;
let orderId: string;

test.beforeAll( async ( { request } ) => {
	apiUtils = new ApiUtils( request );
	const [ , id ] = await apiUtils.createOrder( payloads.createProduct(), payloads.createOrder );
	orderId = id;
} );

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe( 'order api test', () => {
	test( 'get all orders', async ( { request } ) => {
		const response = await request.get( endPoints.getAllOrders );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );

	test( 'get orders summary', async ( { request } ) => {
		const response = await request.get( endPoints.getOrdersSummary );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );

	test( 'get orders with before after', async ( { request } ) => {
		const response = await request.get( endPoints.getOrdersBeforeAfter( `${ helpers.currentYear }-12-30`, `${ helpers.currentYear }-01-01` ) );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );

	test( 'get single order', async ( { request } ) => {
		// let [, orderId] = await apiUtils.createOrder(payloads.createProduct(),payloads.createOrder)

		const response = await request.get( endPoints.getSingleOrder( orderId ) );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );

	test( 'update an order', async ( { request } ) => {
		// let [, orderId] = await apiUtils.createOrder(payloads.createProduct(),payloads.createOrder)

		const response = await request.put( endPoints.updateOrder( orderId ), { data: payloads.updateOrder } );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );
} );

