import { test, expect } from '@playwright/test';
import { ApiUtils } from '../../utils/apiUtils';
import { endPoints } from '../../utils/apiEndPoints';
import { payloads } from '../../utils/payloads';

let apiUtils: any;
let productId: string;
let variationId: string;

test.beforeAll( async ( { request } ) => {
	apiUtils = new ApiUtils( request );
	const [ , pId ] = await apiUtils.createProduct( payloads.createDownloadableProduct() );
	productId = pId;
	const [ , vId ] = await apiUtils.createVariableProductWithVariation( payloads.createAttribute(), payloads.createAttributeTerm(), payloads.createVariableProduct() );
	variationId = vId;
} );

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe( 'product block api test', () => {
	test( 'get product block details', async ( { request } ) => {
		const response = await request.get( endPoints.getProductBlockDetails( productId ) );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );

	test( 'get variable product block details', async ( { request } ) => {
		const response = await request.get( endPoints.getProductBlockDetails( variationId ) );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );
} );
