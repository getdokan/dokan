import { FullConfig, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { helpers } from '@utils/helpers';

async function globalSetup(config: FullConfig) {
    console.log('Global Setup running....');

    // get site url structure
    let serverUrl = config.projects[0]?.use.baseURL as string;
    const apiUtils = new ApiUtils(await request.newContext({ ignoreHTTPSErrors: true }));
    for (let i = 0; i < 3; i++) {
        const headers = await apiUtils.getSiteHeaders(serverUrl);
        if (headers.link) {
            serverUrl = headers.link.includes('rest_route') ? serverUrl + '/?rest_route=' : serverUrl + '/wp-json';
            helpers.writeEnvJson('SERVER_URL', serverUrl);
            break;
        }
        console.log('retrying...');
    }
    console.log('ServerUrl:', serverUrl);

    console.log('Global Setup Finished!');
}

export default globalSetup;
