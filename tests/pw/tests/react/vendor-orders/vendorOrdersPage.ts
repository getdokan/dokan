import { expect, type Locator, type Page, type Response } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';
import { DataViewsTable } from '../_shared/dataViewsTable';

/** React vendor Orders list: /dashboard/new/#/orders (src/dashboard/orders/OrderList.tsx). */
export class VendorOrdersPage {
    readonly table: DataViewsTable;

    constructor(readonly page: Page) {
        this.table = new DataViewsTable(page, '/dokan/v1/orders', 'Search Orders');
    }

    async goto(): Promise<void> {
        await closeAnnouncementModal(this.page);
        const listed = this.page.waitForResponse(r => r.request().method() === 'GET' && /\/dokan\/v1\/orders\?/.test(decodeURIComponent(r.url())));
        await this.page.goto('dashboard/new/#/orders');
        await listed;
        await this.table.settled();
    }

    row(orderId: string): Locator {
        return this.table.rowByLink(`#${orderId}`);
    }

    /** Search the list down to one order, so actions never depend on how many orders the site holds. */
    async find(orderId: string): Promise<Locator> {
        await this.table.search(orderId);
        return this.row(orderId);
    }

    async changeStatus(orderId: string, status: string): Promise<Response> {
        return this.table.rowAction(await this.find(orderId), `Change status to ${status}`);
    }

    /** Order ids of the rows on the current page of the list. */
    async rowIds(): Promise<string[]> {
        return (await this.table.rows.getByRole('link', { name: /^#\d+$/ }).allInnerTexts()).map(t => t.replace('#', ''));
    }

    async filterByCustomer(search: string, option: RegExp): Promise<void> {
        await this.table.openFilter('Customer');
        // react-select renders its placeholder as text, so target the filter's combobox input.
        await this.page.locator('input[role="combobox"]').last().fill(search);
        await this.table.refetch(() => this.page.getByRole('option', { name: option }).first().click(), 'customer_id=');
    }

    /** Date Range filter: one click on each day of the visible month (react-dates), then Ok. */
    async filterByDays(startDay: number, endDay: number): Promise<void> {
        await this.table.openFilter('Date Range');
        await this.page.locator('input[placeholder="Enter Date"]').first().click();
        const day = (n: number) => this.page.locator('td.CalendarDay:visible').filter({ hasText: new RegExp(`^${n}$`) }).first();
        await day(startDay).click();
        await day(endDay).click();
        await this.table.refetch(() => this.page.getByRole('button', { name: 'Ok', exact: true }).click(), 'after=');
    }

    /**
     * Export through the header dropdown and return the CSV the server sends. The export is a hidden form POST that
     * headless Chromium never turns into a download, so the POST is intercepted, fetched for real, and answered with 204.
     */
    async exportCsv(which: 'Export All' | 'Export Filtered'): Promise<string> {
        let csv: Promise<string> | undefined;
        const isExport = (r: { method(): string; postData(): string | null }) => r.method() === 'POST' && (r.postData() ?? '').includes('dokan_vendor_order_export_nonce');
        await this.page.route('**/*', async route => {
            if (!isExport(route.request())) return route.fallback();
            const response = await route.fetch();
            csv = response.text();
            await route.fulfill({ status: 204 });
        });
        const posted = this.page.waitForRequest(isExport);
        await this.page.getByRole('button', { name: 'Export All' }).first().click();
        await this.page.getByRole('button', { name: which, exact: true }).last().click();
        await posted;
        await expect.poll(() => csv !== undefined).toBe(true);
        return csv!;
    }

    async cell(orderId: string, header: 'Order Total' | 'Earning' | 'Status' | 'Customer'): Promise<Locator> {
        return this.table.cell(this.row(orderId), header);
    }
}

/** First column ("Order No") of every data record in an order export CSV. Handles quoted fields with commas and newlines. */
export function csvOrderIds(csv: string): string[] {
    const ids: string[] = [];
    let field = '';
    let column = 0;
    let quoted = false;
    for (let i = 0; i < csv.length; i++) {
        const c = csv[i];
        if (quoted) {
            if (c === '"' && csv[i + 1] === '"') { field += '"'; i++; }
            else if (c === '"') quoted = false;
            else field += c;
        } else if (c === '"') quoted = true;
        else if (c === ',') { if (column === 0) ids.push(field); column++; field = ''; }
        else if (c === '\n' || c === '\r') {
            if (column === 0 && field) ids.push(field);
            if (c === '\r' && csv[i + 1] === '\n') i++;
            column = 0; field = '';
        } else field += c;
    }
    if (column === 0 && field) ids.push(field);
    return ids.slice(1).map(id => id.replace(/^#/, '').trim());
}
