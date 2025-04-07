import { test } from '@playwright/test';

test.describe('Product AI', () => {
    test.use({ storageState: 'playwright/.auth/vendorStorageState.json' });

    test('add product title, description', async ({ page }) => {
      await page.goto('https://dokan.test/dashboard/products/');
      await page.getByRole('link', { name: 'Add new product' }).click();
      await page.locator('#ai-prompt-app').click();
      await page.getByRole('textbox', { name: 'Enter prompt' }).click();
      await page.getByRole('textbox', { name: 'Enter prompt' }).fill('iphone 16 pro max');
      await page.getByRole('button', { name: 'Generate' }).click();
      await page.getByRole('button', { name: 'Insert', exact: true }).click();
      await page.locator('#ai-prompt-app').click();
      await page.getByRole('button', { name: 'Refine' }).first().click();
      await page.getByRole('button', { name: 'Refine' }).nth(1).click();
      await page.getByRole('button', { name: 'Refine' }).nth(2).click();
      await page.getByRole('button', { name: 'regenerate all again' }).click();
      await page.getByRole('button', { name: 'Insert', exact: true }).click();
      await page.getByRole('button', { name: 'Yes, Insert' }).click();
      await page.getByRole('textbox', { name: 'Price ( You Earn : 0.0000$ )' }).click();
      await page.getByRole('textbox', { name: 'Price ( You Earn : 0.0000$ )' }).fill('599');
      await page.getByRole('button', { name: 'Save Product' }).click();
    });
})
