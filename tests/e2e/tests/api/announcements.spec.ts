import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

let apiUtils: any
let announcementId: string;
test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
    let [, id] = await apiUtils.createAnnouncement(payloads.createAnnouncemnt)
    announcementId = id
});
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe('announcements api test', () => {

    test('get all announcements', async ({ request }) => {
        let response = await request.get(endPoints.getAllAnnouncements)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get single announcement', async ({ request }) => {
        // let [, announcementId] = await apiUtils.createAnnouncement(payloads.createAnnouncemnt)

        let response = await request.get(endPoints.getSingleAnnouncement(announcementId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('create a announcement', async ({ request }) => {
        let response = await request.post(endPoints.createAnnouncement, { data: payloads.createAnnouncemnt })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });


    test('update a announcement', async ({ request }) => {
        // let [, announcementId] = await apiUtils.createAnnouncement(payloads.createAnnouncemnt)

        let response = await request.post(endPoints.updateAnnouncement(announcementId), { data: payloads.updateAnnouncement })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()

    });

    test('delete a announcement', async ({ request }) => {
        // let [, announcementId] = await apiUtils.createAnnouncement(payloads.createAnnouncemnt)

        let response = await request.delete(endPoints.deleteAnnouncement(announcementId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('restore a deleted announcement ', async ({ request }) => {
        // let [, announcementId] = await apiUtils.createAnnouncement(payloads.createAnnouncemnt)
        await apiUtils.deleteAnnouncement(announcementId)

        let response = await request.put(endPoints.restoredeletedAnnouncement(announcementId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('update batch announcements', async ({ request }) => {
        // let [, announcementId] = await apiUtils.createAnnouncement(payloads.createAnnouncemnt)
        let allAnnouncementIds = (await apiUtils.getAllAnnouncements()).map(a => a.id)
        // console.log(allAnnouncementIds)

        let response = await request.put(endPoints.updateBatchAnnouncements, { data: { trash: allAnnouncementIds } })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()

        // restore all announcements
        await apiUtils.updateBatchAnnouncements('restore', allAnnouncementIds)
    });

});
