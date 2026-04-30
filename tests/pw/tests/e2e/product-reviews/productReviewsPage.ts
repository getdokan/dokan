import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const payloads = {
    vendorAuth: {} as Record<string, string>,
    createProductReview: (): any => ({}),
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async createProductReview(_p: any, _d: any, _a: any): Promise<[any, any, string]> { return [null, 0, '']; }
    async dispose(): Promise<void> {}
}

export class ProductReviewsPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async vendorProductReviewsRenderProperly(): Promise<void> {}
    async viewProductReview(_m: string): Promise<void> {}
    async updateProductReview(_a: string, _m: string): Promise<void> {}
    async productReviewsBulkActions(_a: string): Promise<void> {}
}
