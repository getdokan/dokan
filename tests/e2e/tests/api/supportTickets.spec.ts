import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'



let apiUtils;
test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
});
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe.skip('support ticket api test', () => {

    //TODO: need to send vendor credentials for vendor info
    //TODO: prerequisite => multiple support tickets
    test('get all support ticket customers', async ({ request }) => {
        let response = await request.get(endPoints.getAllSupportTicketCustomers)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get all support tickets', async ({ request }) => {
        let response = await request.get(endPoints.getAllSupportTickets)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get single support ticket', async ({ request }) => {
        let [supportTicketId, sellerId] = await apiUtils.getSupportTicketId()

        let response = await request.get(endPoints.getSingleSupportTicket(supportTicketId, sellerId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });


    test('create a support ticket comment', async ({ request }) => {
        let [supportTicketId,] = await apiUtils.getSupportTicketId()

        let response = await request.post(endPoints.createSupportTicketComment(supportTicketId), { data: payloads.createSupportTicketComment })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });


    test('update support ticket status', async ({ request }) => {
        let [supportTicketId,] = await apiUtils.getSupportTicketId()

        let response = await request.post(endPoints.updateSupportTicketStatus(supportTicketId), { data: payloads.updateSuppotTicketStatus })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()

        //reopen support ticket
        await apiUtils.updateSupportTicketStatus(supportTicketId, 'open')
    });

    test('update a support ticket email notification', async ({ request }) => {
        let [supportTicketId,] = await apiUtils.getSupportTicketId()

        let response = await request.post(endPoints.updateSupportTicketEmailNotification(supportTicketId), { data: payloads.updateSuppotTicketEmailNotification })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });


    test('delete a support ticket comment', async ({ request }) => {
        let supportTicketCommentId = await apiUtils.createSupportTicketComment(payloads.createSupportTicketComment)

        let response = await request.delete(endPoints.deleteSupportTicketComment(supportTicketCommentId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('update batch support tickets', async ({ request }) => {
        let allSupportTicketIds = (await apiUtils.getAllSupportTickets()).map(a => a.ID)
        console.log(allSupportTicketIds)

        let response = await request.put(endPoints.updateBatchSupportTickets, { data: { close: allSupportTicketIds } })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()

        // reopen all support tickets
        for (let supportTicketId of allSupportTicketIds) {
            await apiUtils.updateSupportTicketStatus(supportTicketId, 'open')
        }
    });

});