import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export class newCouponsPage {
    readonly page: Page;
    readonly testData = { product: { name: 'p1_v1 (simple)' } };
    constructor(page: Page) { this.page = page; void closeAnnouncementModal(page); }
    async cleanupTestCoupons(): Promise<void> {}
    async createMarketplaceCoupon(): Promise<void> {}
    async verifyMarketplaceCouponFormValues(): Promise<void> {}
    async verifyMarketplaceCouponCreated(): Promise<void> {}
    async searchAndViewCoupon(_code: string): Promise<void> {}
    async viewMarketplaceCoupons(): Promise<void> {}
    async createVendorCoupon(): Promise<void> {}
    async buyProductWithCoupon(_name: string, _code: string): Promise<void> {}
}
