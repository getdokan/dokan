import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;
let announcementId: string;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	[, announcementId] = await apiUtils.createAnnouncement(payloads.createAnnouncement);
});

test.describe('announcements api test', () => {
	
	test('get all announcements @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAllAnnouncements);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get single announcement @pro', async ({ request }) => {
		const response = await request.get(endPoints.getSingleAnnouncement(announcementId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('create a announcement @pro', async ({ request }) => {
		const response = await request.post(endPoints.createAnnouncement, { data: payloads.createAnnouncement });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('update a announcement @pro', async ({ request }) => {
		const response = await request.post(endPoints.updateAnnouncement(announcementId), { data: payloads.updateAnnouncement });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('delete a announcement @pro', async ({ request }) => {
		const response = await request.delete(endPoints.deleteAnnouncement(announcementId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('restore a deleted announcement  @pro', async ({ request }) => {
		const response = await request.put(endPoints.restoreDeletedAnnouncement(announcementId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('update batch announcements @pro', async ({ request }) => {
		const allAnnouncementIds = (await apiUtils.getAllAnnouncements()).map((a: { id: any }) => a.id);
		const response = await request.put(endPoints.updateBatchAnnouncements, { data: { trash: allAnnouncementIds } });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();

		// restore all announcements
		await apiUtils.updateBatchAnnouncements('restore', allAnnouncementIds);
	});
});
