import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    customer: { customerInfo: {} as any, username: '' },
    predefined: { vendorStores: { vendor1: '' } },
    product: { productInfo: { wholesaleOption: {} as any } },
};

export const payloads = {
    moduleIds: { wholesale: 'wholesale' },
    adminAuth: {} as Record<string, string>,
    vendorAuth: {} as Record<string, string>,
    createCustomer: () => ({} as any),
    createProduct: () => ({} as any),
    createProductRequiredFields: () => ({} as any),
    createWholesaleProduct: () => ({} as any),
    createOrder: {} as any,
};

export const dbData = {
    dokan: { optionName: { wholesale: '' }, wholesaleSettings: {} as any },
};

export const dbUtils = {
    async setOptionValue(_k: string, _v: any): Promise<void> {},
    async updateOptionValue(_k: string, _v: any): Promise<void> {},
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async createWholesaleCustomer(_p: any, _a: any): Promise<[any, string, string]> { return [null, '', '']; }
    async createProduct(_p: any, _a: any): Promise<[any, string, string]> { return [{ name: '', meta_data: [{ value: { price: '', quantity: '' } }] }, '', '']; }
    async createOrder(_pr: any, _p: any, _a: any): Promise<void> {}
    async activateModules(_m: any, _a: any): Promise<void> {}
    async deactivateModules(_m: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class CustomerPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async customerRegister(_i: any): Promise<void> {}
    async addProductToCart(_n: string, _t: string, _b?: boolean, _q?: string): Promise<void> {}
    async goToCart(): Promise<void> {}
    async goToCheckout(): Promise<void> {}
    async paymentOrder(): Promise<string> { return ''; }
}

export class ProductsPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async addProductWholesaleOptions(_n: string, _o: any): Promise<void> {}
}

export class WholesalePage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async enableWholesaleModule(): Promise<void> {}
    async disableWholesaleModule(): Promise<void> {}
    async adminWholesaleCustomersRenderProperly(): Promise<void> {}
    async searchWholesaleCustomer(_n: string): Promise<void> {}
    async updateWholesaleCustomer(_n: string, _a: string): Promise<void> {}
    async editWholesaleCustomer(_c: any): Promise<void> {}
    async viewWholesaleCustomerOrders(_n: string): Promise<void> {}
    async wholesaleCustomerBulkAction(_a: string): Promise<void> {}
    async customerBecomeWholesaleCustomer(): Promise<void> {}
    async customerRequestForBecomeWholesaleCustomer(): Promise<void> {}
    async viewWholeSalePrice(_n: string, _b?: boolean, _s?: boolean): Promise<void> {}
    async assertWholesalePrice(_p: string, _q: string): Promise<void> {}
}
