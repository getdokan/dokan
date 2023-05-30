import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: ApiUtils;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
});

test.describe.skip('support ticket api test', () => {
	//TODO: prerequisite => multiple support tickets

	test('get all support ticket customers @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAllSupportTicketCustomers);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get all support tickets @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAllSupportTickets);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get single support ticket @pro', async ({ request }) => {
		const [supportTicketId, sellerId] = await apiUtils.getSupportTicketId();
		const response = await request.get(endPoints.getSingleSupportTicket(supportTicketId, sellerId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('create a support ticket comment @pro', async ({ request }) => {
		const [supportTicketId] = await apiUtils.getSupportTicketId();
		const response = await request.post(endPoints.createSupportTicketComment(supportTicketId), { data: payloads.createSupportTicketComment });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update support ticket status @pro', async ({ request }) => {
		const [supportTicketId] = await apiUtils.getSupportTicketId();
		const response = await request.post(endPoints.updateSupportTicketStatus(supportTicketId), { data: payloads.updateSupportTicketStatus });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();

		//reopen support ticket
		await apiUtils.updateSupportTicketStatus(supportTicketId, 'open');
	});

	test('update a support ticket email notification @pro', async ({ request }) => {
		const [supportTicketId] = await apiUtils.getSupportTicketId();
		const response = await request.post(endPoints.updateSupportTicketEmailNotification(supportTicketId), { data: payloads.updateSupportTicketEmailNotification });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('delete a support ticket comment @pro', async ({ request }) => {
		const supportTicketCommentId = await apiUtils.createSupportTicketComment(payloads.createSupportTicketComment);
		const response = await request.delete(endPoints.deleteSupportTicketComment(supportTicketCommentId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update batch support tickets @pro', async ({ request }) => {
		const allSupportTicketIds = (await apiUtils.getAllSupportTickets()).map((a: { ID: any }) => a.ID);

		const response = await request.put(endPoints.updateBatchSupportTickets, { data: { close: allSupportTicketIds } });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();

		// reopen all support tickets
		for (const supportTicketId of allSupportTicketIds) {
			await apiUtils.updateSupportTicketStatus(supportTicketId, 'open');
		}
	});
});
