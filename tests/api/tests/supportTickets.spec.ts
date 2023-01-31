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

test.describe.skip( 'support ticket api test', () => {
	//TODO: prerequisite => multiple support tickets

	test( 'get all support ticket customers', async ( { request } ) => {
		const response = await request.get( endPoints.getAllSupportTicketCustomers );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );

	test( 'get all support tickets', async ( { request } ) => {
		const response = await request.get( endPoints.getAllSupportTickets );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );

	test( 'get single support ticket', async ( { request } ) => {
		const [ supportTicketId, sellerId ] = await apiUtils.getSupportTicketId();

		const response = await request.get( endPoints.getSingleSupportTicket( supportTicketId, sellerId ) );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );

	test( 'create a support ticket comment', async ( { request } ) => {
		const [ supportTicketId ] = await apiUtils.getSupportTicketId();

		const response = await request.post( endPoints.createSupportTicketComment( supportTicketId ), { data: payloads.createSupportTicketComment } );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );

	test( 'update support ticket status', async ( { request } ) => {
		const [ supportTicketId ] = await apiUtils.getSupportTicketId();

		const response = await request.post( endPoints.updateSupportTicketStatus( supportTicketId ), { data: payloads.updateSupportTicketStatus } );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();

		//reopen support ticket
		await apiUtils.updateSupportTicketStatus( supportTicketId, 'open' );
	} );

	test( 'update a support ticket email notification', async ( { request } ) => {
		const [ supportTicketId ] = await apiUtils.getSupportTicketId();

		const response = await request.post( endPoints.updateSupportTicketEmailNotification( supportTicketId ), { data: payloads.updateSupportTicketEmailNotification } );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );

	test( 'delete a support ticket comment', async ( { request } ) => {
		const supportTicketCommentId = await apiUtils.createSupportTicketComment( payloads.createSupportTicketComment );

		const response = await request.delete( endPoints.deleteSupportTicketComment( supportTicketCommentId ) );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );

	test( 'update batch support tickets', async ( { request } ) => {
		const allSupportTicketIds = ( await apiUtils.getAllSupportTickets() ).map( ( a: { ID: any } ) => a.ID );
		console.log( allSupportTicketIds );

		const response = await request.put( endPoints.updateBatchSupportTickets, { data: { close: allSupportTicketIds } } );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();

		// reopen all support tickets
		for ( const supportTicketId of allSupportTicketIds ) {
			await apiUtils.updateSupportTicketStatus( supportTicketId, 'open' );
		}
	} );
} );
