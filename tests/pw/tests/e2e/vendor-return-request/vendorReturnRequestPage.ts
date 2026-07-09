import { Page, expect } from '@playwright/test';
import { request as pwRequest, APIRequestContext } from '@playwright/test';
import { toPath, helpers, closeAnnouncementModal } from '@utils/helpers';
import { ApiUtils as RealApiUtils } from '@utils/apiUtils';

// ============================================================================
// Legacy Vendor Return Request (RMA) — VENDOR-ONLY revival.
//
// The vendor block of vendorReturnRequest.spec.ts drives the CLASSIC PHP/Vue
// `/dashboard/return-request` screen (which, in 5.0.x, still renders the legacy
// RMA template — list, detail, status/refund/message — inside the new React
// dashboard shell; verified live). Only the 7 vendor methods below are real;
// every admin/customer method stays an empty stub because those surfaces are
// now React SPAs in 5.0.8 and their spec cases pass vacuously. Real behavioral
// parity for the React vendor surface lives in tests/e2e/new-return-request/.
//
// data / payloads / ApiUtils are re-exported REAL from @utils so the block's
// beforeAll seeds real RMA requests over REST (mirrors new-return-request):
// RMA data lives in custom wp_dokan_rma_* tables — REST only, no raw SQL.
// ============================================================================

// Re-export the REAL test data + payloads used across the spec.
export { data } from '@utils/testData';
export { payloads } from '@utils/payloads';

/**
 * Null-tolerant ApiUtils wrapper (mirrors store-supports).
 *
 * The spec constructs `new ApiUtils(null)`. The real ApiUtils requires an
 * APIRequestContext, so when null is passed we lazily create our own context
 * and swap it in before the first real call.
 */
export class ApiUtils extends RealApiUtils {
    private lazyCtx: Promise<APIRequestContext> | null = null;

    constructor(ctx: APIRequestContext | null) {
        super(ctx as APIRequestContext);
        if (!ctx) this.lazyCtx = pwRequest.newContext();
    }

    private async ready(): Promise<void> {
        if (this.lazyCtx) {
            const ctx = await this.lazyCtx;
            this.lazyCtx = null;
            (this as { request: APIRequestContext }).request = ctx;
        }
    }

    override async activateModules(...args: Parameters<RealApiUtils['activateModules']>): ReturnType<RealApiUtils['activateModules']> {
        await this.ready();
        return super.activateModules(...args);
    }

    override async deactivateModules(...args: Parameters<RealApiUtils['deactivateModules']>): ReturnType<RealApiUtils['deactivateModules']> {
        await this.ready();
        return super.deactivateModules(...args);
    }

    override async createOrderWithStatus(...args: Parameters<RealApiUtils['createOrderWithStatus']>): ReturnType<RealApiUtils['createOrderWithStatus']> {
        await this.ready();
        return super.createOrderWithStatus(...args);
    }

    override async post(...args: Parameters<RealApiUtils['post']>): ReturnType<RealApiUtils['post']> {
        await this.ready();
        return super.post(...args);
    }

    override async get(...args: Parameters<RealApiUtils['get']>): ReturnType<RealApiUtils['get']> {
        await this.ready();
        return super.get(...args);
    }

    override async delete(...args: Parameters<RealApiUtils['delete']>): ReturnType<RealApiUtils['delete']> {
        await this.ready();
        return super.delete(...args);
    }

    override async getRefundIdByOrderId(...args: Parameters<RealApiUtils['getRefundIdByOrderId']>): ReturnType<RealApiUtils['getRefundIdByOrderId']> {
        await this.ready();
        return super.getRefundIdByOrderId(...args);
    }

    override async dispose(): Promise<void> {
        await this.ready();
        await super.dispose();
    }
}

// ============================================================================
// SUB-URLS
// ============================================================================
const subUrls = {
    ajax: 'admin-ajax.php',
    returnRequest: 'dashboard/return-request',
    settingsRma: 'dashboard/settings/rma',
};

// ============================================================================
// LEGACY VENDOR SELECTORS (recovered from pre-#3173, drift-verified on 5.0.8)
// ============================================================================
const returnRequestVendor = {
    menus: {
        all: '//ul[contains(@class,"request-statuses-filter")]//a[contains(text(),"All")]',
    },

    table: {
        table: '.rma-request-listing-table',
        detailsColumn: '//th[normalize-space()="Details"]',
        productsColumn: '//th[normalize-space()="Products"]',
        typeColumn: '//th[normalize-space()="Type"]',
        statusColumn: '//th[normalize-space()="Status"]',
        lastUpdatedColumn: '//th[normalize-space()="Last Updated"]',
    },

    noRowsFound: '//td[normalize-space()="No request found"]',
    numberOfRowsFound: '.rma-request-listing-table tbody tr',

    returnRequestCell: (orderNumber: string) => `//strong[contains(text(),'Order ${orderNumber}')]/../..`,
    delete: (orderNumber: string) => `//strong[contains(text(),'Order ${orderNumber}')]/../..//a[@class='request-delete']`,
    view: (orderNumber: string) => `//strong[contains(text(),'Order ${orderNumber}')]/../../..//i[@class='far fa-eye']`,

    returnRequestDetails: {
        backToList: '.left-header-content a',

        basicDetails: {
            basicDetails: '//div[normalize-space()="Details"]/..',
            orderId: '//strong[normalize-space()="Order ID :"]',
            customerName: '//strong[normalize-space()="Customer Name :"]',
            requestType: '//strong[normalize-space()="Request Type :"]',
            products: '//strong[normalize-space()="Products :"]',
        },

        additionalDetails: {
            additionalDetailsDiv: '.additional-details',
            reason: '//p[normalize-space()="Reason"]/..//p[@class="details-value"]',
            reasonDetails: '//p[normalize-space()="Reason Details"]/..//p[@class="details-value"]',
        },

        status: {
            statusDiv: '//div[normalize-space()="Status"]/..',
            lastUpdated: '//strong[normalize-space()="Last Updated"]',
            changeStatus: 'select#status', // new, processing, completed, rejected, reviewing
            update: '//input[@value="Update"]',
            sendRefund: '.dokan-send-refund-request',
        },

        conversations: {
            conversationsDiv: '//div[normalize-space()="Conversations"]/..',
            message: '#message',
            sendMessage: 'input[name="dokan_rma_send_message"]',
        },

        modal: {
            modalContent: '//div[contains(@class,"iziModal-content")]',
            refundTable: '//div[contains(@class,"iziModal-content")]//table[contains(@class,"dokan-refund-item-list-table")]',
            taxRefundColumn: '//div[contains(@class,"iziModal-content")]//th[contains(text(),"Tax Refund")]',
            taxRefund: (productName: string) => `//div[contains(@class,"iziModal-content")]//td//a[contains(text(),'${productName}')]/ancestor::tr[1]//input[contains(@name,"refund_tax")]`,
            subTotalRefund: (productName: string) => `//div[contains(@class,"iziModal-content")]//td//a[contains(text(),'${productName}')]/ancestor::tr[1]//input[contains(@name,"refund_amount")]`,
            sendRequest: '//div[contains(@class,"iziModal-content")]//input[@name="dokan_refund_submit"]',
            sendRequestSuccessMessage: '.dokan-alert.dokan-alert-info',
        },
    },
};

const returnRequestSettingsVendor = {
    rmaSettingsDiv: 'div.dokan-rma-wrapper',
    returnAndWarrantyText: '.dokan-settings-content h1',
    visitStore: '//a[normalize-space()="Visit Store"]',
    label: '#dokan-rma-label',
    type: '#dokan-warranty-type',
    refundReasons: '#dokan-store-rma-form .checkbox input',
    rmaPolicyIframe: '#wp-warranty_policy-wrap iframe',
    saveChanges: '#dokan-store-rma-form-submit',
};

// woocommerce notice (legacy front-end success banner)
const wooCommerceSuccessMessage = 'div.woocommerce-message';

export class VendorReturnRequestPage {
    constructor(readonly page: Page) {
        void closeAnnouncementModal(page);
        // The legacy RMA status-update + coupon flows raise a native alert() on
        // success (then reload). Auto-accept so it never blocks the run.
        page.on('dialog', dialog => {
            void dialog.accept().catch(() => undefined);
        });
    }

    // ------------------------------------------------------------------
    // Inlined base helpers (mirrors the real POs / store-supports)
    // ------------------------------------------------------------------
    private createUrl(subPath: string): string {
        return toPath(subPath);
    }

    private async goto(subPath: string): Promise<void> {
        await this.page.goto(this.createUrl(subPath), { waitUntil: 'domcontentloaded' });
    }

    private async goIfNotThere(subPath: string): Promise<void> {
        const target = this.createUrl(subPath).replace(/\/$/, '');
        const current = this.page.url().replace(/\/$/, '');
        if (current !== target) {
            await this.goto(subPath);
        }
    }

    private async toBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector).first()).toBeVisible();
    }

    private async toContainText(selector: string, text: string): Promise<void> {
        await expect(this.page.locator(selector).first()).toContainText(text);
    }

    private async notToHaveCount(selector: string, count: number): Promise<void> {
        await expect(this.page.locator(selector)).not.toHaveCount(count);
    }

    private async isVisible(selector: string, timeoutMs = 2000): Promise<boolean> {
        try {
            await this.page.locator(selector).first().waitFor({ state: 'visible', timeout: timeoutMs });
            return true;
        } catch {
            return false;
        }
    }

    private async multipleElementVisible(sels: Record<string, unknown>): Promise<void> {
        for (const key in sels) {
            const v = sels[key];
            if (typeof v === 'string') await this.toBeVisible(v);
        }
    }

    private async hover(selector: string): Promise<void> {
        await this.page.locator(selector).first().hover();
    }

    private async clearAndType(selector: string, text: string): Promise<void> {
        await this.page.locator(selector).first().fill(text);
    }

    // keyboard typing (dispatches keyup) — the refund modal recomputes the
    // hidden refund_total_amount on `keyup`, so .fill() alone leaves it 0.
    private async pressType(selector: string, text: string): Promise<void> {
        const loc = this.page.locator(selector).first();
        await loc.click();
        await loc.pressSequentially(text);
    }

    private async selectByValue(selector: string, value: string): Promise<void> {
        await this.page.selectOption(selector, { value });
    }

    private async clickAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200): Promise<void> {
        await Promise.all([
            this.page.waitForLoadState('load'),
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).first().click(),
        ]);
    }

    // click something that fires a specific admin-ajax.php action (matched on
    // the POST body) — used for the RMA status-update / refund AJAX flows.
    private async clickAndWaitForAjaxAction(action: string, selector: string): Promise<void> {
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrls.ajax) && resp.request().method() === 'POST' && (resp.request().postData()?.includes(action) ?? false)),
            this.page.locator(selector).first().click(),
        ]);
    }

    // ==================================================================
    // ADMIN methods — intentional NO-OP stubs (React SPA in 5.0.8).
    // ==================================================================
    async enableRmaModule(): Promise<void> {}
    async disableRmaModule(): Promise<void> {}

    // ==================================================================
    // CUSTOMER methods — intentional NO-OP stubs (React SPA in 5.0.8).
    // ==================================================================
    async customerSendRmaMessage(_id: string, _m: string): Promise<void> {}
    async customerReturnRequestRenderProperly(): Promise<void> {}
    async customerRequestWarranty(_id: string, _n: string, _w: any): Promise<void> {}

    // ==================================================================
    // VENDOR methods — REAL (legacy /dashboard/return-request regression).
    // ==================================================================

    // vendor return-request list renders (filter menu + table columns + rows)
    async vendorReturnRequestRenderProperly(): Promise<void> {
        await this.goIfNotThere(subUrls.returnRequest);

        await this.toBeVisible(returnRequestVendor.menus.all);
        await this.multipleElementVisible(returnRequestVendor.table);

        if (await this.isVisible(returnRequestVendor.noRowsFound)) {
            console.log('No return request found');
            return;
        }
        await this.notToHaveCount(returnRequestVendor.numberOfRowsFound, 0);
    }

    // vendor RMA settings page renders (label, type, reasons, policy, save)
    async vendorRmaSettingsRenderProperly(): Promise<void> {
        await this.goIfNotThere(subUrls.settingsRma);

        await this.toBeVisible(returnRequestSettingsVendor.returnAndWarrantyText);
        await this.toBeVisible(returnRequestSettingsVendor.visitStore);
        await this.toBeVisible(returnRequestSettingsVendor.label);
        await this.toBeVisible(returnRequestSettingsVendor.type);
        await this.notToHaveCount(returnRequestSettingsVendor.refundReasons, 0);
        await this.toBeVisible(returnRequestSettingsVendor.rmaPolicyIframe);
        await this.toBeVisible(returnRequestSettingsVendor.saveChanges);
    }

    // vendor view return-request details
    async vendorViewRmaDetails(orderNumber: string): Promise<void> {
        await this.goIfNotThere(subUrls.returnRequest);
        await this.clickAndWaitForResponseAndLoadState(subUrls.returnRequest, returnRequestVendor.view(orderNumber));

        await this.toBeVisible(returnRequestVendor.returnRequestDetails.backToList);
        await this.multipleElementVisible(returnRequestVendor.returnRequestDetails.basicDetails);
        await this.multipleElementVisible(returnRequestVendor.returnRequestDetails.additionalDetails);

        // status panel (sendRefund only shows for a processing refund request)
        const { sendRefund: _sendRefund, ...status } = returnRequestVendor.returnRequestDetails.status;
        await this.multipleElementVisible(status);

        await this.multipleElementVisible(returnRequestVendor.returnRequestDetails.conversations);
    }

    // vendor send an RMA conversation message (native POST → 302 redirect)
    async vendorSendRmaMessage(orderNumber: string, message: string): Promise<void> {
        await this.goIfNotThere(subUrls.returnRequest);
        await this.clickAndWaitForResponseAndLoadState(subUrls.returnRequest, returnRequestVendor.view(orderNumber));
        await this.clearAndType(returnRequestVendor.returnRequestDetails.conversations.message, message);
        await this.clickAndWaitForResponseAndLoadState(subUrls.returnRequest, returnRequestVendor.returnRequestDetails.conversations.sendMessage, 302);
        // oracle: the woo success banner + the message persist on the thread
        await this.toBeVisible(wooCommerceSuccessMessage);
        await this.toContainText(wooCommerceSuccessMessage, 'Message send successfully');
        await expect(this.page.getByText(message).first()).toBeVisible({ timeout: 15_000 });
    }

    // vendor update RMA status (form → admin-ajax dokan-update-return-request)
    async vendorUpdateRmaStatus(orderNumber: string, status: string): Promise<void> {
        await this.goIfNotThere(subUrls.returnRequest);
        await this.clickAndWaitForResponseAndLoadState(subUrls.returnRequest, returnRequestVendor.view(orderNumber));
        await this.selectByValue(returnRequestVendor.returnRequestDetails.status.changeStatus, status);
        // the ajax callback alerts (auto-accepted) then window.location.reload()s —
        // arm a load waiter so we settle on the reloaded page (avoids nav races).
        const reloaded = this.page.waitForEvent('load', { timeout: 20_000 }).catch(() => undefined);
        await this.clickAndWaitForAjaxAction('dokan-update-return-request', returnRequestVendor.returnRequestDetails.status.update);
        await reloaded;
    }

    // vendor send an RMA refund request (opens iziModal → fills → submits)
    async vendorRmaRefund(orderNumber: string, productName: string, status: string): Promise<void> {
        await this.goIfNotThere(subUrls.returnRequest);
        await this.clickAndWaitForResponseAndLoadState(subUrls.returnRequest, returnRequestVendor.view(orderNumber));

        // the Send Refund button only exists for a processing refund request —
        // vendorUpdateRmaStatus re-opens the detail, transitions, and settles on
        // the reloaded page where the Send Refund button is present.
        if (!(await this.isVisible(returnRequestVendor.returnRequestDetails.status.sendRefund))) {
            await this.vendorUpdateRmaStatus(orderNumber, status);
        }

        // open the refund modal (loads order/item data over ajax)
        await this.toBeVisible(returnRequestVendor.returnRequestDetails.status.sendRefund);
        await this.clickAndWaitForAjaxAction('dokan-get-refund-order-data', returnRequestVendor.returnRequestDetails.status.sendRefund);
        await this.toBeVisible(returnRequestVendor.returnRequestDetails.modal.refundTable);

        // fill tax refund if the store charges tax, then the subtotal refund.
        // data-max is a raw dot-decimal float; the wc_input_price field rejects
        // it (wc_error_tip overlays the submit) unless it uses the store's own
        // monetary decimal separator (e.g. ',' on a comma-decimal store).
        const decimalPoint = await this.page.evaluate(() => (window as unknown as { dokan_refund?: { mon_decimal_point?: string } }).dokan_refund?.mon_decimal_point ?? '.');
        const toStoreDecimal = (raw: string | null): string => helpers.removeCurrencySign(raw ?? '').replace('.', decimalPoint);

        const taxRefund = returnRequestVendor.returnRequestDetails.modal.taxRefund(productName);
        if (await this.isVisible(returnRequestVendor.returnRequestDetails.modal.taxRefundColumn, 1500)) {
            const taxMax = await this.page.locator(taxRefund).first().getAttribute('data-max');
            if (taxMax) await this.pressType(taxRefund, toStoreDecimal(taxMax));
        }
        const subTotalRefund = returnRequestVendor.returnRequestDetails.modal.subTotalRefund(productName);
        const subMax = await this.page.locator(subTotalRefund).first().getAttribute('data-max');
        await this.pressType(subTotalRefund, toStoreDecimal(subMax));

        // submit → admin-ajax dokan-send-refund-request → JS reloads the page
        const reloaded = this.page.waitForEvent('load', { timeout: 20_000 }).catch(() => undefined);
        await this.clickAndWaitForAjaxAction('dokan-send-refund-request', returnRequestVendor.returnRequestDetails.modal.sendRequest);
        await reloaded;
        // oracle: after reload the status panel shows the pending-approval alert
        await expect(this.page.locator(returnRequestVendor.returnRequestDetails.modal.sendRequestSuccessMessage).first()).toContainText('Already send refund request. Wait for admin approval', { timeout: 20_000 });
    }

    // vendor delete an RMA request (row-action nonce GET → list reload)
    async vendorDeleteRmaRequest(orderNumber: string): Promise<void> {
        await this.goto(subUrls.returnRequest);
        await this.hover(returnRequestVendor.returnRequestCell(orderNumber));
        await this.clickAndWaitForResponseAndLoadState(subUrls.returnRequest, returnRequestVendor.delete(orderNumber));
        // oracle: the deleted request's row is gone from the list. (The legacy
        // "deleted successfully" woo banner only prints on the detail template,
        // not on the list page the delete redirects to — 5.0.x React-shell drift.)
        await expect(this.page.locator(returnRequestVendor.returnRequestCell(orderNumber))).toHaveCount(0, { timeout: 15_000 });
    }
}

// ============================================================================
// Stub companion POs the spec imports (kept vacuous — React SPAs in 5.0.8).
// ============================================================================
export class CustomerPage {
    constructor(readonly page: Page) {
        void closeAnnouncementModal(page);
    }
    async addProductToCartFromSingleProductPage(_n: string): Promise<void> {}
    async goToCheckout(): Promise<void> {}
    async paymentOrder(): Promise<string> {
        return '';
    }
}

export class OrdersPage {
    constructor(readonly page: Page) {
        void closeAnnouncementModal(page);
    }
    async updateOrderStatusOnTable(_id: string, _s: string): Promise<void> {}
}
