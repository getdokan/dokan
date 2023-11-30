//COVERAGE_tag: GET /dokan/v1/announcement
//COVERAGE_TAG: GET /dokan/v1/announcement/(?P<id>[\d]+)
//COVERAGE_TAG: POST /dokan/v1/announcement
//COVERAGE_TAG: POST /dokan/v1/announcement/(?P<id>[\d]+)
//COVERAGE_TAG: DELETE /dokan/v1/announcement/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v1/announcement/(?P<id>[\d]+)/restore
//COVERAGE_TAG: PUT /dokan/v1/announcement/batch

import { test, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

test.describe('announcements api test', () => {
    let apiUtils: ApiUtils;
    let announcementId: string;
    let announcementNoticeId: string;

    test.beforeAll(async ({ request }) => {
        apiUtils = new ApiUtils(request);
        [, announcementId] = await apiUtils.createAnnouncement(payloads.createAnnouncement());
        announcementNoticeId = await apiUtils.getAnnouncementNoticeId(payloads.vendorAuth);
    });

    test('get all announcements @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllAnnouncements);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get single announcement @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleAnnouncement(announcementId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('create an announcement @pro', async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createAnnouncement, { data: payloads.createAnnouncement() });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update an announcement @pro', async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.updateAnnouncement(announcementId), { data: payloads.updateAnnouncement });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('trash an announcement @pro', async () => {
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteAnnouncement(announcementId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('restore a trashed announcement @pro', async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.restoreDeletedAnnouncement(announcementId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update batch announcements @pro', async () => {
        const allAnnouncementIds = (await apiUtils.getAllAnnouncements()).map((a: { id: unknown }) => a.id);
        const [response, responseBody] = await apiUtils.put(endPoints.updateBatchAnnouncements, { data: { trash: allAnnouncementIds } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();

        // restore all announcements
        await apiUtils.updateBatchAnnouncements('restore', allAnnouncementIds);
    });

    // announcement notice

    test('get single announcement notice @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleAnnouncementNotice(announcementNoticeId), { headers: payloads.vendorAuth });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update an announcement notice @pro', async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.updateAnnouncementNotice(announcementNoticeId), { data: payloads.updateAnnouncementNotice, headers: payloads.vendorAuth });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('delete an announcement notice @pro', async () => {
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteAnnouncementNotice(announcementNoticeId), { headers: payloads.vendorAuth });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
