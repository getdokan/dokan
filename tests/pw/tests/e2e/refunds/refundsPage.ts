import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    order: { orderStatus: { processing: 'processing', completed: 'completed' } },
    predefined: { vendorStores: { vendor1: '' }, simpleProduct: { product1: { name: '' } } },
};

export const payloads = {
    vendorAuth: {} as Record<string, string>,
    createOrder: {} as any,
};

export const dbUtils = {
    async createRefundRequest(_b: any): Promise<void> {},
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async createOrderWithStatus(_p: any, _o: any, _s: string, _a: any): Promise<[any, any, string]> { return [null, null, '']; }
    async dispose(): Promise<void> {}
}

export class RefundsPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async adminRefundRequestsRenderProperly(): Promise<void> {}
    async searchRefundRequests(_q: string): Promise<void> {}
    async updateRefundRequests(_id: string, _a: string): Promise<void> {}
    async refundRequestsBulkAction(_a: string): Promise<void> {}
    async refundOrder(_id: string, _n: string, _partial?: boolean): Promise<void> {}
}
