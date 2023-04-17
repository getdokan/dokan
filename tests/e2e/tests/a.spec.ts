import { test, expect } from '@playwright/test';



// test.use({ storageState: { cookies: [], origins: [] } });
// test.use({ storageState: 'adminStorageState.json' });
// test.use({ storageState: 'customerStorageState.json' });
test.use({ storageState: 'vendorStorageState.json' });
test('user login', async ({ page }) => {
	// const loginPage = new LoginPage(page);
	await page.goto('http://dokan5.test')
	await page.pause();
});