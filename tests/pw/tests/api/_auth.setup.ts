import { test as setup, expect, request, type Page } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { data } from '@utils/testData';
import { dbUtils } from '@utils/dbUtils';
import { helpers } from '@utils/helpers';

const { DOKAN_PRO } = process.env;

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
    await page.goto('wp-admin', { waitUntil: 'networkidle' });
    const hasLoginForm = await page.locator('#user_login').isVisible().catch(() => false);
    if (hasLoginForm) {
        await page.locator('#user_login').fill(user.username);
        await page.locator('#user_pass').fill(user.password);
        await Promise.all([
            page.waitForLoadState('load'),
            page.waitForResponse(r => r.url().includes('wp-admin')),
            page.locator('#wp-submit').click(),
        ]);
        if (storageState) await page.context().storageState({ path: storageState });
        const loggedIn = await getCurrentUser(page);
        expect(loggedIn).toBe(user.username);
    }
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
        if (DOKAN_PRO) {
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
        if (DOKAN_PRO) {
            await apiUtils.createStoreReview(sellerId, { ...payloads.createStoreReview, rating: 5 }, payloads.adminAuth);
        }
        // add map location
        await dbUtils.addStoreMapLocation(sellerId);

        helpers.createEnvVar('VENDOR2_ID', sellerId);
    });
});
