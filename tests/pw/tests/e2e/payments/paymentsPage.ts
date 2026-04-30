import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const testData = {
    payment: {
        currency: { dollar: '$' },
    } as any,
    vendor: { payment: {} as any },
    paymentSettings: { bank: {} as any },
};

export const payloads = {
    moduleIds: {
        mangopay: 'mangopay',
        paypalMarketplace: 'paypal_marketplace',
        razorpay: 'razorpay',
        stripe: 'stripe',
        stripeExpress: 'stripe_express',
    },
    adminAuth: {} as Record<string, string>,
    vendorAuth: {} as Record<string, string>,
    currency: { update: [{ id: 'woocommerce_currency', value: 'USD' }] },
    defaultStoreSettings: {} as any,
};

export const db = {
    async updateUserMeta(_u: string, _k: string, _v: any): Promise<void> {},
    async dispose(): Promise<void> {},
};

export const api = {
    async init(): Promise<void> {},
    async dispose(): Promise<void> {},
    async activateModules(_m: any, _a: any): Promise<void> {},
    async deactivateModules(_m: any, _a: any): Promise<void> {},
    async updateBatchWcSettingsOptions(_g: string, _p: any, _a: any): Promise<void> {},
    async setStoreSettings(_s: any, _a: any): Promise<void> {},
};

export const helpers = {
    emptyObjectValues(_o: any): any { return {}; },
};

export class PaymentsPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async setCurrency(_c: string): Promise<void> {}
    async setupBasicPaymentMethods(_p: any): Promise<void> {}
    async enableMangoPayModule(): Promise<void> {}
    async disableMangoPayModule(): Promise<void> {}
    async enablePayPalMarketplaceModule(): Promise<void> {}
    async disablePayPalMarketplaceModule(): Promise<void> {}
    async enableRazorpayModule(): Promise<void> {}
    async disableRazorpayModule(): Promise<void> {}
    async enableStripeConnectModule(): Promise<void> {}
    async disableStripeConnectModule(): Promise<void> {}
    async enableStripeExpressModule(): Promise<void> {}
    async disableStripeExpressModule(): Promise<void> {}
    async setupStripeConnect(_p: any): Promise<void> {}
    async setupPaypalMarketPlace(_p: any): Promise<void> {}
    async setupMangoPay(_p: any): Promise<void> {}
    async setupRazorpay(_p: any): Promise<void> {}
    async setupStripeExpress(_p: any): Promise<void> {}
    async vendorPaymentSettingsRenderProperly(): Promise<void> {}
    async addBasicPayment(_p: any): Promise<void> {}
    async removeBasicPayment(_p: any): Promise<void> {}
    async addBankTransfer(_p: any): Promise<void> {}
}
