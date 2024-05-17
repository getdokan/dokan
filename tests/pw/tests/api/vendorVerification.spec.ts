//COVERAGE_TAG: GET /dokan/v1/verification-methods
//COVERAGE_TAG: GET /dokan/v1/verification-methods/(?P<id>[\d]+)
//COVERAGE_TAG: POST /dokan/v1/verification-methods
//COVERAGE_TAG: PUT /dokan/v1/verification-methods/(?P<id>[\d]+)
//COVERAGE_TAG: DELETE /dokan/v1/verification-methods/(?P<id>[\d]+)
//COVERAGE_TAG: GET /dokan/v1/verification-requests
//COVERAGE_TAG: GET /dokan/v1/verification-requests/(?P<id>[\d]+)
//COVERAGE_TAG: POST /dokan/v1/verification-requests
//COVERAGE_TAG: PUT /dokan/v1/verification-requests/(?P<id>[\d]+)
//COVERAGE_TAG: DELETE /dokan/v1/verification-requests/(?P<id>[\d]+)

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { schemas } from '@utils/schemas';
import { data } from '@utils/testData';

const { VENDOR_ID } = process.env;

test.describe('vendor verification api test', () => {
    let apiUtils: ApiUtils;
    let methodId: string;
    let requestId: string;
    let mediaId: string;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        [, methodId] = await apiUtils.createVerificationMethod(payloads.createVerificationMethod());
        [, mediaId] = await apiUtils.uploadMedia(data.image.dokan, payloads.mimeTypes.png, payloads.adminAuth);
        [, requestId] = await apiUtils.createVerificationRequest({ ...payloads.createVerificationRequest(), vendor_id: VENDOR_ID, method_id: methodId, documents: [mediaId] });
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    // verification methods

    test('get all verification methods', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllVerificationMethods);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.vendorVerificationSchema.verificationMethodsSchema);
    });

    test('get single verification method', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleVerificationMethod(methodId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.vendorVerificationSchema.verificationMethodSchema);
    });

    test('create a verification method', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createVerificationMethod, { data: payloads.createVerificationMethod() });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.vendorVerificationSchema.verificationMethodSchema);
    });

    test('update a verification method', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.updateVerificationMethod(methodId), { data: payloads.updateVerificationMethod() });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.vendorVerificationSchema.verificationMethodSchema);
    });

    test('delete a verification method', { tag: ['@pro'] }, async () => {
        const [, methodId] = await apiUtils.createVerificationMethod(payloads.createVerificationMethod());
        const [response] = await apiUtils.delete(endPoints.deleteVerificationMethod(methodId));
        expect(response.ok()).toBeTruthy();
    });

    // verification requests

    test('get all verification requests', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllVerificationRequests);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.vendorVerificationSchema.verificationRequestsSchema);
    });

    test('get single verification request', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleVerificationRequest(requestId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.vendorVerificationSchema.verificationRequestSchema);
    });

    test('create a verification request', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createVerificationRequest, { data: { ...payloads.createVerificationRequest(), vendor_id: VENDOR_ID, method_id: methodId, documents: [mediaId] } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.vendorVerificationSchema.verificationRequestSchema);
    });

    test('update a verification request', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.updateVerificationRequest(requestId), { data: { ...payloads.updateVerificationRequest(), vendor_id: VENDOR_ID, method_id: methodId, documents: [mediaId] } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.vendorVerificationSchema.verificationRequestSchema);
    });

    test('delete a verification request', { tag: ['@pro'] }, async () => {
        const [, requestId] = await apiUtils.createVerificationRequest({ ...payloads.createVerificationRequest(), vendor_id: VENDOR_ID, method_id: methodId, documents: [mediaId] });
        const [response] = await apiUtils.delete(endPoints.deleteVerificationRequest(requestId));
        expect(response.ok()).toBeTruthy();
    });
});
