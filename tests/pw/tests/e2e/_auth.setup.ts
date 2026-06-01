import { test as setup, expect, request, type Page } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { data } from '@utils/testData';
import { dbUtils } from '@utils/dbUtils';
import { helpers, parseBoolean } from '@utils/helpers';

const { DOKAN_PRO } = process.env;
const isPro = parseBoolean(DOKAN_PRO);

// ============================================================================
// Inlined login + nonce helpers (previously in pages/loginPage.ts + pages/productsPage.ts)
// Uses only Playwright primitives. Relies on playwright.config.ts baseURL.
// ============================================================================

async function getCurrentUser(page: Page): Promise<string | undefined> {
    const cookies = await page.context().cookies();
    const cookie = cookies.find(c => c.name?.startsWith('wordpress_logged_in_'));
    if (!cookie?.value) return undefined;
    return decodeURIComponent(cookie.value).split('|')[0];
}

async function frontendLogout(page: Page): Promise<void> {
    if (!page.url().includes('my-account')) {
        await page.goto('my-account', { waitUntil: 'domcontentloaded' });
    }
    await page.locator('.woocommerce-MyAccount-navigation-link--customer-logout > a').click();
    await page.waitForLoadState('load');
}

async function frontendLogin(page: Page, user: { username: string; password: string }, storageState?: string): Promise<void> {
    if (!page.url().includes('my-account')) {
        await page.goto('my-account', { waitUntil: 'domcontentloaded' });
    }
    const current = await getCurrentUser(page);
    if (current === user.username) return;
    if (current) await frontendLogout(page);

    await page.locator('#username').fill(user.username);
    await page.locator('#password').fill(user.password);
    if (storageState) await page.locator('#rememberme').check();
    // Don't race on the 302 — it can fire before the listener attaches and then hang the Promise.all.
    // Click, wait for navigation to settle, and then verify via the logged-in cookie.
    await page.locator('//button[@value="Log in"]').click();
    await page.waitForLoadState('load');
    await expect
        .poll(async () => await getCurrentUser(page), { timeout: 15000 })
        .toBe(user.username);
    if (storageState) await page.context().storageState({ path: storageState });
    const loggedIn = await getCurrentUser(page);
    expect(loggedIn).toBe(user.username);
}

async function adminLogin(page: Page, user: { username: string; password: string }, storageState?: string): Promise<void> {
    await page.goto('wp-admin', { waitUntil: 'domcontentloaded' });
    const hasLoginForm = await page.locator('#user_login').isVisible().catch(() => false);
    if (hasLoginForm) {
        await page.locator('#user_login').fill(user.username);
        await page.locator('#user_pass').fill(user.password);
        // Don't race on the post-login redirect response (mirrors frontendLogin). On a loaded CI
        // runner it can fire before the listener attaches, or the heavy first wp-admin load can blow
        // the 15s budget, and Promise.all hangs. Click, let navigation settle, then verify the cookie.
        await page.locator('#wp-submit').click();
        await page.waitForLoadState('domcontentloaded');
    }
    await expect
        .poll(async () => await getCurrentUser(page), { timeout: 30000 })
        .toBe(user.username);
    if (storageState) await page.context().storageState({ path: storageState });
}

async function getProductEditNonce(page: Page): Promise<string> {
    const addNewProductSelector = 'span.dokan-add-product-link .dokan-btn.dokan-btn-theme:first-child';
    try {
        await page.goto('dashboard/?path=%2Fanalytics%2FOverview', { waitUntil: 'networkidle' });
        await page.goto('dashboard/products', { waitUntil: 'networkidle' });
        await page.locator(addNewProductSelector).waitFor({ state: 'attached', timeout: 15000 });
        const url = await page.getAttribute(addNewProductSelector, 'href');
        const nonce = url?.match(/_dokan_edit_product_nonce=([\w\d]+)/)?.[1];
        if (!nonce) throw new Error('Nonce not found');
        return nonce;
    } catch {
        // Fallback: go through my-account first
        console.log('Direct products access failed, trying through my-account...');
        await page.goto('my-account', { waitUntil: 'networkidle' });
        await page.goto('dashboard/?path=%2Fanalytics%2FOverview', { waitUntil: 'networkidle' });
        await page.goto('dashboard/products', { waitUntil: 'networkidle' });
        await page.locator(addNewProductSelector).waitFor({ state: 'attached', timeout: 15000 });
        const url = await page.getAttribute(addNewProductSelector, 'href');
        const nonce = url?.match(/_dokan_edit_product_nonce=([\w\d]+)/)?.[1];
        if (!nonce) throw new Error('Nonce not found');
        return nonce;
    }
}

// ============================================================================

setup.describe('add & authenticate users', () => {
    let apiUtils: ApiUtils;

    setup.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    setup.afterAll(async () => {
        await apiUtils.dispose();
    });

    setup('authenticate admin', { tag: ['@lite'] }, async ({ page }) => {
        await adminLogin(page, data.admin, data.auth.adminAuthFile);
    });

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

        if (sellerId) {
            await apiUtils.updateStore(sellerId, { ...payloads.storeResetFields, ...payloads.storeOpenClose }, payloads.adminAuth);

            if (isPro) {
                await apiUtils.createStoreReview(sellerId, { ...payloads.createStoreReview, rating: 5 }, payloads.adminAuth);
            }
            await dbUtils.addStoreMapLocation(sellerId);

            helpers.createEnvVar('VENDOR_ID', sellerId);
        }
    });

    setup('add customer2', { tag: ['@lite'] }, async () => {
        const [, customerId] = await apiUtils.createCustomer(payloads.createCustomer2, payloads.adminAuth);
        helpers.createEnvVar('CUSTOMER2_ID', customerId);
    });

    setup('add vendor2', { tag: ['@lite'] }, async () => {
        const [, sellerId] = await apiUtils.createStore(payloads.createStore2, payloads.adminAuth, true);

        if (sellerId) {
            await apiUtils.updateStore(sellerId, { ...payloads.storeResetFields, ...payloads.storeOpenClose }, payloads.adminAuth);
            if (isPro) {
                await apiUtils.createStoreReview(sellerId, { ...payloads.createStoreReview, rating: 5 }, payloads.adminAuth);
            }
            await dbUtils.addStoreMapLocation(sellerId);

            helpers.createEnvVar('VENDOR2_ID', sellerId);
        }
    });

    setup('authenticate customer', { tag: ['@lite'] }, async ({ page }) => {
        await frontendLogin(page, data.customer, data.auth.customerAuthFile);
    });

    setup('authenticate vendor', { tag: ['@lite'] }, async ({ page }) => {
        await frontendLogin(page, data.vendor, data.auth.vendorAuthFile);

        try {
            page.setDefaultTimeout(20000);
            const nonce = await getProductEditNonce(page);
            helpers.createEnvVar('PRODUCT_EDIT_NONCE', nonce);
            console.log(`PRODUCT_EDIT_NONCE=${nonce}`);
        } catch {
            console.log('Error!Product edit nonce retrieval timed out. Tests will fetch it when needed.');
        }
    });

    setup('authenticate customer2', { tag: ['@lite'] }, async ({ page }) => {
        await frontendLogin(page, data.customer.customer2, data.auth.customer2AuthFile);
    });

    setup('authenticate vendor2', { tag: ['@lite'] }, async ({ page }) => {
        try {
            await frontendLogin(page, data.vendor.vendor2, data.auth.vendor2AuthFile);
        } catch {
            console.log('Vendor2 authentication timed out, but continuing...');
        }
    });
});
