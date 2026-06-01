import { Page, APIRequestContext, Download, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';

declare const process: { env: Record<string, string | undefined> };
declare const Buffer: {
    from(input: string | Uint8Array, encoding?: string): { toString(encoding: string): string };
};

import { toPath, SERVER_URL } from '@utils/helpers';

/**
 * Page object for the Dokan Invoice add-on UI surfaces.
 *
 * dokan-invoice + WC PDF render two visible surfaces in the current
 * dokan-lite/dokan-pro release:
 *
 *   1. Customer → My Account → Orders: an "Invoice" / "Packing slip" link
 *      per row, hooked via dokan_my_account_my_sub_orders_actions.
 *   2. Admin → wp-admin order detail: a "Create PDF" button group in the
 *      WC PDF metabox / sidebar (a.button.invoice, a.button.packing-slip).
 *
 * The new (Dokan 5.0.0+) React vendor dashboard has *no* visible surface
 * yet — dokan-invoice 1.2.8 registers the JS filter
 * `dokan_orders_data_view_dataviews_actions` but dokan-lite's
 * OrderList.tsx does not call applyFilters() for it. Test #vendor-gap
 * documents that explicitly so a future dokan-lite change picks it up.
 */
export class DokanInvoicePage {
    readonly page: Page;
    private apiContext: APIRequestContext | null = null;
    private apiUtils: ApiUtils | null = null;

    constructor(page: Page) {
        this.page = page;
    }

    // ============================================
    // SELECTORS
    // ============================================

    customer = {
        myAccountOrdersUrl: toPath(`my-account/orders/`),
        myAccountViewOrderUrl: (orderId: string | number) => toPath(`my-account/view-order/${orderId}/`),
        // Per-row action button injected by WC PDF + dokan-invoice on the
        // My Account → Orders table. Class names come from WC PDF; the
        // text "Invoice" / "Packing slip" is locale-dependent.
        invoiceButton: 'a.button.invoice',
        packingSlipButton: 'a.button.packing-slip',
        invoiceButtonForOrder: (orderId: string | number) =>
            `a.button.invoice[aria-label*="${orderId}"]`,
    };

    admin = {
        loginUrl: toPath(`wp-login.php`),
        pluginsUrl: toPath(`wp-admin/plugins.php`),
        wcOrdersListUrl: toPath(`wp-admin/admin.php?page=wc-orders`),
        wcOrderEditUrl: (orderId: string | number) =>
            toPath(`wp-admin/admin.php?page=wc-orders&action=edit&id=${orderId}`),
        wcPdfSettingsUrl: toPath(`wp-admin/admin.php?page=wpo_wcpdf_options_page`),
        // WC PDF buttons in the order edit sidebar metabox.
        invoiceButton: 'a.button.invoice',
        packingSlipButton: 'a.button.packing-slip',
        // Plugin row used by the activation regression test. Match on data-plugin (the plugin file
        // path) — WordPress derives data-slug from the display name ("Dokan - PDF Invoice" =>
        // dokan-pdf-invoice) for premium plugins, not the folder name.
        dokanInvoiceRow: "tr[data-plugin='dokan-invoice/dokan-invoice.php']",
    };

    vendor = {
        // New React vendor dashboard (Dokan 5.0.0+). Hash-routed SPA.
        ordersUrl: toPath(`dashboard/new/#orders`),
        // DataViews row + per-row actions menu.
        dataRow: 'table tbody tr',
        rowActionsTrigger: 'table tbody tr td:last-child button',
        viewInvoiceMenuItem: { name: /View Invoice/i },
        viewPackingSlipMenuItem: { name: /View Packing Slip/i },
    };

    // ============================================
    // TEST DATA
    // ============================================

    testData = {
        admin: {
            user: process.env.ADMIN || 'admin',
            pass: process.env.ADMIN_PASSWORD || 'password',
            authHeader: payloads.adminAuth,
        },
        vendor1: { authHeader: payloads.vendorAuth },
        vendor2: { authHeader: payloads.vendor2Auth },
        customer: { authHeader: payloads.customerAuth },
        // Vendor1's seeded store name — comes from auth_setup. Used to
        // assert vendor info in WC PDF's HTML preview output.
        vendor1StoreName: 'vendor1store',
    };

    // ============================================
    // GENERIC NAVIGATION
    // ============================================

    async navigateTo(url: string) {
        await this.page.goto(url, { waitUntil: 'load' });
    }

    async loginAsAdmin() {
        await this.page.goto(this.admin.loginUrl);
        await this.page.fill('#user_login', this.testData.admin.user);
        await this.page.fill('#user_pass', this.testData.admin.pass);
        await Promise.all([this.page.waitForLoadState('load'), this.page.click('#wp-submit')]);
    }

    // ============================================
    // REST HELPERS — only for seeding orders before driving the UI
    // ============================================

    private async getApi(): Promise<APIRequestContext> {
        if (!this.apiContext) this.apiContext = await request.newContext();
        return this.apiContext;
    }

    private async getApiUtils(): Promise<ApiUtils> {
        if (!this.apiUtils) this.apiUtils = new ApiUtils(await this.getApi());
        return this.apiUtils;
    }

    async dispose(): Promise<void> {
        if (this.apiUtils) {
            await this.apiUtils.dispose();
            this.apiUtils = null;
            this.apiContext = null;
        } else if (this.apiContext) {
            await this.apiContext.dispose();
            this.apiContext = null;
        }
    }

    /**
     * Seed an order owned by vendor1 (post_author = vendor1 → Dokan
     * recognises vendor1 as the seller) for customer1, in a given status.
     *
     * IMPORTANT: `payloads.createOrder.customer_id` is captured at
     * module-load time from `process.env.CUSTOMER_ID`. On a fresh CI run
     * that env var isn't set yet when payloads.ts is first imported
     * (auth_setup writes it later), so the static payload's customer_id
     * is 0 → guest order → never appears in customer1's My Account →
     * Orders list. We re-read the env var at runtime and override
     * `customer_id` so the order is correctly attributed to customer1.
     */
    async seedVendor1Order(status: 'processing' | 'completed' | 'pending' | 'cancelled' = 'processing'): Promise<string> {
        const apiUtils = await this.getApiUtils();
        const productId = process.env.PRODUCT_ID;
        if (!productId) throw new Error('PRODUCT_ID env var not set — run docker:setup first');
        const customerId = Number(process.env.CUSTOMER_ID ?? 0);
        const orderPayload = { ...payloads.createOrder, customer_id: customerId };
        const [, , orderId] = await apiUtils.createOrder(productId, orderPayload, payloads.vendorAuth);
        if (status !== 'processing' && status !== 'pending') {
            const api = await this.getApi();
            const res = await api.put(`${SERVER_URL}/wc/v3/orders/${orderId}`, {
                data: { status },
                headers: payloads.adminAuth,
            });
            expect(res.ok(), `seedVendor1Order(${status}) → ${res.status()}`).toBeTruthy();
        }
        return orderId;
    }

    // ============================================
    // UI ACTIONS
    // ============================================

    /**
     * Click an invoice/packing-slip download button and capture the
     * resulting browser download. Returns the Download handle so callers
     * can save the file or inspect the suggested filename.
     */
    async clickAndCaptureDownload(selector: string, label = selector): Promise<Download> {
        const downloadPromise = this.page.waitForEvent('download', { timeout: 15000 });
        await this.page.locator(selector).first().click();
        const download = await downloadPromise;
        expect(download, `${label} did not produce a download`).toBeTruthy();
        return download;
    }

    /**
     * Fetch the WC PDF document for an order in HTML preview mode using
     * the supplied authenticated `Page` (so the URL's WP nonce validates
     * against the same session). Returns the rendered HTML so callers can
     * assert vendor name / address / billing details / order id appear in
     * the document body.
     */
    async fetchHtmlPreviewFromAdminPage(page: Page, orderId: string | number): Promise<string> {
        await page.goto(this.admin.wcOrderEditUrl(orderId), { waitUntil: 'load' });
        const pdfUrl = await page.locator(this.admin.invoiceButton).first().getAttribute('href');
        expect(pdfUrl, 'admin order edit page should expose an invoice URL').toBeTruthy();
        const htmlUrl = `${pdfUrl}&output=html`;
        const res = await page.request.get(htmlUrl);
        expect(res.ok(), `HTML preview status=${res.status()}`).toBeTruthy();
        return await res.text();
    }

    /**
     * Read the payload of a WC PDF download and assert it's a real PDF.
     * Returns the bytes for downstream introspection (e.g. text extraction).
     */
    async readDownloadAsPdf(download: Download, label: string): Promise<Buffer> {
        const stream = await download.createReadStream();
        if (!stream) throw new Error(`${label}: download stream was null`);
        const chunks: Buffer[] = [];
        await new Promise<void>((resolve, reject) => {
            stream.on('data', (c: Buffer) => chunks.push(c));
            stream.on('end', () => resolve());
            stream.on('error', reject);
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const buf = (Buffer as any).concat(chunks) as Buffer;
        const magic = buf.subarray(0, 5).toString('binary');
        expect(magic, `${label}: response is not a PDF (magic="${magic}")`).toBe('%PDF-');
        return buf;
    }

}
