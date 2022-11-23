import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'
import { helpers } from '../../utils/helpers'



// test.beforeAll(async ({ request }) => {});
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('modules api test', () => {

    // //TODO: need to send admin credentials 
    test('get all modules', async ({ request }) => {
        let response = await request.get(endPoints.getAllModules)
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('deactivate a module', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let randomModule = helpers.randomItem(await apiUtils.getAllModuleIds())
        console.log(randomModule)

        let response = await request.put(endPoints.deactivateModule, { data: { module: [randomModule]} })
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        //
        apiUtils.activateModules(randomModule)
    });

    test('activate a module', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let randomModule = helpers.randomItem(await apiUtils.getAllModuleIds())
        console.log(randomModule)

        let response = await request.put(endPoints.activateModule, { data: { module:[randomModule] } })
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });



});