import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

let apiUtils: any
let productId: string
let attributeId: string
let attributeTermId: string
let attribute: any
let attributeTerm: any

test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
    let [res, pId] = await apiUtils.createProduct(payloads.createProduct())
    productId = pId
    let [body, aId, atId] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm())
    attributeTerm = body
    attributeId = aId
    attributeTermId = atId
    attribute = await apiUtils.getSingleAttribute(attributeId)
});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('product attribute api test', () => {

    test('set default attribute', async ({ request }) => {
        let payload = {
            id: attribute.id,
            name: attribute.name,
            option: attributeTerm.name,
            options: []
        }

        let response = await request.put(endPoints.setDefaultAttribute(productId), { data: { attributes: [payload] } })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('update product attribute', async ({ request }) => {
        let payload = {
            attributes: [
                {
                    all_terms: [
                        {
                            label: attributeTerm.name,
                            slug: attributeTerm.slug,
                            taxonomy: attribute.slug,
                            value: attributeTerm.id
                        }
                    ],
                    id: attribute.id,
                    name: attribute.name,
                    options: [ attributeTerm.name,],
                    slug: attribute.slug,
                    taxonomy: true,
                    variation: false,
                    visible: true
                }
            ]
        }
        let response = await request.post(endPoints.updateProductAttribute(productId), { data: payload })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

});
