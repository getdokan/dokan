import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    predefined: {
        spmv: { productName: () => '' },
        vendorStores: { vendor1: '' },
        simpleProduct: { product1: { name: '' } },
    },
};

export const payloads = {
    moduleIds: { spmv: 'spmv' },
    adminAuth: {} as Record<string, string>,
    vendorAuth: {} as Record<string, string>,
    vendor2Auth: {} as Record<string, string>,
    createProduct: () => ({} as any),
    createBookableProduct: () => ({} as any),
    createAuctionProduct: () => ({} as any),
};

export const dbData = {
    dokan: {
        optionName: { selling: 'dokan_selling' },
        sellingSettings: {} as any,
    },
};

export const dbUtils = {
    async updateOptionValue(_n: string, _v: any): Promise<void> {},
    async setOptionValue(_n: string, _v: any): Promise<void> {},
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async createProduct(_p: any, _a: any): Promise<[any, string, string]> { return [null, '', '']; }
    async addSpmvProductToStore(_id: string, _a: any): Promise<void> {}
    async createBookableProduct(_p: any, _a: any): Promise<[any, string, string]> { return [null, '', '']; }
    async activateModules(_m: any, _a: any): Promise<void> {}
    async deactivateModules(_m: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class SpmvPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async enableSpmvModule(): Promise<void> {}
    async disableSpmvModule(): Promise<void> {}
    async assignSpmvProduct(_id: string, _v: string): Promise<void> {}
    async vendorSpmvRenderProperly(): Promise<void> {}
    async searchSimilarProduct(_n: string, _t: string): Promise<void> {}
    async goToProductEditFromSpmv(_n: string): Promise<void> {}
    async sortSpmvProduct(_s: string): Promise<void> {}
    async cloneProduct(_n: string): Promise<void> {}
    async cloneProductViaSellItemButton(_n: string): Promise<void> {}
    async viewOtherAvailableVendors(_n: string): Promise<void> {}
    async viewOtherAvailableVendor(_n: string, _v: string): Promise<void> {}
    async viewOtherAvailableVendorProduct(_n: string, _v: string): Promise<void> {}
    async addToCartOtherAvailableVendorsProduct(_n: string, _v: string): Promise<void> {}
}
