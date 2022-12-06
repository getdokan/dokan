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
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('get single announcement', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, announcementId] = await apiUtils.createAnnouncement(payloads.createAnnouncemnt)

        let response = await request.get(endPoints.getSingleAnnouncement(announcementId))
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('create a announcement', async ({ request }) => {
        let response = await request.post(endPoints.createAnnouncement, { data: payloads.createAnnouncemnt })
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });


    test('update a announcement', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, announcementId] = await apiUtils.createAnnouncement(payloads.createAnnouncemnt)

        let response = await request.post(endPoints.updateAnnouncement(announcementId), { data: payloads.updateAnnouncement })
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)

    });

    test('delete a announcement', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, announcementId] = await apiUtils.createAnnouncement(payloads.createAnnouncemnt)

        let response = await request.delete(endPoints.deleteAnnouncement(announcementId))
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('update batch announcements', async ({ request }) => { 
        let apiUtils = new ApiUtils(request)
        let allAnnouncementIds = (await apiUtils.getAllAnnouncements()).map(a => a.id)
        // console.log(allAnnouncementIds)

        let response = await request.put(endPoints.updateBatchAnnouncements, { data: { trash: allAnnouncementIds } })
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)

        // restore all announcements
        await apiUtils.updateBatchAnnouncements('restore', allAnnouncementIds)
    });

});