import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    predefined: { simpleProduct: { product1: { name: '' } } },
    product: { enquiry: {} as any },
};

export const dbData = {
    dokan: { createAbuseReport: {} as any },
};

export const payloads = {
    moduleIds: { productEnquiry: 'product_enquiry' },
    adminAuth: {} as Record<string, string>,
};

export const dbUtils = {
    async createAbuseReport(_d: any, _p: any, _v: any, _c: any): Promise<void> {},
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async activateModules(_m: any, _a: any): Promise<void> {}
    async deactivateModules(_m: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class ProductEnquiryPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async enableProductEnquiryModule(_n: string): Promise<void> {}
    async disableProductEnquiryModule(_n: string): Promise<void> {}
    async enquireProduct(_n: string, _e: any): Promise<void> {}
}
