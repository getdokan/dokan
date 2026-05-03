import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    vendor: { addon: () => ({}) as any },
    product: { productInfo: { addon: {} as any } },
};

export const payloads = {
    moduleIds: { productAddon: 'product_addon' },
    adminAuth: {} as Record<string, string>,
    vendorAuth: {} as Record<string, string>,
    createCategoryRandom: () => ({}) as any,
    createGlobalProductAddons: (): any => ({ fields: [{}] }),
    createProduct: (): any => ({}),
    createProductAddon: (): any => ({ name: 'addon' }),
};

export const dbUtils = {
    async updateCell(_id: any, _v: any): Promise<void> {},
};

export interface responseBody {
    fields: any[];
    meta_data: any[];
}

export class ApiUtils {
    constructor(_ctx: any) {}
    async createCategory(_p: any, _a: any): Promise<[any, any, string]> { return [null, 0, '']; }
    async createProductAddon(_p: any, _a: any): Promise<[responseBody, any, string, string]> { return [{ fields: [], meta_data: [] }, 0, '', '']; }
    async createProduct(_p: any, _a: any): Promise<[any, any, string]> { return [null, 0, '']; }
    async createProductWithAddon(_p: any, _a: any[], _auth: any): Promise<[responseBody, any, string, string[]]> { return [{ fields: [], meta_data: [] }, 0, '', ['']]; }
    async deleteAllProductAddons(_a: any): Promise<void> {}
    async activateModules(_m: any, _a: any): Promise<void> {}
    async deactivateModules(_m: any, _a: any): Promise<void> {}
    getMetaDataValue(_m: any[], _k: string): any { return null; }
    async dispose(): Promise<void> {}
}

export class ProductAddonsPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async enableProductAddonModule(): Promise<void> {}
    async disableProductAddonModule(): Promise<void> {}
    async vendorProductAddonsSettingsRenderProperly(): Promise<void> {}
    async addAddon(_p: any): Promise<void> {}
    async editAddon(_p: any): Promise<void> {}
    async importAddonField(_id: any, _s: string, _t: string): Promise<void> {}
    async exportAddonField(_id: any, _f: any): Promise<void> {}
    async removeAddonField(_id: any, _t: string): Promise<void> {}
    async removeAddon(_p: any): Promise<void> {}
}

export class ProductsPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async addProductAddon(_n: string, _a: any): Promise<void> {}
    async importAddon(_n: string, _s: string, _an: string): Promise<void> {}
    async exportAddon(_n: string, _s: string): Promise<void> {}
    async removeAddon(_n: string, _an: string): Promise<void> {}
}
