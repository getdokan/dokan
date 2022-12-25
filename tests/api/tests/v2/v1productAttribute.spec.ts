import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

let apiUtils: any
let productId: string
let attributeId: string
let attributeTermId: string

test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
    let [, pId] = await apiUtils.createProduct(payloads.createProduct())
    productId = pId
    let [, aId, atId] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm())
    attributeId = aId
    attributeTermId = atId
});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('product attribute api test', () => {

    test.only('set default attribute', async ({ request }) => {
        let attribute = await apiUtils.getSingleAttribute(attributeId)
        let attributeTerm = await apiUtils.getSingleAttributeTerm(attributeId, attributeTermId)
        let payload = {
            "id": attribute.id,
            "name": attribute.name,
            "option": attributeTerm.name,
            "options": []
        }
        console.log('payload',payload)

        let response = await request.put(endPoints.setDefaultAttribute(productId), { data: { attributes: [payload] } })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('update product attribute', async ({ request }) => {
        let response = await request.post(endPoints.updateProductAttribute(productId), { data: {} })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

});
