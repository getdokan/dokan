import { test as setup, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { helpers } from '@utils/helpers';
import { data } from '@utils/testData';

const { CI, LOCAL, DOKAN_PRO, BASE_URL } = process.env;

setup.describe('setup test environment', () => {
    let apiUtils: ApiUtils;

    setup.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    setup.afterAll(async () => {
        await apiUtils.dispose();
    });

    setup.skip('get server url', { tag: ['@lite'] }, async () => {
        const headers = await apiUtils.getSiteHeaders(BASE_URL);
        if (headers.link) {
            const serverUrl = headers.link.includes('rest_route') ? BASE_URL + '/?rest_route=' : BASE_URL + '/wp-json';
            helpers.createEnvVar('SERVER_URL', serverUrl);
        } else {
            console.log("Headers link doesn't exists");
        }
    });

    setup('activate Dokan Lite', { tag: ['@lite'] }, async () => {
        setup.skip(CI, 'skip plugin activation on CI');
        await apiUtils.updatePlugin('dokan/dokan', { status: 'active' }, payloads.adminAuth);
    });

    setup('activate Dokan Pro', { tag: ['@pro'] }, async () => {
        setup.skip(CI, 'skip plugin activation on CI');
        await apiUtils.updatePlugin('dokan-pro/dokan-pro', { status: 'active' }, payloads.adminAuth);
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

    setup('dokan pro enabled or not', { tag: ['@lite'] }, async () => {
        setup.skip(LOCAL, 'Skip on Local testing');
        let res = await apiUtils.checkPluginsExistence(data.plugin.dokanPro, payloads.adminAuth);
        if (res) {
            res = await apiUtils.pluginsActiveOrNot(data.plugin.dokanPro, payloads.adminAuth);
        }
        DOKAN_PRO ? expect(res).toBeTruthy() : expect(res).toBeFalsy();
    });

    setup('get test environment info', { tag: ['@lite'] }, async () => {
        const [, systemInfo] = await apiUtils.getSystemStatus(payloads.adminAuth);
        helpers.writeFile(data.systemInfo, JSON.stringify(systemInfo));
    });
});
