import type { Locator, Page, Response } from '@playwright/test';
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

    async cell(orderId: string, header: 'Order Total' | 'Earning' | 'Status' | 'Customer'): Promise<Locator> {
        return this.table.cell(this.row(orderId), header);
    }
}
