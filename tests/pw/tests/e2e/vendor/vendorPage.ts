import { Page } from '@playwright/test';

export const data = {
    vendor: { vendorInfo: {} as any } as any,
    vendorSetupWizard: {} as any,
    predefined: { vendorStores: { vendor1: '' } },
};

export const dbData = {
    dokan: { optionName: { general: 'dokan_general' } },
};

export const dbUtils = {
    async updateOptionValue(_n: string, _v: any): Promise<void> {},
};

export class LoginPage {
    constructor(readonly page: Page) {}
    async login(_u: any): Promise<void> {}
    async logout(): Promise<void> {}
}

export class VendorPage {
    constructor(readonly page: Page) {}
    async vendorRegister(_v: any, _s: any): Promise<void> {}
    async vendorSetupWizard(_s: any): Promise<void> {}
    async vendorAccountDetailsRenderProperly(): Promise<void> {}
    async addVendorDetails(_v: any): Promise<void> {}
    async visitStore(_s: string): Promise<void> {}
}
