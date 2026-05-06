import { test, expect } from '@playwright/test';
import { DokanInvoicePage } from './dokanInvoicePage';

// dokan-invoice depends on Dokan Pro for sub-orders + premium WC PDF
// integration; the suite is gated `@pro`. Per-test tags add the role
// context (`@admin`, `@vendor`, `@customer`, `@guest`).

test.describe('Dokan Invoice Tests @pro', () => {
    // ============================================
    // HAPPY PATH — order lifecycle
    //
    // Walks one order through processing → completed and asserts at each
    // step that BOTH admin and vendor can:
    //   1. See actions.invoice.url + actions.packing-slip.url in the Dokan
    //      order REST response, with the URL pointing at the right order.
    //   2. Hit those URLs and receive an actual PDF (magic bytes %PDF-).
    // ============================================

    test.describe('Happy path — invoice & packing slip across order statuses', () => {
        test('HP1 - admin REST exposes invoice + slip URLs while order is processing', { tag: ['@pro', '@admin', '@invoice'] }, async ({ page }) => {
            const inv = new DokanInvoicePage(page);
            const orderId = await inv.createVendor1OrderWithStatus('processing');

            const { response, body } = await inv.getDokanOrder(orderId, inv.testData.admin.authHeader);
            expect(response.ok()).toBeTruthy();
            const { invoice, packingSlip } = inv.extractInvoiceUrls(body, orderId);
            expect(invoice).toBeTruthy();
            expect(packingSlip, 'packing-slip URL should be present when document is enabled').toBeTruthy();

            await inv.dispose();
        });

        test('HP2 - admin can fetch a real PDF for a processing order', { tag: ['@pro', '@admin', '@invoice'] }, async ({ page }) => {
            const inv = new DokanInvoicePage(page);
            const orderId = await inv.createVendor1OrderWithStatus('processing');
            const { body } = await inv.getDokanOrder(orderId, inv.testData.admin.authHeader);
            const { invoice, packingSlip } = inv.extractInvoiceUrls(body, orderId);

            const invoiceRes = await inv.fetchPdfUrlAs(invoice, inv.testData.admin.authHeader);
            await inv.assertIsPdfResponse(invoiceRes, `processing/admin invoice (order ${orderId})`);

            if (packingSlip) {
                const slipRes = await inv.fetchPdfUrlAs(packingSlip, inv.testData.admin.authHeader);
                await inv.assertIsPdfResponse(slipRes, `processing/admin packing-slip (order ${orderId})`);
            }

            await inv.dispose();
        });

        test('HP3 - vendor REST also exposes invoice URL while order is processing', { tag: ['@pro', '@vendor', '@invoice'] }, async ({ page }) => {
            const inv = new DokanInvoicePage(page);
            const orderId = await inv.createVendor1OrderWithStatus('processing');
            const { response, body } = await inv.getDokanOrder(orderId, inv.testData.vendor1.authHeader);
            expect(response.ok(), 'vendor1 must see their own order').toBeTruthy();
            inv.extractInvoiceUrls(body, orderId);
            await inv.dispose();
        });

        test('HP4 - admin REST still exposes invoice URL after order is marked completed', { tag: ['@pro', '@admin', '@invoice'] }, async ({ page }) => {
            const inv = new DokanInvoicePage(page);
            const orderId = await inv.createVendor1OrderWithStatus('processing');
            await inv.updateOrderStatus(orderId, 'completed');

            const { response, body } = await inv.getDokanOrder(orderId, inv.testData.admin.authHeader);
            expect(response.ok()).toBeTruthy();
            expect(body.status).toBe('completed');
            inv.extractInvoiceUrls(body, orderId);
            await inv.dispose();
        });

        test('HP5 - admin can fetch a real PDF for a completed order', { tag: ['@pro', '@admin', '@invoice'] }, async ({ page }) => {
            const inv = new DokanInvoicePage(page);
            const orderId = await inv.createVendor1OrderWithStatus('processing');
            await inv.updateOrderStatus(orderId, 'completed');

            const { body } = await inv.getDokanOrder(orderId, inv.testData.admin.authHeader);
            const { invoice } = inv.extractInvoiceUrls(body, orderId);
            const res = await inv.fetchPdfUrlAs(invoice, inv.testData.admin.authHeader);
            await inv.assertIsPdfResponse(res, `completed/admin invoice (order ${orderId})`);
            await inv.dispose();
        });

        test('HP6 - vendor REST still exposes invoice URL after order completion', { tag: ['@pro', '@vendor', '@invoice'] }, async ({ page }) => {
            const inv = new DokanInvoicePage(page);
            const orderId = await inv.createVendor1OrderWithStatus('processing');
            await inv.updateOrderStatus(orderId, 'completed');
            const { response, body } = await inv.getDokanOrder(orderId, inv.testData.vendor1.authHeader);
            expect(response.ok()).toBeTruthy();
            inv.extractInvoiceUrls(body, orderId);
            await inv.dispose();
        });
    });

    // ============================================
    // EDGE — order lifecycle
    // ============================================

    test.describe('Edge — order statuses & lifecycle', () => {
        test('EC-status-pending - URL shape is well-formed for pending-payment orders', { tag: ['@pro', '@admin', '@invoice'] }, async ({ page }) => {
            const inv = new DokanInvoicePage(page);
            const orderId = await inv.createVendor1OrderWithStatus('pending');
            const { body } = await inv.getDokanOrder(orderId, inv.testData.admin.authHeader);
            // dokan-invoice doesn't filter by status; WC PDF gates per its own
            // settings. Assert the URL shape is well-formed when present.
            const url: string = body?.actions?.invoice?.url ?? '';
            if (url) {
                expect(url).toMatch(/document_type=invoice/);
                expect(url).toMatch(new RegExp(`order_ids=${orderId}\\b`));
            }
            await inv.dispose();
        });

        test('EC-status-cancelled - URL emission for cancelled orders matches WC PDF settings', { tag: ['@pro', '@admin', '@invoice'] }, async ({ page }) => {
            const inv = new DokanInvoicePage(page);
            const orderId = await inv.createVendor1OrderWithStatus('processing');
            await inv.updateOrderStatus(orderId, 'cancelled');
            const { response, body } = await inv.getDokanOrder(orderId, inv.testData.admin.authHeader);
            expect(response.ok()).toBeTruthy();
            // Don't assert presence — WC PDF "Disable for trash/cancelled" may
            // strip the URL. We just assert that whatever IS emitted is well-formed.
            const url: string = body?.actions?.invoice?.url ?? '';
            if (url) expect(url).toMatch(new RegExp(`order_ids=${orderId}\\b`));
            await inv.dispose();
        });

        test('EC-status-transition - URL stays valid across pending → processing → completed', { tag: ['@pro', '@admin', '@invoice'] }, async ({ page }) => {
            const inv = new DokanInvoicePage(page);
            const orderId = await inv.createVendor1OrderWithStatus('pending');

            for (const status of ['processing', 'completed'] as const) {
                await inv.updateOrderStatus(orderId, status);
                const { body } = await inv.getDokanOrder(orderId, inv.testData.admin.authHeader);
                const { invoice } = inv.extractInvoiceUrls(body, orderId);
                const res = await inv.fetchPdfUrlAs(invoice, inv.testData.admin.authHeader);
                await inv.assertIsPdfResponse(res, `status=${status} invoice (order ${orderId})`);
            }
            await inv.dispose();
        });

        test('EC-refresh - re-fetching the same order returns the same URL', { tag: ['@pro', '@admin', '@invoice'] }, async ({ page }) => {
            const inv = new DokanInvoicePage(page);
            const orderId = await inv.createVendor1OrderWithStatus('processing');
            const a = await inv.getDokanOrder(orderId, inv.testData.admin.authHeader);
            const b = await inv.getDokanOrder(orderId, inv.testData.admin.authHeader);
            expect(a.body?.actions?.invoice?.url).toBe(b.body?.actions?.invoice?.url);
            await inv.dispose();
        });
    });

    // ============================================
    // EDGE — REST shape / encoding
    // ============================================

    test.describe('Edge — REST shape', () => {
        test('EC-shape-url - actions.invoice.url is XSS-safe (esc_url_raw + decoded entities)', { tag: ['@pro', '@admin', '@invoice'] }, async ({ page }) => {
            const inv = new DokanInvoicePage(page);
            const orderId = await inv.createVendor1OrderWithStatus('processing');
            const { body } = await inv.getDokanOrder(orderId, inv.testData.admin.authHeader);
            const url: string = body?.actions?.invoice?.url ?? '';
            expect(url).not.toMatch(/<script/i);
            expect(url).not.toMatch(/javascript:/i);
            expect(url).not.toMatch(/&amp;/);
            await inv.dispose();
        });

        test('EC-shape-version - /dokan/v1/orders includes the URL', { tag: ['@pro', '@admin', '@invoice'] }, async ({ page }) => {
            // Dokan v2 orders endpoint currently returns a fatal in this env
            // (separate bug, not related to dokan-invoice). We pin the URL
            // assertion to v1; once v2 lands cleanly, expand the loop.
            const inv = new DokanInvoicePage(page);
            const orderId = await inv.createVendor1OrderWithStatus('processing');
            const { body } = await inv.getDokanOrder(orderId, inv.testData.admin.authHeader, 'v1');
            expect(body?.actions?.invoice?.url, 'v1 should expose actions.invoice.url').toBeTruthy();
            await inv.dispose();
        });
    });

    // ============================================
    // EDGE — permissions / security
    // ============================================

    test.describe('Edge — permissions', () => {
        test('EC-perm-cross-vendor-rest - vendor2 cannot read vendor1\'s order via REST', { tag: ['@pro', '@vendor', '@invoice'] }, async ({ page }) => {
            const inv = new DokanInvoicePage(page);
            const orderId = await inv.createVendor1OrderWithStatus('processing');
            const { response } = await inv.getDokanOrder(orderId, inv.testData.vendor2.authHeader);
            // Dokan order REST returns 401/403/404 for orders not belonging to the requester.
            expect([401, 403, 404]).toContain(response.status());
            await inv.dispose();
        });

        test('EC-perm-guest - guest cannot fetch invoice URL as a real PDF', { tag: ['@pro', '@guest', '@invoice'] }, async ({ page }) => {
            const inv = new DokanInvoicePage(page);
            const orderId = await inv.createVendor1OrderWithStatus('processing');
            const { body } = await inv.getDokanOrder(orderId, inv.testData.admin.authHeader);
            const url: string = body?.actions?.invoice?.url ?? '';
            const res = await inv.fetchPdfUrlAsGuest(url);
            // We don't pin the exact status (WC PDF may 200 + login HTML, 302
            // redirect to wp-login, or 401). What MUST be true is that the
            // response is not the actual PDF.
            const ct = (res.headers()['content-type'] ?? '').toLowerCase();
            const buf = await res.body();
            const looksLikePdf = ct.includes('pdf') || buf.subarray(0, 5).toString('binary') === '%PDF-';
            expect(looksLikePdf, `guest must not receive a real PDF (status=${res.status()} ct=${ct})`).toBeFalsy();
            await inv.dispose();
        });
    });

    // ============================================
    // ACTIVATION REGRESSION
    // ============================================

    test('TC-A6 - dokan-invoice survives admin page render (fresh-install regression for the wpo_wcpdf_version seed)', { tag: ['@pro', '@admin', '@invoice'] }, async ({ page }) => {
        // dokan-invoice <=1.2.8 self-deactivates via dependency_notice() on
        // the first admin page load if `wpo_wcpdf_version` is missing —
        // _site.setup.ts seeds the option so the new-class branch wins.
        const inv = new DokanInvoicePage(page);
        const orderId = await inv.createVendor1OrderWithStatus('processing');
        await inv.loginAsAdmin();
        await inv.navigateTo(inv.admin.pluginsUrl);
        await inv.waitForPageReady();
        const { body } = await inv.getDokanOrder(orderId, inv.testData.admin.authHeader);
        expect(body?.actions?.invoice?.url, 'plugin must still be active after wp-admin page render').toBeTruthy();
        await inv.dispose();
    });

    // ============================================
    // SKIPPED — new vendor dashboard (TC-D*)
    //
    // dokan-invoice 1.2.8 registers `dokan_orders_data_view_dataviews_actions`
    // (assets/js/dokan-orders.js), but dokan-lite's OrderList.tsx doesn't
    // call applyFilters() for it yet, so the action menu items never render.
    // ============================================

    test.describe('New vendor dashboard (skipped — filter not wired in dokan-lite)', () => {
        test.skip('TC-D1 - vendor sees "View Invoice" action in DataView row menu', { tag: ['@pro', '@vendor', '@invoice', '@new-ui'] }, () => {});
        test.skip('TC-D2 - vendor sees "View Packing Slip" action when document enabled', { tag: ['@pro', '@vendor', '@invoice', '@new-ui'] }, () => {});
        test.skip('TC-D3 - clicking "View Invoice" opens the PDF in a new tab', { tag: ['@pro', '@vendor', '@invoice', '@new-ui'] }, () => {});
        test.skip('TC-D4 - action absent when WC PDF document disabled', { tag: ['@pro', '@vendor', '@invoice', '@new-ui'] }, () => {});
        test.skip('TC-D5 - bulk action runs against items[0] only (current JS limitation)', { tag: ['@pro', '@vendor', '@invoice', '@new-ui'] }, () => {});
        test.skip('TC-D6 - action labels are localised (currently hardcoded EN strings)', { tag: ['@pro', '@vendor', '@invoice', '@new-ui'] }, () => {});
        test.skip('TC-D7 - action absent in bulk toolbar (supportsBulk: false)', { tag: ['@pro', '@vendor', '@invoice', '@new-ui'] }, () => {});
    });

    // ============================================
    // SKIPPED — PDF body content rewrites (TC-F*)
    //
    // Asserting vendor name / address / shop block content in the rendered
    // PDF requires a parser. Re-enable once `pdf-parse` (or equivalent) is
    // a dev-dep and we add an `extractPdfText` helper.
    // ============================================

    test.describe('PDF body content (skipped — needs pdf-parse)', () => {
        test.skip('TC-F1 - single-vendor parent: store name appended to shop name', { tag: ['@pro', '@admin', '@invoice'] }, () => {});
        test.skip('TC-F2 - single-vendor parent: shop address replaced with vendor address', { tag: ['@pro', '@admin', '@invoice'] }, () => {});
        test.skip('TC-F3 - multi-vendor parent: lists vendors after address ("From vendors:")', { tag: ['@pro', '@admin', '@invoice'] }, () => {});
        test.skip('TC-F4 - sub-order: full vendor replacement', { tag: ['@pro', '@admin', '@invoice'] }, () => {});
        test.skip('TC-F5 - dokan_invoice_shop_name_label filter changes the "Vendor:" prefix', { tag: ['@pro', '@admin', '@invoice'] }, () => {});
        test.skip('TC-F6 - dokan_invoice_single_seller_address filter override applied', { tag: ['@pro', '@admin', '@invoice'] }, () => {});
        test.skip('TC-F7 - dokan_invoice_store_name filter override applied', { tag: ['@pro', '@admin', '@invoice'] }, () => {});
    });

    // ============================================
    // SKIPPED — Pro module compatibility (EC-Pro-*)
    //
    // Each requires the corresponding product type seeded (subscription,
    // booking, auction, etc.) and end-to-end checkout. Out of scope for
    // this initial pass.
    // ============================================

    test.describe('Pro module compatibility (skipped — need module-specific setup)', () => {
        test.skip('EC-Pro-subscription - invoice URL present per renewal', { tag: ['@pro', '@invoice'] }, () => {});
        test.skip('EC-Pro-booking - booking metadata visible in WC PDF body', { tag: ['@pro', '@invoice'] }, () => {});
        test.skip('EC-Pro-auction - auction last-bid items resolve to vendor', { tag: ['@pro', '@invoice'] }, () => {});
        test.skip('EC-Pro-product-addons - line item meta rendered (no Dokan-invoice impact)', { tag: ['@pro', '@invoice'] }, () => {});
        test.skip('EC-Pro-eu-compliance - dokan_invoice_store_name still wins over EU shop info', { tag: ['@pro', '@invoice'] }, () => {});
    });

    // ============================================
    // SKIPPED — destructive / out-of-scope (EC-Misc-*)
    // ============================================

    test.describe('Destructive / out-of-scope (skipped)', () => {
        test.skip('EC-Misc-no-wc-pdf - response unchanged when wc-pdf is deactivated (destructive)', { tag: ['@pro', '@admin', '@invoice'] }, () => {});
        test.skip('EC-Misc-no-dokan-pro - sub-order URLs vanish when dokan-pro is deactivated (destructive)', { tag: ['@pro', '@admin', '@invoice'] }, () => {});
        test.skip('EC-Misc-hpos-toggle - HPOS enabled vs legacy parity (env toggle)', { tag: ['@pro', '@invoice'] }, () => {});
        test.skip('EC-Misc-deleted-vendor - PDF still generates when vendor user is deleted (cleanup)', { tag: ['@pro', '@invoice'] }, () => {});
        test.skip('EC-Misc-deleted-product - wpo_wcpdf_dokan_privs returns gracefully (cleanup)', { tag: ['@pro', '@invoice'] }, () => {});
        test.skip('EC-Misc-multibyte-store - multibyte/emoji store name renders correctly (needs pdf-parse)', { tag: ['@pro', '@invoice'] }, () => {});
        test.skip('EC-Misc-html-store - HTML in store name is sanitised in PDF (needs pdf-parse + setup)', { tag: ['@pro', '@invoice'] }, () => {});
        test.skip('EC-Misc-multi-currency - PDF currency matches order currency, not site default (needs setup)', { tag: ['@pro', '@invoice'] }, () => {});
        test.skip('EC-Misc-i18n - dokan-invoice strings translatable via WPML/Polylang (needs language pack setup)', { tag: ['@pro', '@invoice'] }, () => {});
    });
});
