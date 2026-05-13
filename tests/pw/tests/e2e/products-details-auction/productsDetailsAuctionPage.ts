import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    product: {
        auction: { itemCondition: 'new', auctionType: 'normal', relistIfFailAfterNHours: '', relistIfNotPaidAfterNHours: '', relistAuctionDurationInH: '' } as any,
        productInfo: {
            title: '',
            tags: { tags: [] as string[], randomTags: [] as string[] },
            images: { cover: '', gallery: [] as string[] },
            description: { shortDescription: '', description: '' },
            downloadableOptions: {} as any,
            inventory: (): any => ({}),
            otherOptions: {} as any,
            shipping: {} as any,
            tax: {} as any,
            attribute: { attributeName: '' } as any,
            geolocation: {} as any,
            addon: {} as any,
        },
        category: {
            clothings: '',
            categories: [] as string[],
            multistepCategories: [] as string[],
        },
    },
};

export const dbData = {
    dokan: { optionName: { selling: 'dokan_selling' } },
};

export const payloads = {
    adminAuth: {} as Record<string, string>,
    vendorAuth: {} as Record<string, string>,
    createAuctionProductRequiredFields: (): any => ({}),
    createAuctionProduct: (): any => ({}),
    createProductAddon: (): any => ({}),
    createAttribute: (): any => ({}),
    createAttributeTerm: (): any => ({}),
};

export const dbUtils = {
    async updateOptionValue(_n: string, _v: any): Promise<void> {},
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async createProduct(_p: any, _a: any): Promise<[any, string, string]> { return [null, '', '']; }
    async getCategoryId(_n: string, _a: any): Promise<any> { return 0; }
    async createProductWithAddon(_p: any, _addons: any[], _a: any): Promise<[any, string, string, string[]]> { return [{ meta_data: [] }, '', '', ['']]; }
    async createAttributeTerm(_a: any, _t: any, _auth: any): Promise<[any, any, any, string, string]> { return [null, 0, 0, '', '']; }
    getMetaDataValue(_m: any[], _k: string): any { return null; }
    async dispose(): Promise<void> {}
}

export class AuctionsPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async addProductTitle(_id: string, _t: string): Promise<void> {}
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
    async addProductGeneralOption(_id: string, _a: any): Promise<void> {}
    async addProductRelistingOption(_id: string, _a: any): Promise<void> {}
    async addProductInventory(_id: string, _i: any): Promise<void> {}
    async addProductOtherOptions(_id: string, _o: any, _t: string): Promise<void> {}
    async addProductShipping(_id: string, _s: any): Promise<void> {}
    async removeProductShipping(_id: string): Promise<void> {}
    async addProductTax(_id: string, _t: any, _c?: boolean): Promise<void> {}
    async addProductAttribute(_id: string, _a: any, _create?: boolean): Promise<void> {}
    async cantAddAlreadyAddedAttribute(_id: string, _n: string): Promise<void> {}
    async removeProductAttribute(_id: string, _n: string): Promise<void> {}
    async removeProductAttributeTerm(_id: string, _n: string, _t: string): Promise<void> {}
    async addProductGeolocation(_id: string, _g: any): Promise<void> {}
    async removeProductGeolocation(_id: string): Promise<void> {}
    async addProductAddon(_id: string, _a: any): Promise<void> {}
    async importAddon(_id: string, _s: string, _n: string): Promise<void> {}
    async exportAddon(_id: string, _s: string): Promise<void> {}
    async removeAddon(_id: string, _n: string): Promise<void> {}
}
