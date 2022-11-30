import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

// test.beforeAll(async ({ request }) => {});
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe.skip(' api test', () => {

    // test('get all ', async ({ request }) => {
    //     await request.post('http://dokan1.test/wp-admin', {
    //         form: {
    //             'user': 'admin',
    //             'password': '01dokan01'
    //         }
    //     });
    //     // Save signed-in state to 'storageState.json'.
    //     await request.storageState({ path: 'storageState.json' });
    //     await request.dispose();

    // }); 
    test('get all ', async ({ request }) => {
        let payload = JSON.stringify({
            action: 'dokan_report_abuse_submit_form',
            description: 'this is desc',
            product_id: '347',
            reason: 'Other'
        })

        let response = await request.post('http://dokan1.test/wp-admin/admin-ajax.php', {
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                // 'X-WP-Nonce': '',
                // 'cookie': ''
            },
            data: payload
        })
        console.log(response)
        let responseBody = await response.json()
        console.log(responseBody)

        // expect(response.ok()).toBeTruthy()
        // expect(response.status()).toBe(200)
    });

    //     test('get all ', async ({ request }) => {


    //         let response = await request.get(endPoints.getSettings)
    //         // let response = await request.post(endPoints.userRegitration, { data: { name: 'v1' } })
    //     // let response = await request.get(endPoints.wc.getAllSettingsGroups)
    //     // let response = await request.get(endPoints.wc.getAllSettingOptions('checkout'))
    //     // let response = await request.post(endPoints.wc.updateBatchSettingOptions('general'),{data: payloads.general})
    //     // let response = await request.get(endPoints.wc.getSingleSettingOption('account','woocommerce_registration_generate_password'))
    //     // let response = await request.post(endPoints.wc.updateSettingOption('account','woocommerce_registration_generate_password'),{data: payloads.account})
    //     let responseBody = await response.json()
    //     console.log(responseBody)

    //     // expect(response.ok()).toBeTruthy()
    //     // expect(response.status()).toBe(200)

    //     // let apiUtils = new ApiUtils(request)
    //     // let response = await apiUtils.getCustomerId('customer1')
    //     // console.log(response)

    // });
});
