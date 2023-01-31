import { test, expect } from '@playwright/test';
import { ApiUtils } from '../../utils/apiUtils';
import { endPoints } from '../../utils/apiEndPoints';
import { payloads } from '../../utils/payloads';

let apiUtils: any;

test.beforeAll( async ( { request } ) => {
	apiUtils = new ApiUtils( request );
} );

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe( 'withdraw api test', () => {
	test( 'get withdraw settings @v2', async ( { request } ) => {
		const response = await request.get( endPoints.getWithdrawSettings );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );

	test( 'get withdraw summary @v2', async ( { request } ) => {
		const response = await request.get( endPoints.getWithdrawSummary );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );
} );
