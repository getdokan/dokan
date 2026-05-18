import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    predefined: { vendorStores: { vendor1: '' }, simpleProduct: { product1: { name: '' } } },
    commands: { wpcli: { rewritePermalink: '' } },
    image: { dokan: '' },
    order: { orderStatus: { onhold: 'on-hold' } },
};

export const dbData = {
    dokan: {
        optionName: { general: 'dokan_general', selling: 'dokan_selling' },
        generalSettings: {} as any,
        sellingSettings: {} as any,
    },
    testData: { dokan: { generalSettings: { setup_wizard_message: '', setup_wizard_message_without_html: '' } } },
};

export const payloads = {
    adminAuth: {} as Record<string, string>,
    vendorAuth: {} as Record<string, string>,
    createOrder: {} as any,
};

export const helpers = {
    async exeCommandWpcli(_c: string): Promise<void> {},
};

export const dbUtils = {
    async setOptionValue(_n: string, _v: any): Promise<void> {},
    async updateOptionValue(_n: string, _v: any): Promise<void> {},
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async uploadFile(_f: string, _a: any): Promise<[{ source_url: string }]> { return [{ source_url: '' }]; }
    async createOrderWithStatus(_p: any, _o: any, _s: string, _a: any): Promise<[any, any, string]> { return [null, null, '']; }
}

export class SettingPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async vendorStoreUrlSetting(_v: string, _p: string): Promise<void> {}
    async vendorSetupWizardLogoAndMessageSetting(_l: string, _m: string): Promise<void> {}
    async disableVendorSetupWizardSetting(): Promise<void> {}
    async setStoreTermsAndConditions(_s: string): Promise<void> {}
    async setStoreProductsPerPage(_v: string, _n: number): Promise<void> {}
    async enableAddressFieldsOnRegistration(_s: string): Promise<void> {}
    async enableStoreTermsAndConditionsOnRegistration(_s: string): Promise<void> {}
    async setShowVendorInfo(_n: string, _s: string): Promise<void> {}
    async enableMoreProductsTab(_n: string, _s: string): Promise<void> {}
    async enableVendorSelling(_s: string): Promise<void> {}
    async setOrderStatusChangeCapability(_id: string, _s: string): Promise<void> {}
}
