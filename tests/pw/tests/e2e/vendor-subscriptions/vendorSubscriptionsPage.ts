import { Page } from '@playwright/test';

export const data = {
    vendor: { vendorInfo: {} as any },
    vendorSetupWizard: {} as any,
    order: { orderStatus: { completed: 'completed' } },
};

export const payloads = {
    moduleIds: { vendorSubscription: 'vendor-subscription' },
    adminAuth: {} as Record<string, string>,
    vendorAuth: {} as Record<string, string>,
    createDokanSubscriptionProduct: () => ({} as any),
    saveVendorSubscriptionProductCommission: {} as any,
    createStore: () => ({} as any),
};

export const dbData = {
    dokan: {
        optionName: { vendorSubscription: '' },
        vendorSubscriptionSettings: {} as any,
    },
};

export const dbUtils = {
    async setOptionValue(_k: string, _v: any): Promise<void> {},
    async updateProductType(_id: string): Promise<void> {},
    async setUserMeta(_id: string, _k: string, _v: any): Promise<void> {},
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async createProduct(_p: any, _a: any): Promise<[any, string, string]> { return [null, '', '']; }
    async saveCommissionToSubscriptionProduct(_id: string, _p: any, _a: any): Promise<void> {}
    async assignSubscriptionToVendor(_id: string): Promise<[string, string, string, string]> { return ['', '', '', '']; }
    async createStore(_p: any, _a: any, _b?: boolean): Promise<[any, string, string, string]> { return [null, '', '', '']; }
    async updateOrderStatus(_id: string, _s: string, _a: any): Promise<void> {}
    async activateModules(_m: any, _a: any): Promise<void> {}
    async deactivateModules(_m: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class VendorPage {
    constructor(readonly page: Page) {}
    async vendorRegister(_i: any, _w: any): Promise<void> {}
}

export class VendorSubscriptionsPage {
    constructor(readonly page: Page) {}
    async enableVendorSubscriptionModule(): Promise<void> {}
    async disableVendorSubscriptionModule(): Promise<void> {}
    async subscriptionsRenderProperly(): Promise<void> {}
    async filterSubscribedVendors(_n: string, _t: string): Promise<void> {}
    async cancelSubscription(_n: string, _t: string): Promise<void> {}
    async subscriptionsBulkAction(_a: string, _n: string): Promise<void> {}
    async assignSubscriptionPack(_id: string, _p: string): Promise<void> {}
    async vendorSubscriptionsRenderProperly(): Promise<void> {}
    async buySubscription(_v: string, _p: string, _s?: boolean): Promise<string> { return ''; }
    async assertSubscription(_p: string): Promise<void> {}
    async vendorCancelSubscription(_n: string): Promise<void> {}
}
