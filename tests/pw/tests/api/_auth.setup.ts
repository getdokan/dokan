import { test as setup, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { helpers } from '@utils/helpers';
import { data } from '@utils/testData';

const { DOKAN_PRO, BASE_URL } = process.env;

setup.describe('setup test environment', () => {
    let apiUtils: ApiUtils;

    setup.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    setup.afterAll(async () => {
        await apiUtils.dispose();
    });

    setup.skip('get server url @lite', async () => {
        const headers = await apiUtils.getSiteHeaders(BASE_URL);
        if (headers.link) {
            const serverUrl = headers.link.includes('rest_route') ? BASE_URL + '/?rest_route=' : BASE_URL + '/wp-json';
            helpers.createEnvVar('SERVER_URL', serverUrl);
        } else {
            console.log("Headers link doesn't exists");
        }
    });

    setup('setup store settings @lite', async () => {
        const [response] = await apiUtils.put(endPoints.updateSettings, { data: payloads.setupStore });
        expect(response.ok()).toBeTruthy();
    });

    setup('create customer @lite', async () => {
        const [, customerId] = await apiUtils.createCustomer(payloads.createCustomer1, payloads.adminAuth);
        helpers.createEnvVar('CUSTOMER_ID', customerId);
    });

    setup('create vendor @lite', async () => {
        const [, sellerId] = await apiUtils.createStore(payloads.createStore1, payloads.adminAuth);
        helpers.createEnvVar('VENDOR_ID', sellerId);
    });

    setup('add vendor2 @lite', async () => {
        const [, sellerId] = await apiUtils.createStore(payloads.createStore2, payloads.adminAuth);
        helpers.createEnvVar('VENDOR2_ID', sellerId);
    });

    setup('dokan pro enabled or not @lite', async () => {
        let res = await apiUtils.checkPluginsExistence(data.plugin.dokanPro, payloads.adminAuth);
        if (res) {
            res = await apiUtils.pluginsActiveOrNot(data.plugin.dokanPro, payloads.adminAuth);
        }
        DOKAN_PRO ? expect(res).toBeTruthy() : expect(res).toBeFalsy();
    });

    setup('get test environment info @lite', async () => {
        const [, systemInfo] = await apiUtils.getSystemStatus(payloads.adminAuth);
        helpers.writeFile(data.systemInfo, JSON.stringify(systemInfo));
    });
});
