import { test as setup, expect, request } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { data } from '@utils/testData';
import { dbUtils } from '@utils/dbUtils';
import { helpers } from '@utils/helpers';

const { DOKAN_PRO } = process.env;

setup.describe('add users', () => {
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
        await dbUtils.addStoreBiographyAndMapLocation(sellerId);

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
        await dbUtils.addStoreBiographyAndMapLocation(sellerId);

        helpers.createEnvVar('VENDOR2_ID', sellerId);
    });
});
