import { test as setup, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { helpers } from '@utils/helpers';

setup.describe('add users', () => {
    let apiUtils: ApiUtils;

    setup.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    setup.afterAll(async () => {
        await apiUtils.dispose();
    });

    setup('enable admin selling status', { tag: ['@lite'] }, async () => {
        const responseBody = await apiUtils.setStoreSettings(payloads.setupStore, payloads.adminAuth);
        expect(responseBody).toBeTruthy();
    });

    setup('create customer', { tag: ['@lite'] }, async () => {
        const [, customerId] = await apiUtils.createCustomer(payloads.createCustomer1, payloads.adminAuth);
        helpers.createEnvVar('CUSTOMER_ID', customerId);
    });

    setup('create vendor', { tag: ['@lite'] }, async () => {
        const [, sellerId] = await apiUtils.createStore(payloads.createStore1, payloads.adminAuth);
        helpers.createEnvVar('VENDOR_ID', sellerId);
    });

    setup('add vendor2', { tag: ['@lite'] }, async () => {
        const [, sellerId] = await apiUtils.createStore(payloads.createStore2, payloads.adminAuth);
        helpers.createEnvVar('VENDOR2_ID', sellerId);
    });
});
