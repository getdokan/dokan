import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    dokanSettings: {
        general: {} as any,
        selling: {} as any,
        withdraw: {} as any,
        reverseWithdraw: {} as any,
        page: {} as any,
        appearance: {} as any,
        menuManager: { menus: {} as any },
        privacyPolicy: { privacyPage: '' } as any,
        colors: { predefinedPalette: { tree: {} as any } },
        liveSearch: {} as any,
        storeSupport: {} as any,
        vendorVerification: {} as any,
        verificationSmsGateway: {} as any,
        emailVerification: {} as any,
        socialApi: {} as any,
        shippingStatus: {} as any,
        quote: {} as any,
        liveChat: {} as any,
        rma: {} as any,
        wholesale: {} as any,
        euCompliance: {} as any,
        deliveryTime: {} as any,
        productAdvertising: {} as any,
        geolocation: {} as any,
        productReportAbuse: {} as any,
        spmv: {} as any,
        printful: {} as any,
        vendorSubscription: {} as any,
    },
};

export const dbData = {
    dokan: {
        optionName: { privacyPolicy: 'dokan_privacy', emailVerification: 'dokan_email_verification', vendorSubscription: 'dokan_product_subscription' },
        emailVerificationSettings: {} as any,
        vendorSubscriptionSettings: {} as any,
    },
};

export const dbUtils = {
    async getOptionValue(_n: string): Promise<any> { return { privacyPage: '' }; },
    async setOptionValue(_n: string, _v: any): Promise<void> {},
};

export class SettingsPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async dokanSettingsRenderProperly(): Promise<void> {}
    async scrollToTopSettings(): Promise<void> {}
    async searchSettings(_s: string): Promise<void> {}
    async setDokanGeneralSettings(_d: any): Promise<void> {}
    async setDokanSellingSettings(_d: any): Promise<void> {}
    async setDokanWithdrawSettings(_d: any): Promise<void> {}
    async setDokanReverseWithdrawSettings(_d: any): Promise<void> {}
    async setPageSettings(_d: any): Promise<void> {}
    async setDokanAppearanceSettings(_d: any): Promise<void> {}
    async setDokanMenuManagerSettings(_d: any): Promise<void> {}
    async setDokanPrivacyPolicySettings(_d: any): Promise<void> {}
    async setDokanColorSettings(_d: any): Promise<void> {}
    async setDokanLiveSearchSettings(_d: any): Promise<void> {}
    async setDokanStoreSupportSettings(_d: any): Promise<void> {}
    async setDokanVendorVerificationSettings(_d: any): Promise<void> {}
    async setDokanSMSVerificationGatewaysSettings(_d: any): Promise<void> {}
    async setDokanEmailVerificationSettings(_d: any): Promise<void> {}
    async setDokanSocialApiSettings(_d: any): Promise<void> {}
    async setDokanShippingStatusSettings(_d: any): Promise<void> {}
    async setDokanQuoteSettings(_d: any): Promise<void> {}
    async setDokanLiveChatSettings(_d: any): Promise<void> {}
    async setDokanRmaSettings(_d: any): Promise<void> {}
    async setDokanWholesaleSettings(_d: any): Promise<void> {}
    async setDokanEuComplianceSettings(_d: any): Promise<void> {}
    async setDokanDeliveryTimeSettings(_d: any): Promise<void> {}
    async setDokanProductAdvertisingSettings(_d: any): Promise<void> {}
    async setDokanGeolocationSettings(_d: any): Promise<void> {}
    async setDokanProductReportAbuseSettings(_d: any): Promise<void> {}
    async setDokanSpmvSettings(_d: any): Promise<void> {}
    async setDokanPrintfulSettings(_d: any): Promise<void> {}
    async setDokanVendorSubscriptionSettings(_d: any): Promise<void> {}
}
