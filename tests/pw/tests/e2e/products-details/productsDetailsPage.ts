import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    product: {
        productInfo: {
            title: '',
            permalink: '',
            price: (): any => ({}),
            discount: {} as any,
            tags: { tags: [] as string[], randomTags: [] as string[] },
            images: { cover: '', gallery: [] as string[] },
            description: { shortDescription: '', description: '' },
            downloadableOptions: {} as any,
            inventory: (): any => ({}),
            otherOptions: {} as any,
            shipping: {} as any,
            tax: {} as any,
            linkedProducts: [] as string[],
            attribute: { attributeName: '' } as any,
            quantityDiscount: {} as any,
            geolocation: {} as any,
            euCompliance: {} as any,
            addon: {} as any,
            wholesaleOption: {} as any,
            minMax: {} as any,
        },
        category: {
            clothings: '',
            categories: [] as string[],
            multistepCategories: [] as string[],
        },
    },
    vendor: { rma: { type: 'warranty_included', length: 'limited' } as any },
};

export const dbData = {
    dokan: { optionName: { selling: 'dokan_selling' } },
};

export const payloads = {
    adminAuth: {} as Record<string, string>,
    vendorAuth: {} as Record<string, string>,
    createProductRequiredFields: (): any => ({}),
    createProductAllFields: (): any => ({}),
    createProduct: (): any => ({}),
    createDiscountProduct: (): any => ({}),
    createProductAddon: (): any => ({}),
    createAttribute: (): any => ({}),
    createAttributeTerm: (): any => ({}),
};

export const dbUtils = {
    async updateOptionValue(_n: string, _v: any): Promise<void> {},
};

export interface responseBody {
    price: string;
    meta_data: any[];
}

export class ApiUtils {
    constructor(_ctx: any) {}
    async createProduct(_p: any, _a: any): Promise<[responseBody, string, string]> { return [{ price: '0', meta_data: [] }, '', '']; }
    async createProductWc(_p: any, _a: any): Promise<[responseBody, string]> { return [{ price: '0', meta_data: [] }, '']; }
    async updateProduct(_id: string, _d: any, _a: any): Promise<void> {}
    async getCategoryId(_n: string, _a: any): Promise<any> { return 0; }
    async createProductWithAddon(_p: any, _addons: any[], _a: any): Promise<[responseBody, string, string, string[]]> { return [{ price: '0', meta_data: [] }, '', '', ['']]; }
    async createAttributeTerm(_a: any, _t: any, _auth: any): Promise<[any, any, any, string, string]> { return [null, 0, 0, '', '']; }
    getMetaDataValue(_m: any[], _k: string): any { return null; }
    async dispose(): Promise<void> {}
}

export class ProductsPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async addProductTitle(_id: string, _t: string): Promise<void> {}
    async addProductPermalink(_id: string, _p: string): Promise<void> {}
    async addPrice(_id: string, _p: any): Promise<void> {}
    async removePrice(_id: string): Promise<void> {}
    async addDiscount(_id: string, _d: any, _s?: boolean, _u?: boolean): Promise<void> {}
    async cantAddGreaterDiscount(_id: string, _d: any): Promise<void> {}
    async removeDiscount(_id: string, _s?: boolean): Promise<void> {}
    async addProductCategory(_id: string, _c: any[], _m?: boolean): Promise<void> {}
    async removeProductCategory(_id: string, _c: any[]): Promise<void> {}
    async cantAddCategory(_id: string, _c: string): Promise<void> {}
    async addProductTags(_id: string, _t: string[]): Promise<void> {}
    async removeProductTags(_id: string, _t: string[]): Promise<void> {}
    async addProductCoverImage(_id: string, _i: string, _u?: boolean): Promise<void> {}
    async removeProductCoverImage(_id: string): Promise<void> {}
    async addProductGalleryImages(_id: string, _i: string[], _u?: boolean): Promise<void> {}
    async removeProductGalleryImages(_id: string): Promise<void> {}
    async addProductShortDescription(_id: string, _d: string): Promise<void> {}
    async addProductDescription(_id: string, _d: string): Promise<void> {}
    async addProductDownloadableOptions(_id: string, _o: any): Promise<void> {}
    async removeDownloadableFile(_id: string, _o: any): Promise<void> {}
    async addProductVirtualOption(_id: string, _v: boolean): Promise<void> {}
    async addProductInventory(_id: string, _i: any, _t: string): Promise<void> {}
    async removeProductInventory(_id: string): Promise<void> {}
    async addProductOtherOptions(_id: string, _o: any, _t: string): Promise<void> {}
    async addProductCatalogMode(_id: string, _h?: boolean): Promise<void> {}
    async removeProductCatalogMode(_id: string, _p?: boolean): Promise<void> {}
    async addProductShipping(_id: string, _s: any): Promise<void> {}
    async removeProductShipping(_id: string): Promise<void> {}
    async addProductTax(_id: string, _t: any, _c?: boolean): Promise<void> {}
    async addProductLinkedProducts(_id: string, _p: string[], _t: string): Promise<void> {}
    async removeProductLinkedProducts(_id: string, _p: string[], _t: string): Promise<void> {}
    async addProductAttribute(_id: string, _a: any, _create?: boolean): Promise<void> {}
    async cantAddAlreadyAddedAttribute(_id: string, _n: string): Promise<void> {}
    async removeProductAttribute(_id: string, _n: string): Promise<void> {}
    async removeProductAttributeTerm(_id: string, _n: string, _t: string): Promise<void> {}
    async addProductBulkDiscountOptions(_id: string, _d: any): Promise<void> {}
    async removeProductBulkDiscountOptions(_id: string): Promise<void> {}
    async addProductGeolocation(_id: string, _g: any): Promise<void> {}
    async removeProductGeolocation(_id: string): Promise<void> {}
    async addProductEuCompliance(_id: string, _e: any): Promise<void> {}
    async addProductAddon(_id: string, _a: any): Promise<void> {}
    async importAddon(_id: string, _s: string, _n: string): Promise<void> {}
    async exportAddon(_id: string, _s: string): Promise<void> {}
    async removeAddon(_id: string, _n: string): Promise<void> {}
    async addProductRmaOptions(_id: string, _r: any): Promise<void> {}
    async removeProductRmaOptions(_id: string): Promise<void> {}
    async addProductWholesaleOptions(_id: string, _w: any): Promise<void> {}
    async removeProductWholesaleOptions(_id: string): Promise<void> {}
    async addProductMinMaxOptions(_id: string, _m: any): Promise<void> {}
    async cantAddGreaterMin(_id: string, _m: any): Promise<void> {}
    async removeProductMinMaxOptions(_id: string, _m: any): Promise<void> {}
}
