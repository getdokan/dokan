import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    sellerBadge: {
        eventName: { productsPublished: '', numberOfItemsSold: '', exclusiveToPlatform: '', featuredProducts: '' },
        badgeName: '',
    } as any,
    predefined: { vendorStores: { vendor1: '' } },
};

export const payloads = {
    moduleIds: { sellerBadge: 'seller_badge' },
    adminAuth: {} as Record<string, string>,
    createSellerBadgeProductsPublished: {} as any,
    createSellerBadgeExclusiveToPlatform: {} as any,
    createSellerBadgeFeatureProducts: {} as any,
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async createSellerBadge(_p: any, _a: any): Promise<void> {}
    async getSellerBadgeId(_e: string, _a: any): Promise<any> { return null; }
    async deleteSellerBadge(_id: any, _a: any): Promise<void> {}
    async activateModules(_m: any, _a: any): Promise<void> {}
    async deactivateModules(_m: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class SellerBadgesPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async enableSellerBadgeModule(): Promise<void> {}
    async disableSellerBadgeModule(): Promise<void> {}
    async adminSellerBadgeRenderProperly(): Promise<void> {}
    async previewSellerBadge(_e: string): Promise<void> {}
    async viewSellerBadge(_e: string): Promise<void> {}
    async searchSellerBadge(_e: string): Promise<void> {}
    async createSellerBadge(_d: any): Promise<void> {}
    async editSellerBadge(_d: any): Promise<void> {}
    async filterVendorsByBadge(_e: string): Promise<void> {}
    async sellerBadgeVendors(_e: string): Promise<void> {}
    async sellerBadgeAcquiredByVendor(_v: string): Promise<void> {}
    async updateSellerBadge(_e: string, _a: string): Promise<void> {}
    async sellerBadgeBulkAction(_a: string, _e: string): Promise<void> {}
    async vendorSellerBadgeRenderProperly(): Promise<void> {}
    async sellerBadgeCongratsPopup(): Promise<void> {}
    async vendorSearchSellerBadge(_e: string): Promise<void> {}
    async filterSellerBadges(_f: string): Promise<void> {}
}
