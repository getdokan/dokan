import { test as setup } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { helpers } from '@utils/helpers';

const { BASE_URL } = process.env;

setup.describe('Setup test environment', () => {
    let apiUtils: ApiUtils;

    setup.beforeAll(async ({ request }) => {
        console.log('Global Setup running....');
        apiUtils = new ApiUtils(request);
    });

    setup.afterAll(async () => {
        console.log('Global Setup Finished!');
    });

    setup('get server url @lite', async () => {
        let serverUrl = BASE_URL;
        const headers = await apiUtils.getSiteHeaders(serverUrl);
        if (headers.link) {
            serverUrl = headers.link.includes('rest_route') ? serverUrl + '/?rest_route=' : serverUrl + '/wp-json';
            // process.env.SERVER_URL = serverUrl;
            helpers.writeJsonData('utils/data.json', 'SERVER_URL', serverUrl);
            console.log('ServerUrl:', helpers.readJsonData('utils/data.json', 'SERVER_URL'));
        }
    });
});
