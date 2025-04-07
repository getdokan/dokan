import { test } from '@playwright/test';

test.describe('Vendor store seo test', () => {
    test.use({ storageState: 'playwright/.auth/vendorStorageState.json' });

    test('store seo title, description', async ({ page }) => {
      await page.goto('https://dokan.test/dashboard/new/#settings/seo');
      await page.locator('#dokan_seo_meta_title').click();
      await page.locator('#dokan_seo_meta_title').fill('My Dokan Title');
      await page.locator('#dokan_seo_meta_desc').click();
      await page.locator('#dokan_seo_meta_desc').fill('This meta description is for testing');
      await page.locator('#dokan_seo_meta_keywords').click();
      await page.locator('#dokan_seo_meta_keywords').fill('Keyword 1, Keyword 2, Keyword 3');
      await page.locator('#dokan_seo_og_title').click();
      await page.locator('#dokan_seo_og_title').fill('My Dokan OG Title');
      await page.locator('#dokan_seo_og_desc').click();
      await page.locator('#dokan_seo_og_desc').fill('This OG description is for testing');
      await page.locator('#dokan_seo_twitter_title').click();
      await page.locator('#dokan_seo_twitter_title').fill('My Dokan Twitter Title');
      await page.locator('#dokan_seo_twitter_desc').click();
      await page.locator('#dokan_seo_twitter_desc').fill('This Twitter description is for testing');

      // await page.getByRole('button', { name: ' Upload' }).first().click();
      // await page.getByRole('tab', { name: 'Media Library' }).click();
      // await page.waitForLoadState('load', { timeout: 10000 });
      // await page.getByLabel('polo-2.jpg').click();
      // await page.getByRole('button', { name: 'Use this media' }).click();
      // await page.getByRole('button', { name: ' Upload' }).nth(1).click();
      // await page.getByRole('tab', { name: 'Media Library' }).click();
      // await page.waitForLoadState('load', { timeout: 10000 });
      // await page.getByRole('checkbox', { name: 'tshirt-2.jpg' }).click();
      // await page.getByRole('button', { name: 'Use this media' }).click();

      await page.getByRole('button', { name: 'Save Changes' }).click();
    });
})
