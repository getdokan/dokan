import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    predefined: { vendorStores: { vendor1: 'vendor1' } },
    storeContactData: {} as any,
};

export const dbData = {
    dokan: { optionName: { privacyPolicy: 'dokan_privacy', appearance: 'dokan_appearance' } },
    emptySideBarsWidgets: {} as any,
};

export const dbUtils = {
    async updateOptionValue(_n: string, _v: any): Promise<void> {},
    async setOptionValue(_n: string, _v: any): Promise<void> {},
};

export class ApiUtils {
    constructor(_ctx: any) {}
    async dispose(): Promise<void> {}
}

export class PrivacyPolicyPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async contactVendor(_store: string, _data: any): Promise<void> {}
    async goToPrivacyPolicy(_store: string): Promise<void> {}
    async disablePrivacyPolicy(_store: string): Promise<void> {}
    async disableStoreContactForm(_store: string): Promise<void> {}
}
