import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    order: { orderStatus: { processing: 'processing', completed: 'completed' } },
    reverseWithdraw: {} as any,
    date: { dateRange: {} as any },
    header: { userAuth: (_n: string): any => ({}) },
};

export const dbData = {
    testData: { dokan: { reverseWithdrawalFailedActions: {} as any } },
};

export const payloads = {
    adminAuth: {} as Record<string, string>,
    createStore: (): any => ({}),
    createProduct: (): any => ({}),
    createOrderCod: {} as any,
    userAuth: (_n: string): any => ({}),
};

export const helpers = {
    previousDate: (): string => '',
};

export const dbUtils = {
    async setUserMeta(_id: string, _k: string, _v: any, _s: boolean): Promise<void> {},
    async updateUserMeta(_id: string, _k: string, _v: any, _s: boolean): Promise<void> {},
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async createStore(_p: any, _a: any, _login: boolean): Promise<[any, string, string, string]> { return [null, '', '', '']; }
    async createProduct(_p: any, _a: any): Promise<[any, string, string]> { return [null, '', '']; }
    async createOrderWithStatus(_p: any, _o: any, _s: string, _a: any): Promise<[any, any, string]> { return [null, null, '']; }
    async updateOrderStatus(_id: string, _s: string, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class ReverseWithdrawsPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async adminReverseWithdrawRenderProperly(): Promise<void> {}
    async filterReverseWithdraws(_s: string): Promise<void> {}
    async clearFilterReverseWithdraws(_s: string): Promise<void> {}
    async addReverseWithdrawal(_d: any): Promise<void> {}
    async vendorReverseWithdrawalRenderProperly(): Promise<void> {}
    async vendorViewReverseWithdrawalNotice(_t: string): Promise<void> {}
    async vendorViewReverseWithdrawalAnnouncement(): Promise<void> {}
    async vendorFilterReverseWithdrawals(_d: any): Promise<void> {}
    async vendorCantWithdraw(): Promise<void> {}
    async vendorProductsInCatalogMode(_v: string): Promise<void> {}
    async vendorPayReversePayBalance(): Promise<string> { return ''; }
}
