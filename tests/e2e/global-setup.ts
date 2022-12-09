// // global-setup.ts
// import { chromium, FullConfig } from '@playwright/test';
// import { BasePage } from "./pages/basePage";
// import { data } from './utils/testData';
// import { selector } from './pages/selectors';

// async function globalSetup(config: FullConfig) {
//     const browser = await chromium.launch();
//     const page = await browser.newPage();
//     await page.goto('http://dokan1.test/wp-admin');

//     await page.fill(selector.backend.email, 'admin')
//     await page.fill(selector.backend.password, '01dokan01')
//     await page.click(selector.backend.login)
//     // Save signed-in state to 'storageState.json'.
//     await page.context().storageState({ path: 'storageState.json' });
//     await browser.close();
// }

// export default globalSetup;


require('dotenv').config();
import { FullConfig, request } from '@playwright/test'
import { payloads } from './utils/payloads'


async function globalSetup(config: FullConfig) {
    // get site url structur
    var serverUrl = process.env.BASE_URL ? process.env.BASE_URL : 'http://localhost:8889'
    var query = '?'
    const context = await request.newContext({})
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

    // create user auth
    let basicAuth = (username: string, password: string) => 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
    process.env.ADMIN_AUTH = { Authorization: basicAuth(process.env.ADMIN, process.env.ADMIN_PASSWORD) }
    process.env.VENDOR_AUTH = { Authorization: basicAuth(process.env.VENDOR, process.env.VENDOR_PASSWORD) }
    process.env.CUSTOMER_AUTH = { Authorization: basicAuth(process.env.CUSTOMER, process.env.CUSTOMER_PASSWORD) }
    // let response = await request.post(endPoints.createStoreReview(sellerId), { data: payloads.createStoreReview, headers: process.env.CUSTOMER_AUTH })
}

export default globalSetup;

