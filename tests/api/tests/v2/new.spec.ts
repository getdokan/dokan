import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

let apiUtils: any
let productId: string 
let variationId: string
let orderId: string


test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
    let [, pId] = await apiUtils.createProduct(payloads.createDownloadableProduct())
    productId = pId
    let [, vId] = await apiUtils.createVariableProductWithVariation(payloads.createAttribute(), payloads.createAttributeTerm(), payloads.createVariableProduct())
    variationId = vId
    let [, id] = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder)
    orderId = id
    await apiUtils.createOrderDownload(orderId, [productId],)
    // await apiUtils.createOrderDownload(33, ['31'],)
});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('new v1 api test', () => {

    test('get product block details', async ({ request }) => {
        let response = await request.get(endPoints.getProductBlockDetails(productId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get variable product block details', async ({ request }) => {
        let response = await request.get(endPoints.getProductBlockDetails(variationId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    // test('set default attribute', async ({ request }) => {
    //     let response = await request.post(endPoints.setDefaultAttribute(productId), { data: {} })
    //     let responseBody = await apiUtils.getResponseBody(response)
    //     expect(response.ok()).toBeTruthy()
    // });

    // test('update product attribute', async ({ request }) => {
    //     let response = await request.post(endPoints.updateProductAttribute(productId), { data: {} })
    //     let responseBody = await apiUtils.getResponseBody(response)
    //     expect(response.ok()).toBeTruthy()
    // });



    test('get vendor dashboard statistics', async ({ request }) => {
        let response = await request.get(endPoints.getVendorDashboardStatistics)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get vendor profile information', async ({ request }) => {
        let response = await request.get(endPoints.getVendorProfileInformation)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get vendor sales report', async ({ request }) => {
        let response = await request.get(endPoints.getVendorSalesReport)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get vendor product reports summary', async ({ request }) => {
        let response = await request.get(endPoints.getVendorProductReportsSummary)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get vendor order reports summary', async ({ request }) => {
        let response = await request.get(endPoints.getVendorOrderReportsSummary)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get vendor store preferences', async ({ request }) => {
        let response = await request.get(endPoints.getVendorStorePreferences)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get vendor profile progress bar data', async ({ request }) => {
        let response = await request.get(endPoints.getVendorProfileProgressBarData)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });



    test.skip('rank math', async ({ request }) => {
        let response = await request.post(endPoints.rankMath(productId), { data: {} })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });


    //v2


    test('get withdraw settings', async ({ request }) => {
        let response = await request.get(endPoints.getWithdrawSettings)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });


    test('get withdraw summary', async ({ request }) => {
        let response = await request.get(endPoints.getWithdrawSummary)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });



    test('update batch orders', async ({ request }) => {
        let allOrderIds = (await apiUtils.getAllOrders()).map((a: { id: any }) => a.id)
        console.log(allOrderIds)

        let response = await request.put(endPoints.updateBatchRequestQuotes, { data: { order_ids: allOrderIds, status: "wc-completed" } })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });


    // test('get all order downloads', async ({ request }) => {
    //     let response = await request.get(endPoints.getAllOrderDownloads(orderId))
    //     let responseBody = await apiUtils.getResponseBody(response)
    //     expect(response.ok()).toBeTruthy()
    // });

    // test.only('create order downloads', async ({ request }) => {
    //     let response = await request.post(endPoints.createOrderDownload('33'), { data: { ids: [31] } })
    //     let responseBody = await apiUtils.getResponseBody(response)
    //     expect(response.ok()).toBeTruthy()
    // });

    // test('delete order downloads', async ({ request }) => {
    //     let response = await request.delete(endPoints.deleteOrderDownload(orderId), { data: { permission_id: 1 } })
    //     let responseBody = await apiUtils.getResponseBody(response)
    //     expect(response.ok()).toBeTruthy()
    // });



    test('get store settings', async ({ request }) => {
        let response = await request.get(endPoints.getStoreSettings)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get single setting group', async ({ request }) => {
        let response = await request.get(endPoints.getSingleSettingGroup('store'))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('update single setting group', async ({ request }) => {
        let response = await request.post(endPoints.updateSingleSettingGroup('store'), { data: payloads.updateSettingsGroup })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get sub settings from single settings group', async ({ request }) => {
        let response = await request.get(endPoints.getSubSettingFromSingleSettingGroup('store', 'store_name'))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('update sub settings from single settings group', async ({ request }) => {
        let response = await request.post(endPoints.updateSubSettingFromSingleSettingGroup('store', 'store_name'), { data: payloads.updateSubSettingFromSingleSettingGroup })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get sub sub settings from single settings group', async ({ request }) => {
        let response = await request.get(endPoints.getSubSubSettingFromSingleSettingGroup('store', 'store_name', 'street_1'))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('update sub sub settings from single settings group', async ({ request }) => {
        let response = await request.post(endPoints.updateSubSubSettingFromSingleSettingGroup('store', 'store_name', 'street_1'), { data: payloads.updateSubSubSettingFromSingleSettingGroup })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

});
