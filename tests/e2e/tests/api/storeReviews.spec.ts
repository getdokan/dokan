import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'



// test.beforeAll(async ({ request }) => {
//     let apiUtils = new ApiUtils(request)
//     await apiUtils.createAnnouncement(payloads.createAnnouncemnt)
// });
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('store reviews api test', () => {

    //TODO: need to send admin credentials 
    //TODO: store, store reviews

    test('get all store reviews', async ({ request }) => {
        let response = await request.get(endPoints.getAllAnnouncements)
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get single store review', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, announcementId] = await apiUtils.createAnnouncement(payloads.createAnnouncemnt)

        let response = await request.get(endPoints.getSingleAnnouncement(announcementId))
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('update a store review', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, announcementId] = await apiUtils.createAnnouncement(payloads.createAnnouncemnt)

        let response = await request.post(endPoints.updateAnnouncement(announcementId), { data: payloads.updateAnnouncement })
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

    });

    test('restore a deleted store review ', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, announcementId] = await apiUtils.createAnnouncement(payloads.createAnnouncemnt)

        let response = await request.delete(endPoints.deleteAnnouncement(announcementId))
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    // test('update batch store review', async ({ request }) => { //TODO
    //     let apiUtils = new ApiUtils(request)
    //     let allSupportTicketIds = (await apiUtils.getAllSupportTickets()).map(a => a.ID)
    //     console.log(allSupportTicketIds)

    //     let response = await request.put(endPoints.updateBatchSupportTickets, { data: { close: allSupportTicketIds } })
    //     let responseBody = await response.json()
    //     console.log(responseBody)

    //     expect(response.ok()).toBeTruthy()
    //     expect(response.status()).toBe(200)

    //     // reopen all support tickets
    //     for (let supportTicketId of allSupportTicketIds) {
    //         await apiUtils.updateSupportTicketStatus(supportTicketId, 'open')
    //     }
    // });

});