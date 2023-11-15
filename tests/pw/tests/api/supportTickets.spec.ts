//COVERAGE_TAG: GET /dokan/v1/admin/support-ticket/customers
//COVERAGE_TAG: GET /dokan/v1/admin/support-ticket
//COVERAGE_TAG: GET /dokan/v1/admin/support-ticket/(?P<id>[\d]+)
//COVERAGE_TAG: POST /dokan/v1/admin/support-ticket/(?P<id>[\d]+)
//COVERAGE_TAG: POST /dokan/v1/admin/support-ticket/(?P<id>[\d]+)/status
//COVERAGE_TAG: POST /dokan/v1/admin/support-ticket/(?P<id>[\d]+)/email-notification
//COVERAGE_TAG: DELETE /dokan/v1/admin/support-ticket/(?P<id>[\d]+)/comment
//COVERAGE_TAG: PUT /dokan/v1/admin/support-ticket/batch

import { test, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';


import { VENDOR_ID, CUSTOMER_ID } from '@utils/data.json';

test.describe('support ticket api test', () => {
    let apiUtils: ApiUtils;
    let supportTicketId: string;

    test.beforeAll(async ({ request }) => {
        apiUtils = new ApiUtils(request);
        [, supportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, store_id: VENDOR_ID });
    });

    test('get all support ticket customers @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllSupportTicketCustomers);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get all support tickets @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllSupportTickets);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get single support ticket @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleSupportTicket(supportTicketId), { params: { vendor_id: VENDOR_ID } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('create a support ticket comment @pro', async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createSupportTicketComment(supportTicketId), { data: payloads.createSupportTicketComment });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update a support ticket status @pro', async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.updateSupportTicketStatus(supportTicketId), { data: payloads.updateSupportTicketStatus });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();

        // reopen support ticket
        await apiUtils.updateSupportTicketStatus(supportTicketId, 'open');
    });

    test('update a support ticket email notification @pro', async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.updateSupportTicketEmailNotification(supportTicketId), { data: payloads.updateSupportTicketEmailNotification });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('delete a support ticket comment @pro', async () => {
        const supportTicketCommentId = await apiUtils.createSupportTicketComment(supportTicketId, payloads.createSupportTicketComment);
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteSupportTicketComment(supportTicketCommentId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update batch support tickets @pro', async () => {
        const allSupportTicketIds = (await apiUtils.getAllSupportTickets()).map((a: { ID: unknown }) => a.ID);
        const [response, responseBody] = await apiUtils.put(endPoints.updateBatchSupportTickets, { data: { close: allSupportTicketIds } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();

        // reopen all support tickets
        for (const supportTicketId of allSupportTicketIds) {
            await apiUtils.updateSupportTicketStatus(supportTicketId, 'open');
        }
    });
});
