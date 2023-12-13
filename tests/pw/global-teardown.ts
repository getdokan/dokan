import { request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { helpers } from '@utils/helpers';
import { payloads } from '@utils/payloads';

async function globalSetup() {
    console.log('Global Teardown running....');

    const systemInfo = 'playwright/systemInfo.json';

    // get test environment info
    if (!helpers.fileExists(systemInfo)) {
        const apiUtils = new ApiUtils(await request.newContext({ ignoreHTTPSErrors: true }));
        const [, summaryInfo] = await apiUtils.getSystemStatus(payloads.adminAuth);
        helpers.writeFile(systemInfo, JSON.stringify(summaryInfo));
    }

    console.log('Global Teardown Finished!');
}

export default globalSetup;
