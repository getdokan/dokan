// tests/e2e/rank-math/rankMath.spec.ts
//
// Coverage for the Dokan Pro "Rank Math SEO" product-editor module.
//   COVERAGE_TAG: POST /dokan/v2/rank-math/(?P<id>[\d]+)/store-current-editable-post
//   COVERAGE_TAG: GET  /dokan/v2/rank-math/(?P<id>[\d]+)/editor-data
//
// All tests are @pro (the module ships in dokan-pro). The module only registers
// its REST routes for users who can `dokan_edit_product`; everyone else gets a
// 404 (route never registered) rather than a 401/403. Among product-editors,
// per-request access is gated by `current_user_can('edit_post', $id)`:
//   • owner vendor / admin            → 200
//   • foreign / non-product / missing → 403 (permission runs before validation)
//   • customer / guest                → 404 (module + routes not booted)

import { test, expect, Page } from '@utils/test';
import { RankMathPage, api } from './rankMathPage';
import { payloads } from '@utils/payloads';
import path from 'path';

const { VENDOR2, USER_PASSWORD } = process.env;

const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

// vendor2 owns no part of vendor1's product — used for the cross-vendor checks.
const vendor2Auth = {
    Authorization: 'Basic ' + Buffer.from(`${VENDOR2}:${USER_PASSWORD}`).toString('base64'),
};

const NON_EXISTENT_PRODUCT = '999999999';

test.describe('Rank Math SEO module functionality', () => {
    let vendor: RankMathPage;
    let vPage: Page;
    let productId: string;

    test.beforeAll(async ({ browser }) => {
        await api.init();
        // Module must be active for the vendor-facing surface to render.
        await api.activateRankMath();
        // Seed a published product owned by vendor1 to open in the editor.
        productId = await api.createVendorProduct(payloads.vendorAuth);

        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new RankMathPage(vPage);
    });

    test.afterAll(async () => {
        await api.deleteProduct(productId);
        await vPage?.close();
        await api.dispose();
    });

    // ── Happy paths ───────────────────────────────────────────────
    test.describe('happy paths', () => {
        test('admin can enable Rank Math SEO module', { tag: ['@pro', '@admin'] }, async () => {
            await api.activateRankMath();
            expect(await api.isRankMathActive()).toBe(true);
        });

        test('vendor product editor renders without fatal error', { tag: ['@pro', '@vendor'] }, async () => {
            await vendor.gotoVendorProductEditor(productId);
            await vendor.assertNoFatal();
            await vendor.assertRendersContent();
        });

        test('vendor sees the Rank Math SEO card on the product editor', { tag: ['@pro', '@vendor'] }, async () => {
            await vendor.gotoVendorProductEditor(productId);
            await vendor.assertSeoCardPresent();
        });

        // Regression guard: the SEO panel must actually mount Rank Math's metabox
        // (not just the empty card header). This is what breaks when Dokan's
        // hardcoded CMB2 bootstrap class no longer matches the bundled CMB2.
        //TODO - Needs Fix
        test('vendor sees the Rank Math SEO fields rendered in the panel', { tag: ['@pro', '@vendor'] }, async () => {
            await vendor.gotoVendorProductEditor(productId);
            await vendor.assertSeoPanelRendersFields();
        });

        test('vendor can store the current editable post id', { tag: ['@pro', '@vendor'] }, async () => {
            const [response, body] = await api.storeCurrentEditablePost(productId, payloads.vendorAuth);
            expect(response.ok()).toBeTruthy();
            expect(body).toBe(true);
        });

        test('admin can store the current editable post id', { tag: ['@pro', '@admin'] }, async () => {
            const [response, body] = await api.storeCurrentEditablePost(productId, payloads.adminAuth);
            expect(response.ok()).toBeTruthy();
            expect(body).toBe(true);
        });

        test('vendor can read the rank math editor data for own product', { tag: ['@pro', '@vendor'] }, async () => {
            const [response, body] = await api.getEditorData(productId, payloads.vendorAuth);
            expect(response.ok()).toBeTruthy();
            // The payload Rank Math's metabox re-seeds from on an SPA product switch.
            expect(body).toHaveProperty('objectID');
            expect(body).toHaveProperty('objectType');
            expect(body).toHaveProperty('schemas');
        });

        test('admin can read the rank math editor data', { tag: ['@pro', '@admin'] }, async () => {
            const [response, body] = await api.getEditorData(productId, payloads.adminAuth);
            expect(response.ok()).toBeTruthy();
            expect(body).toHaveProperty('objectID');
            expect(body).toHaveProperty('schemas');
        });
    });

    // ── Edge cases ────────────────────────────────────────────────
    test.describe('edge cases', () => {
        test('store-current-editable-post rejects a non-existent product', { tag: ['@pro', '@vendor'] }, async () => {
            const [response] = await api.storeCurrentEditablePost(NON_EXISTENT_PRODUCT, payloads.vendorAuth);
            expect(response.ok()).toBeFalsy();
        });

        test('editor-data rejects a non-existent product', { tag: ['@pro', '@vendor'] }, async () => {
            const [response] = await api.getEditorData(NON_EXISTENT_PRODUCT, payloads.vendorAuth);
            expect(response.ok()).toBeFalsy();
        });

        test('Rank Math SEO section is absent when the module is disabled', { tag: ['@pro', '@vendor'] }, async () => {
            await api.deactivateRankMath();
            try {
                await vendor.gotoVendorProductEditor(productId);
                await vendor.assertNoFatal();
                await vendor.assertSeoSectionAbsent();
            } finally {
                // Restore module state for the remaining tests / suite hygiene.
                await api.activateRankMath();
            }
        });
    });

    // ── Negative cases ────────────────────────────────────────────
    test.describe('negative cases', () => {
        test('guest cannot store the current editable post id', { tag: ['@pro', '@guest'] }, async () => {
            const [response] = await api.storeCurrentEditablePost(productId);
            expect(response.ok()).toBeFalsy();
            // 404: the module never registers its routes for non product-editors.
            expect([401, 403, 404]).toContain(response.status());
        });

        test('guest cannot read the rank math editor data', { tag: ['@pro', '@guest'] }, async () => {
            const [response] = await api.getEditorData(productId);
            expect(response.ok()).toBeFalsy();
            expect([401, 403, 404]).toContain(response.status());
        });

        test('customer cannot store the current editable post id', { tag: ['@pro', '@customer'] }, async () => {
            const [response] = await api.storeCurrentEditablePost(productId, payloads.customerAuth);
            expect(response.ok()).toBeFalsy();
            expect([401, 403, 404]).toContain(response.status());
        });

        test('a vendor cannot store the editable post id for another vendor product', { tag: ['@pro', '@vendor'] }, async () => {
            // productId belongs to vendor1; authenticate as vendor2 (foreign owner).
            const [response] = await api.storeCurrentEditablePost(productId, vendor2Auth);
            expect(response.ok()).toBeFalsy();
            expect([401, 403]).toContain(response.status());
        });

        test('a vendor cannot read editor data for another vendor product', { tag: ['@pro', '@vendor'] }, async () => {
            const [response] = await api.getEditorData(productId, vendor2Auth);
            expect(response.ok()).toBeFalsy();
            expect([401, 403]).toContain(response.status());
        });
    });
});
