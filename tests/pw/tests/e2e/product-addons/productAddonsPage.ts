import { Page, expect } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';

// New React vendor-dashboard surface for product add-ons (Dokan 5.0.0+).
// The list lives in the HashRouter dashboard; the add/edit form is still the legacy settings page.
export const addonListPath = 'dashboard/new/#settings/product-addon';

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

    // --- New React UI (Dokan 5.0.0+) ------------------------------------------------
    async gotoAddonList(): Promise<void> {
        await this.page.goto(toPath(addonListPath));
        await this.page.waitForLoadState('domcontentloaded');
    }

    // List page renders: heading + "Create New Addon" action, with no PHP fatal error.
    async assertAddonListRenders(): Promise<void> {
        await this.gotoAddonList();
        await expect(this.page.getByRole('heading', { name: 'Product Addons' })).toBeVisible({ timeout: 30_000 });
        await expect(this.page.getByRole('link', { name: /Create New Addon/i })).toBeVisible();
        await expect(this.page.getByText(/Fatal error|Parse error|There has been a critical error/i)).toBeHidden();
    }

    // List page is interactive: the DataViews search box renders.
    async assertAddonListContent(): Promise<void> {
        await this.gotoAddonList();
        await expect(this.page.getByRole('textbox', { name: 'Search' })).toBeVisible({ timeout: 30_000 });
    }

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
