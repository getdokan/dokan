import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    requestForQuotation: { quoteRule: (): any => ({ includeProducts: '', title: '', specificProducts: true }) },
};

export const payloads = {
    adminAuth: {} as Record<string, string>,
    vendorAuth: {} as Record<string, string>,
    createQuoteRule: (): any => ({}),
    createProduct: (): any => ({}),
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async createQuoteRule(_p: any, _a: any): Promise<[any, any, string]> { return [null, 0, '']; }
    async createProduct(_p: any, _a: any): Promise<[any, any, string]> { return [null, 0, '']; }
    async dispose(): Promise<void> {}
}

export class RequestForQuotationsPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async adminQuoteRulesRenderProperly(): Promise<void> {}
    async addQuoteRule(_r: any): Promise<void> {}
    async editQuoteRule(_r: any): Promise<void> {}
    async updateQuoteRule(_t: string, _a: string): Promise<void> {}
    async quoteRulesBulkAction(_a: string): Promise<void> {}
}
