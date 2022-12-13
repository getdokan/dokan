import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import qs from 'qs'





let apiUtils;
test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
});
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe.skip(' api test', () => {


    test('ajax call ', async ({ request }) => {
        let cData = await apiUtils.getCookie()
        console.log('nonce: in test', process.env.nonce)
        console.log('cookie:', cData)

        let response = await request.get(`http://dokan1.test/wp-admin/admin-ajax.php?_wpnonce=${String(process.env.nonce)}&action=dokan_report_abuse_get_form`, {
            // let response = await request.get('http://dokan1.test/wp-admin/admin-ajax.php?_wpnonce=61dc1f5f1a&action=dokan_report_abuse_get_form', {
            headers: {
                'accept': 'application/json, text/javascript, */*',
                'X-Requested-With': 'XMLHttpRequest',
                // 'X-WP-Nonce': '98378d8e38',
                // 'Cookie': 'wordpress_logged_in_f9bb350617bdc9412ec6f5c13ccb7293=admin%7C1671030732%7CnjWRUJRvLCas11E8PS5vI4XuhfFoWNyQCnIdHVZWirW%7Cb337b2e0263751c73465959b7b14b7c3e765fde6381ee3c0103ee2af0c8e7edc'
                // 'Cookie': 'wordpress_logged_in_f9bb350617bdc9412ec6f5c13ccb7293=admin%7C1671037712%7CF8A8TwqSSV86bUsOz1OEpacjBCR6AxICzzspEEthGwF%7Cb426a36f68164dae32e6fac2bd5ee3270ca536e35cf4e8bd8688c9f51749f84c'
                'Cookie': String(cData)
            }
        })
        // console.log('text:', await response.text())
        console.log('StatusCode:', response.status())
        console.log('responsebody:', await response.json())
        // let responseBody = await response.json()
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });



    test('ajax submit support ticket ', async ({ request }) => {

        let cData = await apiUtils.getCookie()
        let payload = {
            '_wpnonce': process.env.arnonce,
            'action': 'dokan_support_ajax_handler',
            'data': 'support_msg_submit',
            'form_data[_wp_http_referer]': '/wp-admin/admin-ajax.php',
            'form_data[dokan-support-subject]': 'this is message sub',
            'form_data[dokan-support-msg]': 'this is messagge',
            'form_data[store_id]': '1',
            'form_data[dokan-support-form-nonce]': '6196d4418',
            'form_data[reason]': 'Other'
        }
        // console.log('arnonce:', process.env.arnonce)
        // console.log('cookie:', cData)

        let response = await request.post( process.env.BASE_URL + '/wp-admin/admin-ajax.php', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'accept': 'application/json, text/javascript, */*',
                'X-Requested-With': 'XMLHttpRequest',
                'Cookie': 'wordpress_logged_in_f9bb350617bdc9412ec6f5c13ccb7293=admin%7C1671030732%7CnjWRUJRvLCas11E8PS5vI4XuhfFoWNyQCnIdHVZWirW%7Cb337b2e0263751c73465959b7b14b7c3e765fde6381ee3c0103ee2af0c8e7edc'
                // 'Cookie': cData
            },
            data: qs.stringify(payload)
        })
        // let responseBody = await response.json()
        expect(response.ok()).toBeTruthy()
    }); 
    
    test('ajax submit report abuse ', async ({ request }) => {

        let cData = await apiUtils.getCookie()
        let payload = {
            '_wpnonce': process.env.arnonce,
            'action': 'dokan_report_abuse_submit_form',
            'form_data[description]': 'this is desc',
            'form_data[product_id]': process.env.arpid,
            'form_data[reason]': 'Other'
        }
        // console.log('arnonce:', process.env.arnonce)
        // console.log('cookie:', cData)

        let response = await request.post( process.env.BASE_URL + '/wp-admin/admin-ajax.php', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'accept': 'application/json, text/javascript, */*',
                'X-Requested-With': 'XMLHttpRequest',
                'Cookie': cData
            },
            data: qs.stringify(payload)
        })
        // let responseBody = await response.json()
        expect(response.ok()).toBeTruthy()
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

    // test.use({ storageState: 'storageState.json' });

    // test('get admin report overview', async ({ request, page }) => {
    //     let response = await request.get(endPoints.getAdminReportOverview, {headers:{cookie:'storageState.json' }} )
    //     let responseBody = await apiUtils.getResponseBody(response)
    //     expect(response.ok()).toBeTruthy()
    // });

    test('get admin report overview', async ({ request, page }) => {
        // let response = await request.get(endPoints.getAdminReportOverview, {headers:{cookie:'storageState.json' }} )
        // let responseBody = await apiUtils.getResponseBody(response)
        // expect(response.ok()).toBeTruthy()
    });
});
