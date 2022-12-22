import { test, expect } from '@playwright/test'
import { ApiUtils } from '../utils/apiUtils'
import { endPoints } from '../utils/apiEndPoints'
import * as storageState from '../storageState.json'
import qs from 'qs'

let apiUtils: any

// get cookie
function getCookie() {
    let cookieName = String(storageState.cookies[3].name)
    let cookieValue = String(storageState.cookies[3].value)
    let cookie = cookieName + '=' + cookieValue
    return cookie
}


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
        console.log('responseBody:', await response.json())
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
            'form_data[dokan-support-msg]': 'this is message',
            'form_data[store_id]': '1',
            'form_data[dokan-support-form-nonce]': '6196d4418',
            'form_data[reason]': 'Other'
        }
        // console.log('arnonce:', process.env.arnonce)
        // console.log('cookie:', cData)

        let response = await request.post(process.env.BASE_URL + '/wp-admin/admin-ajax.php', {
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

        let response = await request.post(process.env.BASE_URL + '/wp-admin/admin-ajax.php', {
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

});
