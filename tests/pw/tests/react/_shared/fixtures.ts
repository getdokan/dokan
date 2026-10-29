import { test as base, expect, type Browser, type BrowserContext, type Page } from '@utils/test';
import { request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { LoginPage } from '@pages/loginPage';
import { PHP_FATAL } from '@utils/dataViews';
import { ADMIN_STORAGE_STATE, VENDOR_STORAGE_STATE, VENDOR2_STORAGE_STATE, CUSTOMER_STORAGE_STATE } from '@utils/authStates';

type RolePages = { adminPage: Page; vendorPage: Page; vendor2Page: Page; customerPage: Page };
type Worker = { api: ApiUtils };

// Every page fails its test on an uncaught JS error or a PHP fatal, so no spec needs its own "renders without errors" test.
// A known product bug can be tolerated with an annotation naming it in baseline/FINDINGS.md:
//   test.info().annotations.push({ type: 'known-js-error', description: '<exact error message>' })
async function guarded(context: BrowserContext, use: (p: Page) => Promise<void>): Promise<void> {
    const page = await context.newPage();
    const jsErrors: string[] = [];
    const failedRest: string[] = [];
    page.on('pageerror', error => jsErrors.push(error.message));
    // Rejected apiFetch calls surface as opaque "Object" page errors; the failed REST calls say which one.
    page.on('response', r => {
        if (r.status() >= 400 && /wp-json|rest_route/.test(r.url())) failedRest.push(`${r.status()} ${r.request().method()} ${decodeURIComponent(r.url()).replace(/^https?:\/\/[^/]+/, '')}`);
    });
    await use(page);
    await expect(page.locator(PHP_FATAL), 'PHP fatal on the page').toHaveCount(0);
    const known = base.info().annotations.filter(a => a.type === 'known-js-error').map(a => a.description);
    expect(jsErrors.filter(message => !known.includes(message)), `uncaught JS errors; failed REST calls: ${failedRest.join(' | ') || 'none'}`).toEqual([]);
    await context.close();
}

const rolePage = (storageState: string) => async ({ browser }: { browser: Browser }, use: (p: Page) => Promise<void>) => guarded(await browser.newContext({ storageState }), use);

/** Log a user created by the test (e.g. a fresh vendor) in through the storefront form, with the same error guard. */
export async function withUserPage(browser: Browser, user: { username: string; password: string }, use: (p: Page) => Promise<void>): Promise<void> {
    await guarded(await browser.newContext(), async page => {
        await new LoginPage(page).login(user);
        await use(page);
    });
}

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
