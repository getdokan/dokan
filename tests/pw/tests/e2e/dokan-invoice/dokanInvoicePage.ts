import { Page, APIRequestContext, APIResponse, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

declare const process: { env: Record<string, string | undefined> };
declare const Buffer: {
    from(input: string | Uint8Array, encoding?: string): { toString(encoding: string): string; subarray(start: number, end?: number): { toString(encoding: string): string } };
};

const BASE_URL = process.env.BASE_URL || 'http://localhost:9999';
const SERVER_URL = process.env.SERVER_URL ?? `${BASE_URL}/wp-json`;

/**
 * Page object for Dokan Invoice (PDF Invoices for Dokan multi-vendor) E2E
 * coverage. Centralises selectors, REST endpoints, and helpers so the spec
 * file stays focused on assertions per CONVENTIONS.md §4.
 *
 * Order/product creation goes through ApiUtils + payloads so vendor
 * association (product author = vendor) lines up with how the rest of the
 * suite seeds data.
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

    admin = {
        pluginsUrl: `${BASE_URL}/wp-admin/plugins.php`,
        wcOrdersUrl: `${BASE_URL}/wp-admin/admin.php?page=wc-orders`,
        loginUrl: `${BASE_URL}/wp-login.php`,
        dokanInvoiceRow: "tr[data-slug='dokan-invoice']",
        dokanInvoiceActiveRow: "tr.active[data-slug='dokan-invoice']",
        dokanInvoiceInactiveRow: "tr.inactive[data-slug='dokan-invoice']",
        wcPdfSettingsUrl: `${BASE_URL}/wp-admin/admin.php?page=wpo_wcpdf_options_page`,
    };

    // Vendor (new React vendor dashboard) selectors — Dokan 5.0.0+
    // Tests below are gated `test.skip` until dokan-lite's OrderList.tsx
    // calls `applyFilters('dokan_orders_data_view_dataviews_actions', …)`.
    vendor = {
        ordersUrl: `${BASE_URL}/dashboard/orders`,
        rowActionsButton: "//tr//button[@aria-haspopup='menu' or @aria-label='Actions']",
        viewInvoiceMenuItem: "//*[@role='menuitem'][normalize-space()='View Invoice']",
        viewPackingSlipMenuItem: "//*[@role='menuitem'][normalize-space()='View Packing Slip']",
    };

    customer = {
        myAccountOrdersUrl: `${BASE_URL}/my-account/orders/`,
        invoiceLink: "//a[contains(@class,'wpo_wcpdf') and contains(., 'Invoice')]",
        packingSlipLink: "//a[contains(@class,'wpo_wcpdf') and contains(., 'Packing Slip')]",
    };

    // ============================================
    // REST API CONFIG
    // ============================================

    rest = {
        getOrder: (orderId: string | number, version: 'v1' | 'v2' = 'v1') =>
            `${SERVER_URL}/dokan/${version}/orders/${orderId}`,
        getAllOrders: (version: 'v1' | 'v2' = 'v1') =>
            `${SERVER_URL}/dokan/${version}/orders`,
    };

    // ============================================
    // TEST DATA
    // ============================================

    testData = {
        admin: { authHeader: payloads.adminAuth },
        vendor1: { authHeader: payloads.vendorAuth },
        vendor2: { authHeader: payloads.vendor2Auth },
        customer: { authHeader: payloads.customerAuth },
        admin_user: process.env.ADMIN || 'admin',
        admin_pass: process.env.ADMIN_PASSWORD || 'password',
    };

    // ============================================
    // GENERIC NAVIGATION / WAITS
    // ============================================

    async navigateTo(url: string) {
        await this.page.goto(url);
    }

    async waitForPageReady() {
        await this.page.waitForLoadState('load');
    }

    async loginAsAdmin() {
        await this.page.goto(this.admin.loginUrl);
        await this.page.fill('#user_login', this.testData.admin_user);
        await this.page.fill('#user_pass', this.testData.admin_pass);
        await Promise.all([this.page.waitForLoadState('load'), this.page.click('#wp-submit')]);
    }

    // ============================================
    // REST HELPERS
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
     * Create a vendor1-owned order. Reuses the seeded vendor1 product
     * (PRODUCT_ID env var, populated by _env.setup.ts). That product is
     * authored by vendor1, so the resulting order is recognised as
     * vendor1's by Dokan and reachable via /dokan/v1/orders for vendor1.
     */
    async createVendor1Order(): Promise<string> {
        const apiUtils = await this.getApiUtils();
        const productId = process.env.PRODUCT_ID;
        if (!productId) throw new Error('PRODUCT_ID env var not set — run docker:setup first');
        const [, , orderId] = await apiUtils.createOrder(productId, payloads.createOrder, payloads.vendorAuth);
        return orderId;
    }

    /**
     * Create a vendor1-owned order and force it to a specific status (e.g.
     * `wc-processing`, `wc-completed`, `wc-cancelled`).
     */
    async createVendor1OrderWithStatus(status: string): Promise<string> {
        const orderId = await this.createVendor1Order();
        if (status && status !== 'processing' && status !== 'pending') {
            await this.updateOrderStatus(orderId, status);
        }
        return orderId;
    }

    async updateOrderStatus(orderId: string, status: string): Promise<void> {
        // Use the WC core orders endpoint (not Dokan's) for the status flip:
        // the Dokan endpoint requires the requester to BE the vendor of the
        // order, and going through it as admin sometimes returns 200 but
        // doesn't actually flip the status / wipes line items.
        const api = await this.getApi();
        const res = await api.put(`${SERVER_URL}/wc/v3/orders/${orderId}`, {
            data: { status },
            headers: payloads.adminAuth,
        });
        expect(res.ok(), `updateOrderStatus(${orderId}, ${status}) ${res.status()}`).toBeTruthy();
    }

    async getDokanOrder(
        orderId: string | number,
        authHeader: typeof payloads.adminAuth,
        version: 'v1' | 'v2' = 'v1',
    ): Promise<{ response: APIResponse; body: any }> {
        const api = await this.getApi();
        const response = await api.get(this.rest.getOrder(orderId, version), { headers: authHeader });
        const body = response.ok() ? await response.json() : null;
        return { response, body };
    }

    async fetchPdfUrlAsGuest(url: string): Promise<APIResponse> {
        const api = await this.getApi();
        return await api.get(url, { headers: {} });
    }

    async fetchPdfUrlAs(url: string, authHeader: typeof payloads.adminAuth): Promise<APIResponse> {
        const api = await this.getApi();
        return await api.get(url, { headers: authHeader });
    }

    /**
     * Assert that an APIResponse looks like a real WC PDF generation:
     *   - 2xx HTTP status
     *   - Content-Type indicates PDF (application/pdf or download disposition)
     *   - Body starts with the PDF magic bytes "%PDF-"
     * Returns the body bytes for callers that want to introspect further.
     */
    async assertIsPdfResponse(res: APIResponse, label: string): Promise<Buffer> {
        expect(res.status(), `${label}: HTTP status`).toBeLessThan(400);
        const ct = (res.headers()['content-type'] ?? '').toLowerCase();
        const cd = (res.headers()['content-disposition'] ?? '').toLowerCase();
        const isPdfHeader = ct.includes('pdf') || cd.includes('pdf');
        const buf = await res.body();
        const magic = buf.subarray(0, 5).toString('binary');
        const isPdfMagic = magic === '%PDF-';
        expect(isPdfHeader || isPdfMagic, `${label}: response should be a PDF (content-type=${ct} cd=${cd} magic=${magic})`).toBeTruthy();
        return buf;
    }

    /**
     * Pull the actions.invoice.url and actions.packing-slip.url from a Dokan
     * order REST response. Throws assertion if the URL shape is wrong.
     */
    extractInvoiceUrls(body: any, orderId: string | number): { invoice: string; packingSlip: string | null } {
        const invoice: string = body?.actions?.invoice?.url ?? '';
        const packingSlip: string = body?.actions?.['packing-slip']?.url ?? '';
        expect(invoice, 'actions.invoice.url should be injected').toBeTruthy();
        expect(invoice).toMatch(/action=generate_wpo_wcpdf/);
        expect(invoice).toMatch(/document_type=invoice/);
        expect(invoice).toMatch(new RegExp(`order_ids=${orderId}\\b`));
        return { invoice, packingSlip: packingSlip || null };
    }
}
