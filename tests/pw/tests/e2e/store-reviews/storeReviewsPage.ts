import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    predefined: { vendorStores: { vendor1: '' } },
    storeReview: { review: () => ({} as any), filter: { byVendor: '' } },
};

export const payloads = {
    moduleIds: { storeReviews: 'store_reviews' },
    adminAuth: {} as Record<string, string>,
    customerAuth: {} as Record<string, string>,
    createStoreReview: {} as any,
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async updateBatchStoreReviews(_a: string, _i: any[], _auth: any): Promise<void> {}
    async createStoreReview(_v: any, _p: any, _a: any): Promise<[any, string]> { return [null, '']; }
    async deleteStoreReview(_id: string, _a: any): Promise<void> {}
    async activateModules(_m: any, _a: any): Promise<void> {}
    async deactivateModules(_m: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class StoreReviewsPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async enableStoreReviewsModule(_v: string): Promise<void> {}
    async disableStoreReviewsModule(_v: string): Promise<void> {}
    async adminStoreReviewsRenderProperly(): Promise<void> {}
    async viewStoreReview(): Promise<void> {}
    async editStoreReview(_r: any): Promise<void> {}
    async filterStoreReviews(_f: string): Promise<void> {}
    async updateStoreReview(_a: string): Promise<void> {}
    async storeReviewsBulkAction(_a: string): Promise<void> {}
    async reviewStore(_v: string, _r: any, _a: string): Promise<void> {}
    async viewOwnReview(_v: string): Promise<void> {}
    async cantReviewOwnStore(_v: string): Promise<void> {}
}
