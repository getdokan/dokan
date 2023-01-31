import { test, expect } from '@playwright/test';
import { ApiUtils } from '../../utils/apiUtils';
import { endPoints } from '../../utils/apiEndPoints';
import { payloads } from '../../utils/payloads';

let apiUtils: any;

test.beforeAll( async ( { request } ) => {
	apiUtils = new ApiUtils( request );
	await apiUtils.createProduct( payloads.createProduct() );
} );

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe( 'product filter api test', () => {
	test( 'get products filter by data @v2', async ( { request } ) => {
		const response = await request.get( endPoints.getProductsFilterByData );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );

	test( 'get filtered products @v2', async ( { request } ) => {
		const response = await request.get( endPoints.getFilteredProducts, { params: payloads.filterParams } );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );
} );
