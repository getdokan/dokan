import { test, expect } from '@playwright/test';
import { ApiUtils } from '../../utils/apiUtils';
import { endPoints } from '../../utils/apiEndPoints';
import { payloads } from '../../utils/payloads';

let apiUtils: any;
let productId : string

test.beforeAll( async ( { request } ) => {
	 apiUtils = new ApiUtils( request );
	let [,pid] = await apiUtils.createProduct( payloads.createProduct() );
    productId = pid

} );

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe( 'product duplicate api test', () => {
	test( 'create duplicate product @v2', async ( { request } ) => {
        test.fail(!!process.env.CI, 'failed because not merged with develop yet')

		const response = await request.get( endPoints.createDuplicateProduct( productId) );
		const responseBody = await apiUtils.getResponseBody( response );
        console.log(responseBody)
		expect( response.ok() ).toBeTruthy();
	} );


} );
