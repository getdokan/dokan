import { test as base, expect, type Browser, type Page } from '@utils/test';
import { request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { PHP_FATAL } from '@utils/dataViews';
import { ADMIN_STORAGE_STATE, VENDOR_STORAGE_STATE, VENDOR2_STORAGE_STATE, CUSTOMER_STORAGE_STATE } from '@utils/authStates';

type RolePages = { adminPage: Page; vendorPage: Page; vendor2Page: Page; customerPage: Page };
type Worker = { api: ApiUtils };

// Every role page fails its test on an uncaught JS error or a PHP fatal, so no spec needs its own "renders without errors" test.
const rolePage = (storageState: string) => async ({ browser }: { browser: Browser }, use: (p: Page) => Promise<void>) => {
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();
    const jsErrors: string[] = [];
    page.on('pageerror', error => jsErrors.push(error.message));
    await use(page);
    await expect(page.locator(PHP_FATAL), 'PHP fatal on the page').toHaveCount(0);
    expect(jsErrors, 'uncaught JS errors').toEqual([]);
    await context.close();
};

// One logged-in page per role, opened only when a test asks for it, plus a worker-scoped API client.
export const test = base.extend<RolePages, Worker>({
    api: [
        async ({}, use) => {
            const api = new ApiUtils(await request.newContext());
            await use(api);
            await api.dispose();
        },
        { scope: 'worker' },
    ],
    adminPage: rolePage(ADMIN_STORAGE_STATE),
    vendorPage: rolePage(VENDOR_STORAGE_STATE),
    vendor2Page: rolePage(VENDOR2_STORAGE_STATE),
    customerPage: rolePage(CUSTOMER_STORAGE_STATE),
});

export { expect };
