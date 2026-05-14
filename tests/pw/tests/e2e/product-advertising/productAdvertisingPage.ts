import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    productAdvertisement: {
        filter: {
            byStore: '',
            createVia: { admin: '' },
        },
    } as any,
};

export const payloads = {
    moduleIds: { productAdvertising: 'product_advertising' },
    adminAuth: {} as Record<string, string>,
    vendorAuth: {} as Record<string, string>,
    createProduct: (): any => ({}),
    createBookableProduct: (): any => ({}),
    createAuctionProduct: (): any => ({}),
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async createProductAdvertisement(_p: any, _a: any): Promise<[any, any, string]> { return [null, 0, '']; }
    async createProduct(_p: any, _a: any): Promise<[any, any, string]> { return [null, 0, '']; }
    async createBookableProduct(_p: any, _a: any): Promise<[any, any, string]> { return [null, 0, '']; }
    async updateOrderStatus(_id: any, _s: string, _a: any): Promise<void> {}
    async activateModules(_m: any, _a: any): Promise<void> {}
    async deactivateModules(_m: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class ProductAdvertisingPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async enableProductAdvertisingModule(): Promise<void> {}
    async disableProductAdvertisingModule(): Promise<void> {}
    async adminProductAdvertisingRenderProperly(): Promise<void> {}
    async addNewProductAdvertisement(_p: any): Promise<void> {}
    async searchAdvertisedProduct(_n: string): Promise<void> {}
    async filterAdvertisedProduct(_v: string, _m: string): Promise<void> {}
    async updateAdvertisedProduct(_n: string, _a: string): Promise<void> {}
    async productAdvertisingBulkAction(_a: string): Promise<void> {}
}

export class VendorPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async buyProductAdvertising(_n: string, _t: string, _b?: any): Promise<string> { return ''; }
    async assertProductAdvertisementIsBought(_n: string, _t: string, _b?: any): Promise<void> {}
}

export class AuctionsPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
}

export class BookingPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
}
