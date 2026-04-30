import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    vendor: {
        vendorInfo: {} as any,
        shipStation: {} as any,
        socialProfileUrls: {} as any,
        rma: {} as any,
        seo: {} as any,
    },
};

export const payloads = {
    defaultStoreSettings: {} as any,
    vendorAuth: {} as Record<string, string>,
};

export const dbData = {
    testData: { dokan: { rmaSettings: {} as any } },
    dokan: { optionName: { selling: '' } },
};

export const dbUtils = {
    async setUserMeta(_v: any, _k: string, _v2: any, _b: boolean): Promise<void> {},
    async updateOptionValue(_k: string, _v: any): Promise<void> {},
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async setStoreSettings(_s: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class VendorSettingsPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async vendorStoreSettingsRenderProperly(): Promise<void> {}
    async vendorShipStationSettingsRenderProperly(): Promise<void> {}
    async vendorSocialProfileSettingsRenderProperly(): Promise<void> {}
    async vendorRmaSettingsRenderProperly(): Promise<void> {}
    async vendorStoreSeoSettingsRenderProperly(): Promise<void> {}
    async setStoreSettings(_i: any, _t: string): Promise<void> {}
    async setShipStation(_s: any): Promise<void> {}
    async setSocialProfile(_u: any): Promise<void> {}
    async setRmaSettings(_r: any): Promise<void> {}
    async setStoreSeo(_s: any): Promise<void> {}
}
