//COVERAGE_TAG: GET /dokan/v1/vendor-staff
//COVERAGE_TAG: GET /dokan/v1/vendor-staff/(?P<id>[\d]+)/capabilities
//COVERAGE_TAG: PUT /dokan/v1/vendor-staff/(?P<id>[\d]+)/capabilities
//COVERAGE_TAG: PUT /dokan/v1/vendor-staff/(?P<id>[\d]+)
//COVERAGE_TAG: DELETE /dokan/v1/vendor-staff/(?P<id>[\d]+)

import { test, expect } from '../_shared/fixtures';
import { authOf, createStaff, seedOrder, setStaffCaps, staffCaps } from '../_shared/seed';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

// Risk: P0 Vendor staff, the REST enforcement behind the React screens. Ids (#Vn) refer to
// tests/pw/baseline/failure-modes/vendor-staff.md. Menu visibility is not protection; these assert the server.

const ORDER_CAPS = { dokan_view_order: false, dokan_manage_order: false, dokan_view_order_menu: false };

test.describe('Vendor staff REST', () => {
    test('#V1 staff without order permissions cannot list, read or change the vendor\'s orders', { tag: ['@pro', '@staff', '@p0'] }, async ({ api }) => {
        const [staff, orderId] = await Promise.all([createStaff(api), seedOrder(api)]);
        await setStaffCaps(api, staff.id, ORDER_CAPS);

        expect((await api.get(endPoints.getAllOrders, { headers: staff.auth }, false))[0].status()).toBe(403);
        expect((await api.get(endPoints.getSingleOrder(orderId), { headers: staff.auth }, false))[0].status()).toBe(403);
        expect((await api.put(endPoints.updateOrder(orderId), { headers: staff.auth, data: { status: 'on-hold' } }, false))[0].status()).toBe(403);
        expect((await api.getSingleOrder(orderId, authOf('vendor1')))[1].status).toBe('processing');
    });

    test('#V2 staff with default permissions lists its vendor\'s orders, not another vendor\'s', { tag: ['@pro', '@staff', '@p0'] }, async ({ api }) => {
        const [staff, own, other] = await Promise.all([createStaff(api), seedOrder(api), seedOrder(api, { vendor: 'vendor2' })]);
        const listed = async (search: string) => ((await api.get(endPoints.getAllOrders, { headers: staff.auth, params: { search } }))[1] as { id: number }[]).map(o => String(o.id));
        expect(await listed(own)).toContain(own);
        expect(await listed(other)).not.toContain(other);
        expect((await api.get(endPoints.getSingleOrder(other), { headers: staff.auth }, false))[0].status()).toBeGreaterThanOrEqual(400);
    });

    for (const version of ['v1', 'v2']) {
        test(`#V8 staff with default permissions opens one of its vendor's orders by id (${version})`, { tag: ['@pro', '@staff', '@p0'] }, async ({ api }) => {
            // Known bug (FINDINGS.md #6): get_single_order_permissions_check compares the order's vendor with
            // get_current_user_id() (the staff id) instead of dokan_get_current_user_id(). Remove test.fail once fixed.
            test.fail();
            const [staff, own] = await Promise.all([createStaff(api), seedOrder(api)]);
            const url = endPoints.getSingleOrder(own).replace('/dokan/v1/', `/dokan/${version}/`);
            expect((await api.get(url, { headers: staff.auth }, false))[0].status()).toBe(200);
        });
    }

    test('#V3 staff is refused withdraw and staff management by default', { tag: ['@pro', '@staff', '@p0'] }, async ({ api }) => {
        const staff = await createStaff(api);
        expect((await api.get(endPoints.getAllWithdraws, { headers: staff.auth }, false))[0].status()).toBe(403);
        expect((await api.get(endPoints.getAllVendorStaffs, { headers: staff.auth }, false))[0].status()).toBe(403);
    });

    test('#V4 staff cannot grant itself a permission', { tag: ['@pro', '@staff', '@p0'] }, async ({ api }) => {
        const staff = await createStaff(api);
        const data = { capabilities: [{ capability: 'dokan_view_withdraw_menu', access: true }] };
        expect((await api.put(endPoints.updateVendorStaffCapabilities(staff.id), { headers: staff.auth, data }, false))[0].status()).toBe(403);
        expect((await staffCaps(api, staff.id)).dokan_view_withdraw_menu, 'ungranted capabilities are absent').not.toBe(true);
    });

    test('#V5 another vendor cannot read, change or delete the vendor\'s staff', { tag: ['@pro', '@vendor', '@p0'] }, async ({ api }) => {
        const staff = await createStaff(api);
        const other = authOf('vendor2');
        const data = { capabilities: [{ capability: 'dokan_view_withdraw_menu', access: true }] };
        expect((await api.get(endPoints.getVendorStaffCapabilities(staff.id), { headers: other }, false))[0].status()).toBe(403);
        expect((await api.put(endPoints.updateVendorStaffCapabilities(staff.id), { headers: other, data }, false))[0].status()).toBe(403);
        expect((await api.put(endPoints.updateVendorStaff(staff.id), { headers: other, data: { last_name: 'hijacked' } }, false))[0].status()).toBeGreaterThanOrEqual(400);
        expect((await api.delete(endPoints.deleteVendorStaff(staff.id), { headers: other, data: { force: true } }, false))[0].status()).toBeGreaterThanOrEqual(400);

        const [, after] = await api.get(endPoints.getSingleVendorStaff(staff.id), { headers: authOf('vendor1') });
        expect(after.last_name).not.toBe('hijacked');
        expect((await staffCaps(api, staff.id)).dokan_view_withdraw_menu, 'ungranted capabilities are absent').not.toBe(true);
    });

    test('#V6 customers and guests are refused', { tag: ['@pro', '@customer', '@guest', '@p0'] }, async ({ api }) => {
        expect((await api.get(endPoints.getAllVendorStaffs, { headers: payloads.customerAuth }, false))[0].status()).toBe(403);
        // Plain fetch: the project's API context sends admin auth by default.
        expect([401, 403]).toContain((await fetch(endPoints.getAllVendorStaffs)).status);
    });

    test('#V7 a permission the vendor grants opens that REST area to the staff member', { tag: ['@pro', '@staff', '@p1'] }, async ({ api }) => {
        const staff = await createStaff(api);
        expect((await api.get(endPoints.getAllWithdraws, { headers: staff.auth }, false))[0].status()).toBe(403);
        await setStaffCaps(api, staff.id, { dokan_view_withdraw_menu: true, dokan_manage_withdraw: true });
        expect((await api.get(endPoints.getAllWithdraws, { headers: staff.auth }, false))[0].status()).toBe(200);
    });
});
