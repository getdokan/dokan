import { test as setup, expect, request } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { data } from '@utils/testData';
import { dbUtils } from '@utils/dbUtils';
import { helpers } from '@utils/helpers';
import { selector } from '@pages/selectors';

const { DOKAN_PRO } = process.env;

setup.describe('add & authenticate users', () => {
    let apiUtils: ApiUtils;

    setup.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    setup.afterAll(async () => {
        await apiUtils.dispose();
    });

    setup('authenticate admin', { tag: ['@lite'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.adminLogin(data.admin, data.auth.adminAuthFile);
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

    setup('authenticate customer', { tag: ['@lite'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login(data.customer, data.auth.customerAuthFile);
    });

    setup('authenticate vendor', { tag: ['@lite'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login(data.vendor, data.auth.vendorAuthFile);
        try {
            // Wait for the products dashboard to load
            await page.goto(data.subUrls.frontend.vDashboard.products);
            await page.waitForLoadState('networkidle');

            // Wait for the 'Add new product' button to be visible
            await page.waitForSelector(selector.vendor.vDashboard.products.addNewProduct, { timeout: 15000 });

            // Get the href attribute from the 'Add new product' button
            const addProductHref = await page.getAttribute(selector.vendor.vDashboard.products.addNewProductHref, 'href');
            let nonce = '';
            if (addProductHref) {
                const match = addProductHref.match(/_dokan_edit_product_nonce=([a-zA-Z0-9]+)/);
                if (match && match[1]) {
                    nonce = match[1];
                    console.log(`✅ Product edit nonce found: ${nonce}`);
                }
            }
            if (!nonce) {
                console.log('⚠️ Could not extract nonce from add product button');
                nonce = 'fallback_nonce';
            }
            helpers.createEnvVar('PRODUCT_EDIT_NONCE', nonce);
        } catch (error) {
            console.error('Failed to get vendor product edit nonce:', error);
            helpers.createEnvVar('PRODUCT_EDIT_NONCE', 'error_fallback_nonce');
            console.log('⚠️ Set fallback nonce due to error');
        }
    });

    setup('authenticate customer2', { tag: ['@lite'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login(data.customer.customer2, data.auth.customer2AuthFile);
    });

    setup('authenticate vendor2', { tag: ['@lite'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login(data.vendor.vendor2, data.auth.vendor2AuthFile);
    });
});
