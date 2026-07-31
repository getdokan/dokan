import { Page, expect } from '@playwright/test';
import { toPath, closeAnnouncementModal } from '@utils/helpers';
import { data } from '@utils/testData';

const subUrls = data.subUrls.backend.dokan;

// ============================================
// SELECTORS (ported from pre-refactor selectors.ts -> selector.admin.dokan.*)
// ============================================
const selectors = {
    // dokan admin notice slider
    notice: {
        noticeDiv: 'div.dokan-admin-notices',
        noticeDiv1: '//div[@class="dokan-admin-notices"]//div[contains(@class,"dokan-admin-notice")and not(contains(@class,"dokan-promotion"))]',
        closeNotice: '.close-notice',
        slider: '.slide-notice',
        sliderPrev: '.slide-notice .prev',
        sliderNext: '.slide-notice .next',
    },

    // dokan promotion banner
    promotion: {
        promotion: 'div.dokan-notice-slides div.dokan-promotion',
        message: 'div.dokan-promotion div.dokan-message',
    },

    // dokan lite modules (pro upgrade surface)
    modules: {
        lite: {
            moduleText: '#lite-modules h1',

            // dokan upgrade popup
            popup: {
                dokanUpgradePopup: '#dokan-upgrade-popup',
                closeDokanUpgradePopup: '#dokan-upgrade-popup .close',
                upgradeToProText: 'div.modal-content p.upgrade-text',
                upgradeToPro: 'div.modal-content a.upgrade-button',
                proCard: 'div.modal-content div.promo-card',
                alreadyUpdated: 'div.modal-content a.already-updated',
            },

            // module cards
            moduleCard: '.plugin-card',
        },
    },

    // dokan pro features menu
    proFeatures: {
        dokanProFeatures: '.dokan-pro-features',

        // header section
        headerSection: '.header-section',

        // vendor capabilities
        vendorCapabilitiesBanner: '.vendor-capabilities-banner',
        checkOutAllVendorFunctionalities: '//a[normalize-space()="Check Out All Vendor Functionalities"]',

        // service section
        serviceSection: '.service-section',
        serviceList: '.service-section .service-list',
        andManyMore: '//a[normalize-space()="And Many More"]',

        // compare section
        comparisonSection: '.comparison-section',
        comparisonBoxDokanLite: '.comparison-section .compare-box.dokan-lite',
        comparisonBoxDokanPro: '.comparison-section .compare-box.dokan-pro',

        // pricing section
        pricingSection: '.pricing-section',
        pricingTable: '.pricing-section .pricing-wrapper',

        // payment section
        paymentSection: '.payment-section',
        guaranteeSection: '.payment-section .guarantee-section',
        paymentOptions: '.payment-section .payment-area',

        // testimonial section
        testimonialSection: '.testimonial-section',
        testimonials: '.testimonial-section .testimonial-wrapper',

        // cta section
        ctaSection: '.cta-section',
        upgradeToPro: '//a[normalize-space()="Upgrade to Pro"]',
    },

    // dokan settings pro advertisement banner
    settings: {
        proAdvertisementBanner: {
            settingsBanner: '#dokan-settings-banner',
            upgradeToPro: '//a[normalize-space()="Upgrade to Pro"]',
            checkOutAllVendorFunctionalities: '//a[normalize-space()="Check Out All Vendor Functionalities"]',
        },
    },
} as const;

export class NoticeAndPromotionPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ============================================
    // Navigation / assertion helpers (raw Playwright equivalents of the old base-class helpers)
    // ============================================

    private isCurrentUrl(subPath: string): boolean {
        const url = new URL(this.page.url());
        const currentURL = url.href.replace(/[/]$/, '');
        return currentURL === toPath(subPath);
    }

    async toPass(asyncFn: () => Promise<void>, options?: { timeout?: number; intervals?: number[] }): Promise<void> {
        await expect(async () => {
            await asyncFn();
        }).toPass(options);
    }

    async goto(subPath: string, options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' }): Promise<void> {
        await this.page.goto(toPath(subPath), options ?? { waitUntil: 'domcontentloaded' });
    }

    async goIfNotThere(subPath: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' = 'domcontentloaded'): Promise<void> {
        if (!this.isCurrentUrl(subPath)) {
            const url = toPath(subPath);
            await this.toPass(async () => {
                await this.page.goto(url, { waitUntil });
                expect(this.page.url()).toMatch(subPath);
            });
        }
    }

    async goToDokanSettings(): Promise<void> {
        await this.goIfNotThere(subUrls.settings);
    }

    // Bounded visibility poll (mirrors the old base-class isVisible: returns a boolean, never throws).
    async isVisible(selector: string, timeout = 2): Promise<boolean> {
        const start = Date.now();
        let interval = 20;
        while (Date.now() - start < timeout * 1000) {
            try {
                if (await this.page.locator(selector).first().isVisible()) return true;
            } catch {
                /* element not ready yet */
            }
            await this.page.waitForTimeout(interval);
            if (interval === 20) interval = 100;
            else if (interval === 100) interval = 500;
        }
        return false;
    }

    // Recursively assert every selector in a co-located selectors object is visible.
    // Skips nested function selectors (parametrized), matching the old multipleElementVisible.
    async multipleElementVisible(group: { [key: string]: any }): Promise<void> {
        for (const key in group) {
            const value = group[key];
            if (typeof value === 'function') {
                continue;
            } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                await this.multipleElementVisible(value);
            } else {
                await expect(this.page.locator(value)).toBeVisible();
            }
        }
    }

    // ============================================
    // dokan notice & promotion
    // ============================================

    // dokan notice renders properly
    async dokanNoticeRenderProperly(): Promise<void> {
        await this.goto(subUrls.dokan);

        // dokan notice elements are present
        const isPromotionVisible = await this.isVisible(selectors.promotion.promotion);
        if (isPromotionVisible) {
            await expect(this.page.locator(selectors.notice.noticeDiv1)).not.toHaveCount(0);
        } else {
            await expect(this.page.locator(selectors.notice.noticeDiv)).not.toHaveCount(0);
        }
        await expect(this.page.locator(selectors.notice.slider)).not.toHaveCount(0);
        await expect(this.page.locator(selectors.notice.sliderPrev)).not.toHaveCount(0);
        await expect(this.page.locator(selectors.notice.sliderNext)).not.toHaveCount(0);
    }

    // dokan promotion renders properly
    async dokanPromotionRenderProperly(): Promise<void> {
        await this.goto(subUrls.dokan);

        // dokan promotion elements are visible (only when a promotion is ongoing)
        const isPromotionVisible = await this.isVisible(selectors.promotion.promotion);
        if (isPromotionVisible) {
            await this.multipleElementVisible(selectors.promotion);
        } else {
            console.log('No promotion is ongoing');
        }
    }

    // dokan pro (premium features) promotion renders properly
    async dokanProPromotionRenderProperly(): Promise<void> {
        // dokan lite modules
        await this.goIfNotThere(subUrls.liteModules);

        // pro upgrade popup elements are visible
        await this.multipleElementVisible(selectors.modules.lite.popup);

        // close popup, then module cards are visible
        await this.page.locator(selectors.modules.lite.popup.closeDokanUpgradePopup).click();
        await expect(this.page.locator(selectors.modules.lite.moduleText)).toBeVisible();
        await expect(this.page.locator(selectors.modules.lite.moduleCard)).toHaveCount(27);

        // dokan pro features menu
        await this.goIfNotThere(subUrls.proFeatures);

        // dokan pro feature sections are visible
        await this.multipleElementVisible(selectors.proFeatures);

        // dokan settings pro advertisement
        await this.goToDokanSettings();

        // settings pro advertisement banner elements are visible
        await this.multipleElementVisible(selectors.settings.proAdvertisementBanner);
    }
}
