import { test as setup, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { helpers } from '@utils/helpers';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';
import { data } from '@utils/testData';

// const { BASE_URL } = process.env;

setup.describe('setup test environment', () => {
    let apiUtils: ApiUtils;

    setup.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    setup.afterAll(async () => {
        await apiUtils.dispose();
    });

    // setup.skip('get server url @lite', async ({ request }) => {
    //     const apiUtils = new ApiUtils(await request.newContext());
    //     const headers = await apiUtils.getSiteHeaders(BASE_URL);
    //     if (headers.link) {
    //         const serverUrl = headers.link.includes('rest_route') ? BASE_URL + '/?rest_route=' : BASE_URL + '/wp-json';
    //         console.log('ServerUrl:', serverUrl);
    //         process.env.SERVER_URL = serverUrl;
    //     } else {
    //         console.log("Headers link doesn't exists");
    //     }
    // });

    setup('setup store settings @lite', async () => {
        const [response] = await apiUtils.put(endPoints.updateSettings, { data: payloads.setupStore });
        expect(response.ok()).toBeTruthy();
    });

    setup('create customer @lite', async () => {
        const [, customerId] = await apiUtils.createCustomer(payloads.createCustomer1, payloads.adminAuth);
        console.log('CUSTOMER_ID:', customerId);
        process.env.CUSTOMER_ID = customerId;
        helpers.appendEnv(`CUSTOMER_ID=${customerId}`); // for local testing
    });

    setup('create vendor @lite', async () => {
        const [, sellerId] = await apiUtils.createStore(payloads.createStore1, payloads.adminAuth);
        console.log('VENDOR_ID:', sellerId);
        process.env.VENDOR_ID = sellerId;
        helpers.appendEnv(`VENDOR_ID=${sellerId}`); // for local testing
    });

    setup('add vendor2 @lite', async () => {
        const [, sellerId] = await apiUtils.createStore(payloads.createStore2, payloads.adminAuth);
        console.log('VENDOR2_ID:', sellerId);
        process.env.VENDOR2_ID = sellerId;
        helpers.appendEnv(`VENDOR2_ID=${sellerId}`); // for local testing
    });

    setup('set dokan general settings @lite', async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.general, { ...dbData.dokan.generalSettings, store_category_type: 'single' });
    });

    setup('admin set dokan selling settings @lite', async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
    });

    setup('admin set dokan withdraw settings @lite', async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.withdraw, dbData.dokan.withdrawSettings);
    });

    setup('admin set dokan reverse withdraw settings @lite', async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.reverseWithdraw, dbData.dokan.reverseWithdrawSettings);
    });

    setup('get test environment info @lite', async () => {
        const [, systemInfo] = await apiUtils.getSystemStatus(payloads.adminAuth);
        helpers.writeFile(data.systemInfo, JSON.stringify(systemInfo));
    });
});
