import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'



test.beforeAll(async ({ request }) => {
    let apiUtils = new ApiUtils(request)
    await apiUtils.createAnnouncement(payloads.createAnnouncemnt)
});
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('announcements api test', () => {

    //TODO: need to send admin credentials 

    test('get all announcements', async ({ request }) => {
        let response = await request.get(endPoints.getAllAnnouncements)
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get single announcement', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, announcementId] = await apiUtils.createAnnouncement(payloads.createAnnouncemnt)

        let response = await request.get(endPoints.getSingleAnnouncement(announcementId))
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('create a announcement', async ({ request }) => {
        let response = await request.post(endPoints.createAnnouncement, { data: payloads.createAnnouncemnt })
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


    test('update a announcement', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, announcementId] = await apiUtils.createAnnouncement(payloads.createAnnouncemnt)

        let response = await request.post(endPoints.updateAnnouncement(announcementId), { data: payloads.updateAnnouncement })
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

    });

    test('delete a announcement', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, announcementId] = await apiUtils.createAnnouncement(payloads.createAnnouncemnt)

        let response = await request.delete(endPoints.deleteAnnouncement(announcementId))
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('update batch announcements', async ({ request }) => { 
        let apiUtils = new ApiUtils(request)
        let allAnnouncementIds = (await apiUtils.getAllAnnouncements()).map(a => a.id)
        console.log(allAnnouncementIds)

        let response = await request.put(endPoints.updateBatchAnnouncements, { data: { trash: allAnnouncementIds } })
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        // restore all announcements
        await apiUtils.updateBatchAnnouncements('restore', allAnnouncementIds)
    });

});