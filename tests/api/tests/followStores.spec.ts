import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;
let sellerId: string;

test.beforeAll( async ( { request } ) => {
	apiUtils = new ApiUtils( request );
	const [ , id ] = await apiUtils.createStore( payloads.createStore() );
	sellerId = id;
	await apiUtils.followUnfollowStore( sellerId );
} );

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe( 'follow store api test', () => {
	test( 'get store follow status @pro', async ( { request } ) => {
		// let [, sellerId] = await apiUtils.createStore(payloads.createStore())

		const response = await request.get( endPoints.getStoreFollowStatus( sellerId ) );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );

	test( 'follow-unfollow a store @pro', async ( { request } ) => {
		// let [, sellerId] = await apiUtils.createStore(payloads.createStore())

		const response = await request.post( endPoints.followUnfollowStore, { data: { vendor_id: Number( sellerId ) } } );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );
} );
