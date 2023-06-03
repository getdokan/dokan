import { FullConfig, request } from '@playwright/test';

async function globalSetup(config: FullConfig) {
	console.log('Global Setup running....');
	// get site url structure
	let serverUrl = process.env.BASE_URL ? process.env.BASE_URL : 'http://localhost:9999';
	const apiContext = await request.newContext({ ignoreHTTPSErrors: true });
	const head = await apiContext.head(serverUrl);  //TODO: add retry fro these step
	const headers = head.headers();
	const link = headers.link;
	process.env.SERVER_URL =  link.includes('rest_route') ? serverUrl + '?rest_route=': serverUrl = serverUrl + '/wp-json';
	console.log('ServerUrl:', process.env.SERVER_URL);
	console.log('Global Setup Finished!');
}

export default globalSetup;
