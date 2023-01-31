import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;
let reviewId: string;

test.beforeAll( async ( { request } ) => {
	apiUtils = new ApiUtils( request );
	const [ , id ] = await apiUtils.createProductReview( payloads.createProduct(), payloads.createProductReview() );
	reviewId = id;
} );

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe( 'product review api test', () => {
	test( 'get all product reviews', async ( { request } ) => {
		const response = await request.get( endPoints.getAllProductReviews );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );

	test( 'get product reviews summary', async ( { request } ) => {
		const response = await request.get( endPoints.getProductReviewSummary );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );

	test( 'update a product review', async ( { request } ) => {
		// let [, reviewId] = await apiUtils.createProductReview(payloads.createProduct(), payloads.createProductReview())

		const response = await request.put( endPoints.updateStoreReview( reviewId ), { data: payloads.updateProductReview } );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );
} );
