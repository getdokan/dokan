require('dotenv').config();
import { chromium, FullConfig, request } from '@playwright/test'

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

}
export default globalSetup;
