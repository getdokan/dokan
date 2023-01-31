require( 'dotenv' ).config();
import { chromium, FullConfig, request } from '@playwright/test';

async function globalSetup( config: FullConfig ) {
	// get site url structure
	let serverUrl = process.env.BASE_URL ? process.env.BASE_URL : 'http://localhost:8888';
	let query = '?';
	const context = await request.newContext( { ignoreHTTPSErrors: true } );
	const head = await context.head( serverUrl );
	const headers = head.headers();
	const link = headers.link;
	if ( link.includes( 'rest_route' ) ) {
		serverUrl = serverUrl + '?rest_route=';
		query = '&';
	} else {
		serverUrl = serverUrl + '/wp-json';
	}
	process.env.SERVER_URL = serverUrl;
	process.env.QUERY = query;
}
export default globalSetup;
