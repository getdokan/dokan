import { Page, expect, APIRequestContext } from '@playwright/test';
import mysql from 'mysql2/promise';
import { isSerialized, serialize, unserialize } from 'php-serialize';

// closeAnnouncementModal is inlined per CONVENTIONS.md §4 (self-contained).
async function closeAnnouncementModal(page: Page): Promise<void> {
    const installed = '__dokanAnnouncementModalHandlerInstalled' as const;
    const pwf = page as Page & { [installed]?: boolean };
    if (!pwf[installed]) {
        pwf[installed] = true;
        const modal = page.locator('.vendor-announcement-modal');
        await page.addLocatorHandler(modal, async () => {
            const btn = modal.locator('button[aria-label="Close"]').first();
            if (await btn.isVisible().catch(() => false)) await btn.click({ timeout: 2000 }).catch(() => undefined);
            else await page.keyboard.press('Escape').catch(() => undefined);
        }, { noWaitAfter: true }).catch(() => undefined);
    }
    try {
        const modal = page.locator('.vendor-announcement-modal').first();
        if (!(await modal.isVisible({ timeout: 500 }).catch(() => false))) return;
        const btn = modal.locator('button[aria-label="Close"]').first();
        if (await btn.isVisible().catch(() => false)) await btn.click().catch(() => undefined);
        else await page.keyboard.press('Escape').catch(() => undefined);
        await modal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => undefined);
    } catch { /* selector shape may change */ }
}

import { toPath } from '@utils/helpers';
const SERVER_URL = process.env.SERVER_URL ?? toPath(`wp-json`);
const DOKAN_PRO = process.env.DOKAN_PRO;

const { VENDOR, ADMIN, ADMIN_PASSWORD, USER_PASSWORD, CUSTOMER_ID, PRODUCT_ID, DB_HOST_NAME, DB_USER_NAME, DB_USER_PASSWORD, DATABASE, DB_PORT, DB_PREFIX } = process.env;

const basicAuth = (username: string, password: string) =>
    'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

const vendorAuth = { Authorization: basicAuth(VENDOR!, USER_PASSWORD!) };
const adminAuth = { Authorization: basicAuth(ADMIN!, ADMIN_PASSWORD!) };

// ============================================
// INLINE DB HELPERS
// ============================================

const dbPool = mysql.createPool({
    host: DB_HOST_NAME,
    user: DB_USER_NAME,
    password: DB_USER_PASSWORD,
    database: DATABASE,
    port: DB_PORT ? Number(DB_PORT) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

async function dbQuery(query: string, params?: unknown[]): Promise<unknown[]> {
    const connection = await dbPool.getConnection();
    try {
        const [result] = await connection.execute(query, params);
        return result as unknown[];
    } finally {
        connection.release();
    }
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
    const result = { ...target };
    for (const key of Object.keys(source)) {
        const s = source[key];
        const t = target[key];
        if (s !== null && typeof s === 'object' && !Array.isArray(s) && t !== null && typeof t === 'object' && !Array.isArray(t)) {
            result[key] = deepMerge(t as Record<string, unknown>, s as Record<string, unknown>);
        } else {
            result[key] = s;
        }
    }
    return result;
}

async function getOptionValue(optionName: string): Promise<Record<string, unknown>> {
    const prefix = DB_PREFIX ?? 'wp';
    const res = await dbQuery(`SELECT option_value FROM ${prefix}_options WHERE option_name = ?`, [optionName]) as Array<{ option_value: string }>;
    return unserialize(res[0]?.option_value ?? '') as Record<string, unknown>;
}

async function setOptionValue(optionName: string, optionValue: unknown): Promise<void> {
    const prefix = DB_PREFIX ?? 'wp';
    const serialized = !isSerialized(optionValue as string) ? serialize(optionValue) : optionValue;
    await dbQuery(
        `INSERT INTO ${prefix}_options (option_id, option_name, option_value, autoload) VALUES (NULL, ?, ?, 'yes') ON DUPLICATE KEY UPDATE option_value = ?`,
        [optionName, serialized, serialized]
    );
}

async function updateOptionValue(optionName: string, updatedSettings: Record<string, unknown>): Promise<void> {
    const current = await getOptionValue(optionName);
    const merged = deepMerge(current, updatedSettings);
    await setOptionValue(optionName, merged);
}

// ============================================
// INLINE API HELPERS
// ============================================

async function apiPost(requestContext: APIRequestContext, url: string, body: unknown, auth: Record<string, string>): Promise<unknown> {
    const response = await requestContext.post(url, { data: body as object, headers: auth });
    return await response.json();
}

async function apiPut(requestContext: APIRequestContext, url: string, body: unknown, auth: Record<string, string>): Promise<unknown> {
    const response = await requestContext.put(url, { data: body as object, headers: auth });
    return await response.json();
}

const createOrderPayload = {
    payment_method: 'bacs',
    payment_method_title: 'Direct Bank Transfer',
    set_paid: true,
    customer_id: CUSTOMER_ID ?? 0,
    billing: {
        first_name: 'customer1',
        last_name: 'c1',
        address_1: 'abc street',
        address_2: 'xyz street',
        city: 'New York',
        state: 'NY',
        postcode: '10003',
        country: 'US',
        email: 'customer1@email.com',
        phone: '(555) 555-5555',
    },
    shipping: {
        first_name: 'customer1',
        last_name: 'c1',
        address_1: 'abc street',
        address_2: 'xyz street',
        city: 'New York',
        state: 'NY',
        postcode: '10003',
        country: 'US',
    },
    line_items: [
        {
            product_id: PRODUCT_ID ?? '',
            quantity: 1,
        },
    ],
    shipping_lines: [
        {
            method_id: 'flat_rate',
            method_title: 'Flat Rate',
            total: '10.00',
        },
    ],
};

const createDownloadableProductPayload = () => ({
    name: `Downloadable_Product_${Date.now()}`,
    type: 'simple',
    downloadable: true,
    regular_price: '10',
    downloads: [],
});

const shippingStatusOptionName = 'dokan_shipping_status_setting';

// ============================================
// INLINE TYPES (no external interfaces)
// ============================================

interface OrderNote {
    note: string;
    noteType: string;
}

interface OrderTrackingDetails {
    shippingProvider: string;
    trackingNumber: string;
    dateShipped: string;
}

interface OrderShipmentDetails {
    shipmentOrderItem: string;
    shipmentOrderItemQty: string;
    shippingStatus: string;
    shippingProvider: string;
    dateShipped: string;
    trackingNumber: string;
    comments: string;
}

// ============================================
// INLINE HELPERS (no external utils)
// ============================================

const dateFormatFYJ = (date: string): string =>
    new Date(date).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

const currentDate = new Date().toLocaleDateString('en-CA');

const addDays = (date: string | number | Date | null, days: number, format = 'default'): string => {
    const result = date ? new Date(date) : new Date();
    result.setDate(result.getDate() + days);
    if (format === 'compact' || format === 'default') return result.toLocaleDateString('en-CA');
    return result.toLocaleDateString('en-CA');
};

const isPlainObject = (obj: unknown): obj is Record<string, unknown> =>
    typeof obj === 'object' && obj !== null && !Array.isArray(obj) && Object.getPrototypeOf(obj) === Object.prototype;

// ============================================
// SELECTORS (vendor orders – all in this file)
// ============================================

const ordersVendor = {
    menus: {
        all: '//ul[contains(@class,"order-statuses-filter")]//a[contains(text(), "All")]',
        completed: '//ul[contains(@class,"order-statuses-filter")]//a[contains(text(), "Completed")]',
        processing: '//ul[contains(@class,"order-statuses-filter")]//a[contains(text(), "Processing")]',
        onHold: '//ul[contains(@class,"order-statuses-filter")]//a[contains(text(), "On hold")]',
        pending: '//ul[contains(@class,"order-statuses-filter")]//a[contains(text(), "Pending")]',
        cancelled: '//ul[contains(@class,"order-statuses-filter")]//a[contains(text(), "Cancelled")]',
        refunded: '//ul[contains(@class,"order-statuses-filter")]//a[contains(text(), "Refunded")]',
        failed: '//ul[contains(@class,"order-statuses-filter")]//a[contains(text(), "Failed")]',
    },
    export: {
        exportAll: '//input[@name="dokan_order_export_all"]',
        exportFiltered: '//input[@name="dokan_order_export_filtered"]',
    },
    filters: {
        filterByCustomer: {
            dropDown: '.select2-selection .select2-selection__arrow',
            input: '.select2-search__field',
            searchedResult: '.select2-results__option--highlighted',
        },
        filterByDate: {
            dateRangeInput: 'input#order_filter_date_range',
            startDateInput: 'input#order_filter_start_date',
            endDateInput: 'input#order_filter_end_date',
        },
        filter: '//button[normalize-space()="Filter"]',
        reset: '//a[normalize-space()="Reset"]',
    },
    search: {
        searchInput: '//input[@placeholder="Search Orders"]',
        searchBtn: '//button[normalize-space()="Filter"]',
    },
    bulkActions: {
        selectAll: '#cb-select-all',
        selectAction: '#bulk-order-action-selector',
        applyAction: '#bulk-order-action',
    },
    table: {
        orderTable: '.dokan-table.dokan-table-striped',
        orderColumn: '//th[normalize-space()="Order"]',
        totalColumn: '//th[normalize-space()="Order Total"]',
        earningColumn: '//th[normalize-space()="Earning"]',
        statusColumn: '//th[normalize-space()="Status"]',
        customerColumn: '//th[normalize-space()="Customer"]',
        dateColumn: '//th[normalize-space()="Date"]',
        shipmentColumn: '//th[normalize-space()="Shipment"]',
        actionColumn: '//th[normalize-space()="Action"]',
    },
    numberOfRowsFound: '.dokan-table.dokan-table tbody tr',
    firstRow: '(//table//tbody//tr)[1]',
    firstRowOrderEarning: '(//table//tbody//tr)[1]//td[@class="dokan-order-earning"]',
    orderTotalTable: (orderNumber: string) => `//strong[contains(text(),'Order ${orderNumber}')]/../../..//td[@class='dokan-order-total']//bdi`,
    orderTotalAfterRefundTable: (orderNumber: string) => `///strong[contains(text(),'Order ${orderNumber}')]/../../..//td[@class='dokan-order-total']//ins//bdi`,
    vendorEarningTable: (orderNumber: string) => `//strong[contains(text(),'Order ${orderNumber}')]/../../..//td[@class='dokan-order-earning']//span[@class="woocommerce-Price-amount amount"]`,
    orderStatusTable: (orderNumber: string) => `//strong[contains(text(),'Order ${orderNumber}')]/../../..//td[@class='dokan-order-status']//span`,
    orderLink: (orderNumber: string) => `//strong[contains(text(),'Order ${orderNumber}')]/..`,
    processing: (orderNumber: string) => `//strong[contains(text(),'Order ${orderNumber}')]/../../..//a[@data-original-title='Processing']`,
    complete: (orderNumber: string) => `//strong[contains(text(),'Order ${orderNumber}')]/../../..//a[@data-original-title='Complete']`,
    view: (orderNumber: string) => `//strong[contains(text(),'Order ${orderNumber}')]/../../..//a[@data-original-title='View']`,
    orderDetails: {
        orderNumber: '//strong[contains(text(),"Order#")]',
        orderDate: '//span[contains(text(),"Order Date:")]/..',
        orderTotal: '//td[contains(text(),"Order Total:")]/..//bdi',
        orderTotalBeforeRefund: '//td[contains(text(),"Order Total:")]/..//del',
        orderTotalAfterRefund: '//td[contains(text(),"Order Total:")]/..//ins//bdi',
        discount: '//td[contains(text(),"Discount")]/..//bdi',
        shippingMethod: '//tr[contains(@class,"shipping")]//td[@class="name"]//div[@class="view"]',
        shippingCost: '//td[contains(text(),"Shipping")]/..//bdi',
        tax: '//td[contains(text(),"Tax")]/..//bdi',
        refunded: '.total.refunded-total bdi',
        total: '//th[contains(text(),"Total:")]/..//td//span[@class="woocommerce-Price-amount amount"]',
    },
    generalDetails: {
        generalDetailsDiv: '//strong[normalize-space()="General Details"]/../..',
        orderDetails: 'ul.list-unstyled.order-status',
        earningFromOrder: 'li.earning-from-order',
        earningAmount: 'li.earning-from-order span.amount',
        customerDetails: 'ul.list-unstyled.customer-details',
    },
    status: {
        currentOrderStatus: '.order-status .dokan-label',
        selectedOrderStatus: '//select[@id="order_status"]//option[@selected="selected"]',
        edit: '.dokan-edit-status',
        orderStatus: '#order_status',
        updateOrderStatus: '//input[@name="dokan_change_status"]',
    },
    orderNote: {
        orderNoteDiv: '//strong[normalize-space()="Order Notes"]/../..',
        orderNoteInput: '#add-note-content',
        orderNoteType: '#order_note_type',
        addNote: 'input[value="Add Note"]',
    },
    trackingDetails: {
        addTrackingNumber: '#dokan-add-tracking-number',
        shippingProvider: '#shipping_provider',
        trackingNumber: '#tracking_number',
        dateShipped: '#shipped-date',
        addTrackingDetails: '#add-tracking-details',
        cancelAddTrackingDetails: '#dokan-cancel-tracking-note',
    },
    shipment: {
        shipmentDiv: '//strong[normalize-space()="Shipments"]/../..',
        createNewShipment: '#create-tracking-status-action',
        shipmentOrderItem: (productName: string) => `//div[@id="dokan-order-shipping-status-tracking-panel"]//td//a[contains( text(),"${productName}")]/../..//input[@name="shipment_order_item_select"]`,
        shipmentOrderItemQty: (productName: string) => `//div[@id="dokan-order-shipping-status-tracking-panel"]//td//a[contains( text(),"${productName}")]/../..//input[@class="shipping_order_item_qty"]`,
        shippingStatus: 'select#shipment-status',
        shippingProvider: 'select#shipping_status_provider',
        dateShipped: 'input#shipped_status_date',
        trackingNumber: 'input#tracking_status_number',
        comments: 'textarea#tracking_status_comments',
        notifyCustomer: 'input#shipped_status_is_notify',
        createShipment: 'input#add-tracking-status-details',
        cancelCreateShipment: 'input#cancel-tracking-status-details',
    },
    downloadableProductPermission: {
        downloadableProductPermissionDiv: '//strong[normalize-space()="Downloadable Product Permission"]/../..',
        downloadableProductInput: '.select2-search__field',
        grantAccess: '.grant_access',
        revokeAccess: '.revoke_access',
        confirmAction: '.swal2-actions .swal2-confirm',
        cancelAction: '.swal2-actions .swal2-cancel',
    },
};

// ============================================
// URLS & KEYS (kept in this file)
// ============================================

const subUrls = {
    orders: 'dashboard/orders',
    ajax: '/admin-ajax.php',
};

const key = {
    enter: 'Enter',
};

// ============================================
// PAGE CLASS
// ============================================

export class OrdersPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ============================================
    // STATIC API HELPERS (setup / teardown)
    // ============================================

    static async createTestOrder(requestContext: APIRequestContext): Promise<string> {
        const payload = { ...createOrderPayload, customer_id: CUSTOMER_ID!, line_items: [{ product_id: PRODUCT_ID!, quantity: 1 }] };
        const orderBody = await apiPost(requestContext, `${SERVER_URL}/wc/v3/orders`, payload, adminAuth) as { id: number };
        const orderId = String(orderBody.id);
        await apiPut(requestContext, `${SERVER_URL}/dokan/v1/orders/${orderId}`, { status: 'wc-on-hold' }, vendorAuth);
        await requestContext.dispose();
        return orderId;
    }

    static async createDownloadableProduct(requestContext: APIRequestContext): Promise<string> {
        const body = await apiPost(requestContext, `${SERVER_URL}/dokan/v1/products`, createDownloadableProductPayload(), vendorAuth) as { name: string };
        await requestContext.dispose();
        return body.name;
    }

    static async enableShippingStatus(): Promise<void> {
        await updateOptionValue(shippingStatusOptionName, { enabled: 'on' });
    }

    static async disableShippingStatus(): Promise<void> {
        await updateOptionValue(shippingStatusOptionName, { enabled: 'off' });
    }

    // ============================================
    // TEST DATA (order-related, all in this file)
    // ============================================

    testData = {
        order: {
            orderStatus: {
                pending: 'wc-pending',
                processing: 'wc-processing',
                onhold: 'wc-on-hold',
                completed: 'wc-completed',
                cancelled: 'wc-cancelled',
                refunded: 'wc-refunded',
                failed: 'wc-failed',
            },
        },
        orderNote: {
            customer: {
                note: 'test order note',
                noteType: 'Customer note',
            },
            private: {
                note: 'test private order note',
                noteType: 'Private note',
            },
        },
        orderTrackingDetails: {
            shippingProvider: 'test shipping provider',
            trackingNumber: '1234567890',
            dateShipped: currentDate,
        },
        orderShipmentDetails: {
            shipmentOrderItem: 'p1_v1 (simple)',
            shipmentOrderItemQty: '1',
            shippingStatus: 'ss_proceccing',
            shippingProvider: 'sp-dhl',
            dateShipped: currentDate,
            trackingNumber: '1234567890',
            comments: 'test shipment comment',
        },
        date: {
            dateRange: {
                startDate: currentDate,
                endDate: addDays(currentDate, 1, 'compact'),
            },
        },
        customer: {
            username: process.env.CUSTOMER || 'customer1',
        },
    };

    // ============================================
    // INTERNAL HELPERS (no external base page)
    // ============================================

    private createUrl(subPath: string): string {
        return toPath(subPath);
    }

    private getCurrentUrl(): string {
        return this.page.url();
    }

    private isCurrentUrl(subPath: string): boolean {
        const url = new URL(this.getCurrentUrl());
        const currentURL = url.href.replace(/\/$/, '');
        return currentURL === this.createUrl(subPath);
    }

    private async gotoUrl(fullUrl: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'): Promise<void> {
        await this.page.goto(fullUrl, { waitUntil });
        await closeAnnouncementModal(this.page);
    }

    private async goIfNotThere(subPath: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'): Promise<void> {
        if (!this.isCurrentUrl(subPath)) {
            const url = this.createUrl(subPath);
            await expect(async () => {
                await this.gotoUrl(url, waitUntil);
                expect(this.getCurrentUrl()).toMatch(subPath);
            }).toPass();
        }
    }

    private acceptAlert(): void {
        this.page.once('dialog', dialog => void dialog.accept());
    }

    async waitForLoadState(state: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'): Promise<void> {
        await this.page.waitForLoadState(state);
    }

    async click(selector: string): Promise<void> {
        await this.page.locator(selector).click();
    }

    async press(keyName: string): Promise<void> {
        await this.page.keyboard.press(keyName);
    }

    async toBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeVisible();
    }

    async notToBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeHidden();
    }

    async toContainText(selector: string, text: string | RegExp): Promise<void> {
        await expect(this.page.locator(selector)).toContainText(text);
    }

    async toHaveCount(selector: string, count: number): Promise<void> {
        await expect(this.page.locator(selector)).toHaveCount(count);
    }

    async notToHaveCount(selector: string, count: number): Promise<void> {
        await this.page.waitForLoadState('domcontentloaded');
        await expect(this.page.locator(selector)).not.toHaveCount(count);
    }

    async clearAndType(selector: string, text: string): Promise<void> {
        await this.page.locator(selector).fill(text);
    }

    async setAttributeValue(selector: string, attribute: string, value: string): Promise<void> {
        const args: [string, string] = [attribute, value];
        await this.page.locator(selector).evaluate(
            (el, [attr, val]) => (el as HTMLElement).setAttribute(attr, val),
            args
        );
    }

    async selectByValue(selector: string, value: string): Promise<void> {
        await this.page.selectOption(selector, { value });
    }

    async selectByLabel(selector: string, value: string): Promise<void> {
        await this.page.selectOption(selector, { label: value });
    }

    async getElementText(selector: string): Promise<string | null> {
        return await this.page.locator(selector).textContent();
    }

    async clickAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<void> {
        const locator = this.page.locator(selector);
        await locator.scrollIntoViewIfNeeded();
        await locator.waitFor({ state: 'visible' });
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            locator.click(),
        ]);
    }

    async clickAndWaitForLoadState(selector: string, state: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'): Promise<void> {
        await Promise.all([this.waitForLoadState(state), this.page.locator(selector).click()]);
    }

    async clickAndWaitForDownload(selector: string): Promise<void> {
        await Promise.all([this.page.waitForEvent('download'), this.page.locator(selector).click()]);
    }

    async clickAndAcceptAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<void> {
        // Dokan switched order-action confirmations from native confirm() to SweetAlert2.
        // Fire the click, dismiss the SweetAlert, and wait for the ajax call in parallel.
        await this.page.locator(selector).click();
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator('.swal2-confirm').click({ timeout: 5000 }).catch(() => this.acceptAlert()),
        ]);
    }

    async clickAndAcceptAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200): Promise<void> {
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.acceptAlert(),
            this.waitForLoadState(),
            this.page.locator(selector).click(),
        ]);
    }

    async typeAndWaitForResponse(subUrl: string, selector: string, text: string, code = 200): Promise<void> {
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).fill(text),
        ]);
    }

    async multipleElementVisible(selectors: Record<string, unknown>): Promise<void> {
        for (const k of Object.keys(selectors)) {
            const v = selectors[k];
            if (isPlainObject(v)) {
                await this.multipleElementVisible(v as Record<string, unknown>);
            } else if (typeof v === 'function') {
                continue;
            } else if (typeof v === 'string') {
                await this.toBeVisible(v);
            }
        }
    }

    // ============================================
    // ORDER HELPER METHODS
    // ============================================

    async vendorOrdersRenderProperly(): Promise<void> {
        await this.goIfNotThere(subUrls.orders);
        await this.multipleElementVisible(ordersVendor.menus as Record<string, unknown>);
        await this.multipleElementVisible(ordersVendor.export as Record<string, unknown>);
        const { filterByCustomer, filterByDate, ...filters } = ordersVendor.filters;
        await this.toBeVisible(ordersVendor.filters.filterByCustomer.dropDown);
        await this.toBeVisible(ordersVendor.filters.filterByDate.dateRangeInput);
        await this.multipleElementVisible(filters as Record<string, unknown>);
        await this.multipleElementVisible(ordersVendor.search as Record<string, unknown>);
        await this.multipleElementVisible(ordersVendor.bulkActions as Record<string, unknown>);
        const { shipmentColumn, ...table } = ordersVendor.table;
        await this.multipleElementVisible(table as Record<string, unknown>);
        if (DOKAN_PRO) await this.toBeVisible(shipmentColumn);
    }

    async exportOrders(type: string): Promise<void> {
        await this.goIfNotThere(subUrls.orders);
        switch (type) {
            case 'all':
                await this.clickAndWaitForDownload(ordersVendor.export.exportAll);
                break;
            case 'filtered':
                await this.clickAndWaitForDownload(ordersVendor.export.exportFiltered);
                break;
            default:
                break;
        }
    }

    async searchOrder(orderNumber: string): Promise<void> {
        await this.goIfNotThere(subUrls.orders);
        await this.clearAndType(ordersVendor.search.searchInput, orderNumber);
        await this.clickAndWaitForResponse(subUrls.orders, ordersVendor.search.searchBtn);
        await this.toHaveCount(ordersVendor.numberOfRowsFound, 1);
        await this.toBeVisible(ordersVendor.orderLink(orderNumber));
    }

    async filterOrders(filterBy: string, inputValue: string | { startDate: string; endDate: string }): Promise<void> {
        await this.goIfNotThere(subUrls.orders);
        switch (filterBy) {
            case 'by-customer':
                await this.click(ordersVendor.filters.filterByCustomer.dropDown);
                await this.typeAndWaitForResponse(subUrls.ajax, ordersVendor.filters.filterByCustomer.input, inputValue as string);
                await this.click(ordersVendor.filters.filterByCustomer.searchedResult);
                break;
            case 'by-date':
                if (typeof inputValue !== 'string') {
                    await this.setAttributeValue(ordersVendor.filters.filterByDate.dateRangeInput, 'value', dateFormatFYJ(inputValue.startDate) + ' - ' + dateFormatFYJ(inputValue.endDate));
                    await this.setAttributeValue(ordersVendor.filters.filterByDate.startDateInput, 'value', inputValue.startDate);
                    await this.setAttributeValue(ordersVendor.filters.filterByDate.endDateInput, 'value', inputValue.endDate);
                }
                break;
            default:
                break;
        }
        await this.clickAndWaitForLoadState(ordersVendor.filters.filter);
        await this.notToHaveCount(ordersVendor.numberOfRowsFound, 0);
    }

    async goToOrderDetails(orderNumber: string): Promise<void> {
        await this.searchOrder(orderNumber);
        await this.clickAndWaitForLoadState(ordersVendor.view(orderNumber));
        await this.toContainText(ordersVendor.orderDetails.orderNumber, orderNumber);
    }

    async viewOrderDetails(orderNumber: string): Promise<void> {
        await this.goToOrderDetails(orderNumber);
        await this.toBeVisible(ordersVendor.orderDetails.orderNumber);
        await this.toBeVisible(ordersVendor.orderDetails.orderDate);
        if (DOKAN_PRO) {
            await this.toBeVisible(ordersVendor.orderDetails.orderTotal);
        } else {
            await this.toBeVisible(ordersVendor.orderDetails.total);
        }
        await this.multipleElementVisible(ordersVendor.generalDetails as Record<string, unknown>);
        await this.click(ordersVendor.status.edit);
        const { selectedOrderStatus, edit, ...status } = ordersVendor.status;
        await this.multipleElementVisible(status as Record<string, unknown>);
        await this.multipleElementVisible(ordersVendor.orderNote as Record<string, unknown>);
        if (DOKAN_PRO) {
            await this.click(ordersVendor.shipment.createNewShipment);
            const { createNewShipment, shipmentOrderItem, shipmentOrderItemQty, ...shipment } = ordersVendor.shipment;
            await this.multipleElementVisible(shipment as Record<string, unknown>);
        } else {
            await this.click(ordersVendor.trackingDetails.addTrackingNumber);
            const { addTrackingNumber, ...trackingDetails } = ordersVendor.trackingDetails;
            await this.multipleElementVisible(trackingDetails as Record<string, unknown>);
        }
        const { revokeAccess, confirmAction, cancelAction, ...downloadableProductPermission } = ordersVendor.downloadableProductPermission;
        await this.multipleElementVisible(downloadableProductPermission as Record<string, unknown>);
    }

    async updateOrderStatusOnTable(orderNumber: string, status: string): Promise<void> {
        await this.searchOrder(orderNumber);
        switch (status) {
            case 'wc-processing':
            case 'processing':
                await this.clickAndAcceptAndWaitForResponse(subUrls.ajax, ordersVendor.processing(orderNumber), 302);
                await this.notToBeVisible(ordersVendor.processing(orderNumber));
                break;
            case 'wc-completed':
            case 'complete':
                await this.clickAndAcceptAndWaitForResponse(subUrls.ajax, ordersVendor.complete(orderNumber), 302);
                await this.notToBeVisible(ordersVendor.complete(orderNumber));
                break;
            default:
                break;
        }
    }

    async updateOrderStatus(orderNumber: string, status: string): Promise<void> {
        await this.goToOrderDetails(orderNumber);
        await this.click(ordersVendor.status.edit);
        await this.selectByValue(ordersVendor.status.orderStatus, status);
        await this.clickAndAcceptAndWaitForResponse(subUrls.ajax, ordersVendor.status.updateOrderStatus);
        const currentStatus = await this.getElementText(ordersVendor.status.currentOrderStatus);
        expect(currentStatus?.toLowerCase()).toBe(status.split('-').pop());
    }

    async addOrderNote(orderNumber: string, note: OrderNote): Promise<void> {
        await this.goToOrderDetails(orderNumber);
        await this.clearAndType(ordersVendor.orderNote.orderNoteInput, note.note);
        await this.selectByLabel(ordersVendor.orderNote.orderNoteType, note.noteType);
        await this.clickAndAcceptAndWaitForResponse(subUrls.ajax, ordersVendor.orderNote.addNote);
    }

    async addTrackingDetails(orderNumber: string, details: OrderTrackingDetails): Promise<void> {
        await this.goToOrderDetails(orderNumber);
        await this.click(ordersVendor.trackingDetails.addTrackingNumber);
        await this.clearAndType(ordersVendor.trackingDetails.shippingProvider, details.shippingProvider);
        await this.press(key.enter);
        await this.clearAndType(ordersVendor.trackingDetails.trackingNumber, details.trackingNumber);
        await this.setAttributeValue(ordersVendor.trackingDetails.dateShipped, 'value', dateFormatFYJ(details.dateShipped));
        await this.clickAndAcceptAndWaitForResponse(subUrls.ajax, ordersVendor.trackingDetails.addTrackingDetails);
    }

    async addShipment(orderNumber: string, _shipmentDetails: OrderShipmentDetails): Promise<void> {
        await this.goToOrderDetails(orderNumber);
        const shipmentExists = await this.page.locator("//strong[normalize-space()='Shipment #1']").isVisible();
        if (shipmentExists) return;
        const createShipmentButton = await this.page.locator("//button[@id='create-tracking-status-action']").isVisible();
        if (!createShipmentButton) return;
        // Bypass the dokan-pro orders.js click handlers entirely — they've been
        // unreliable on CI in two ways:
        //   1. Clicking '#create-tracking-status-action' before the body-delegated
        //      handler is bound silently no-ops, so the tracking panel never shows.
        //   2. The shipment-item checkbox click handler relies on jQuery .toggle()
        //      timing that has missed synthetic events in CI.
        // Drive the visibility transitions ourselves via DOM, then waitFor visible
        // to confirm. Submit-time logic in orders.js only reads is(":checked") —
        // no events need to fire for the shipment to save.
        await this.page.locator('#dokan-order-shipping-status-tracking').waitFor({ state: 'attached' });
        await this.page.locator('.shipping_order_item_qty').first().waitFor({ state: 'attached' });
        await this.page.evaluate(() => {
            const panel = document.getElementById('dokan-order-shipping-status-tracking');
            if (panel) {
                panel.classList.remove('dokan-hide');
                panel.style.display = '';
            }
            const createBtn = document.getElementById('create-tracking-status-action');
            if (createBtn) (createBtn as HTMLElement).style.display = 'none';
            document.querySelectorAll<HTMLInputElement>('.shipment_order_item_select').forEach(cb => {
                cb.checked = true;
            });
            document.querySelectorAll<HTMLElement>('.shipping-tracking').forEach(c => {
                c.classList.remove('dokan-hide');
                c.style.display = '';
            });
        });
        const qtyInput = this.page.locator('.shipping_order_item_qty').first();
        await qtyInput.waitFor({ state: 'visible' });
        await qtyInput.fill('1');
        await this.page.locator('#shipment-status').selectOption({ label: 'Delivered' });
        await this.page.locator('#shipping_status_provider').selectOption({ label: 'DHL' });
        await this.page.locator(ordersVendor.shipment.dateShipped).fill(currentDate);
        await this.page.locator("//input[@id='tracking_status_number']").fill('1234567890');
        await this.page.locator("//input[@id='tracking_status_number']").press(key.enter);
        await this.page.locator("//textarea[@id='tracking_status_comments']").fill('Test Comment 1');
        await this.page.locator("//input[@id='add-tracking-status-details']").click();
        await this.page.waitForLoadState('load');
    }

    async addDownloadableProduct(orderNumber: string, downloadableProductName: string): Promise<void> {
        await this.goToOrderDetails(orderNumber);
        await this.clearAndType(ordersVendor.downloadableProductPermission.downloadableProductInput, downloadableProductName);
        await this.press(key.enter);
        await this.clickAndAcceptAndWaitForResponseAndLoadState(subUrls.ajax, ordersVendor.downloadableProductPermission.grantAccess);
    }

    async removeDownloadableProduct(orderNumber: string, downloadableProductName: string): Promise<void> {
        await this.addDownloadableProduct(orderNumber, downloadableProductName);
        await this.click(ordersVendor.downloadableProductPermission.revokeAccess);
        await this.clickAndAcceptAndWaitForResponse(subUrls.ajax, ordersVendor.downloadableProductPermission.confirmAction);
    }

    async orderBulkAction(action: string, orderNumber?: string): Promise<void> {
        if (orderNumber) {
            await this.searchOrder(orderNumber);
        } else {
            await this.goIfNotThere(subUrls.orders);
        }
        await this.click(ordersVendor.bulkActions.selectAll);
        switch (action) {
            case 'onhold':
                await this.selectByValue(ordersVendor.bulkActions.selectAction, 'wc-on-hold');
                break;
            case 'processing':
                await this.selectByValue(ordersVendor.bulkActions.selectAction, 'wc-processing');
                break;
            case 'completed':
                await this.selectByValue(ordersVendor.bulkActions.selectAction, 'wc-completed');
                break;
            default:
                break;
        }
        await this.clickAndAcceptAndWaitForResponseAndLoadState(subUrls.orders, ordersVendor.bulkActions.applyAction);
    }

    async waitForPageReady(): Promise<void> {
        await this.page.waitForLoadState('load');
    }
}
