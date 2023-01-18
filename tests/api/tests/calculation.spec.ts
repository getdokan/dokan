import { test, expect } from '@playwright/test'
import { ApiUtils } from '../utils/apiUtils'
import { endPoints } from '../utils/apiEndPoints'
import { payloads } from '../utils/payloads'

let apiUtils: any

test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)

});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe.skip('calculation test', () => {
    test('calculation test', async ({ request }) => {

        let [res, oid] = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder)
        let total = res.total
        let oRes = await apiUtils.getSingleOrder(oid)
        let [, uid] = await apiUtils.getCurrentUser()
        let sRes = await apiUtils.getSingleStore(uid)

    });



});