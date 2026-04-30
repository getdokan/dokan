import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    pageTitle: '',
    dokanShortcodes: { dashboard: '' },
};

export const payloads = {
    adminAuth: {} as Record<string, string>,
    dashboardShortcode: {} as any,
    dokanSubscriptionPackShortcode: {} as any,
    vendorRegistrationShortcode: {} as any,
    vendorOnboardingShortcode: {} as any,
    bestSellingProductShortcode: {} as any,
    topRatedProductShortcode: {} as any,
    customerMigrationShortcode: {} as any,
    geolocationFilterFormShortcode: {} as any,
    productAdvertisementShortcode: {} as any,
    storesShortcode: {} as any,
    myOrdersShortcode: {} as any,
    requestQuoteShortcode: {} as any,
    createProduct: () => ({} as any),
};

export const dbData = {
    dokan: {
        optionName: { vendorSubscription: 'dokan_product_subscription' },
        vendorSubscriptionSettings: {} as any,
    },
};

export const dbUtils = {
    async updateOptionValue(_n: string, _v: any): Promise<void> {},
    async setOptionValue(_n: string, _v: any): Promise<void> {},
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async createPage(_p: any, _a: any): Promise<[{ link: string }, any]> { return [{ link: '' }, null]; }
    async deletePage(_id: any, _a: any): Promise<void> {}
    async createProductAdvertisement(_p: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class ShortcodePage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async createPageWithShortcode(_t: string, _s: string): Promise<void> {}
    async viewDashboard(_l: string): Promise<void> {}
    async viewDokanSubscriptionPacks(_l: string): Promise<void> {}
    async viewVendorRegistrationForm(_l: string): Promise<void> {}
    async viewVendorOnboardingForm(_l: string): Promise<void> {}
    async viewProducts(_l: string): Promise<void> {}
    async viewMigrationForm(_l: string): Promise<void> {}
    async viewGeolocationFilterForm(_l: string): Promise<void> {}
    async viewAdvertisedProducts(_l: string): Promise<void> {}
    async viewStores(_l: string): Promise<void> {}
    async viewMyOrders(_l: string): Promise<void> {}
    async viewRequestQuote(_l: string): Promise<void> {}
}
