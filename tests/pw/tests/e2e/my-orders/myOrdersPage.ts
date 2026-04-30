import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const testData = {
    orderStatus: { completed: 'completed', pending: 'pending' },
    orderNote: () => 'test note ' + Math.random().toString(36).slice(2, 8),
};

export const payloads = {
    createOrder: {} as any,
    createOrderNoteForCustomer: {} as any,
    vendorAuth: {} as Record<string, string>,
};

export const api = {
    async init(): Promise<void> {},
    async dispose(): Promise<void> {},
    async createOrderWithStatus(_p: any, _o: any, _s: string, _a: any): Promise<[any, any, string]> { return [{}, {}, '0']; },
    async createOrderNote(_p: any, _o: any, _n: any, _a: any): Promise<[any, string]> { return [{}, '0']; },
};

export class MyOrdersPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async myOrdersRenderProperly(): Promise<void> {}
    async viewOrderDetails(_id: string): Promise<void> {}
    async viewOrderNote(_id: string, _note: string): Promise<void> {}
    async payPendingOrder(_id: string, _method: string): Promise<void> {}
    async cancelPendingOrder(_id: string): Promise<void> {}
    async orderAgain(_id: string): Promise<void> {}
}
