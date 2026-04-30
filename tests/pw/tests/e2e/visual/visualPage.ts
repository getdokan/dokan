import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

export const data = {
    subUrls: {
        backend: {
            dokan: {
                dokan: '', withdraw: '', reverseWithdraws: '', vendors: '', storeReviews: '',
                storeSupport: '', sellerBadge: '', requestForQuote: '', requestForQuoteRules: '',
                abuseReports: '', announcements: '', refunds: '', reports: '', allLogs: '',
                modules: '', tools: '', verifications: '', productAdvertising: '',
                wholeSaleCustomer: '', help: '', license: '',
            },
        },
    },
};

export const selector = {
    admin: {
        dokan: {
            settings: {
                menus: {
                    general: '', sellingOptions: '', withdrawOptions: '', reverseWithdrawal: '',
                    pageSettings: '', appearance: '', privacyPolicy: '', colors: '', liveSearch: '',
                    storeSupport: '', vendorVerification: '', verificationSmsGateways: '',
                    emailVerification: '', socialApi: '', shippingStatus: '', quote: '', liveChat: '',
                    rma: '', wholesale: '', euComplianceFields: '', deliveryTime: '',
                    productAdvertising: '', geolocation: '', productReportAbuse: '',
                    singleProductMultiVendor: '', vendorSubscription: '', vendorAnalytics: '',
                },
            },
        },
    },
};

export class VisualPage {
    constructor(readonly page: Page) { void closeAnnouncementModal(page); }
    async dokanMenu(_u: string): Promise<void> {}
    async dokanSettingsMenu(_s: string): Promise<void> {}
    async addReverseWithdrawal(): Promise<void> {}
    async addVendor(): Promise<void> {}
    async adminStoreCategoryRenderProperly(): Promise<void> {}
    async createSellerBadge(): Promise<void> {}
    async addQuote(): Promise<void> {}
    async addQuoteRule(): Promise<void> {}
    async addAnnouncement(): Promise<void> {}
    async adminModulesPlanRenderProperly(): Promise<void> {}
    async addNewProductAdvertisement(): Promise<void> {}
}
