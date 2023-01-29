import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

let apiUtils: any
let downloadableProductId: string
let orderId: string
let downloadId: string


test.beforeAll(async ({ request }) => {
  apiUtils = new ApiUtils(request)
  let [responseBody,] = await apiUtils.uploadMedia('../../tests/api/utils/sampleData/avatar.png')
  let downloads = [{
    id: String(responseBody.id),
    name: responseBody.title.raw,
    file: responseBody.source_url
  }]
  let [, pId] = await apiUtils.createProduct({ ...payloads.createDownloadableProduct(), downloads: downloads })
  downloadableProductId = pId
  let [, oId,] = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder)
  orderId = oId
  let [, dId] = await apiUtils.createOrderDownload(orderId, [downloadableProductId],)
  downloadId = dId
});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('order downloads api test', () => {

  test('get all order downloads @v2', async ({ request }) => {
    let response = await request.get(endPoints.getAllOrderDownloads(orderId))
    let responseBody = await apiUtils.getResponseBody(response)
    expect(response.ok()).toBeTruthy()
  });

  test('create order downloads @v2', async ({ request }) => {
    let response = await request.post(endPoints.createOrderDownload(orderId), { data: { ids: [downloadableProductId] } })
    let responseBody = await apiUtils.getResponseBody(response)
    expect(response.ok()).toBeTruthy()
  });

  test('delete order downloads @v2', async ({ request }) => {
    let response = await request.delete(endPoints.deleteOrderDownload(orderId), { data: { permission_id: downloadId } })
    let responseBody = await apiUtils.getResponseBody(response)
    expect(response.ok()).toBeTruthy()
  });

});
