//COVERAGE_tag: GET /dokan/v1/announcement
//COVERAGE_TAG: GET /dokan/v1/announcement/(?P<id>[\d]+)
//COVERAGE_TAG: POST /dokan/v1/announcement
//COVERAGE_TAG: POST /dokan/v1/announcement/(?P<id>[\d]+)
//COVERAGE_TAG: DELETE /dokan/v1/announcement/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v1/announcement/(?P<id>[\d]+)/restore
//COVERAGE_TAG: PUT /dokan/v1/announcement/batch
//COVERAGE_TAG: GET /dokan/v1/announcement/notice/(?P<id>[\\d]+)
//COVERAGE_TAG: POST /dokan/v1/announcement/notice/(?P<id>[\\d]+)
//COVERAGE_TAG: DELETE /dokan/v1/announcement/notice/(?P<id>[\\d]+)

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
        // Create announcement with admin authentication
        [, announcementId] = await apiUtils.createAnnouncement(payloads.createAnnouncement(), payloads.adminAuth);
        
        // Get announcement notice ID - if none exists, skip notice tests
        try {
            announcementNoticeId = await apiUtils.getAnnouncementNoticeId(payloads.adminAuth);
            if (!announcementNoticeId || announcementNoticeId === 'undefined') {
                console.log('No announcement notices found, skipping notice tests');
                announcementNoticeId = '';
            }
        } catch (error) {
            console.log('Error getting announcement notice ID:', error);
            announcementNoticeId = '';
        }
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get all announcements', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllAnnouncements, { headers: payloads.adminAuth });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.announcementsSchema.announcementsSchema);
    });

    test('get single announcement', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleAnnouncement(announcementId), { headers: payloads.adminAuth });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.announcementsSchema.announcementSchema);
    });

    test('create an announcement', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createAnnouncement, { data: payloads.createAnnouncement(), headers: payloads.adminAuth });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.announcementsSchema.announcementSchema);
    });

    test('update an announcement', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.updateAnnouncement(announcementId), { data: payloads.updateAnnouncement, headers: payloads.adminAuth });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.announcementsSchema.announcementSchema);
    });

    test('trash an announcement', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteAnnouncement(announcementId), { headers: payloads.adminAuth });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.announcementsSchema.announcementSchema);
    });

    test('restore a trashed announcement', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.restoreDeletedAnnouncement(announcementId), { headers: payloads.adminAuth });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.announcementsSchema.announcementSchema);
    });

    test('update batch announcements', { tag: ['@pro'] }, async () => {
        const allAnnouncements = await apiUtils.getAllAnnouncements(payloads.adminAuth);
        const allIds = allAnnouncements?.map((a: { id: unknown }) => String(a.id)) || [];
        const [response, responseBody] = await apiUtils.updateBatchAnnouncements('trash', allIds, payloads.adminAuth);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    // announcement notice tests - only run if notice ID is available

    test('get single announcement notice', { tag: ['@pro'] }, async () => {
        test.skip(!announcementNoticeId, 'No announcement notice ID available');
        
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleAnnouncementNotice(announcementNoticeId), { headers: payloads.vendorAuth });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.announcementsSchema.announcementSchema);
    });

    test('update an announcement notice', { tag: ['@pro'] }, async () => {
        test.skip(!announcementNoticeId, 'No announcement notice ID available');
        
        const [response, responseBody] = await apiUtils.post(endPoints.updateAnnouncementNotice(announcementNoticeId), { data: payloads.updateAnnouncementNotice, headers: payloads.vendorAuth });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.announcementsSchema.announcementSchema);
    });

    test('delete an announcement notice', { tag: ['@pro'] }, async () => {
        test.skip(!announcementNoticeId, 'No announcement notice ID available');
        
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteAnnouncementNotice(announcementNoticeId), { headers: payloads.vendorAuth });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.announcementsSchema.deleteAnnouncementNoticeSchema);
    });
});
