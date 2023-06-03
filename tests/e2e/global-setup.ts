import { chromium, FullConfig, request } from '@playwright/test';

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
	process.env.QUERY = query;
	console.log('ServerUrl:', process.env.SERVER_URL);
	console.log('Global Setup Finished!');
}

export default globalSetup;
