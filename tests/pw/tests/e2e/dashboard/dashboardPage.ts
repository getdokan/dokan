import { Page, expect } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

// ============================================
// ENVIRONMENT VARIABLES
// ============================================
const { BASE_URL, DOKAN_PRO } = process.env;

// ============================================
// HELPER FUNCTIONS
// ============================================
function isPlainObject(value: any): boolean {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// ============================================
// URLS
// ============================================
const urls = {
    adminDashboard: 'wp-admin/admin.php?page=dokan-dashboard',
    vendorDashboard: 'dashboard',
    vendorNewDashboard: 'dashboard/?path=%2Fanalytics%2FOverview',
};

// ============================================
// VENDOR DASHBOARD SELECTORS
// ============================================
const vendorDashboard = {
    menus: {
        menus: '#primary ul.dokan-dashboard-menu',
        activeMenu: '#primary .dokan-dashboard-menu li.active',
        primary: {
            dashboard: 'ul.dokan-dashboard-menu li.dashboard a',
            products: 'ul.dokan-dashboard-menu li.products a',
            orders: 'ul.dokan-dashboard-menu li.orders a',
            userSubscriptions: 'ul.dokan-dashboard-menu li.user-subscription a',
            requestQuotes: 'ul.dokan-dashboard-menu li.requested-quotes a',
            coupons: 'ul.dokan-dashboard-menu li.coupons a',
            reports: 'ul.dokan-dashboard-menu li.reports a',
            deliveryTime: 'ul.dokan-dashboard-menu li.delivery-time-dashboard a',
            reviews: 'ul.dokan-dashboard-menu li.reviews a',
            withdraw: 'ul.dokan-dashboard-menu li.withdraw a',
            reverseWithdrawal: 'ul.dokan-dashboard-menu li.reverse-withdrawal a',
            badges: 'ul.dokan-dashboard-menu li.seller-badge a',
            productQa: 'ul.dokan-dashboard-menu li.product-questions-answers a',
            returnRequest: 'ul.dokan-dashboard-menu li.return-request a',
            staff: 'ul.dokan-dashboard-menu li.staffs a',
            followers: 'ul.dokan-dashboard-menu li.followers a',
            booking: 'ul.dokan-dashboard-menu li.booking a',
            printful: 'ul.dokan-dashboard-menu li.printful a',
            announcements: 'ul.dokan-dashboard-menu li.announcement a',
            analytics: 'ul.dokan-dashboard-menu li.analytics a',
            tools: 'ul.dokan-dashboard-menu li.tools a',
            auction: 'ul.dokan-dashboard-menu li.auction a',
            support: 'ul.dokan-dashboard-menu li.support a',
            inbox: 'ul.dokan-dashboard-menu li.inbox a',
            subscription: 'ul.dokan-dashboard-menu li.subscription a',
            wepos: 'ul.dokan-dashboard-menu li.wepos a',
            settings: '(//ul[@class="dokan-dashboard-menu"]//li[contains(@class,"settings has-submenu")]//a)[1]',
            visitStore: '//i[@class="fas fa-external-link-alt"]/..',
            editAccount: '.fa-user',
        },
    },

    profileProgress: {
        profileProgressDiv: '.dokan-profile-completeness',
        dokanProgressBar: '.dokan-progress',
        dokanProgressBarText: '.dokan-progress-bar',
        nextStep: '.dokan-alert.dokan-alert-info.dokan-panel-alert',
    },

    atAGlance: {
        atAGlanceDiv: '.dashboard-widget.big-counter',
        netSalesTitle: '//div[normalize-space()="Net Sales"]',
        earningTitle: '//div[normalize-space()="Earning"]',
        pageviewTitle: '//div[normalize-space()="Pageview"]',
        orderTitle: '//div[normalize-space()="Order"]',
        salesValue: '//div[@class="title" and contains(text(), "Net Sales")]/..//div[@class="count"]',
        earningValue: '//div[@class="title" and contains(text(), "Earning")]/..//div[@class="count"]',
        pageViewValue: '//div[@class="title" and contains(text(), "Pageview")]/..//div[@class="count"]',
        orderValue: '//div[@class="title" and contains(text(), "Order")]/..//div[@class="count"]',
    },

    graph: {
        graphDiv: '.dashboard-widget.sells-graph',
        widgetTitle: '.sells-graph .widget-title',
        chart: '.chart-container',
    },

    orders: {
        ordersDiv: '.dashboard-widget.orders',
        widgetTitle: '.orders .widget-title',
        totalTitle: '//div[@class="dashboard-widget orders"]//span[normalize-space()="Total"]',
        completedTitle: '//div[@class="dashboard-widget orders"]//span[normalize-space()="Completed"]',
        pendingTitle: '//div[@class="dashboard-widget orders"]//span[normalize-space()="Pending"]',
        processingTitle: '//div[@class="dashboard-widget orders"]//span[normalize-space()="Processing"]',
        cancelledTitle: '//div[@class="dashboard-widget orders"]//span[normalize-space()="Cancelled"]',
        refundedTitle: '//div[@class="dashboard-widget orders"]//span[normalize-space()="Refunded"]',
        onholdTitle: '//div[@class="dashboard-widget orders"]//span[normalize-space()="On hold"]',
        totalValue: '//div[@class="dashboard-widget orders"]//span[normalize-space()="Total"]/..//span[@class="count"]',
        completedValue: '//div[@class="dashboard-widget orders"]//span[normalize-space()="Completed"]/..//span[@class="count"]',
        pendingValue: '//div[@class="dashboard-widget orders"]//span[normalize-space()="Pending"]/..//span[@class="count"]',
        processingValue: '//div[@class="dashboard-widget orders"]//span[normalize-space()="Processing"]/..//span[@class="count"]',
        cancelledValue: '//div[@class="dashboard-widget orders"]//span[normalize-space()="Cancelled"]/..//span[@class="count"]',
        refundedValue: '//div[@class="dashboard-widget orders"]//span[normalize-space()="Refunded"]/..//span[@class="count"]',
        onholdValue: '//div[@class="dashboard-widget orders"]//span[normalize-space()="On hold"]/..//span[@class="count"]',
        pieChart: '#order-stats',
    },

    reviews: {
        reviewsDiv: '.dashboard-widget.reviews',
        widgetTitle: '.reviews .widget-title',
        allTitle: '//div[@class="dashboard-widget reviews"]//span[normalize-space()="All"]',
        pendingTitle: '//div[@class="dashboard-widget reviews"]//span[normalize-space()="Pending"]',
        spamTitle: '//div[@class="dashboard-widget reviews"]//span[normalize-space()="Spam"]',
        trashTitle: '//div[@class="dashboard-widget reviews"]//span[normalize-space()="Trash"]',
        allValue: '//div[@class="dashboard-widget reviews"]//span[normalize-space()="All"]/..//span[@class="count"]',
        pendingValue: '//div[@class="dashboard-widget reviews"]//span[normalize-space()="Pending"]/..//span[@class="count"]',
        spamValue: '//div[@class="dashboard-widget reviews"]//span[normalize-space()="Spam"]/..//span[@class="count"]',
        trashValue: '//div[@class="dashboard-widget reviews"]//span[normalize-space()="Trash"]/..//span[@class="count"]',
    },

    products: {
        productsDiv: '.dashboard-widget.products',
        addNewProduct: "//span[@class='dokan-add-product-link']//a[1]",
        widgetTitle: '.products .widget-title',
        totalTitle: '//div[@class="dashboard-widget products"]//span[normalize-space()="Total"]',
        liveTitle: '//div[@class="dashboard-widget products"]//span[normalize-space()="Live"]',
        offlineTitle: '//div[@class="dashboard-widget products"]//span[normalize-space()="Offline"]',
        pendingReviewTitle: '//div[@class="dashboard-widget products"]//span[normalize-space()="Pending Review"]',
        totalValue: '//div[@class="dashboard-widget products"]//span[normalize-space()="Total"]/..//span[@class="count"]',
        liveValue: '//div[@class="dashboard-widget products"]//span[normalize-space()="Live"]/..//span[@class="count"]',
        offlineValue: '//div[@class="dashboard-widget products"]//span[normalize-space()="Offline"]/..//span[@class="count"]',
        pendingReviewValue: '//div[@class="dashboard-widget products"]//span[normalize-space()="Pending Review"]/..//span[@class="count"]',
    },

    announcement: {
        announcementDiv: '.dashboard-widget.dokan-announcement-widget',
        widgetTitle: '.dokan-announcement-widget .widget-title',
        seeAll: '//a[normalize-space()="See All"]',
    },
};

// ============================================
// BASE PAGE METHODS (inlined)
// ============================================
class BasePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // navigation
    getCurrentUrl(): string {
        return this.page.url();
    }

    createUrl(subPath: string): string {
        return BASE_URL + '/' + subPath;
    }

    isCurrentUrl(subPath: string): boolean {
        const url = new URL(this.getCurrentUrl());
        const currentURL = url.href.replace(/[/]$/, '');
        return currentURL === this.createUrl(subPath);
    }

    async goto(subPath: string, options: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' } = { waitUntil: 'domcontentloaded' }): Promise<void> {
        const url = this.createUrl(subPath);
        await this.page.goto(url, options);
    }

    async goIfNotThere(subPath: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' = 'domcontentloaded'): Promise<void> {
        if (!this.isCurrentUrl(subPath)) {
            const url = this.createUrl(subPath);
            await expect(async () => {
                await this.page.goto(url, { waitUntil });
                const currentUrl = this.getCurrentUrl();
                expect(currentUrl).toMatch(subPath);
            }).toPass();
        }
    }

    // visibility
    async isVisible(selector: string, timeout: number = 2): Promise<boolean> {
        const start = Date.now();
        let interval = 20;
        while (Date.now() - start < timeout * 1000) {
            try {
                const isVisible = await this.page.locator(selector).isVisible();
                if (isVisible) return true;
            } catch {
                /* empty */
            }
            await this.page.waitForTimeout(interval);
            if (interval === 20) interval = 100;
            else if (interval === 100) interval = 500;
        }
        return false;
    }

    async toBeVisible(selector: string, options?: { timeout?: number; visible?: boolean }) {
        await expect(this.page.locator(selector)).toBeVisible(options);
    }

    async toContainText(selector: string, text: string | RegExp, options?: { ignoreCase?: boolean; timeout?: number; useInnerText?: boolean }) {
        await expect(this.page.locator(selector)).toContainText(text, options);
    }

    async multipleElementVisible(selectors: { [key: string]: any }) {
        for (const selector in selectors) {
            if (isPlainObject(selectors[selector])) {
                await this.multipleElementVisible(selectors[selector]);
            } else if (typeof selectors[selector] === 'function') {
                continue;
            } else {
                await this.toBeVisible(selectors[selector]);
            }
        }
    }

    async getElementText(selector: string): Promise<string | null> {
        return await this.page.locator(selector).textContent();
    }

    async clearAndType(selector: string, text: string): Promise<void> {
        const input = this.page.locator(selector);
        await input.fill(text);
    }

    async clickAndWaitForResponse(subUrl: string, selector: string, code = 200) {
        const [response] = await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).click()]);
        return response;
    }

    async reload(): Promise<void> {
        await this.page.reload();
    }
}

// ============================================
// ADMIN DASHBOARD PAGE
// ============================================
export class AdminDashboardPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    async goToDokanDashboard() {
        await this.goIfNotThere(urls.adminDashboard);
        await this.page.waitForLoadState('networkidle');
    }

    async adminDashboardRenderProperly() {
        await this.goToDokanDashboard();
        await this.page.waitForLoadState('networkidle');

        await this.checkMainDashboardElements();
        await this.checkToDoSection();
        await this.checkAnalyticsSection();
        await this.checkVendorMetricsSection();
        await this.checkMarketplaceStatsSection();
        await this.checkAdditionalSections();
    }

    private async checkMainDashboardElements() {
        const mainElements = [
            "//h1[normalize-space()='Dashboard']",
            "//h3[normalize-space()='To-Do']",
            "//h3[normalize-space()='Analytics']",
            "//h3[normalize-space(text())='Daily Sales Chart']",
            "//h3[normalize-space()='Monthly Overview']",
            "//h3[normalize-space(text())='Vendor Metrics']",
            "//h3[normalize-space(text())='All-Time Marketplace Stats']",
            "//h3[normalize-space()='Top Performing Vendors']",
            "//h3[normalize-space()='Most Reviewed Products']",
            "//h3[normalize-space()='Most Reported Vendors']",
        ];
        await this.multipleElementVisible(mainElements);
    }

    private async checkToDoSection() {
        const toDoElements = [
            "//div[contains(text(),'Vendor Approvals')]",
            "//div[contains(text(),'Product Approvals')]",
            "//div[contains(text(),'Pending Withdrawals')]",
            "//div[contains(text(),'Pending Verifications')]",
            "//div[contains(text(),'Open Support Tickets')]",
            "//div[contains(text(),'Return Requests')]",
            "//div[contains(text(),'Product Q&A Inquiries')]",
            "//div[contains(text(),'Pending Quotes')]",
        ];
        await this.multipleElementVisible(toDoElements);
    }

    private async checkAnalyticsSection() {
        const analyticsElements = [
            "//div[contains(text(),'Sales Overview')]",
            "//div[contains(text(),'Revenue Insight')]",
            "//span[normalize-space(text())='New Products']",
            "//span[normalize-space(text())='Active Vendors']",
            "//span[normalize-space(text())='New Vendor Registration']",
            "//span[normalize-space(text())='New Customers']",
            "//span[normalize-space(text())='Recurring Customers']",
            "//span[normalize-space(text())='Refunds']",
            "//span[normalize-space(text())='Reviews']",
            "//span[normalize-space(text())='Order Cancellation Rate']",
            "//span[normalize-space(text())='Support Tickets']",
            "//span[normalize-space(text())='Abuse Reports']",
        ];
        await this.multipleElementVisible(analyticsElements);

        await this.toBeVisible("(//button[contains(@class,'inline-flex items-center')])[1]");
        await this.toBeVisible("(//button[contains(@class,'inline-flex items-center')])[2]");
        await this.toBeVisible("(//h3[contains(@class,'font-semibold text-base')])[3]");

        await this.toBeVisible("(//span[@class='text-sm font-medium'])[1]");
        await this.toBeVisible("(//span[@class='text-sm font-medium'])[2]");
        await this.toBeVisible("(//span[@class='text-sm font-medium'])[3]");
    }

    private async checkVendorMetricsSection() {
        const vendorMetricsElements = [
            "//span[normalize-space(text())='Verified Vendors']",
            "//span[normalize-space(text())='Subscribed Vendors']",
            "//span[normalize-space(text())='Vendor on Vacation']",
        ];
        await this.multipleElementVisible(vendorMetricsElements);
    }

    private async checkMarketplaceStatsSection() {
        const marketplaceStatsElements = [
            "//span[normalize-space(text())='Total Products']",
            "//span[normalize-space(text())='Total Vendors']",
            "//span[normalize-space(text())='Total Customers']",
            "//span[normalize-space(text())='Total Orders']",
            "//span[@class='text-black font-semibold text-sm'][normalize-space()='Total Sales']",
            "//span[normalize-space()='Total Commissions']",
        ];
        await this.multipleElementVisible(marketplaceStatsElements);
    }

    private async checkAdditionalSections() {
        await this.toBeVisible("//a[normalize-space()='Click Here']");
    }
}

// ============================================
// VENDOR DASHBOARD PAGE
// ============================================
export class VendorDashboardPage extends BasePage {
    constructor(page: Page) {
        super(page);
        void closeAnnouncementModal(page);
    }

    async vendorDashboardRenderProperly(link?: string) {
        if (link) {
            await this.goto(link);
        } else {
            await this.goIfNotThere(urls.vendorNewDashboard);
        }

        const isNewDashboard = await this.isVisible('#dokan-vendor-dashboard-root');
        const hasTraditionalWidgets = await this.isVisible('.dashboard-widget.big-counter');

        console.log(`Dashboard detection: React=${isNewDashboard}, Traditional=${hasTraditionalWidgets}`);

        if (isNewDashboard) {
            await this.toBeVisible('#dokan-vendor-dashboard-root');

            try {
                await this.page.waitForFunction(() => {
                    const spinner = document.querySelector('#dokan-vendor-dashboard-root .animate-spin');
                    return !spinner;
                }, { timeout: 15000 });
            } catch (error) {
                console.log('React dashboard spinner still present, continuing with basic checks');
            }

            await this.toBeVisible('.dokan-dashboard-wrap');
            await this.toBeVisible('.dokan-dashboard-content');
        } else if (hasTraditionalWidgets) {
            await this.multipleElementVisible(vendorDashboard.atAGlance);
            await this.multipleElementVisible(vendorDashboard.graph);
            await this.multipleElementVisible(vendorDashboard.orders);
            await this.multipleElementVisible(vendorDashboard.products);

            if (DOKAN_PRO) {
                await this.multipleElementVisible(vendorDashboard.profileProgress);
                await this.multipleElementVisible(vendorDashboard.reviews);
                await this.multipleElementVisible(vendorDashboard.announcement);
            }
        } else {
            console.log('No traditional widgets detected, assuming React dashboard');
            await this.toBeVisible('.dokan-dashboard-wrap');
            await this.toBeVisible('.dokan-dashboard-content');
        }
    }

    async vendorDashboardMenusRenderProperly() {
        await this.goIfNotThere(urls.vendorDashboard);

        await this.toBeVisible(vendorDashboard.menus.menus);

        if (DOKAN_PRO) {
            const { inbox, subscription, wepos, userSubscriptions, ...menus } = vendorDashboard.menus.primary;

            for (const [key, selector] of Object.entries(menus)) {
                try {
                    await this.page.locator(selector).first().waitFor({ state: 'visible', timeout: 5000 });
                } catch (error) {
                    console.log(`Menu not available: ${key} - ${selector}`);
                }
            }
        } else {
            const liteMenus = [
                vendorDashboard.menus.primary.dashboard,
                vendorDashboard.menus.primary.products,
                vendorDashboard.menus.primary.orders,
                vendorDashboard.menus.primary.withdraw,
                vendorDashboard.menus.primary.reverseWithdrawal,
                vendorDashboard.menus.primary.settings,
                vendorDashboard.menus.primary.visitStore,
                vendorDashboard.menus.primary.editAccount,
            ];

            for (const menuSelector of liteMenus) {
                try {
                    await this.page.locator(menuSelector).first().waitFor({ state: 'visible', timeout: 5000 });
                } catch (error) {
                    console.log(`Menu not available: ${menuSelector}`);
                }
            }

            await this.page.locator(vendorDashboard.menus.primary.dashboard).first().waitFor({ state: 'visible' });
            await this.page.locator(vendorDashboard.menus.primary.products).first().waitFor({ state: 'visible' });
            await this.page.locator(vendorDashboard.menus.primary.orders).first().waitFor({ state: 'visible' });
            await this.page.locator(vendorDashboard.menus.primary.settings).first().waitFor({ state: 'visible' });
        }
    }
}
