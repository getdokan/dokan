// tests/e2e/rank-math/rankMath.spec.ts
//
// Coverage for the Dokan Pro "Rank Math SEO" module.
//   COVERAGE_TAG: POST /dokan/v2/rank-math/(?P<id>[\d]+)/store-current-editable-post
//   COVERAGE_TAG: GET  /dokan/v2/rank-math/(?P<id>[\d]+)/editor-data
//
// All tests are @pro (the module ships in dokan-pro). The vendor UI assertions
// are resilient to the Rank Math SEO plugin being absent (see rankMathPage.ts).

import { test, expect, Page } from '@utils/test';
import { RankMathPage, api } from './rankMathPage';
import { payloads } from '@utils/payloads';
import path from 'path';

const { VENDOR2, USER_PASSWORD } = process.env;

const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

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

        test('vendor can view Rank Math SEO options on product edit page', { tag: ['@pro', '@vendor'] }, async () => {
            await vendor.gotoVendorProductEditor(productId);
            await vendor.assertSeoSectionPresent();
        });

        test('vendor can store the current editable post id', { tag: ['@pro', '@vendor'] }, async () => {
            const [response, body] = await api.storeCurrentEditablePost(productId, payloads.vendorAuth);
            expect(response.ok()).toBeTruthy();
            expect(body).toBe(true);
        });

        test('vendor can read the rank math editor data for own product', { tag: ['@pro', '@vendor'] }, async () => {
            const [response] = await api.getEditorData(productId, payloads.vendorAuth);
            // 200 when Rank Math is present; never a server/permission error for the owner.
            expect(response.status()).toBeLessThan(500);
            expect([401, 403]).not.toContain(response.status());
        });
    });

    // ── Edge cases ────────────────────────────────────────────────
    test.describe('edge cases', () => {
        test('store-current-editable-post rejects a non-existent product', { tag: ['@pro', '@vendor'] }, async () => {
            const [response] = await api.storeCurrentEditablePost('999999999', payloads.vendorAuth);
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
            expect([401, 403]).toContain(response.status());
        });

        test('a vendor cannot store the editable post id for another vendor product', { tag: ['@pro', '@vendor'] }, async () => {
            // productId belongs to vendor1; authenticate as vendor2 (foreign owner).
            const vendor2Auth = {
                Authorization: 'Basic ' + Buffer.from(`${VENDOR2}:${USER_PASSWORD}`).toString('base64'),
            };
            const [response] = await api.storeCurrentEditablePost(productId, vendor2Auth);
            expect(response.ok()).toBeFalsy();
            expect([401, 403]).toContain(response.status());
        });
    });
});
