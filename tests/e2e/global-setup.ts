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
    var serverUrl = process.env.BASE_URL ? process.env.BASE_URL : 'http://localhost:8889'
    var query = '?'
    const context = await request.newContext({})
    let head = await context.head(serverUrl)
    let headers = head.headers()
    let link = headers.link
    if (link.includes('rest_route')) {
        serverUrl = serverUrl + '?rest_route='
        query = '&'
        // console.log('if')
        // console.log(process.env.SERVER_URL)
    } else {
        serverUrl = serverUrl + '/wp-json'
        // console.log('else')
    }
    process.env.SERVER_URL = serverUrl
    process.env.QUERY = query

    // // create vendor
    // let response = await context.post(`${process.env.SERVER_URL}/dokan/v1/stores`, { data: payloads.createStore1 })
    // console.log(response.status())
    // let responseBody = await response.json()
    // let sellerId = responseBody.id
    // console.log(responseBody)
    // console.log(sellerId)

}

export default globalSetup;

