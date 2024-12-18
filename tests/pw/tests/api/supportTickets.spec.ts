//COVERAGE_TAG: GET /dokan/v1/admin/support-ticket/customers
//COVERAGE_TAG: GET /dokan/v1/admin/support-ticket
//COVERAGE_TAG: GET /dokan/v1/admin/support-ticket/(?P<id>[\d]+)
//COVERAGE_TAG: POST /dokan/v1/admin/support-ticket/(?P<id>[\d]+)
//COVERAGE_TAG: POST /dokan/v1/admin/support-ticket/(?P<id>[\d]+)/status
//COVERAGE_TAG: POST /dokan/v1/admin/support-ticket/(?P<id>[\d]+)/email-notification
//COVERAGE_TAG: DELETE /dokan/v1/admin/support-ticket/(?P<id>[\d]+)/comment
//COVERAGE_TAG: PUT /dokan/v1/admin/support-ticket/batch

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { schemas } from '@utils/schemas';

const { VENDOR_ID, CUSTOMER_ID } = process.env;

test.describe('support ticket api test', () => {
    let apiUtils: ApiUtils;
    let supportTicketId: string;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        [, supportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, meta: { ...payloads.createSupportTicket.meta, store_id: VENDOR_ID } });
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get all support ticket customers', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllSupportTicketCustomers);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.supportTicketsSchema.supportTicketCustomerSchema);
    });

    test('get all support tickets', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllSupportTickets);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.supportTicketsSchema.supportTicketsSchema);
    });

    test('get single support ticket', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleSupportTicket(supportTicketId), { params: { vendor_id: VENDOR_ID } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.supportTicketsSchema.singleSupportTicketSchema);
    });

    test('create a support ticket comment', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createSupportTicketComment(supportTicketId), { data: payloads.createSupportTicketComment });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.supportTicketsSchema.supportTicketCommentSchema);
    });

    test('update a support ticket status', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.updateSupportTicketStatus(supportTicketId), { data: payloads.updateSupportTicketStatus });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.supportTicketsSchema.supportTicketStatusSchema);

        // reopen support ticket
        await apiUtils.updateSupportTicketStatus(supportTicketId, 'open');
    });

    test('update a support ticket email notification', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.updateSupportTicketEmailNotification(supportTicketId), { data: payloads.updateSupportTicketEmailNotification });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.supportTicketsSchema.supportTicketEmailSchema);
    });

    test('delete a support ticket comment', { tag: ['@pro'] }, async () => {
        const supportTicketCommentId = await apiUtils.createSupportTicketComment(supportTicketId, payloads.createSupportTicketComment);
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteSupportTicketComment(supportTicketCommentId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.supportTicketsSchema.deleteSupportTicketSchema);
    });

    test('update batch support tickets', { tag: ['@pro'] }, async () => {
        const allSupportTicketIds = (await apiUtils.getAllSupportTickets()).map((a: { ID: unknown }) => a.ID);
        // console.log(allSupportTicketIds);

        const [response, responseBody] = await apiUtils.put(endPoints.updateBatchSupportTickets, { data: { close: allSupportTicketIds } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.supportTicketsSchema.batchUpdateSupportTicketSchema);

        // reopen all support tickets
        // for (const supportTicketId of allSupportTicketIds) {
        //     await apiUtils.updateSupportTicketStatus(supportTicketId, 'open');
        // }
    });
});
