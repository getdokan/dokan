//COVERAGE_TAG: GET /dokan/v1/vendor/product-addons
//COVERAGE_TAG: GET /dokan/v1/vendor/product-addons/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v1/vendor/product-addons/(?P<id>[\d]+)
//COVERAGE_TAG: DELETE /dokan/v1/vendor/product-addons/(?P<id>[\d]+)
//COVERAGE_TAG: POST /dokan/v1/vendor/product-addons/serialize
//COVERAGE_TAG: POST /dokan/v1/vendor/product-addons/unserialize

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { SERVER_URL } from '@utils/helpers';

// Dokan vendor-scoped product add-on controller
// (dokan-pro/modules/product-addon/includes/Rest/VendorProductAddonController.php).
// Global add-ons are the `global_product_addon` post type; they're created via the
// WC Product Add-ons endpoint (admin) and re-assigned to the vendor by post_author,
// which is what `dokan_pa_get_global_addons_for_vendor_staff_vendor` lists by.
const base = `${SERVER_URL}/dokan/v1/vendor/product-addons`;

const { VENDOR_ID, VENDOR2_ID } = process.env;

test.describe('Vendor Product Add-ons REST API', () => {
    let apiUtils: ApiUtils;
    let addonId: string;

    // Seed a vendor-owned global add-on; returns its id.
    async function seedForVendor(ownerId = VENDOR_ID!): Promise<string> {
        const [, id] = await apiUtils.createProductAddon(payloads.createGlobalProductAddons(), payloads.adminAuth);
        await dbUtils.updateCell(id, ownerId);
        return id;
    }

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        addonId = await seedForVendor();
    });

    test.afterAll(async () => {
        await apiUtils.deleteAllProductAddons(payloads.adminAuth);
        await apiUtils.dispose();
    });

    // ---- Happy Paths ---------------------------------------------------------
    test.describe('happy paths', () => {
        test('vendor can list their global product add-ons', { tag: ['@pro', '@vendor'] }, async () => {
            const [response, body] = await apiUtils.get(base, { headers: payloads.vendorAuth });
            expect(response.ok()).toBeTruthy();
            expect(Array.isArray(body)).toBeTruthy();
            const found = (body as any[]).find((a) => String(a.id) === addonId);
            expect(found, 'seeded add-on should be in the vendor list').toBeTruthy();
            expect(found).toHaveProperty('priority');
            expect(found).toHaveProperty('field_count');
        });

        test('vendor can fetch a single add-on by id', { tag: ['@pro', '@vendor'] }, async () => {
            const [response, body] = await apiUtils.get(`${base}/${addonId}`, { headers: payloads.vendorAuth });
            expect(response.ok()).toBeTruthy();
            expect(String(body.id)).toBe(addonId);
            expect(Array.isArray(body.fields)).toBeTruthy();
        });

        test('vendor can update an add-on (name, priority, fields)', { tag: ['@pro', '@vendor'] }, async () => {
            const name = `Updated ${Date.now()}`;
            const [response, body] = await apiUtils.put(`${base}/${addonId}`, {
                headers: payloads.vendorAuth,
                data: { name, priority: 42, restrict_to_categories: [], fields: payloads.createGlobalProductAddons().fields },
            });
            expect(response.ok()).toBeTruthy();
            expect(body.name).toBe(name);

            const [, after] = await apiUtils.get(`${base}/${addonId}`, { headers: payloads.vendorAuth });
            expect(after.name).toBe(name);
            expect(Number(after.priority)).toBe(42);
        });

        test('vendor can delete an add-on', { tag: ['@pro', '@vendor'] }, async () => {
            const id = await seedForVendor();
            const [delResponse] = await apiUtils.delete(`${base}/${id}`, { headers: payloads.vendorAuth });
            expect(delResponse.ok()).toBeTruthy();

            const [getResponse] = await apiUtils.get(`${base}/${id}`, { headers: payloads.vendorAuth });
            expect(getResponse.status()).toBe(404);
        });

        test('vendor can serialize then unserialize add-ons (export/import round-trip)', { tag: ['@pro', '@vendor'] }, async () => {
            const addons = payloads.createGlobalProductAddons().fields;

            const [serResponse, serBody] = await apiUtils.post(`${base}/serialize`, {
                headers: payloads.vendorAuth,
                data: { addons },
            });
            expect(serResponse.ok()).toBeTruthy();
            const serialized = serBody?.data ?? serBody;
            expect(typeof serialized === 'string' || typeof serialized === 'object').toBeTruthy();

            const [unserResponse, unserBody] = await apiUtils.post(`${base}/unserialize`, {
                headers: payloads.vendorAuth,
                data: { data: typeof serialized === 'string' ? serialized : JSON.stringify(serialized) },
            });
            expect(unserResponse.ok()).toBeTruthy();
            const decoded = unserBody?.addons ?? unserBody;
            expect(Array.isArray(decoded)).toBeTruthy();
            expect((decoded as any[]).length).toBeGreaterThan(0);
        });
    });

    // ---- Negative Cases ------------------------------------------------------
    test.describe('negative cases', () => {
        test('unauthenticated request is rejected', { tag: ['@pro', '@vendor'] }, async () => {
            const [response] = await apiUtils.get(base, { headers: {} });
            expect([401, 403]).toContain(response.status());
        });

        test('vendor cannot read another vendor’s add-on', { tag: ['@pro', '@vendor'] }, async () => {
            const otherId = await seedForVendor(VENDOR2_ID ?? VENDOR_ID!);
            const [response] = await apiUtils.get(`${base}/${otherId}`, { headers: payloads.vendorAuth });
            expect([401, 403, 404]).toContain(response.status());
        });

        test('unserialize rejects malformed data', { tag: ['@pro', '@vendor'] }, async () => {
            const [response, body] = await apiUtils.post(`${base}/unserialize`, {
                headers: payloads.vendorAuth,
                data: { data: 'not-a-serialized-string-@@@' },
            });
            // Either a 4xx, or a 200 whose decoded addons are empty — never a fatal.
            if (response.ok()) {
                const decoded = body?.addons ?? body;
                expect(Array.isArray(decoded) ? decoded.length : 0).toBe(0);
            } else {
                expect(response.status()).toBeGreaterThanOrEqual(400);
            }
        });
    });
});
