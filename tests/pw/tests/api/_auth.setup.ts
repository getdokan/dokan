import { test as setup, expect, request, type Page } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { data } from '@utils/testData';
import { dbUtils } from '@utils/dbUtils';
import { helpers, parseBoolean } from '@utils/helpers';

const { DOKAN_PRO } = process.env;
const isPro = parseBoolean(DOKAN_PRO);

// ============================================================================
// Inlined admin login helper (previously in pages/loginPage.ts)
// Uses only Playwright primitives. Relies on playwright.config.ts baseURL.
// ============================================================================

async function getCurrentUser(page: Page): Promise<string | undefined> {
    const cookies = await page.context().cookies();
    const cookie = cookies.find(c => c.name?.startsWith('wordpress_logged_in_'));
    if (!cookie?.value) return undefined;
    return decodeURIComponent(cookie.value).split('|')[0];
}

async function adminLogin(page: Page, user: { username: string; password: string }, storageState?: string): Promise<void> {
    await page.goto('wp-admin', { waitUntil: 'domcontentloaded' });
    const hasLoginForm = await page.locator('#user_login').isVisible().catch(() => false);
    if (hasLoginForm) {
        await page.locator('#user_login').fill(user.username);
        await page.locator('#user_pass').fill(user.password);
        // Submit WITHOUT auto-waiting on the post-login navigation. The wp-admin dashboard render is
        // slow on CI (admin_init fires blocking wordpress.org update checks), so click()'s built-in
        // "wait for navigation to finish" hits the 15s actionTimeout and the step fails. The auth
        // cookie is set by the fast wp-login.php 302, so we fire the submit via dispatchEvent (no nav
        // wait) and confirm authentication by polling the logged-in cookie below.
        await page.locator('#wp-submit').dispatchEvent('click');
    }
    await expect
        .poll(async () => await getCurrentUser(page), { timeout: 30000 })
        .toBe(user.username);
    if (storageState) await page.context().storageState({ path: storageState });
}

// ============================================================================

setup.describe('add users', () => {
    let apiUtils: ApiUtils;

    setup.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    setup.afterAll(async () => {
        await apiUtils.dispose();
    });

    setup('authenticate admin', { tag: ['@lite'] }, async ({ page }) => {
        // The api project's default per-test timeout is 15s (api.config.ts) —
        // tuned for fast REST calls. This step is the one exception: it performs
        // a real browser login whose cookie-poll alone allows 30s (see
        // adminLogin). The wp.org-blocking mu-plugin removes the admin_init
        // stall, but a cold PHP-FPM / loaded CI runner can still push the
        // goto+submit+cookie past 15s and kill the test mid-poll — the sole
        // cause of the flaky "authenticate admin" step (it passes on e2e, which
        // budgets 60s). Give this one setup the same headroom so a slow-but-
        // successful login isn't truncated. The assertion (logged-in cookie ===
        // username) is unchanged.
        setup.setTimeout(60_000);
        await adminLogin(page, data.admin, data.auth.adminAuthFile);
    }); // todo: need to resolve why wc_orders table isn't created

    setup('enable admin selling status', { tag: ['@lite'] }, async () => {
        const responseBody = await apiUtils.setStoreSettings(payloads.setupStore, payloads.adminAuth);
        expect(responseBody).toBeTruthy();
    });

    setup('add customer1', { tag: ['@lite'] }, async () => {
        const [, customerId] = await apiUtils.createCustomer(payloads.createCustomer1, payloads.adminAuth);
        helpers.createEnvVar('CUSTOMER_ID', customerId);
    });

    setup('add vendor1', { tag: ['@lite'] }, async () => {
        const [, sellerId] = await apiUtils.createStore(payloads.createStore1, payloads.adminAuth, true);
        // add open-close time
        await apiUtils.updateStore(sellerId, { ...payloads.storeResetFields, ...payloads.storeOpenClose }, payloads.adminAuth);
        // add review
        if (isPro) {
            await apiUtils.createStoreReview(sellerId, { ...payloads.createStoreReview, rating: 5 }, payloads.adminAuth);
        }
        // add map location
        await dbUtils.addStoreMapLocation(sellerId);

        helpers.createEnvVar('VENDOR_ID', sellerId);
    });

    setup('add customer2', { tag: ['@lite'] }, async () => {
        const [, customerId] = await apiUtils.createCustomer(payloads.createCustomer2, payloads.adminAuth);
        helpers.createEnvVar('CUSTOMER2_ID', customerId);
    });

    setup('add vendor2', { tag: ['@lite'] }, async () => {
        const [, sellerId] = await apiUtils.createStore(payloads.createStore2, payloads.adminAuth, true);
        // add open-close time
        await apiUtils.updateStore(sellerId, { ...payloads.storeResetFields, ...payloads.storeOpenClose }, payloads.adminAuth);
        // add review
        if (isPro) {
            await apiUtils.createStoreReview(sellerId, { ...payloads.createStoreReview, rating: 5 }, payloads.adminAuth);
        }
        // add map location
        await dbUtils.addStoreMapLocation(sellerId);

        helpers.createEnvVar('VENDOR2_ID', sellerId);
    });

    // vendor3 — the permanent NON-CONNECTED marketplace-payment vendor (kept in step
    // with tests/e2e/_auth.setup.ts so the two setups do not drift).
    setup('add vendor3', { tag: ['@lite'] }, async () => {
        const [, sellerId] = await apiUtils.createStore(payloads.createStore3, payloads.adminAuth, true);
        // add open-close time
        await apiUtils.updateStore(sellerId, { ...payloads.storeResetFields, ...payloads.storeOpenClose }, payloads.adminAuth);
        // add review
        if (isPro) {
            await apiUtils.createStoreReview(sellerId, { ...payloads.createStoreReview, rating: 5 }, payloads.adminAuth);
        }
        // add map location
        await dbUtils.addStoreMapLocation(sellerId);

        helpers.createEnvVar('VENDOR3_ID', sellerId);
    });
});
