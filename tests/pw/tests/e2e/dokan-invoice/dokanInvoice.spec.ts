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

});
