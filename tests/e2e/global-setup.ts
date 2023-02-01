require('dotenv').config();
import { chromium, expect, FullConfig, request } from '@playwright/test';
import { BasePage } from './pages/basePage';
import { data } from './utils/testData';
import { selector } from './pages/selectors';
import { payloads } from './utils/payloads';
import { ApiUtils } from './utils/apiUtils';

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
	let admin = await browser.newPage()
	// log in
	await admin.goto(process.env.BASE_URL + '/wp-admin', { waitUntil: 'networkidle' })
	await admin.screenshot({ path: './playwright-report/screenshot_admin.png', fullPage: true });
	await admin.fill(selector.backend.email, 'admin')
	await admin.fill(selector.backend.password, '01dokan01')
	await admin.click(selector.backend.login)
	await admin.waitForLoadState('networkidle')
	await admin.context().storageState({ path: 'adminStorageState.json' })
	console.log('Stored adminStorageState')

	// change permalink
	await admin.goto(process.env.BASE_URL +  '/wp-admin/options-permalink.php');
	console.log(admin.url());
	await admin.click('#permalink-input-post-name');
	await admin.click('#submit');
	console.log(admin.url());
	console.log(await admin.locator('#setting-error-settings_updated strong').textContent());
	await expect(admin.getByText('Permalink structure updated.')).toBeVisible();
	await expect(admin.locator('#setting-error-settings_updated strong')).toContainText('Permalink structure updated.');
	console.log('permalink updated');

	// // get storageState: customer
	// let customer = await browser.newPage();
	// // log in
	// await customer.goto(process.env.BASE_URL + '/my-account', { waitUntil: 'networkidle' })
	// await customer.screenshot({ path: './playwright-report/screenshot_customer.png', fullPage: true });
	// await customer.fill(selector.frontend.username, 'customer1')
	// await customer.fill(selector.frontend.userPassword, '01dokan01')
	// await customer.click(selector.frontend.logIn)
	// await customer.context().storageState({ path: 'customerStorageState.json' })
	// console.log('Stored customerStorageState')

	// // get storageState: vendor
	// let vendor = await browser.newPage()
	// // log in
	// await vendor.goto(process.env.BASE_URL + '/my-account', { waitUntil: 'networkidle' })
	// await vendor.screenshot({ path: './playwright-report/screenshot_vendor.png', fullPage: true });
	// await vendor.fill(selector.frontend.username, 'vendor1')
	// await vendor.fill(selector.frontend.userPassword, '01dokan01')
	// await vendor.click(selector.frontend.logIn)
	// await vendor.context().storageState({ path: 'vendorStorageState.json' })
	// console.log('Stored vendorStorageState')

	await browser.close();
	console.log('Global Setup Finished!');
}

export default globalSetup;
