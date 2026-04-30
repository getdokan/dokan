import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    storeCategory: () => ({ name: '' } as any),
};

export const payloads = {
    adminAuth: {} as Record<string, string>,
    createStoreCategory: () => ({} as any),
};

export const dbData = {
    dokan: { optionName: { general: 'dokan_general' } },
};

export const dbUtils = {
    async setOptionValue(_n: string, _v: any): Promise<void> {},
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async createStoreCategory(_p: any, _a: any): Promise<[any, string, string]> { return [null, '', '']; }
    async setDefaultStoreCategory(_n: string, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class StoreCategoriesPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async adminStoreCategoryRenderProperly(): Promise<void> {}
    async addStoreCategory(_c: any): Promise<void> {}
    async searchStoreCategory(_n: string): Promise<void> {}
    async editStoreCategory(_c: any): Promise<void> {}
    async updateStoreCategory(_n: string, _a: string): Promise<void> {}
    async vendorUpdateStoreCategory(_n: string): Promise<void> {}
    async assignStoreCategoryToVendor(_v: any, _c: string[]): Promise<void> {}
}
