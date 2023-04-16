require('dotenv').config();
import { chromium, expect, FullConfig, request } from '@playwright/test';
import { selector } from './pages/selectors';

async function globalSetup(config: FullConfig) {
	console.log('Global Setup running....');

	// get user signed in state
	const browser = await chromium.launch({});
	const context = await browser.newContext();
	await context.tracing.start({ screenshots: true, snapshots: true });

	// // get storageState: admin
	// let admin = await browser.newPage();

	// // log in
	// await admin.goto(process.env.BASE_URL + '/wp-admin', { waitUntil: 'networkidle' });
	// await admin.fill(selector.backend.email, process.env.ADMIN);
	// await admin.fill(selector.backend.password, process.env.ADMIN_PASSWORD);
	// await admin.locator(selector.backend.login).click();
	// await admin.waitForLoadState('networkidle');
	// await admin.context().storageState({ path: 'adminStorageState.json' });
	// console.log('Stored adminStorageState');

	// // set permalink 
	// await admin.goto(process.env.BASE_URL + '/wp-admin/options-permalink.php', { waitUntil: 'networkidle' });
	// await admin.locator('#permalink-input-post-name').click();
	// await admin.locator('#submit').click();
	// await expect(admin.locator('#setting-error-settings_updated strong')).toContainText('Permalink structure updated.');
	// console.log('permalink updated');

   //TODO: implement fixture for lite pro issue handle

	// // get storageState: customer
	let customer = await browser.newPage(); //TODO: user need to create first move to _setup file
	// // register & log in
	await customer.goto(process.env.BASE_URL + '/my-account', { waitUntil: 'networkidle' });
	// await customer.screenshot({ path: './playwright-report/screenshot_customer.png', fullPage: true }); //TODO: where is this saving
	// // register
	await customer.fill(selector.customer.cRegistration.regEmail, 'cushjtomertre345@g.c');  //TODO: global setup not raising error
	await customer.fill(selector.customer.cRegistration.regPassword, process.env.CUSTOMER_PASSWORD);
	await customer.click(selector.customer.cRegistration.regCustomer);
	await customer.click(selector.customer.cRegistration.register); // TODO: will register create storage.json


	//TODO: 1. add vendor reg for vendor storagestate.json
	 		2. seperate globlSetup for local & CI , cant reg user every time for local site 
			3. page context issue

	// log in
	// await customer.fill(selector.frontend.username, process.env.CUSTOMER);
	// await customer.fill(selector.frontend.userPassword, process.env.CUSTOMER_PASSWORD);
	// await customer.click(selector.frontend.logIn);
	await customer.context().storageState({ path: 'customerStorageState12.json' });
	console.log('Stored customerStorageState1');

	// // get storageState: vendor
	// let vendor = await browser.newPage();  //TODO: user need to create first move to _setup file
	// // log in
	// await vendor.goto(process.env.BASE_URL + '/my-account', { waitUntil: 'networkidle' });
	// await vendor.screenshot({ path: './playwright-report/screenshot_vendor.png', fullPage: true });
	// await vendor.fill(selector.frontend.username, process.env.VENDOR);
	// await vendor.fill(selector.frontend.userPassword, process.env.VENDOR_PASSWORD);
	// await vendor.click(selector.frontend.logIn);
	// await vendor.context().storageState({ path: 'vendorStorageState.json' });
	// console.log('Stored vendorStorageState');



	await context.tracing.stop({ path: './test-results/setup-trace.zip' });
	await browser.close();

	// get site url structure
	let serverUrl = process.env.BASE_URL ? process.env.BASE_URL : 'http://localhost:8889';
	let query = '?';
	const apiContext = await request.newContext({ ignoreHTTPSErrors: true });
	const head = await apiContext.head(serverUrl);
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

	console.log('Global Setup Finished!');
}

export default globalSetup;
