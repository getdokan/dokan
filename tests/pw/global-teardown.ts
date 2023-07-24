import { request  } from '@playwright/test';
import { ApiUtils } from 'utils/apiUtils';
import { helpers } from 'utils/helpers';
import { payloads } from 'utils/payloads';

async function globalSetup() {
	console.log('Global Teardown running....');

	// get test environment info
	const apiUtils = new ApiUtils(await request.newContext({ ignoreHTTPSErrors: true }));
	const [, summaryInfo] = await apiUtils.getSystemStatus(payloads.adminAuth);
	helpers.writeFile('systemInfo.json', JSON.stringify(summaryInfo));

	console.log('Global Teardown Finished!');
}

export default globalSetup;