import { Page, expect } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

const { BASE_URL } = process.env;

// ============================================
// URLS
// ============================================
export const subUrls = {
    help: 'wp-admin/admin.php?page=dokan#/help',
};

// ============================================
// SELECTORS
// ============================================
const selectors = {
    help: {
        helpText: '.dokan-help-page h1',
        basics: {
            basics: '//span[contains(text(), "Basics")]/../../..',
            collapsibleButton: '//span[contains(text(), "Basics")]/../../..//button',
            basicsList: '//span[contains(text(), "Basics")]/../../..//ul',
        },
        paymentAndShipping: {
            paymentAndShipping: '//span[contains(text(), "Payment and Shipping")]/../../..',
            collapsibleButton: '//span[contains(text(), "Payment and Shipping")]/../../..//button',
            paymentAndShippingList: '//span[contains(text(), "Basics")]/../../..//ul',
        },
        vendorRelatedQuestions: {
            vendorRelatedQuestions: '//span[contains(text(), "Vendor Related Questions")]/../../..',
            collapsibleButton: '//span[contains(text(), "Vendor Related Questions")]/../../..//button',
            vendorRelatedQuestionsList: '//span[contains(text(), "Basics")]/../../..//ul',
        },
        miscellaneous: {
            miscellaneous: '//span[contains(text(), "Miscellaneous")]/../../..',
            collapsibleButton: '//span[contains(text(), "Miscellaneous")]/../../..//button',
            miscellaneousList: '//span[contains(text(), "Miscellaneous")]/../../..//button',
        },
    },
    dashboard: {
        header: {
            getHelpMenu: '.dokan-admin-header-menu .menu-icon',
        },
        getHelp: {
            whatsNew: '//div[@class="list-item"]//a[normalize-space()="What’s New"]',
            getSupport: '//div[@class="list-item"]//a[normalize-space()="Get Support"]',
            community: '//div[@class="list-item"]//a[normalize-space()="Community"]',
            documentation: '//div[@class="list-item"]//a[normalize-space()="Documentation"]',
            faq: '//div[@class="list-item"]//a[normalize-space()="FAQ"]',
            basicAndFundamental: '//div[@class="list-item"]//a[normalize-space()="Basic & Fundamental"]',
            requestAFeature: '//div[@class="list-item"]//a[normalize-space()="Request a Feature"]',
            importDummyData: '//div[@class="list-item"]//a[normalize-space()="Import dummy data"]',
        },
    },
};

// ============================================
// HELP PAGE
// ============================================
export class HelpPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    private createUrl(subPath: string): string {
        return BASE_URL + '/' + subPath;
    }

    private getCurrentUrl(): string {
        return this.page.url();
    }

    private isCurrentUrl(subPath: string): boolean {
        const url = new URL(this.getCurrentUrl());
        const currentURL = url.href.replace(/[/]$/, '');
        return currentURL === this.createUrl(subPath);
    }

    private async goIfNotThere(subPath: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' = 'domcontentloaded'): Promise<void> {
        if (!this.isCurrentUrl(subPath)) {
            const url = this.createUrl(subPath);
            await expect(async () => {
                await this.page.goto(url, { waitUntil });
                expect(this.getCurrentUrl()).toMatch(subPath);
            }).toPass();
        }
    }

    private async toBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeVisible();
    }

    private async hover(selector: string): Promise<void> {
        await this.page.locator(selector).hover();
    }

    private async multipleElementVisible(sels: Record<string, any>): Promise<void> {
        for (const key in sels) {
            const v = sels[key];
            if (typeof v === 'string') await this.toBeVisible(v);
        }
    }

    // ===========================================
    // PAGE METHODS
    // ===========================================

    async adminHelpRenderProperly(): Promise<void> {
        await this.goIfNotThere(subUrls.help, 'networkidle');
        await this.toBeVisible(selectors.help.helpText);
        await this.multipleElementVisible(selectors.help.basics);
        await this.multipleElementVisible(selectors.help.paymentAndShipping);
        await this.multipleElementVisible(selectors.help.vendorRelatedQuestions);
        await this.multipleElementVisible(selectors.help.miscellaneous);
    }

    async adminGetHelpDropdownRenderProperly(): Promise<void> {
        await this.goIfNotThere(subUrls.help);
        await this.hover(selectors.dashboard.header.getHelpMenu);
        await this.multipleElementVisible(selectors.dashboard.getHelp);
    }
}
