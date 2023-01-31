import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;
let attributeId: string;
let attributeTermId: string;

test.beforeAll( async ( { request } ) => {
	apiUtils = new ApiUtils( request );
	const [ , aId, atId ] = await apiUtils.createAttributeTerm( payloads.createAttribute(), payloads.createAttributeTerm() );
	attributeId = aId;
	attributeTermId = atId;
} );

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe( 'attribute term api test', () => {
	test( 'get all attribute terms', async ( { request } ) => {
		// let [, attributeId,] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm())

		const response = await request.get( endPoints.getAllAttributeTerms( attributeId ) );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );

	test( 'get single attribute term', async ( { request } ) => {
		// let [, attributeId, attributeTermId] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm())

		const response = await request.get( endPoints.getSingleAttributeTerm( attributeId, attributeTermId ) );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );

	test( 'create an attribute term', async ( { request } ) => {
		// let [, attributeId] = await apiUtils.createAttribute(payloads.createAttribute())

		const response = await request.post( endPoints.createAttributeTerm( attributeId ), { data: payloads.createAttributeTerm() } );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );

	test( 'update an attribute term ', async ( { request } ) => {
		// let [, attributeId, attributeTermId] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm())

		const response = await request.put( endPoints.updateAttributeTerm( attributeId, attributeTermId ), { data: payloads.updateAttributeTerm() } );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );

	test( 'delete an attribute term', async ( { request } ) => {
		// let [, attributeId, attributeTermId] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm())

		const response = await request.delete( endPoints.deleteAttributeTerm( attributeId, attributeTermId ) );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );

	test( 'update batch attribute terms', async ( { request } ) => {
		const allAttributeTermIds = ( await apiUtils.getAllAttributeTerms( attributeId ) ).map( ( a: { id: any; } ) => a.id );
		// console.log(allAttributeTermIds)

		const batchAttributeTerms = [];
		for ( const attributeTermId of allAttributeTermIds.slice( 0, 2 ) ) {
			batchAttributeTerms.push( { ...payloads.updateBatchAttributesTemplate(), id: attributeTermId } );
		}
		// console.log(batchAttributeTerms)

		const response = await request.put( endPoints.updateBatchAttributeTerms( attributeId ), { data: { update: batchAttributeTerms } } );
		const responseBody = await apiUtils.getResponseBody( response );
		expect( response.ok() ).toBeTruthy();
	} );
} );
