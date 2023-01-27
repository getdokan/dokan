require('dotenv').config()
import { chromium, FullConfig, request } from '@playwright/test'
import { BasePage } from "./pages/basePage"
import { data } from './utils/testData'
import { selector } from './pages/selectors'
import { payloads } from './utils/payloads'
import { ApiUtils } from './utils/apiUtils'
// import cookie from './storageState.json'

// async function globalSetup(config: FullConfig) {
//      // get site url structure
//     var serverUrl = process.env.BASE_URL ? process.env.BASE_URL : 'http://localhost:8889'
//     var query = '?'
//     const context = await request.newContext({})
//     let head = await context.head(serverUrl)
//     let headers = head.headers()
//     let link = headers.link
//     if (link.includes('rest_route')) {
//         serverUrl = serverUrl + '?rest_route='
//         query = '&'
//     } else {
//         serverUrl = serverUrl + '/wp-json'
//     }
//     process.env.SERVER_URL = serverUrl
//     process.env.QUERY = query

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

//     // get storageState if expired
//     let expTime = cookie.cookies[6].expires
//     let currentTime = Date.now() / 1000
//     console.log(expTime)
//     console.log((new Date(expTime * 1000)).toUTCString())
//     console.log(currentTime)
//     console.log((new Date(currentTime * 1000)).toUTCString())
//     if (currentTime > expTime) {
//         // get storageState
//         const browser = await chromium.launch()
//         const page = await browser.newPage()
//         await page.goto(process.env.BASE_URL + '/wp-admin')
//         await page.fill(selector.backend.email, 'admin')
//         await page.fill(selector.backend.password, '01dokan01')
//         await page.click(selector.backend.login)
//         // await page.waitForTimeout(3 * 1000)
//         await page.waitForLoadState('networkidle')
//         // process.env.nonce = await page.evaluate('wpApiSettings.nonce')
//         // console.log('nonce:', process.env.nonce)
//         // Save signed-in state to 'storageState.json'.
//         await page.context().storageState({ path: 'storageState.json' })
//     }
//     // // await page.waitForTimeout(3 * 1000)
//     // // console.log(process.env.BASE_URL + '/'+ product)

//     // // get arNonce
//     // await page.goto(process.env.BASE_URL + '/' + productName)
//     // await page.waitForLoadState('networkidle')
//     // console.log(page.url())

//     // let [req] = await Promise.all([
//     //     page.waitForRequest(/^http:\/\/dokan1.test\/wp-admin\/admin-ajax.php/),
//     //     page.click('.dokan-report-abuse-button'), page.waitForTimeout(2 * 1000)
//     // ])
//     // process.env.arNonce = (req.url()).split('_wpnonce=').pop().split('&action')[0]
//     // console.log('arNonce', process.env.arNonce)
//     // await browser.close()
// }

// export default globalSetup



async function globalSetup(config: FullConfig) {
    console.log('Global Setup running....')

    // get site url structure
    var serverUrl = process.env.BASE_URL ? process.env.BASE_URL : 'http://localhost:8889'
    var query = '?'
    const context = await request.newContext({ ignoreHTTPSErrors: true })
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


    // get user signed in state
    const browser = await chromium.launch({ headless: true })

    // get storageState: admin
    let adminPage = await browser.newPage()
    // log in
    await adminPage.goto(process.env.BASE_URL + '/wp-admin', { waitUntil: 'networkidle' })
    await adminPage.screenshot({ path: './playwright-report/screenshot_admin.png', fullPage: true });
    await adminPage.fill(selector.backend.email, 'admin')
    await adminPage.fill(selector.backend.password, '01dokan01')
    await adminPage.click(selector.backend.login)
    await adminPage.waitForLoadState('networkidle')
    await adminPage.context().storageState({ path: 'adminStorageState.json' })
    console.log('Stored adminStorageState')

    // get storageState: customer
    let customerPage = await browser.newPage();
    // log in
    await customerPage.goto(process.env.BASE_URL + '/my-account', { waitUntil: 'networkidle' })
    await customerPage.screenshot({ path: './playwright-report/screenshot_customer.png', fullPage: true });
    await customerPage.fill(selector.frontend.username, 'customer1')
    await customerPage.fill(selector.frontend.userPassword, '01dokan01')
    await customerPage.click(selector.frontend.logIn)
    await customerPage.context().storageState({ path: 'customerStorageState.json' })
    console.log('Stored customerStorageState')

    // get storageState: vendor
    let vendorPage = await browser.newPage()
    // log in
    await vendorPage.goto(process.env.BASE_URL + '/my-account', { waitUntil: 'networkidle' })
    await vendorPage.screenshot({ path: './playwright-report/screenshot_vendor.png', fullPage: true });
    await vendorPage.fill(selector.frontend.username, 'vendor1')
    await vendorPage.fill(selector.frontend.userPassword, '01dokan01')
    await vendorPage.click(selector.frontend.logIn)
    await vendorPage.context().storageState({ path: 'vendorStorageState.json' })
    console.log('Stored vendorStorageState')

    await browser.close()
    console.log('Global Setup Finished!')
}

export default globalSetup
