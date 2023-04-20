import { test, expect } from '@playwright/test';



// test.use({ storageState: { cookies: [], origins: [] } });
// test.use({ storageState: 'playwright/.auth/adminStorageState.json' });
// test.use({ storageState: 'playwright/.auth/customerStorageState.json' });
// test.use({ storageState: 'playwright/.auth/vendorStorageState.json' });

test('user login', async ({ page }) => {
	await page.goto('http://dokan5.test')
	await page.context().storageState({ path: 'adminStorageState.json' });
	// await page.pause();
});

// test('user login1', async ({ browser }) => {
// 	// const loginPage = new LoginPage(page);
// 	const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
// 	const page = await context.newPage();
// 	await page.goto('http://dokan5.test')
// 	await page.pause();
// });