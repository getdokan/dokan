import { test, expect, request } from '@utils/test';
import path from 'path';
import { DokanInvoicePage } from './dokanInvoicePage';
import { payloads } from '@utils/payloads';
import { SERVER_URL } from '@utils/helpers';

// ============================================
// SESSION STORAGE VARIABLES
// ============================================
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');     // Admin
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json'); // Customer 1
const c2 = path.join(__dirname, '../../../playwright/.auth/customer2StorageState.json'); // Customer 2

// ============================================
// TEST SETUP
//
// dokan-invoice covers two visible UI surfaces today:
//   1. Customer → My Account → Orders: per-row "Invoice" / "Packing slip"
//      buttons rendered via dokan_my_account_my_sub_orders_actions.
//   2. Admin → wp-admin order detail: WC PDF metabox buttons whose URLs
//      are the same generate_wpo_wcpdf endpoint.
// Tests below DRIVE THE BROWSER and assert the click → download flow
// + the rendered document content (vendor store name shows up in the
// shop block per dokan-invoice's wpo_wcpdf_shop_name filter).
// ============================================

test.describe('Dokan Invoice Tests @pro', () => {
    // ============================================
    // HAPPY PATH — customer downloads invoice / packing slip from My Account
    // ============================================

    test.describe('Happy path — customer can download from My Account → Orders', () => {
        test('HP-customer-1 - customer sees Invoice button on at least one order row', { tag: ['@pro', '@customer', '@invoice'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: c1 });
            const page = await ctx.newPage();
            const inv = new DokanInvoicePage(page);

            // Make sure customer1 has at least one order to render. The
            // orders list paginates and the seed may land on page 2+, so
            // we don't assert the row is the seeded one — only that the
            // Invoice button is rendered and works.
            await inv.seedVendor1Order('processing');
            await page.goto(inv.customer.myAccountOrdersUrl);

            const button = page.locator(inv.customer.invoiceButton).first();
            await expect(button, 'at least one Invoice button must be rendered for the customer').toBeVisible();

            await inv.dispose();
            await ctx.close();
        });

        test('HP-customer-2 - Invoice button URL returns a real PDF for the customer', { tag: ['@pro', '@customer', '@invoice'] }, async ({ browser }) => {
            // The customer URL is rendered inline (no
            // Content-Disposition: attachment with `&my-account=true`),
            // so a click won't trigger Playwright's download event. The
            // meaningful UI assertion is that the URL the customer
            // *would* navigate to actually serves a real PDF when fetched
            // from the same authenticated session.
            const ctx = await browser.newContext({ storageState: c1 });
            const page = await ctx.newPage();
            const inv = new DokanInvoicePage(page);

            await inv.seedVendor1Order('processing');
            await page.goto(inv.customer.myAccountOrdersUrl);

            const href = await page.locator(inv.customer.invoiceButton).first().getAttribute('href');
            expect(href, 'Invoice button must have an href').toBeTruthy();

            const res = await page.request.get(href!);
            const ct = (res.headers()['content-type'] ?? '').toLowerCase();
            const buf = await res.body();
            const isPdf = ct.includes('pdf') || buf.subarray(0, 5).toString('binary') === '%PDF-';
            expect(isPdf, `customer must receive a real PDF (status=${res.status()} ct=${ct})`).toBeTruthy();
            expect(buf.length).toBeGreaterThan(1000);

            await inv.dispose();
            await ctx.close();
        });

        test('HP-customer-3 - PDF body contains vendor1 store name (dokan-invoice shop_name rewrite)', { tag: ['@pro', '@customer', '@invoice'] }, async ({ browser }) => {
            // Use the WC PDF HTML preview (same content as the PDF, minus
            // the rasterisation step). Pulling the URL from the admin
            // order-edit page gives us the access_key the WC PDF endpoint
            // requires; appending output=html switches to the HTML view.
            const ctx = await browser.newContext({ storageState: a1 });
            const page = await ctx.newPage();
            const inv = new DokanInvoicePage(page);

            const orderId = await inv.seedVendor1Order('completed');
            await page.goto(inv.admin.wcOrderEditUrl(orderId));
            const pdfUrl = await page.locator(inv.admin.invoiceButton).first().getAttribute('href');
            expect(pdfUrl, 'admin order edit page should expose an invoice URL').toBeTruthy();

            const htmlUrl = `${pdfUrl}&output=html`;
            const res = await page.request.get(htmlUrl);
            expect(res.ok(), `HTML preview status=${res.status()}`).toBeTruthy();
            const html = await res.text();

            // dokan-invoice's wpo_wcpdf_shop_name filter appends
            // "Vendor: <store_name>" to the shop name block for single-
            // vendor parent orders.
            expect(html, 'invoice HTML should reference vendor1 store name').toMatch(
                new RegExp(inv.testData.vendor1StoreName, 'i'),
            );

            await inv.dispose();
            await ctx.close();
        });
    });

    // ============================================
    // HAPPY PATH — admin downloads invoice / packing slip from order detail
    // ============================================

    test.describe('Happy path — admin can download from order detail page', () => {
        test('HP-admin-1 - admin clicks "Invoice" button on order edit → PDF downloads', { tag: ['@pro', '@admin', '@invoice'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: a1 });
            const page = await ctx.newPage();
            const inv = new DokanInvoicePage(page);

            const orderId = await inv.seedVendor1Order('processing');
            await page.goto(inv.admin.wcOrderEditUrl(orderId));

            const button = page.locator(inv.admin.invoiceButton).first();
            await expect(button, 'WC PDF "Invoice" button should be visible on order edit').toBeVisible();

            const download = await inv.clickAndCaptureDownload(inv.admin.invoiceButton, `admin invoice (order ${orderId})`);
            const buf = await inv.readDownloadAsPdf(download, `admin invoice (order ${orderId})`);
            expect(buf.length).toBeGreaterThan(1000);

            await inv.dispose();
            await ctx.close();
        });

        test('HP-admin-2 - admin clicks "Packing slip" button → PDF downloads', { tag: ['@pro', '@admin', '@invoice'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: a1 });
            const page = await ctx.newPage();
            const inv = new DokanInvoicePage(page);

            const orderId = await inv.seedVendor1Order('processing');
            await page.goto(inv.admin.wcOrderEditUrl(orderId));

            const button = page.locator(inv.admin.packingSlipButton).first();
            const visible = await button.isVisible().catch(() => false);
            test.skip(!visible, 'WC PDF packing-slip document not enabled in this env');

            const download = await inv.clickAndCaptureDownload(inv.admin.packingSlipButton, `admin packing-slip (order ${orderId})`);
            await inv.readDownloadAsPdf(download, `admin packing-slip (order ${orderId})`);

            await inv.dispose();
            await ctx.close();
        });

        test('HP-admin-3 - completed order admin invoice still downloads', { tag: ['@pro', '@admin', '@invoice'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: a1 });
            const page = await ctx.newPage();
            const inv = new DokanInvoicePage(page);

            const orderId = await inv.seedVendor1Order('completed');
            await page.goto(inv.admin.wcOrderEditUrl(orderId));

            const download = await inv.clickAndCaptureDownload(inv.admin.invoiceButton, `admin invoice (completed order ${orderId})`);
            await inv.readDownloadAsPdf(download, `admin invoice (completed order ${orderId})`);

            await inv.dispose();
            await ctx.close();
        });
    });

    // ============================================
    // HAPPY PATH — vendor downloads invoice for their own order
    //
    // The new React vendor dashboard does NOT yet render "View Invoice"
    // (see TC-vendor-gap). The vendor side that DOES work today is the
    // permission grant in `wpo_wcpdf_check_privs` plus the URL injection
    // into `/dokan/v1/orders/<id>` via `dokan_rest_prepare_shop_order_object`.
    // These tests drive the vendor's browser session against those.
    // ============================================

    test.describe('Happy path — vendor side (REST + browser-session URL)', () => {
        test('HP-vendor-1 - vendor /dashboard/orders renders WITHOUT a 5xx', { tag: ['@pro', '@vendor', '@invoice'] }, async ({ browser }) => {
            // Smoke: vendor1 can reach their orders dashboard. Pins the
            // baseline so TC-vendor-gap's "filter not wired" assertion is
            // distinct from a broken page.
            const ctx = await browser.newContext({
                storageState: path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json'),
            });
            const page = await ctx.newPage();
            const inv = new DokanInvoicePage(page);

            const res = await page.goto(inv.vendor.ordersUrl, { waitUntil: 'load' });
            expect(res?.status() ?? 0, 'vendor orders dashboard should not 5xx').toBeLessThan(500);
            await ctx.close();
        });

        test('HP-vendor-2 - vendor REST exposes actions.invoice.url for their own order', { tag: ['@pro', '@vendor', '@invoice'] }, async ({ browser }) => {
            // Use a fresh API context with vendor1 Basic-Auth — same path
            // the vendor dashboard's React app uses internally. (Driving
            // it through `page.request` with a logged-in storage state
            // mixes cookies + Authorization header, which trips the auth
            // pipeline; the API path is what matters here.)
            const ctx = await browser.newContext({
                storageState: path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json'),
            });
            const page = await ctx.newPage();
            const inv = new DokanInvoicePage(page);

            const orderId = await inv.seedVendor1Order('processing');
            const apiCtx = await request.newContext();
            const res = await apiCtx.get(
                `${SERVER_URL}/dokan/v1/orders/${orderId}`,
                { headers: inv.testData.vendor1.authHeader },
            );
            expect(res.ok(), `vendor1 GET order ${orderId} → ${res.status()}`).toBeTruthy();
            const body = await res.json();
            expect(body?.actions?.invoice?.url, 'vendor must see actions.invoice.url for their own order').toBeTruthy();
            await apiCtx.dispose();

            await inv.dispose();
            await ctx.close();
        });

    });

    // ============================================
    // REGRESSION — rendered document body
    //
    // Asserts the HTML preview output of WC PDF (same content as the
    // generated PDF, sans rasterisation) contains the expected order /
    // vendor / billing data. Catches regressions in:
    //   - dokan-invoice's `wpo_wcpdf_shop_name` filter (vendor store name)
    //   - dokan-invoice's `wpo_wcpdf_shop_address` filter (vendor address)
    //   - WC PDF's own rendering pipeline (order id, customer billing)
    // ============================================

    test.describe('Regression — rendered document body', () => {
        test('Body-1 - HTML preview contains the order id', { tag: ['@pro', '@admin', '@invoice'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: a1 });
            const page = await ctx.newPage();
            const inv = new DokanInvoicePage(page);
            const orderId = await inv.seedVendor1Order('processing');
            const html = await inv.fetchHtmlPreviewFromAdminPage(page, orderId);
            expect(html).toContain(String(orderId));
            await inv.dispose();
            await ctx.close();
        });

        test('Body-2 - HTML preview shop block carries vendor1 store name AND city (proves shop_name + shop_address filters)', { tag: ['@pro', '@admin', '@invoice'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: a1 });
            const page = await ctx.newPage();
            const inv = new DokanInvoicePage(page);
            const orderId = await inv.seedVendor1Order('processing');
            const html = await inv.fetchHtmlPreviewFromAdminPage(page, orderId);
            // Vendor's seeded store name (from auth_setup) — proves
            // `wpo_wcpdf_shop_name` filter ran.
            expect(html, 'HTML must contain vendor1 store name').toMatch(
                new RegExp(inv.testData.vendor1StoreName, 'i'),
            );
            // Vendor's seeded address city — proves
            // `wpo_wcpdf_shop_address` filter ran (the default WC site
            // address would not contain "New York" with our seed).
            expect(html, 'HTML must contain vendor1 city (proves shop_address rewrite)').toContain('New York');
            await inv.dispose();
            await ctx.close();
        });

        test('Body-3 - HTML preview contains customer1 billing details', { tag: ['@pro', '@admin', '@invoice'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: a1 });
            const page = await ctx.newPage();
            const inv = new DokanInvoicePage(page);
            const orderId = await inv.seedVendor1Order('processing');
            const html = await inv.fetchHtmlPreviewFromAdminPage(page, orderId);
            // Billing block content (from payloads.createOrder) — catches
            // regressions in WC PDF's billing rendering.
            expect(html).toContain('abc street');     // address line 1
            expect(html).toContain('10003');          // postcode
            expect(html.toLowerCase()).toContain('customer1'); // first name
            await inv.dispose();
            await ctx.close();
        });
    });

    // ============================================
    // REGRESSION — REST shape
    //
    // dokan-invoice's `dokan_rest_prepare_shop_order_object` hook injects
    // `actions.invoice.url` and `actions.packing-slip.url` into Dokan's
    // order REST response. These tests pin the URL shape (right order,
    // right document type, no XSS-unsafe entities) so any regression in
    // the hook is caught.
    // ============================================

    test.describe('Regression — REST shape', () => {
        test('REST-1 - actions.invoice.url is well-formed and matches order', { tag: ['@pro', '@admin', '@invoice'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: a1 });
            const page = await ctx.newPage();
            const inv = new DokanInvoicePage(page);
            const orderId = await inv.seedVendor1Order('processing');

            const apiCtx = await request.newContext();
            const res = await apiCtx.get(
                `${SERVER_URL}/dokan/v1/orders/${orderId}`,
                { headers: payloads.adminAuth },
            );
            expect(res.ok()).toBeTruthy();
            const body = await res.json();
            const url: string = body?.actions?.invoice?.url ?? '';
            expect(url).toMatch(/action=generate_wpo_wcpdf/);
            expect(url).toMatch(/document_type=invoice/);
            expect(url).toMatch(new RegExp(`order_ids=${orderId}\\b`));
            // esc_url_raw + wp_specialchars_decode should leave no raw
            // entities or script-like fragments in the URL.
            expect(url).not.toMatch(/<script/i);
            expect(url).not.toMatch(/javascript:/i);
            expect(url).not.toMatch(/&amp;/);
            await apiCtx.dispose();
            await inv.dispose();
            await ctx.close();
        });

        test('REST-2 - actions.packing-slip.url present when document is enabled', { tag: ['@pro', '@admin', '@invoice'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: a1 });
            const page = await ctx.newPage();
            const inv = new DokanInvoicePage(page);
            const orderId = await inv.seedVendor1Order('processing');

            const apiCtx = await request.newContext();
            const res = await apiCtx.get(
                `${SERVER_URL}/dokan/v1/orders/${orderId}`,
                { headers: payloads.adminAuth },
            );
            const body = await res.json();
            const slip = body?.actions?.['packing-slip'];
            // Setup enables the packing-slip document; if it ever
            // regresses to disabled-by-default, the assertion fails.
            expect(slip?.url, 'packing-slip URL should be injected when WC PDF document is enabled').toMatch(
                /document_type=packing-slip/,
            );
            expect(slip.url).toMatch(new RegExp(`order_ids=${orderId}\\b`));
            await apiCtx.dispose();
            await inv.dispose();
            await ctx.close();
        });
    });

    // ============================================
    // REGRESSION — order status / lifecycle
    // ============================================

    test.describe('Regression — order lifecycle', () => {
        test('Lifecycle-1 - customer URL works for a completed order', { tag: ['@pro', '@customer', '@invoice'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: c1 });
            const page = await ctx.newPage();
            const inv = new DokanInvoicePage(page);
            await inv.seedVendor1Order('completed');
            await page.goto(inv.customer.myAccountOrdersUrl);
            const href = await page.locator(inv.customer.invoiceButton).first().getAttribute('href');
            expect(href).toBeTruthy();
            const res = await page.request.get(href!);
            const ct = (res.headers()['content-type'] ?? '').toLowerCase();
            const buf = await res.body();
            expect(ct.includes('pdf') || buf.subarray(0, 5).toString('binary') === '%PDF-').toBeTruthy();
            await inv.dispose();
            await ctx.close();
        });

        test('Lifecycle-2 - URL stays valid across processing → completed transition', { tag: ['@pro', '@admin', '@invoice'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: a1 });
            const page = await ctx.newPage();
            const inv = new DokanInvoicePage(page);

            const orderId = await inv.seedVendor1Order('processing');
            await page.goto(inv.admin.wcOrderEditUrl(orderId));
            const urlProcessing = await page.locator(inv.admin.invoiceButton).first().getAttribute('href');
            expect(urlProcessing).toBeTruthy();

            // Flip to completed via WC REST.
            const apiCtx = await request.newContext();
            const upd = await apiCtx.put(
                `${SERVER_URL}/wc/v3/orders/${orderId}`,
                { data: { status: 'completed' }, headers: payloads.adminAuth },
            );
            expect(upd.ok()).toBeTruthy();
            await apiCtx.dispose();

            // Reload and pull the URL again — it should still serve PDF.
            await page.goto(inv.admin.wcOrderEditUrl(orderId));
            const urlCompleted = await page.locator(inv.admin.invoiceButton).first().getAttribute('href');
            expect(urlCompleted).toBeTruthy();

            const download = await inv.clickAndCaptureDownload(inv.admin.invoiceButton, `lifecycle invoice (order ${orderId})`);
            const buf = await inv.readDownloadAsPdf(download, `lifecycle invoice (order ${orderId})`);
            expect(buf.length).toBeGreaterThan(1000);

            await inv.dispose();
            await ctx.close();
        });
    });

    // ============================================
    // REGRESSION — asset enqueue
    //
    // dokan-invoice's enqueue_scripts() registers a CSS bundle on every
    // front-end page and a JS bundle (`dokan-orders.js`). These tests
    // catch regressions where the assets stop loading entirely (which
    // would silently break the My Account button styling and the new
    // dashboard JS filter registration).
    // ============================================

    test.describe('Regression — asset enqueue', () => {
        test('Asset-1 - dokan-invoice CSS bundle is enqueued on customer My Account', { tag: ['@pro', '@customer', '@invoice'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: c1 });
            const page = await ctx.newPage();
            const inv = new DokanInvoicePage(page);
            await inv.seedVendor1Order('processing');
            await page.goto(inv.customer.myAccountOrdersUrl);
            // Stylesheet handle is `dokan-invoice-styles`. WordPress
            // emits it as <link id="dokan-invoice-styles-css" …>.
            const cssLoaded = await page.evaluate(() =>
                Boolean(document.querySelector('link[id="dokan-invoice-styles-css"]'))
                || Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
                    .some(l => l.href.includes('/dokan-invoice/assets/css/style.css')),
            );
            expect(cssLoaded, 'dokan-invoice/assets/css/style.css should be enqueued').toBeTruthy();
            await inv.dispose();
            await ctx.close();
        });

        test('Asset-2 - dokan-invoice JS bundle is enqueued on customer pages', { tag: ['@pro', '@customer', '@invoice'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: c1 });
            const page = await ctx.newPage();
            const inv = new DokanInvoicePage(page);
            await page.goto(inv.customer.myAccountOrdersUrl);
            const jsLoaded = await page.evaluate(() =>
                Array.from(document.querySelectorAll<HTMLScriptElement>('script[src]'))
                    .some(s => s.src.includes('/dokan-invoice/assets/js/dokan-orders.js')),
            );
            expect(jsLoaded, 'dokan-invoice/assets/js/dokan-orders.js should be enqueued').toBeTruthy();
            await inv.dispose();
            await ctx.close();
        });
    });

    // ============================================
    // EDGE — security / cross-customer
    // ============================================

    test.describe('Edge — security', () => {
        test('EC-customer2-cannot-access-customer1-invoice', { tag: ['@pro', '@customer', '@invoice'] }, async ({ browser }) => {
            // Build a real invoice URL for customer1's order, then try to hit
            // it as customer2 in their own browser context. WC PDF should
            // refuse: nonce-based access keys are user-scoped.
            const adminCtx = await browser.newContext({ storageState: a1 });
            const adminPage = await adminCtx.newPage();
            const adminInv = new DokanInvoicePage(adminPage);
            const orderId = await adminInv.seedVendor1Order('processing');
            await adminPage.goto(adminInv.admin.wcOrderEditUrl(orderId));
            const url = await adminPage.locator(adminInv.admin.invoiceButton).first().getAttribute('href');
            expect(url, 'admin should see an invoice URL').toBeTruthy();
            await adminInv.dispose();
            await adminCtx.close();

            // Switch to customer2 — different login, different access scope.
            const cust2 = await browser.newContext({ storageState: c2 });
            const cust2Page = await cust2.newPage();
            const res = await cust2Page.request.get(url!);
            const ct = (res.headers()['content-type'] ?? '').toLowerCase();
            const buf = await res.body();
            const isPdf = ct.includes('pdf') || buf.subarray(0, 5).toString('binary') === '%PDF-';
            expect(isPdf, `customer2 must not receive the PDF (status=${res.status()} ct=${ct})`).toBeFalsy();
            await cust2.close();
        });

        test('EC-vendor-cannot-access-other-vendor-order', { tag: ['@pro', '@vendor', '@invoice'] }, async ({ browser }) => {
            // Vendor1 owns the order. Vendor2 tries to read it via Dokan's
            // order REST — Dokan rejects with 401/403/404 because Vendor2
            // is not the seller of that order. (Direct WC PDF URL access
            // is similarly blocked by `wpo_wcpdf_dokan_privs`.)
            const adminCtx = await browser.newContext({ storageState: a1 });
            const adminPage = await adminCtx.newPage();
            const adminInv = new DokanInvoicePage(adminPage);
            const orderId = await adminInv.seedVendor1Order('processing');
            await adminInv.dispose();
            await adminCtx.close();

            const v2Ctx = await browser.newContext({
                storageState: path.join(__dirname, '../../../playwright/.auth/vendor2StorageState.json'),
            });
            const v2Page = await v2Ctx.newPage();
            const res = await v2Page.request.get(
                `${SERVER_URL}/dokan/v1/orders/${orderId}`,
                { headers: payloads.vendor2Auth },
            );
            expect([401, 403, 404]).toContain(res.status());
            await v2Ctx.close();
        });

        test('EC-guest-cannot-access-invoice', { tag: ['@pro', '@guest', '@invoice'] }, async ({ browser }) => {
            // Same URL, hit by a brand-new (no-auth) browser context.
            const adminCtx = await browser.newContext({ storageState: a1 });
            const adminPage = await adminCtx.newPage();
            const adminInv = new DokanInvoicePage(adminPage);
            const orderId = await adminInv.seedVendor1Order('processing');
            await adminPage.goto(adminInv.admin.wcOrderEditUrl(orderId));
            const url = await adminPage.locator(adminInv.admin.invoiceButton).first().getAttribute('href');
            await adminInv.dispose();
            await adminCtx.close();

            const guest = await browser.newContext();
            const guestPage = await guest.newPage();
            const res = await guestPage.request.get(url!);
            const ct = (res.headers()['content-type'] ?? '').toLowerCase();
            const buf = await res.body();
            const isPdf = ct.includes('pdf') || buf.subarray(0, 5).toString('binary') === '%PDF-';
            expect(isPdf, `guest must not receive the PDF (status=${res.status()} ct=${ct})`).toBeFalsy();
            await guest.close();
        });
    });

    // ============================================
    // ACTIVATION REGRESSION
    //
    // dokan-invoice <=1.2.8 self-deactivates via dependency_notice() if
    // `wpo_wcpdf_version` is missing on a fresh install. _site.setup.ts
    // seeds the option; this test proves the plugin row STILL says
    // Active after a real wp-admin/plugins.php render.
    // ============================================

    test('TC-activation - dokan-invoice plugin row shows Active after wp-admin/plugins.php render', { tag: ['@pro', '@admin', '@invoice'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        const inv = new DokanInvoicePage(page);

        await page.goto(inv.admin.pluginsUrl, { waitUntil: 'load' });
        const row = page.locator(inv.admin.dokanInvoiceRow);
        await expect(row, 'dokan-invoice row must exist on plugins page').toBeVisible();
        // Active rows have class="active"; inactive rows have class="inactive".
        const cls = (await row.getAttribute('class')) ?? '';
        expect(cls, `expected dokan-invoice to be active, got class="${cls}"`).toContain('active');
        expect(cls).not.toContain('inactive');

        await inv.dispose();
        await ctx.close();
    });

    // ============================================
    // NEW VENDOR DASHBOARD — /dashboard/new/#orders
    //
    // Dokan 5.0.0+ ships a React DataViews-based vendor dashboard at
    // /dashboard/new/. dokan-invoice 1.2.8 registers a JS filter
    // (`dokan_orders_data_view_dataviews_actions`) that adds View Invoice
    // and View Packing Slip menu items to each order row's action
    // dropdown. Clicking either calls `window.open(url, '_blank')` with
    // the WC PDF generate endpoint URL.
    // ============================================

    test.describe('New vendor dashboard — /dashboard/new/#orders', () => {
        test('NewDash-1 - dashboard renders an orders DataView with rows', { tag: ['@pro', '@vendor', '@invoice', '@new-ui'] }, async ({ browser }) => {
            const ctx = await browser.newContext({
                storageState: path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json'),
            });
            const page = await ctx.newPage();
            const inv = new DokanInvoicePage(page);
            await inv.seedVendor1Order('processing');
            await page.goto(inv.vendor.ordersUrl, { waitUntil: 'load' });
            await page.waitForSelector(inv.vendor.dataRow, { timeout: 15000 });
            const rowCount = await page.locator(inv.vendor.dataRow).count();
            expect(rowCount, 'vendor dashboard should render at least one order row').toBeGreaterThan(0);
            await inv.dispose();
            await ctx.close();
        });

        test('NewDash-2 - row action menu contains "View Invoice" AND "View Packing Slip"', { tag: ['@pro', '@vendor', '@invoice', '@new-ui'] }, async ({ browser }) => {
            const ctx = await browser.newContext({
                storageState: path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json'),
            });
            const page = await ctx.newPage();
            const inv = new DokanInvoicePage(page);
            await inv.seedVendor1Order('processing');
            await page.goto(inv.vendor.ordersUrl, { waitUntil: 'load' });
            await page.waitForSelector(inv.vendor.dataRow, { timeout: 15000 });

            await page.locator(inv.vendor.rowActionsTrigger).first().click();
            await expect(page.getByRole('menuitem', inv.vendor.viewInvoiceMenuItem)).toBeVisible();
            await expect(page.getByRole('menuitem', inv.vendor.viewPackingSlipMenuItem)).toBeVisible();

            await inv.dispose();
            await ctx.close();
        });

        test('NewDash-3 - clicking "View Invoice" calls window.open with the WC PDF URL', { tag: ['@pro', '@vendor', '@invoice', '@new-ui'] }, async ({ browser }) => {
            // dokan-invoice's JS hook calls `window.open(doc.url, '_blank',
            // 'noopener,noreferrer')`. Override window.open before the
            // click so we can inspect the URL synchronously without the
            // popup-URL race.
            const ctx = await browser.newContext({
                storageState: path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json'),
            });
            const page = await ctx.newPage();
            const inv = new DokanInvoicePage(page);
            await inv.seedVendor1Order('processing');
            await page.goto(inv.vendor.ordersUrl, { waitUntil: 'load' });
            await page.waitForSelector(inv.vendor.dataRow, { timeout: 15000 });

            await page.evaluate(() => {
                (window as unknown as { __capturedUrls: string[] }).__capturedUrls = [];
                const orig = window.open.bind(window);
                window.open = function (url, target, features) {
                    (window as unknown as { __capturedUrls: string[] }).__capturedUrls.push(String(url));
                    return orig(url, target, features);
                } as typeof window.open;
            });

            await page.locator(inv.vendor.rowActionsTrigger).first().click();
            await page.getByRole('menuitem', inv.vendor.viewInvoiceMenuItem).click();
            await page.waitForTimeout(500);

            const captured: string[] = await page.evaluate(() => (window as unknown as { __capturedUrls: string[] }).__capturedUrls);
            expect(captured.length, 'window.open should have been called once').toBeGreaterThan(0);
            const url = captured[0];
            expect(url).toMatch(/action=generate_wpo_wcpdf/);
            expect(url).toMatch(/document_type=invoice/);
            expect(url).toMatch(/order_ids=\d+/);

            await inv.dispose();
            await ctx.close();
        });

        test('NewDash-4 - clicking "View Packing Slip" calls window.open with the packing-slip URL', { tag: ['@pro', '@vendor', '@invoice', '@new-ui'] }, async ({ browser }) => {
            const ctx = await browser.newContext({
                storageState: path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json'),
            });
            const page = await ctx.newPage();
            const inv = new DokanInvoicePage(page);
            await inv.seedVendor1Order('processing');
            await page.goto(inv.vendor.ordersUrl, { waitUntil: 'load' });
            await page.waitForSelector(inv.vendor.dataRow, { timeout: 15000 });

            await page.evaluate(() => {
                (window as unknown as { __capturedUrls: string[] }).__capturedUrls = [];
                const orig = window.open.bind(window);
                window.open = function (url, target, features) {
                    (window as unknown as { __capturedUrls: string[] }).__capturedUrls.push(String(url));
                    return orig(url, target, features);
                } as typeof window.open;
            });

            await page.locator(inv.vendor.rowActionsTrigger).first().click();
            await page.getByRole('menuitem', inv.vendor.viewPackingSlipMenuItem).click();
            await page.waitForTimeout(500);

            const captured: string[] = await page.evaluate(() => (window as unknown as { __capturedUrls: string[] }).__capturedUrls);
            expect(captured.length, 'window.open should have been called once').toBeGreaterThan(0);
            expect(captured[0]).toMatch(/document_type=packing-slip/);

            await inv.dispose();
            await ctx.close();
        });

        test('NewDash-5 - the URL window.open is given actually serves a real PDF', { tag: ['@pro', '@vendor', '@invoice', '@new-ui'] }, async ({ browser }) => {
            // The URL was minted by the same vendor session that's now
            // fetching it, so the access_key (WP nonce) validates.
            const ctx = await browser.newContext({
                storageState: path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json'),
            });
            const page = await ctx.newPage();
            const inv = new DokanInvoicePage(page);
            await inv.seedVendor1Order('processing');
            await page.goto(inv.vendor.ordersUrl, { waitUntil: 'load' });
            await page.waitForSelector(inv.vendor.dataRow, { timeout: 15000 });

            await page.evaluate(() => {
                (window as unknown as { __capturedUrls: string[] }).__capturedUrls = [];
                const orig = window.open.bind(window);
                window.open = function (url, target, features) {
                    (window as unknown as { __capturedUrls: string[] }).__capturedUrls.push(String(url));
                    return orig(url, target, features);
                } as typeof window.open;
            });

            await page.locator(inv.vendor.rowActionsTrigger).first().click();
            await page.getByRole('menuitem', inv.vendor.viewInvoiceMenuItem).click();
            await page.waitForTimeout(500);

            const capturedUrls = await page.evaluate(() => (window as unknown as { __capturedUrls: string[] }).__capturedUrls);
            const url = capturedUrls?.[0];
            expect(url).toBeTruthy();
            if (!url) return;

            const res = await page.request.get(url);
            const ct = (res.headers()['content-type'] ?? '').toLowerCase();
            const buf = await res.body();
            const isPdf = ct.includes('pdf') || buf.subarray(0, 5).toString('binary') === '%PDF-';
            expect(isPdf, `vendor must receive a real PDF (status=${res.status()} ct=${ct})`).toBeTruthy();
            expect(buf.length).toBeGreaterThan(1000);

            await inv.dispose();
            await ctx.close();
        });
    });
});
