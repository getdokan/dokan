import { expect, test } from '@utils/test';
import path from 'path';
import { toPath } from '@utils/helpers';

const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

// NOTE: the former legacy `Store Appearance test` describe was RETIRED here.
// Its page object (storeAppearancePage.ts) was 14/14 empty stub methods
// (`async view…(): Promise<void> {}`) with zero page/locator/expect calls, so
// every test in it — the ~10 that ran AND the 10 that were `test.skip`ped
// (store map, Mapbox/Google map source, reCAPTCHA, header templates) — passed
// vacuously, testing nothing (fake-green). Rather than un-skip stubs into more
// fake-green, the whole stub-backed block was removed. Real coverage of the
// store settings surface lives in the React describe below; genuine
// map/reCAPTCHA/header-template coverage should be (re)written against the real
// vendor store page if the team wants it.

test.describe('Vendor Store Appearance (React) Tests @lite', () => {
    test('Test Case 1 - Store settings page renders', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        await page.goto(toPath(`dashboard/settings/store/`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await context.close();
    });

    test('Test Case 2 - Store name field is visible', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        await page.goto(toPath(`dashboard/settings/store/`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        // Vendor settings should expose store name input
        const nameInput = page.locator('input[name="dokan_store_name"], input[name="store_name"], input[id*="store_name"]');
        const visible = await nameInput.first().isVisible({ timeout: 5000 }).catch(() => false);
        expect(visible).toBe(true);
        await page.close();
        await context.close();
    });
});
