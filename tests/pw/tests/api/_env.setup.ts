import { test as setup, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';
import { helpers } from '@utils/helpers';

setup.describe(' setup environment', () => {
    let apiUtils: ApiUtils;

    setup.beforeAll(async ({ request }) => {
        apiUtils = new ApiUtils(request);
    });

    setup('setup store settings @lite', async () => {
        const [response] = await apiUtils.put(endPoints.updateSettings, { data: payloads.setupStore });
        expect(response.ok()).toBeTruthy();
    });

    setup('create customer @lite', async () => {
        const [, customerId] = await apiUtils.createCustomer(payloads.createCustomer1, payloads.adminAuth);
        process.env.CUSTOMER_ID = customerId;
    });

    setup('create vendor @lite', async () => {
        const [, sellerId] = await apiUtils.createStore(payloads.createStore1, payloads.adminAuth);
        process.env.VENDOR_ID = sellerId;
    });

    // setup('set dokan general settings @lite', async () => {
    // 	await dbUtils.setDokanSettings(dbData.dokan.optionName.general, { ...dbData.dokan.generalSettings, store_category_type: 'single' });
    // });

    // setup('admin set dokan selling settings @lite', async () => {
    // 	await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
    // });

    // setup('admin set dokan withdraw settings @lite', async () => {
    // 	await dbUtils.setDokanSettings(dbData.dokan.optionName.withdraw, dbData.dokan.withdrawSettings);
    // });

    // setup('admin set dokan reverse withdraw settings @lite', async () => {
    // 	await dbUtils.setDokanSettings(dbData.dokan.optionName.reverseWithdraw, dbData.dokan.reverseWithdrawSettings);
    // });

    // setup('get test environment info @lite', async () => {
    // 	const [, summaryInfo] = await apiUtils.getSystemStatus();
    // 	helpers.writeFile('systemInfo.json', JSON.stringify(summaryInfo));
    // });
});
