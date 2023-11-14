import { test as teardown } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { helpers } from '@utils/helpers';

teardown.describe('Teardown test environment @lite', () => {
    let apiUtils: ApiUtils;

    teardown.beforeAll(async ({ request }) => {
        console.log('Global Teardown running....');
        apiUtils = new ApiUtils(request);
    });

    teardown.afterAll(async () => {
        console.log('Global Teardown Finished!');
    });

    teardown('get test environment info @lite', async () => {
        const systemInfo = 'playwright/systemInfo.json';

        if (!helpers.fileExists(systemInfo)) {
            const [, summaryInfo] = await apiUtils.getSystemStatus();
            helpers.writeFile('playwright/systemInfo.json', JSON.stringify(summaryInfo));
        }
    });
});
