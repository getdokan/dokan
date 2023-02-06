import { test, expect } from '@playwright/test';
import { ApiUtils } from '../../utils/apiUtils';
import { endPoints } from '../../utils/apiEndPoints';
import { payloads } from '../../utils/payloads';

let apiUtils: any;
let productId: string;

test.beforeAll( async ( { request } ) => {
	apiUtils = new ApiUtils( request );
	const [ , pId ] = await apiUtils.createProduct( payloads.createProduct() );
} );

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe.skip( 'rank math api test', () => {
	test( 'rank math', async ( { request } ) => {
		const response = await request.post( endPoints.rankMath( productId ), { data: {} } );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );
} );
