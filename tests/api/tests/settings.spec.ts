import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;

test.beforeAll( async ( { request } ) => {
	apiUtils = new ApiUtils( request );
} );

test.afterAll( async ( { request } ) => {
	// TODO: remove after update setting cause disable selling fix
	const response = await request.put( endPoints.updateSettings, { data: payloads.setupStore } );
	const responseBody = await apiUtils.getResponseBody( response );
	expect( response.ok() ).toBeTruthy();
} );

// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe( 'settings api test', () => {
	test( 'get settings', async ( { request } ) => {
		const response = await request.get( endPoints.getSettings );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );

	test( 'update settings', async ( { request } ) => {
		const response = await request.put( endPoints.updateSettings, { data: payloads.updateSettings } );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );
} );

