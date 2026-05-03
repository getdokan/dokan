import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    predefined: { simpleProduct: { product1: { name: '' } } },
    product: { review: {} as any },
};

export const payloads = {
    vendorAuth: {} as Record<string, string>,
    createProduct: () => ({} as any),
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async createProduct(_p: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class SingleProductPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async singleProductRenderProperly(_n: string): Promise<void> {}
    async viewHighlightedVendorInfo(_n: string): Promise<void> {}
    async productVendorInfo(_n: string): Promise<void> {}
    async productLocation(_n: string): Promise<void> {}
    async productWarrantyPolicy(_n: string): Promise<void> {}
    async viewMoreProducts(_n: string): Promise<void> {}
    async viewRelatedProducts(_n: string): Promise<void> {}
    async reviewProduct(_n: string, _r: any): Promise<void> {}
}
