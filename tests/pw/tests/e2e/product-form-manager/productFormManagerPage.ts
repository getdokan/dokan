import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    dokanSettings: {
        productFormManager: {
            customBlock: (): any => ({}),
            updateBlock: {} as any,
            customField: (): any => ({}),
        },
    },
};

export const dbData = {
    dokan: { optionName: { productFormManager: 'dokan_product_form_manager' }, productFormManager: {} as any },
};

export const payloads = {
    moduleIds: { productFormManager: 'product_form_manager' },
    adminAuth: {} as Record<string, string>,
};

export const dbUtils = {
    async setOptionValue(_n: string, _v: any): Promise<void> {},
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async activateModules(_m: any, _a: any): Promise<void> {}
    async deactivateModules(_m: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class ProductFormManager {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async enableProductFormManagerModule(): Promise<void> {}
    async disableProductFormManagerModule(): Promise<void> {}
    async addCustomBlock(_b: any, _update?: boolean): Promise<string> { return ''; }
    async deleteCustomBlock(_l: string): Promise<void> {}
    async addCustomField(_f: any, _update?: boolean): Promise<string> { return ''; }
    async deleteCustomField(_f: any): Promise<void> {}
    async resetProductFormManagerSettings(_l: string): Promise<void> {}
}
