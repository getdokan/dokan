import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    predefined: { simpleProduct: { product1: { name: '' } } },
    questionAnswers: (): any => ({ filter: { byVendor: '', byProduct: '' } }),
    subUrls: { backend: { dokan: { dokan: '' } } },
};

export const payloads = {
    moduleIds: { productQa: 'product_qa' },
    adminAuth: {} as Record<string, string>,
    customerAuth: {} as Record<string, string>,
    createProductQuestion: (): any => ({}),
    createProductQuestionAnswer: (): any => ({}),
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async activateModules(_m: any, _a: any): Promise<void> {}
    async deactivateModules(_m: any, _a: any): Promise<[any, any[]]> { return [null, [{ id: 'product_qa', active: false }]]; }
    async createProductQuestion(_p: any, _a: any): Promise<[any, string]> { return [null, '']; }
    async createProductQuestionAnswer(_p: any, _a: any): Promise<[any, any, string]> { return [null, 0, '']; }
    async updateProductQuestion(_id: string, _d: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class ProductQAPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async enableProductQaModule(_n: string): Promise<void> {}
    async disableProductQaModule(_n: string): Promise<void> {}
    async adminProductQARenderProperly(): Promise<void> {}
    async viewQuestionDetails(_id: string): Promise<void> {}
    async filterQuestions(_v: string, _m: string): Promise<void> {}
    async editQuestion(_id: string, _d: any): Promise<void> {}
    async answerQuestion(_id: string, _d: any): Promise<void> {}
    async editAnswer(_id: string, _d: any): Promise<void> {}
    async deleteAnswer(_id: string, _a: string): Promise<void> {}
    async editQuestionVisibility(_id: string, _a: string): Promise<void> {}
    async deleteQuestion(_id: string): Promise<void> {}
    async productQuestionsBulkAction(_a: string): Promise<void> {}
    async vendorProductQARenderProperly(): Promise<void> {}
    async vendorViewQuestionDetails(_id: string): Promise<void> {}
    async vendorFilterQuestions(_p: string): Promise<void> {}
    async vendorAnswerQuestion(_id: string, _d: any): Promise<void> {}
    async vendorEditAnswer(_id: string, _d: any): Promise<void> {}
    async vendorDeleteAnswer(_id: string): Promise<void> {}
    async vendorDeleteQuestion(_id: string): Promise<void> {}
    async searchQuestion(_n: string, _d: any): Promise<void> {}
    async postQuestion(_n: string, _d: any, _guest?: boolean): Promise<void> {}
    async goto(_u: string): Promise<void> {}
}
