// import { test, expect } from '@playwright/test'
// import { ApiUtils } from '../../utils/apiUtils'
// import { endPoints } from '../../utils/apiEndPoints'
// import { payloads } from '../../utils/payloads'

// // test.beforeAll(async ({ request }) => {});
// // test.afterAll(async ({ request }) => { });
// // test.beforeEach(async ({ request }) => { });
// // test.afterEach(async ({ request }) => { });


// test.describe(' api test', () => {

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
// });
