import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    predefined: { vendorStores: { vendor1: '' } },
    vendor: {
        withdraw: {
            defaultWithdrawMethod: { paypal: '', bankTransfer: '' },
        } as any,
    },
};

export const payloads = {
    adminAuth: {} as Record<string, string>,
    vendorAuth: {} as Record<string, string>,
    createOrder: {} as any,
    createWithdraw: {} as any,
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async getMinimumWithdrawLimit(_a: any): Promise<[string, string]> { return ['', '']; }
    async createOrderWithStatus(_p: any, _o: any, _s: string, _a: any): Promise<void> {}
    async createWithdraw(_p: any, _a: any): Promise<void> {}
    async cancelWithdraw(_id: string, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class WithdrawsPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async adminWithdrawsRenderProperly(): Promise<void> {}
    async filterWithdraws(_v: string, _t: string): Promise<void> {}
    async exportWithdraws(): Promise<void> {}
    async addNoteWithdrawRequest(_n: string, _m: string): Promise<void> {}
    async updateWithdrawRequest(_n: string, _a: string): Promise<void> {}
    async withdrawBulkAction(_a: string): Promise<void> {}
    async vendorWithdrawRenderProperly(): Promise<void> {}
    async vendorWithdrawRequestsRenderProperly(): Promise<void> {}
    async requestWithdraw(_w: any): Promise<void> {}
    async cantRequestWithdraw(): Promise<void> {}
    async cancelWithdrawRequest(): Promise<void> {}
    async addAutoWithdrawDisbursementSchedule(_w: any): Promise<void> {}
    async addDefaultWithdrawPaymentMethods(_m: string): Promise<void> {}
}
