import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export type responseBody = { order_key: string };

export const data = {
    predefined: { vendorStores: { vendor1: '' }, simpleProduct: { product1: { name: '' } } },
    storeSupport: {
        title: '',
        filter: { byVendor: '', byCustomer: '' },
        chatReply: { asAdmin: '', asVendor: '', reply: '' },
    },
    customer: { getSupport: {} as any, supportTicket: {} as any },
    order: { orderStatus: { completed: 'completed' } },
    date: { dateRange: {} as any },
};

export const payloads = {
    moduleIds: { storeSupport: 'store_support' },
    adminAuth: {} as Record<string, string>,
    vendorAuth: {} as Record<string, string>,
    createSupportTicket: {} as any,
    createOrder: {} as any,
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async activateModules(_m: any, _a: any): Promise<void> {}
    async deactivateModules(_m: any, _a: any): Promise<void> {}
    async createSupportTicket(_p: any): Promise<[any, string]> { return [null, '']; }
    async updateSupportTicketEmailNotification(_id: string, _p: any, _a: any): Promise<void> {}
    async createOrderWithStatus(_p: any, _o: any, _s: string, _a: any): Promise<[any, responseBody, string]> { return [null, { order_key: '' }, '']; }
    async dispose(): Promise<void> {}
}

export class StoreSupportsPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async enableStoreSupportModule(_v: string): Promise<void> {}
    async disableStoreSupportModule(_v: string): Promise<void> {}
    async adminStoreSupportRenderProperly(): Promise<void> {}
    async decreaseUnreadSupportTicketCount(_id: string): Promise<void> {}
    async adminViewSupportTicketDetails(_id: string): Promise<void> {}
    async searchSupportTicket(_s: string): Promise<void> {}
    async filterSupportTickets(_v: string, _t: string): Promise<void> {}
    async replySupportTicket(_id: string, _r: string): Promise<void> {}
    async updateSupportTicketEmailNotification(_id: string, _a: string): Promise<void> {}
    async closeSupportTicket(_id: string): Promise<void> {}
    async reopenSupportTicket(_id: string): Promise<void> {}
    async storeSupportBulkAction(_a: string, _id: string): Promise<void> {}
    async customerStoreSupportRenderProperly(): Promise<void> {}
    async customerViewSupportTicketDetails(_id: string): Promise<void> {}
    async storeSupport(_t: string, _s: any, _m: string): Promise<void> {}
    async viewOrderReferenceNumberOnSupportTicket(_id: string, _o: string): Promise<void> {}
    async sendMessageToSupportTicket(_id: string, _s: any): Promise<void> {}
    async cantSendMessageToSupportTicket(_id: string): Promise<void> {}
    async vendorStoreSupportRenderProperly(): Promise<void> {}
    async vendorViewSupportTicketDetails(_id: string): Promise<void> {}
    async vendorFilterSupportTickets(_t: string, _v: any): Promise<void> {}
    async vendorSearchSupportTicket(_s: string): Promise<void> {}
    async vendorReplySupportTicket(_id: string, _r: string): Promise<void> {}
    async vendorCloseSupportTicket(_id: string): Promise<void> {}
    async vendorReopenSupportTicket(_id: string): Promise<void> {}
    async vendorCloseSupportTicketWithReply(_id: string, _r: string): Promise<void> {}
    async vendorReopenSupportTicketWithReply(_id: string, _r: string): Promise<void> {}
}
