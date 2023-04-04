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
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get single announcement @pro', async ({ request }) => {
		const response = await request.get(endPoints.getSingleAnnouncement(announcementId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('create a announcement @pro', async ({ request }) => {
		const response = await request.post(endPoints.createAnnouncement, { data: payloads.createAnnouncement });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update a announcement @pro', async ({ request }) => {
		const response = await request.post(endPoints.updateAnnouncement(announcementId), { data: payloads.updateAnnouncement });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('delete a announcement @pro', async ({ request }) => {
		const response = await request.delete(endPoints.deleteAnnouncement(announcementId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('restore a deleted announcement  @pro', async ({ request }) => {
		const response = await request.put(endPoints.restoreDeletedAnnouncement(announcementId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update batch announcements @pro', async ({ request }) => {
		const allAnnouncementIds = (await apiUtils.getAllAnnouncements()).map((a: { id: any }) => a.id);
		const response = await request.put(endPoints.updateBatchAnnouncements, { data: { trash: allAnnouncementIds } });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();

		// restore all announcements
		await apiUtils.updateBatchAnnouncements('restore', allAnnouncementIds);
	});
});
