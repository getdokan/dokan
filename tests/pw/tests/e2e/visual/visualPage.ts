import { Page, Locator, expect } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import { data } from '@utils/testData';

// Re-export the real shared test data so the spec's `data.subUrls.backend.dokan.*`
// and `data.subUrls.api.dokan.*` reads resolve to live URLs, not local no-op stubs.
export { data };

// Co-located selectors ported verbatim from the pre-refactor pages/selectors.ts
// (the old @pages/selectors module no longer exists in the current architecture).
export const selector = {
    admin: {
        dokan: {
            // dokan admin notice — masked out of every screenshot so promotional
            // notices don't cause visual diffs.
            notice: {
                noticeDiv: 'div.dokan-admin-notices',
            },
            reverseWithdraw: {
                addNewReverseWithdrawal: '.dokan-reverse-withdrawal button.page-title-action',
            },
            vendors: {
                addNewVendor: '//button[contains(text(), "Add New")]',
                storeCategories: '//a[normalize-space()="Store Categories"]',
                newVendor: {
                    addNewVendorCloseModal: '.modal-close',
                },
            },
            sellerBadge: {
                createBadge: '//a[normalize-space()="+ Create Badge"]',
            },
            requestForQuotation: {
                quotesList: {
                    newQuote: '.page-title-action',
                },
                quoteRules: {
                    newQuoteRule: '.page-title-action',
                },
            },
            announcements: {
                addNewAnnouncement: '//button[normalize-space()="Add Announcement"]',
            },
            modules: {
                pro: {
                    modulePlan: {
                        upgradePlan: '.module-plan .upgrade-plan',
                    },
                },
            },
            productAdvertising: {
                addNewProductAdvertising: '//button[normalize-space()="Add New Advertisement"]',
            },
            settings: {
                menus: {
                    general: '//div[@class="nav-title" and contains(text(),"General")]',
                    sellingOptions: '//div[@class="nav-title" and contains(text(),"Selling Options")]',
                    withdrawOptions: '//div[@class="nav-title" and contains(text(),"Withdraw Options")]',
                    reverseWithdrawal: '//div[@class="nav-title" and contains(text(),"Reverse Withdrawal")]',
                    pageSettings: '//div[@class="nav-title" and contains(text(),"Page Settings")]',
                    appearance: '//div[@class="nav-title" and contains(text(),"Appearance")]',
                    privacyPolicy: '//div[@class="nav-title" and contains(text(),"Privacy Policy")]',
                    colors: '//div[@class="nav-title" and contains(text(),"Colors")]',
                    liveSearch: '//div[@class="nav-title" and contains(text(),"Live Search")]',
                    storeSupport: '//div[@class="nav-title" and contains(text(),"Store Support")]',
                    vendorVerification: '//div[@class="nav-title" and contains(text(),"Vendor Verification")]',
                    verificationSmsGateways: '//div[@class="nav-title" and contains(text(),"Verification SMS Gateways")]',
                    emailVerification: '//div[@class="nav-title" and contains(text(),"Email Verification")]',
                    socialApi: '//div[@class="nav-title" and contains(text(),"Social API")]',
                    shippingStatus: '//div[@class="nav-title" and contains(text(),"Shipping Status")]',
                    quote: '//div[@class="nav-title" and contains(text(),"Quote Settings")]',
                    liveChat: '//div[@class="nav-title" and contains(text(),"Live Chat")]',
                    rma: '//div[@class="nav-title" and contains(text(),"RMA")]',
                    wholesale: '//div[@class="nav-title" and contains(text(),"Wholesale")]',
                    euComplianceFields: '//div[@class="nav-title" and contains(text(),"EU Compliance Fields")]',
                    deliveryTime: '//div[@class="nav-title" and contains(text(),"Delivery Time")]',
                    productAdvertising: '//div[@class="nav-title" and contains(text(),"Product Advertising")]',
                    geolocation: '//div[@class="nav-title" and contains(text(),"Geolocation")]',
                    productReportAbuse: '//div[@class="nav-title" and contains(text(),"Product Report Abuse")]',
                    singleProductMultiVendor: '//div[@class="nav-title" and contains(text(),"Single Product MultiVendor")]',
                    vendorSubscription: '//div[@class="nav-title" and contains(text(),"Vendor Subscription")]',
                    vendorAnalytics: '//div[@class="nav-title" and contains(text(),"Vendor Analytics")]',
                },
            },
        },
    },
};

export class VisualPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Internal helpers (raw Playwright equivalents of the old basePage methods) ----

    // basePage.goIfNotThere(): navigate to the sub-path if we're not already on it.
    private async goIfNotThere(subPath: string): Promise<void> {
        if (this.page.url().includes(subPath)) {
            return;
        }
        await this.page.goto(toPath(subPath), { waitUntil: 'domcontentloaded' });
    }

    // basePage.toHaveScreenshot(): full-page visual snapshot with masked regions.
    private async toHaveScreenshot(mask?: Locator[]): Promise<void> {
        await expect(this.page).toHaveScreenshot({ fullPage: true, mask, maskColor: 'black', animations: 'disabled' });
    }

    // ---- Page actions (ported from pre-refactor pages/visualPage.ts) ----

    // reverse withdrawal modal
    async addReverseWithdrawal(): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.reverseWithdraws);
        await this.page.locator(selector.admin.dokan.reverseWithdraw.addNewReverseWithdrawal).click();
        await this.toHaveScreenshot(); // todo: fullscreen modal
    }

    // admin add new vendors
    async addVendor(): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.vendors);
        await this.page.locator(selector.admin.dokan.vendors.addNewVendor).click();
        await this.toHaveScreenshot();

        await this.page.locator(selector.admin.dokan.vendors.newVendor.addNewVendorCloseModal).click();
    }

    // store categories render properly
    async adminStoreCategoryRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.vendors);
        await this.page.locator(selector.admin.dokan.vendors.storeCategories).click();
        const notice = this.page.locator(selector.admin.dokan.notice.noticeDiv);
        await this.toHaveScreenshot([notice]);
    }

    // create seller badge
    async createSellerBadge(): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.sellerBadge);
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(data.subUrls.api.dokan.sellerBadgeEvent) && resp.status() === 200),
            this.page.locator(selector.admin.dokan.sellerBadge.createBadge).click(),
        ]);
        await this.toHaveScreenshot();
    }

    // add quote
    async addQuote(): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuote);
        await this.page.locator(selector.admin.dokan.requestForQuotation.quotesList.newQuote).click();
        await this.toHaveScreenshot();
    }

    // add quote rule
    async addQuoteRule(): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuoteRules);

        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(data.subUrls.api.dokan.quotes) && resp.status() === 200),
            this.page.waitForResponse(resp => resp.url().includes(data.subUrls.api.dokan.products) && resp.status() === 200),
            this.page.locator(selector.admin.dokan.requestForQuotation.quoteRules.newQuoteRule).click(),
        ]);
        await this.toHaveScreenshot();
    }

    // add announcement
    async addAnnouncement(): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.announcements);
        await this.page.locator(selector.admin.dokan.announcements.addNewAnnouncement).click();
        const notice = this.page.locator(selector.admin.dokan.notice.noticeDiv);
        await this.toHaveScreenshot([notice]);
    }

    // modules plan render properly
    async adminModulesPlanRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.modules);
        await this.page.locator(selector.admin.dokan.modules.pro.modulePlan.upgradePlan).click();
        await this.toHaveScreenshot();
    }

    // add new product advertisement
    async addNewProductAdvertisement(): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.productAdvertising);
        await this.page.locator(selector.admin.dokan.productAdvertising.addNewProductAdvertising).click();
        await this.toHaveScreenshot();
    }

    // dokan menu
    async dokanMenu(locator: string): Promise<void> {
        await this.goIfNotThere(locator);
        const notice = this.page.locator(selector.admin.dokan.notice.noticeDiv);
        await this.toHaveScreenshot([notice]);
    }

    // dokan setting menus
    async dokanSettingsMenu(locator: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.settings);
        await this.page.waitForTimeout(1000);
        const notice = this.page.locator(selector.admin.dokan.notice.noticeDiv);
        await this.page.locator(locator).click();
        await this.page.waitForTimeout(1500);
        await this.toHaveScreenshot([notice]);
    }
}
