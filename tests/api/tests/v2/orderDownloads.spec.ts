import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'
const fs = require('fs');


let apiUtils: any
let productId: string
let variationId: string
let orderId: string


test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
    // let [, pId] = await apiUtils.createProduct(payloads.createDownloadableProduct())
    // productId = pId
    // let [, vId] = await apiUtils.createVariableProductWithVariation(payloads.createAttribute(), payloads.createAttributeTerm(), payloads.createVariableProduct())
    // variationId = vId
    // let [, id] = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder)
    // orderId = id
    // await apiUtils.createOrderDownload(orderId, [productId],)
    // await apiUtils.createOrderDownload(33, ['31'],)
});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('order downloads api test', () => {

    test('get all order downloads @v2', async ({ request }) => {
        // let response = await request.get(endPoints.wp.getAllMediaItems)
        
        // let file = (Buffer.from(fs.readFileSync('../../tests/api/utils/sampleData/avatar.png').buffer)).toString('binary') ;

        // console.log(file);
        

        // let payload = {
        //     file:  file
        // }
        // // let pp = fs.readFileSync('../../tests/api/utils/sampleData/avatar.png')

        // console.log(payload);
        

        // let headers = {
        //     // "content-disposition": "attachment; filename=avatar.png",
        //     "content-type": "multipart/form-data"
        // }

        // payload = JSON.stringify(payload);

        const image = fs.readFileSync('../../tests/api/utils/sampleData/avatar.png');

        let payload = {
            headers: {
              Accept: "*/*",
              ContentType: "multipart/form-data",
            },
            multipart: {
              file: {
                name: 'avatar.png',
                mimeType: "image/png",
                buffer: image,
              },
            },
          }

        let response = await request.post(endPoints.wp.createMediaItem, payload)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
        let downloads = [{
            id: String(responseBody.id),
            name:  responseBody.title.raw,
            file: responseBody.source_url
        }
        ]
        let [body, pId] = await apiUtils.createProduct({ ...payloads.createDownloadableProduct(), downloads: downloads })
        // await apiUtils.createOrder(pId, payloads.createOrder)

    });

    // test('get all order downloads @v2', async ({ request }) => {

    //     expect(response.ok()).toBeTruthy()
    // });

    // test('create order downloads @v2', async ({ request }) => {

    //     let response = await request.post(endPoints.createOrderDownload('33'), { data: { ids: [31] } })
    //     let responseBody = await apiUtils.getResponseBody(response)
    //     expect(response.ok()).toBeTruthy()
    // });

    // test('delete order downloads @v2', async ({ request }) => {
    //     let response = await request.delete(endPoints.deleteOrderDownload(orderId), { data: { permission_id: 1 } })
    //     let responseBody = await apiUtils.getResponseBody(response)
    //     expect(response.ok()).toBeTruthy()
    // });

});
