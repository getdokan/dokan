import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    predefined: { vendorStores: { vendor1: '' } },
    storeBanner: {} as any,
};

export const payloads = {
    adminAuth: {} as Record<string, string>,
    storeResetFields: {} as any,
};

export const dbData = {
    dokan: { optionName: { appearance: 'dokan_appearance' }, appearanceSettings: {} as any },
    emptySideBarsWidgets: {} as any,
};

export const dbUtils = {
    async setOptionValue(_n: string, _v: any): Promise<void> {},
    async updateOptionValue(_n: string, _v: any): Promise<void> {},
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async updateStore(_v: any, _p: any, _a: any): Promise<void> {}
    async dispose(): Promise<void> {}
}

export class StoreAppearancePage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async viewStoreMapOnStoreSidebar(_s: 'enable' | 'disable', _v: string): Promise<void> {}
    async viewMapAPISource(_a: 'Google Maps' | 'Mapbox', _v: string): Promise<void> {}
    async viewGoogleRecaptcha(_s: 'enable' | 'disable', _v: string): Promise<void> {}
    async viewStoreContactFormOnStoreSidebar(_s: 'enable' | 'disable', _v: string): Promise<void> {}
    async viewStoreHeaderTemplate(_t: 'default' | 'layout1' | 'layout2' | 'layout3', _v: string): Promise<void> {}
    async viewStoreOpenCloseTimeOnStoreSidebar(_s: 'enable' | 'disable', _v: string): Promise<void> {}
    async setBannerSize(_b: any): Promise<void> {}
    async viewStoreSideBarFromTheme(_s: 'enable' | 'disable', _v: string): Promise<void> {}
    async viewVendorInfoOnSingleStorePage(_s: 'enable' | 'disable', _v: string): Promise<void> {}
    async viewFontAwesomeLibrary(_s: 'enable' | 'disable', _v: string): Promise<void> {}
}
