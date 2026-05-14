import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    requestForQuotation: {
        quote: (): any => ({}),
        vendorUpdateQuote: {} as any,
        customerQuoteProduct: {} as any,
        guest: (): any => ({}),
    },
};

export const payloads = {
    adminAuth: {} as Record<string, string>,
    vendorAuth: {} as Record<string, string>,
    createProduct: (): any => ({}),
    createQuoteRequest: (): any => ({}),
    createQuoteRule: (): any => ({}),
    stripeConnect: {} as any,
    payPal: {} as any,
    mangoPay: {} as any,
    razorpay: {} as any,
    stripeExpress: {} as any,
};

export const dbUtils = {
    async updateQuoteRuleContent(_id: any, _c: any): Promise<void> {},
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async createProduct(_p: any, _a: any): Promise<[any, string, string]> { return [null, '', '']; }
    async createQuoteRequest(_p: any, _a: any): Promise<[any, string]> { return [null, '']; }
    async createQuoteRule(_p: any, _a: any): Promise<[any, string]> { return [null, '']; }
    async updatePaymentGateway(_slug: string, _p: any, _a: any): Promise<void> {}
    async convertQuoteToOrder(_id: string, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class RequestForQuotationsPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async adminQuotesRenderProperly(): Promise<void> {}
    async addQuote(_q: any): Promise<void> {}
    async editQuote(_q: any): Promise<void> {}
    async updateQuote(_id: string, _a: string): Promise<void> {}
    async approveQuote(_id: string): Promise<void> {}
    async convertQuoteToOrder(_id: string): Promise<void> {}
    async quotesBulkAction(_a: string): Promise<void> {}
    async vendorRequestQuotesRenderProperly(): Promise<void> {}
    async vendorViewQuoteDetails(_id: string): Promise<void> {}
    async vendorUpdateQuoteRequest(_id: string, _d: any): Promise<void> {}
    async vendorApproveQuoteRequest(_id: string): Promise<void> {}
    async vendorConvertQuoteToOrder(_id: string): Promise<void> {}
    async requestForQuoteRenderProperly(): Promise<void> {}
    async requestedQuotesRenderProperly(): Promise<void> {}
    async customerViewRequestedQuoteDetails(_id: string): Promise<void> {}
    async customerUpdateRequestedQuote(_id: string, _d: any): Promise<void> {}
    async payConvertedQuote(_id: string): Promise<void> {}
    async customerQuoteProduct(_d: any, _g?: any): Promise<void> {}
}
