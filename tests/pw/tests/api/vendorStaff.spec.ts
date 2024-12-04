//COVERAGE_TAG: GET /dokan/v1/vendor-staff
//COVERAGE_TAG: GET /dokan/v1/vendor-staff/(?P<id>[\d]+)
//COVERAGE_TAG: POST /dokan/v1/vendor-staff
//COVERAGE_TAG: PUT /dokan/v1/vendor-staff/(?P<id>[\d]+)
//COVERAGE_TAG: GET /dokan/v1/vendor-staff/capabilities
//COVERAGE_TAG: GET /dokan/v1/vendor-staff/(?P<id>[\d]+)/capabilities
//COVERAGE_TAG: PUT /dokan/v1/vendor-staff/(?P<id>[\d]+)/capabilities
//COVERAGE_TAG: DELETE /dokan/v1/vendor-staff/(?P<id>[\d]+)

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { schemas } from '@utils/schemas';

test.describe('vendor staff api test', () => {
    test.use({ extraHTTPHeaders: payloads.vendorAuth });

    let apiUtils: ApiUtils;
    let staffId: string;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        [, staffId] = await apiUtils.createVendorStaff(payloads.createStaff(), payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get all vendor staffs', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllVendorStaffs);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.vendorStaffSchema.vendorStaffsSchema);
    });

    test('get single vendor staff', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleVendorStaff(staffId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.vendorStaffSchema.vendorStaffSchema);
    });

    test('create a vendor staff', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createVendorStaff, { data: payloads.createStaff() });
        expect(response.status()).toBe(201);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.vendorStaffSchema.vendorStaffSchema);
    });

    test('update a vendor staff', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.updateVendorStaff(staffId), { data: payloads.updateStaff() });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.vendorStaffSchema.vendorStaffSchema);
    });

    test('get all vendor staff capabilities', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllVendorStaffCapabilities);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.vendorStaffSchema.staffCapabilitiesSchema);
    });

    test('get vendor staff capabilities', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getVendorStaffCapabilities(staffId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.vendorStaffSchema.staffCapabilities);
    });

    test('update vendor staff capabilities', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.updateVendorStaffCapabilities(staffId), { data: payloads.updateCapabilities });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.vendorStaffSchema.staffCapabilities);
    });

    test('delete a vendor staff', { tag: ['@pro'] }, async () => {
        const [response] = await apiUtils.delete(endPoints.deleteVendorStaff(staffId), { params: payloads.paramsForceDelete });
        expect(response.ok()).toBeTruthy();
    });
});
