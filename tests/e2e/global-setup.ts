require('dotenv').config();
import { chromium, expect, FullConfig, request } from '@playwright/test';
import { selector } from './pages/selectors';

async function globalSetup(config: FullConfig) {
	console.log('Global Setup running....');

	// get site url structure
	let serverUrl = process.env.BASE_URL ? process.env.BASE_URL : 'http://localhost:8889';
	let query = '?';
	const context = await request.newContext({ ignoreHTTPSErrors: true });
	const head = await context.head(serverUrl);
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

	// get user signed in state
	const browser = await chromium.launch({ headless: true });

	// get storageState: admin
	let admin = await browser.newPage();
	// log in
	await admin.goto(process.env.BASE_URL + '/wp-admin', { waitUntil: 'networkidle' });
	await admin.screenshot({ path: './playwright-report/screenshot_admin.png', fullPage: true });
	await admin.fill(selector.backend.email, process.env.ADMIN);
	await admin.fill(selector.backend.password, process.env.ADMIN_PASSWORD);
	await admin.locator(selector.backend.login).click();
	await admin.waitForLoadState('networkidle');
	// await admin.context().storageState({ path: 'adminStorageState.json' });
	// console.log('Stored adminStorageState');

	// change permalink
	// set Permalinks Settings
	await admin.goto(process.env.BASE_URL +  '/wp-admin/options-permalink.php', { waitUntil: 'networkidle' });
	console.log('permalink page url: ',admin.url());
	// await admin.locator(selector.admin.aDashboard.settings).hover();
	// await admin.locator(selector.admin.settings.permalinks).click();
	await admin.locator('#permalink-input-post-name').click();
	await admin.locator('#submit').click();
	console.log('permalink page url: ',admin.url());
	console.log(await admin.locator('#setting-error-settings_updated strong').textContent());
	// await expect(admin.getByText('Permalink structure updated.')).toBeVisible();
	await expect(admin.locator('#setting-error-settings_updated strong')).toContainText('Permalink structure updated.');
	console.log('permalink updated');

	// // get storageState: customer
	// let customer = await browser.newPage();
	// // log in
	// await customer.goto(process.env.BASE_URL + '/my-account', { waitUntil: 'networkidle' });
	// await customer.screenshot({ path: './playwright-report/screenshot_customer.png', fullPage: true });
	// await customer.fill(selector.frontend.username, process.env.CUSTOMER);
	// await customer.fill(selector.frontend.userPassword, process.env.CUSTOMER_PASSWORD);
	// await customer.click(selector.frontend.logIn);
	// await customer.context().storageState({ path: 'customerStorageState.json' });
	// console.log('Stored customerStorageState');

	// // get storageState: vendor
	// let vendor = await browser.newPage();
	// // log in
	// await vendor.goto(process.env.BASE_URL + '/my-account', { waitUntil: 'networkidle' });
	// await vendor.screenshot({ path: './playwright-report/screenshot_vendor.png', fullPage: true });
	// await vendor.fill(selector.frontend.username, process.env.VENDOR);
	// await vendor.fill(selector.frontend.userPassword, process.env.VENDOR_PASSWORD);
	// await vendor.click(selector.frontend.logIn);
	// await vendor.context().storageState({ path: 'vendorStorageState.json' });
	// console.log('Stored vendorStorageState');

	await browser.close();
	console.log('Global Setup Finished!');
}

export default globalSetup;
