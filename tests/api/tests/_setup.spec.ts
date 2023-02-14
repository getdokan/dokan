import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;

test.beforeAll( async ( { request } ) => {
	apiUtils = new ApiUtils( request );
} );

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe( ' api test', () => {
	test( 'setup test store settings', async ( { request } ) => {
		const response = await request.put( endPoints.updateSettings, { data: payloads.setupStore } );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );

	test( 'create test customer', async ( { request } ) => {
		const response = await request.post( endPoints.createCustomer, { data: payloads.createCustomer1 } );
		const responseBody = await apiUtils.getResponseBody( response , false);
		responseBody.code ? expect( response.status() ).toBe( 400 ) : expect( response.ok() ).toBeTruthy();
	} );

	test( 'create test vendor', async ( { request } ) => {
		const response = await request.post( endPoints.createStore, { data: payloads.createStore1 } );
		const responseBody = await apiUtils.getResponseBody( response , false);
		responseBody.code ? expect( response.status() ).toBe( 500 ) : expect( response.ok() ).toBeTruthy();
	} );
} );
