import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    customer: { username: '', customerInfo: { shipping: {} as any } },
    date: { previousDate: '' },
    predefined: { simpleSubscription: { product1: {} as any } },
};

export const payloads = {
    moduleIds: { productSubscription: 'product-subscription' },
    adminAuth: {} as Record<string, string>,
    vendorAuth: {} as Record<string, string>,
    createSimpleSubscriptionProduct: () => ({} as any),
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async createProduct(_p: any, _a: any): Promise<void> {}
    async activateModules(_m: any, _a: any): Promise<void> {}
    async deactivateModules(_m: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class VendorProductSubscriptionPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async enableProductSubscriptionModule(): Promise<void> {}
    async disableProductSubscriptionModule(): Promise<void> {}
    async vendorUserSubscriptionsRenderProperly(): Promise<void> {}
    async filterProductSubscriptions(_t: string, _v: string): Promise<void> {}
    async viewProductSubscription(_u: string): Promise<void> {}
    async customerViewProductSubscription(_id: string): Promise<void> {}
    async cancelProductSubscription(_id: string): Promise<void> {}
    async reactivateProductSubscription(_id: string): Promise<void> {}
    async changeAddressOfProductSubscription(_id: string, _s: any): Promise<void> {}
    async changePaymentOfProductSubscription(_id: string): Promise<void> {}
    async renewProductSubscription(_id: string): Promise<void> {}
    async buyProductSubscription(_p: any): Promise<void> {}
}
