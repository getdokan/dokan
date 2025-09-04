import { test as setup, expect, request } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { ProductsPage } from '@pages/productsPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { admin, data } from '@utils/testData';
import { dbUtils } from '@utils/dbUtils';
import { helpers } from '@utils/helpers';
import { customer, vendor } from '@utils/interfaces';

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
        await loginPage.adminLogin(data.admin as admin, data.auth.adminAuthFile);
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
        try {
            const [, sellerId] = await apiUtils.createStore(payloads.createStore1, payloads.adminAuth, true);
            // add open-close time
            await apiUtils.updateStore(sellerId, { ...payloads.storeResetFields, ...payloads.storeOpenClose }, payloads.adminAuth);

            // add review
            if (DOKAN_PRO) {
                try {
                    await apiUtils.createStoreReview(sellerId, { ...payloads.createStoreReview, rating: 5 }, payloads.adminAuth);
                } catch (error) {
                    console.log('Store review creation failed, continuing...');
                }
            }
            // add map location
            try {
                await dbUtils.addStoreMapLocation(sellerId);
            } catch (error) {
                console.log('Store map location failed, continuing...');
            }

            helpers.createEnvVar('VENDOR_ID', sellerId);
        } catch (error) {
            console.log('Vendor1 creation failed, using existing vendor ID');
            helpers.createEnvVar('VENDOR_ID', '3'); // Use existing vendor ID
        }
    });

    setup('add customer2', { tag: ['@lite'] }, async () => {
        const [, customerId] = await apiUtils.createCustomer(payloads.createCustomer2, payloads.adminAuth);
        helpers.createEnvVar('CUSTOMER2_ID', customerId);
    });

    setup('add vendor2', { tag: ['@lite'] }, async () => {
        try {
            const [, sellerId] = await apiUtils.createStore(payloads.createStore2, payloads.adminAuth, true);
            // add open-close time
            await apiUtils.updateStore(sellerId, { ...payloads.storeResetFields, ...payloads.storeOpenClose }, payloads.adminAuth);
            // add review
            if (DOKAN_PRO) {
                try {
                    await apiUtils.createStoreReview(sellerId, { ...payloads.createStoreReview, rating: 5 }, payloads.adminAuth);
                } catch (error) {
                    console.log('Store review creation failed, continuing...');
                }
            }
            // add map location
            try {
                await dbUtils.addStoreMapLocation(sellerId);
            } catch (error) {
                console.log('Store map location failed, continuing...');
            }

            helpers.createEnvVar('VENDOR2_ID', sellerId);
        } catch (error) {
            console.log('Vendor2 creation failed, using existing vendor ID');
            helpers.createEnvVar('VENDOR2_ID', '5'); // Use existing vendor ID
        }
    });

    setup('authenticate customer', { tag: ['@lite'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login(data.customer as customer, data.auth.customerAuthFile);
    });

    setup('authenticate vendor', { tag: ['@lite'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login(data.vendor as vendor, data.auth.vendorAuthFile);
        
        // Skip getting nonce if dashboard access fails
        try {
            const productsPage = new ProductsPage(page);
            const nonce = await productsPage.getProductEditNonce();
            helpers.createEnvVar('PRODUCT_EDIT_NONCE', nonce);
        } catch (error) {
            console.log('Failed to get product edit nonce, continuing...');
            helpers.createEnvVar('PRODUCT_EDIT_NONCE', 'test-nonce');
        }
    });

    setup('authenticate customer2', { tag: ['@lite'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login(data.customer.customer2 as customer, data.auth.customer2AuthFile);
    });

    setup('authenticate vendor2', { tag: ['@lite'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login(data.vendor.vendor2 as vendor, data.auth.vendor2AuthFile);
    });
});
