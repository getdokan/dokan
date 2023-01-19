require('dotenv').config();
import { chromium, FullConfig, request } from '@playwright/test';
import { payloads } from './utils/payloads'

async function globalSetup(config: FullConfig) {
    // get site url structure
    var serverUrl = process.env.BASE_URL ? process.env.BASE_URL : 'http://localhost:8888'
    var query = '?'
    const context = await request.newContext({ignoreHTTPSErrors : true})
    let head = await context.head(serverUrl)
    let headers = head.headers()
    let link = headers.link
    if (link.includes('rest_route')) {
        serverUrl = serverUrl + '?rest_route='
        query = '&'
    } else {
        serverUrl = serverUrl + '/wp-json'
    }
    process.env.SERVER_URL = serverUrl
    process.env.QUERY = query

    // // create a product
    // let response = await context.post(process.env.SERVER_URL + '/dokan/v1/products', {
    //     data: payloads.createProduct(),
    //     headers: {
    //         Authorization: 'Basic ' + Buffer.from(process.env.ADMIN + ':' + process.env.ADMIN_PASSWORD).toString('base64')
    //     }
    // })
    // let arBody = await response.json()
    // let productName = (arBody.name).replace(/ /g, "-")
    // process.env.arPid = arBody.id


    // // get storageState
    // const browser = await chromium.launch();
    // const page = await browser.newPage();
    // await page.goto(process.env.BASE_URL + '/wp-admin');
    // await page.fill('#user_login', 'admin')
    // await page.fill('#user_pass', '01dokan01')
    // await page.click('#wp-submit')
    // await page.waitForLoadState('networkidle')
    // // process.env.nonce = await page.evaluate('wpApiSettings.nonce')
    // // console.log('nonce:', process.env.nonce)
    // // Save signed-in state to 'storageState.json'.
    // await page.context().storageState({ path: 'storageState.json' })

    // // get arNonce
    // await page.goto(process.env.BASE_URL + '/' + productName)
    // await page.waitForLoadState('networkidle')
    // console.log(page.url())

    // let [req] = await Promise.all([
    //     page.waitForRequest(/^http:\/\/dokan1.test\/wp-admin\/admin-ajax.php/),
    //     page.click('.dokan-report-abuse-button'), page.waitForTimeout(2 * 1000)
    // ]);
    // process.env.arNonce = (req.url()).split('_wpnonce=').pop().split('&action')[0]
    // console.log('arNonce', process.env.arNonce)
    // await browser.close()
}

export default globalSetup;
