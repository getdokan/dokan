import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    predefined: { vendorStores: { vendor1: '' } },
    vendor: { vendorInfo: { sendEmail: {} as any } } as any,
};

export const payloads = {
    adminAuth: {} as Record<string, string>,
    vendorAuth: {} as Record<string, string>,
    createStore: () => ({} as any),
    createOrder: {} as any,
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async createStore(_p: any, _a: any): Promise<[any, string, string]> { return [null, '', '']; }
    async updateStoreStatus(_id: string, _s: any, _a: any): Promise<void> {}
    async createOrder(_p: any, _o: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class StoresPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async adminVendorsRenderProperly(): Promise<void> {}
    async viewVendorDetails(_v: any): Promise<void> {}
    async emailVendor(_v: any, _e: any): Promise<void> {}
    async addVendor(_v: any): Promise<void> {}
    async searchVendor(_s: string): Promise<void> {}
    async filterVendors(_f: string): Promise<void> {}
    async updateVendor(_n: string, _a: string): Promise<void> {}
    async editVendor(_v: any, _d: any): Promise<void> {}
    async viewVendor(_v: string, _t: string): Promise<void> {}
    async vendorBulkAction(_a: string): Promise<void> {}
}
