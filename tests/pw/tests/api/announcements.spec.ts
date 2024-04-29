//COVERAGE_tag: GET /dokan/v1/announcement
//COVERAGE_TAG: GET /dokan/v1/announcement/(?P<id>[\d]+)
//COVERAGE_TAG: POST /dokan/v1/announcement
//COVERAGE_TAG: POST /dokan/v1/announcement/(?P<id>[\d]+)
//COVERAGE_TAG: DELETE /dokan/v1/announcement/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v1/announcement/(?P<id>[\d]+)/restore
//COVERAGE_TAG: PUT /dokan/v1/announcement/batch

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { schemas } from '@utils/schemas';

test.describe('announcements api test', () => {
    let apiUtils: ApiUtils;
    let announcementId: string;
    let announcementNoticeId: string;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        [, announcementId] = await apiUtils.createAnnouncement(payloads.createAnnouncement());
        announcementNoticeId = await apiUtils.getAnnouncementNoticeId(payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get all announcements', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllAnnouncements);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.announcementsSchema.announcementsSchema);
    });

    test('get single announcement', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleAnnouncement(announcementId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.announcementsSchema.announcementSchema);
    });

    test('create an announcement', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createAnnouncement, { data: payloads.createAnnouncement() });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.announcementsSchema.announcementSchema);
    });

    test('update an announcement', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.updateAnnouncement(announcementId), { data: payloads.updateAnnouncement });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.announcementsSchema.announcementSchema);
    });

    test('trash an announcement', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteAnnouncement(announcementId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.announcementsSchema.announcementSchema);
    });

    test('restore a trashed announcement', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.restoreDeletedAnnouncement(announcementId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.announcementsSchema.announcementSchema);
    });

    test('update batch announcements', { tag: ['@pro'] }, async () => {
        const allAnnouncementIds = (await apiUtils.getAllAnnouncements()).map((a: { id: unknown }) => a.id);
        const [response, responseBody] = await apiUtils.put(endPoints.updateBatchAnnouncements, { data: { trash: allAnnouncementIds } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.announcementsSchema.batchUpdateAnnouncementsSchema);

        // restore all announcements
        await apiUtils.updateBatchAnnouncements('restore', allAnnouncementIds);
    });

    // announcement notice

    test('get single announcement notice', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleAnnouncementNotice(announcementNoticeId), { headers: payloads.vendorAuth });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.announcementsSchema.announcementNoticeSchema);
    });

    test('update an announcement notice', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.updateAnnouncementNotice(announcementNoticeId), { data: payloads.updateAnnouncementNotice, headers: payloads.vendorAuth });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.announcementsSchema.announcementNoticeSchema);
    });

    test('delete an announcement notice', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteAnnouncementNotice(announcementNoticeId), { headers: payloads.vendorAuth });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.announcementsSchema.deleteAnnouncementNoticeSchema);
    });
});
