import { FullConfig, request } from '@playwright/test';

async function globalSetup(config: FullConfig) {
	console.log('Global Setup running....');
	// get site url structure
	let serverUrl = process.env.BASE_URL ? process.env.BASE_URL : 'http://localhost:9999';
	let query = '?';
	const apiContext = await request.newContext({ ignoreHTTPSErrors: true });
	const head = await apiContext.head(serverUrl);  //TODO: add retry fro these step
	const headers = head.headers();
	const link = headers.link;
	if (link.includes('rest_route')) {
		serverUrl = serverUrl + '?rest_route=';
		query = '&';
	} else {
		serverUrl = serverUrl + '/wp-json';
	}
	process.env.SERVER_URL = serverUrl;
	// process.env.SERVER_URL = serverUrl + '/wp-json';
	process.env.QUERY = query;
	// process.env.QUERY = '&';
	console.log('ServerUrl:', process.env.SERVER_URL);
	console.log('Global Setup Finished!');
}

export default globalSetup;
