import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'



// test.beforeAll(async ({ request }) => {});
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe.skip('support ticket api test', () => {

    //TODO: need to send vendor credentials for vendor info
    //TODO: prerequisite => multiple support tickets
    test('get all support ticket customers', async ({ request }) => {
        let response = await request.get(endPoints.getAllSupportTicketCustomers)
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('get all support tickets', async ({ request }) => {
        let response = await request.get(endPoints.getAllSupportTickets)
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('get single support ticket', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [supportTicketId, sellerId] = await apiUtils.getSupportTicketId()

        let response = await request.get(endPoints.getSingleSupportTicket(supportTicketId, sellerId))
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });


    test('create a support ticket comment', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [supportTicketId,] = await apiUtils.getSupportTicketId()

        let response = await request.post(endPoints.createSupportTicketComment(supportTicketId), { data: payloads.createSupportTicketComment })
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });


    test('update support ticket status', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [supportTicketId,] = await apiUtils.getSupportTicketId()

        let response = await request.post(endPoints.updateSupportTicketStatus(supportTicketId), { data: payloads.updateSuppotTicketStatus })
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)

        //reopen support ticket
        await apiUtils.updateSupportTicketStatus(supportTicketId, 'open')
    });

    test('update a support ticket email notification', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [supportTicketId,] = await apiUtils.getSupportTicketId()

        let response = await request.post(endPoints.updateSupportTicketEmailNotification(supportTicketId), { data: payloads.updateSuppotTicketEmailNotification })
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });


    test('delete a support ticket comment', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let supportTicketCommentId = await apiUtils.createSupportTicketComment(payloads.createSupportTicketComment)

        let response = await request.delete(endPoints.deleteSupportTicketComment(supportTicketCommentId))
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('update batch support tickets', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let allSupportTicketIds = (await apiUtils.getAllSupportTickets()).map(a => a.ID)
        console.log(allSupportTicketIds)

        let response = await request.put(endPoints.updateBatchSupportTickets, { data: { close: allSupportTicketIds } })
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)

        // reopen all support tickets
        for (let supportTicketId of allSupportTicketIds) {
            await apiUtils.updateSupportTicketStatus(supportTicketId, 'open')
        }
    });

});