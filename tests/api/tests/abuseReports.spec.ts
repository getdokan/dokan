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

test.describe( 'abuse report api test', () => {
	test( 'get all abuse report reasons @pro', async ( { request } ) => {
		const response = await request.get( endPoints.getAllAbuseReportReasons );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );

	test( 'get all abuse reports @pro', async ( { request } ) => {
		const response = await request.get( endPoints.getAllAbuseReports );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );

	test.skip( 'delete a abuse report @pro', async ( { request } ) => {
		const abuseReportId = await apiUtils.getAbuseReportId();

		const response = await request.delete( endPoints.deleteAbuseReport( abuseReportId ) );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );

	test.skip( 'delete batch abuse reports @pro', async ( { request } ) => {
		const allAbuseReportIds = ( await apiUtils.getAllAbuseReports() ).map( ( a: { id: any } ) => a.id );
		// console.log(allAbuseReportIds)

		const response = await request.delete( endPoints.deleteBatchAbuseReports, { data: { items: allAbuseReportIds } } );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );
} );

