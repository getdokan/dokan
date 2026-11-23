import { Page, expect } from '@playwright/test';
import { request as pwRequest, APIRequestContext } from '@playwright/test';
import { toPath, closeAnnouncementModal } from '@utils/helpers';
import { ApiUtils as RealApiUtils } from '@utils/apiUtils';

// ============================================================================
// Seller Badge (Pro) page object — ported from the pre-refactor
// tests/pw/pages/sellerBadgesPage.ts (git e2ec507de) into the current
// self-contained architecture. Behaviour, flow and assertions are preserved
// 1:1; the AdminPage/StoresPage base-class helpers are inlined as raw
// Playwright calls and the selectors are co-located below.
//
// data / payloads / ApiUtils are re-exported REAL from @utils so the spec's
// beforeAll can seed badges over REST and toggle the seller_badge module.
// ============================================================================

// Re-export the REAL test data + payloads used across the spec.
export { data } from '@utils/testData';
export { payloads } from '@utils/payloads';

import { data } from '@utils/testData';

/**
 * Null-tolerant ApiUtils wrapper (mirrors the other revived legacy pages).
 *
 * The spec constructs `new ApiUtils(null)`. The real ApiUtils requires an
 * APIRequestContext, so when null is passed we lazily create our own context
 * and swap it in before the first real REST call.
 */
export class ApiUtils extends RealApiUtils {
    private lazyCtx: Promise<APIRequestContext> | null = null;

    constructor(ctx: APIRequestContext | null) {
        super(ctx as APIRequestContext);
        if (!ctx) this.lazyCtx = pwRequest.newContext();
    }

    private async ready(): Promise<void> {
        if (this.lazyCtx) {
            const ctx = await this.lazyCtx;
            this.lazyCtx = null;
            (this as { request: APIRequestContext }).request = ctx;
        }
    }

    override async createSellerBadge(...args: Parameters<RealApiUtils['createSellerBadge']>): ReturnType<RealApiUtils['createSellerBadge']> {
        await this.ready();
        return super.createSellerBadge(...args);
    }

    override async getSellerBadgeId(...args: Parameters<RealApiUtils['getSellerBadgeId']>): ReturnType<RealApiUtils['getSellerBadgeId']> {
        await this.ready();
        return super.getSellerBadgeId(...args);
    }

    override async deleteSellerBadge(...args: Parameters<RealApiUtils['deleteSellerBadge']>): ReturnType<RealApiUtils['deleteSellerBadge']> {
        await this.ready();
        return super.deleteSellerBadge(...args);
    }

    override async deleteAllSellerBadges(...args: Parameters<RealApiUtils['deleteAllSellerBadges']>): ReturnType<RealApiUtils['deleteAllSellerBadges']> {
        await this.ready();
        return super.deleteAllSellerBadges(...args);
    }

    override async activateModules(...args: Parameters<RealApiUtils['activateModules']>): ReturnType<RealApiUtils['activateModules']> {
        await this.ready();
        return super.activateModules(...args);
    }

    override async deactivateModules(...args: Parameters<RealApiUtils['deactivateModules']>): ReturnType<RealApiUtils['deactivateModules']> {
        await this.ready();
        return super.deactivateModules(...args);
    }

    override async dispose(): Promise<void> {
        await this.ready();
        await super.dispose();
    }
}

// ============================================================================
// CO-LOCATED SELECTORS (recovered from pre-refactor selectors.ts @ e2ec507de)
// ============================================================================
const selectors = {
    admin: {
        // Dokan admin menu link
        menu: {
            sellerBadge: '//li[contains(@class,"toplevel_page_dokan")]//a[text()="Seller Badge"]',
        },

        // Dokan > Vendors screen (badge filter + acquired-badges summary)
        vendors: {
            search: '#post-search-input',
            numberOfRows: 'div.vendor-list table tbody tr',
            numberOfRowsFound: '.tablenav.top .displaying-num',
            noRowsFound: '//td[normalize-space()="No vendors found."]',
            filters: {
                filterByBadges: '#badge_name',
                clearFilter: '//select[@id="badge_name"]/..//button',
            },
            vendorViewDetails: (username: string) => `//td//a[contains(text(), '${username}')]`,
            vendorCell: (username: string) => `//td//a[contains(text(), '${username}')]/../..`,
            badgesAcquired: 'div.seller-badge-list-card',
        },

        // Dokan > Seller Badge screen
        sellerBadge: {
            sellerBadgeDiv: 'div.seller-badge-list',
            sellerBadgeText: '.seller-badge-list h1',
            createBadge: '//a[normalize-space()="+ Create Badge"]',

            navTabs: {
                all: '//ul[@class="subsubsub"]//li//a[contains(text(),"All")]',
                published: '//ul[@class="subsubsub"]//li//a[contains(text(),"Published")]',
                draft: '//ul[@class="subsubsub"]//li//a[contains(text(),"Draft")]',
            },

            bulkActions: {
                selectAll: 'thead .manage-column input',
                selectAction: '.tablenav.top #bulk-action-selector-top',
                applyAction: '.tablenav.top .button.action',
            },

            search: '#post-search-input',

            table: {
                sellerBadgeTable: '.seller-badge-list table',
                badgesNameColumn: 'thead th.badge_name',
                badgeEventColumn: 'thead th.event_type',
                noOfVendorsColumn: 'thead th.vendor_count',
                statusColumn: 'thead th.badge_status',
            },

            numberOfRows: 'div#seller_badge_list_table table tbody tr',
            noRowsFound: '//td[normalize-space()="No badges found."]',
            sellerBadgeRow: (name: string) => `//a[contains(text(),'${name}')]/../../..`,
            sellerBadgeCell: (name: string) => `//a[contains(text(),'${name}')]/../..`,
            sellerBadgeLevel: (name: string) => `//a[contains(text(),'${name}')]/../../..//span[@class="level_count"]//strong`,
            sellerBadgeEdit: (name: string) => `//a[contains(text(),'${name}')]/../..//span[@class="edit"]//a`,
            sellerBadgePreview: (name: string) => `//a[contains(text(),'${name}')]/../..//span[@class="view"]//a`,
            sellerBadgeVendors: (name: string) => `//a[contains(text(),'${name}')]/../..//span[@class="show_vendors"]//a`,
            sellerBadgePublish: (name: string) => `//a[contains(text(),'${name}')]/../..//span[@class="publish"]//a`,
            sellerBadgeDraft: (name: string) => `//a[contains(text(),'${name}')]/../..//span[@class="draft"]//a`,
            sellerBadgeDelete: (name: string) => `//a[contains(text(),'${name}')]/../..//span[@class="delete"]//a`,

            confirmAction: '.swal2-actions .swal2-confirm',
            successMessage: '.swal2-actions .swal2-confirm',

            previewBadgeDetails: {
                modal: '.seller-badge-modal-content',
                modalHeader: {
                    modalImage: '.modal-header .modal-img',
                    modalTitle: '.modal-header .modal-title',
                    modalClose: '.modal-header .modal-close',
                },
                levelBox: '.modal-level-box',
            },

            badgeDetails: {
                badgeEvents: {
                    badgeEventBox: 'div.badge__event-box',
                    badgeEventDropdown: '.seller-badge-event-dropdown',
                    badgeEvent: (name: string) => `//h3[normalize-space()="${name}"]/../..`,
                    badgePublishedStatus: (name: string) => `//h3[normalize-space()="${name}"]/..//i[contains(@class, "published")]`,
                    badgeName: 'input#title',
                },

                badgeCondition: {
                    badgeConditionBox: 'div.badge__condition-box',
                    badgeLevel: 'span.badge-level',
                    startingLevelValue: '//span[normalize-space()="Level 1"]/..//input',
                    addBadgeLevel: 'div.dokan-logical-container button',
                    removeBadgeLevel: '(//i[@class="remove-level"])[2]',
                    verifiedSellerMethod1: (number: number) => `(//option[normalize-space()="Select a method"]/..)[${number}]`,
                    trendingProductPeriod: '.dokan-logical-container select',
                    trendingProductTopBestSellingProduct: '.dokan-logical-container input',
                },

                badgePhoto: {
                    uploadBadgeImage: '//div[@class="dokan-upload-image-container"]//img',
                    badgePhotoReset: '//a[normalize-space()="restore default."]',
                },

                badgeStatus: {
                    badgeStatus: 'select#status',
                    create: '//button[normalize-space()="Create"]',
                    update: '//button[normalize-space()="Update"]',
                    goBack: '//button[normalize-space()="Go Back"]',
                },

                confirmBadgeUpdate: '.swal2-actions .swal2-confirm',
                badgeAddedSuccessfully: '.swal2-actions .swal2-confirm',
            },
        },
    },

    vendor: {
        // Vendor dashboard menu link + dashboard wrapper
        menu: {
            // Classic (Vue) sidebar link — now server-rendered but visibility:hidden
            // because the vendor dashboard navigation moved to the React shell (Dokan 5.0).
            badges: 'ul.dokan-dashboard-menu li.seller-badge a',
            // Live React vendor-dashboard nav link (the visible menu item). Present only
            // while the seller_badge module is active; removed when the module is disabled.
            badgesNav: 'a[href*="#seller-badge"]',
        },
        dashboardDiv: 'div.dokan-dashboard-wrap',

        // Vendor dashboard > Badges screen
        vBadges: {
            badgesText: '#dokan-seller-badge .entry-title',
            description: '//p[contains(text(), "Vendors with a good selling history on our marketplace are identified by seller badges")]',
            search: '#post-search-input',
            filterBadges: '.tablenav.top .actions select', // all, my_badges, available_badges

            table: {
                table: '#dokan-seller-badge table',
                acquiredBadgeColumn: 'thead th[class="column badge_logo"]',
                descriptionColumn: 'thead th[class="column badge_description"]',
                actionColumn: 'thead th[class="column badge_view"]',
            },

            sellerBadgeCell: (name: string) => `//strong[contains(text(),'${name}')]/../..`,
            numberOfRows: '#dokan-seller-badge table tbody tr',
            noRowsFound: '//td[contains(text(), "No badges found")]',

            congratsModal: {
                closeModal: '.modal-close.modal-close-link',
                sellerBadgeModal: '.seller-badge-modal .seller-badge-modal-content',
                modalBody: '.modal-body',
                congratsMessage: '//div[@class="modal-title"]//h2[contains(text(), "Congratulations!")]',
                acquiredBadges: '//div[@class="modal-sub-title"]//h3[contains(text(), "Acquired Badge & Level:")]',
            },
        },
    },
};

const sellerBadgeAdmin = selectors.admin.sellerBadge;
const sellerBadgeVendor = selectors.vendor.vBadges;
const vendorsAdmin = selectors.admin.vendors;

export class SellerBadgesPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Inlined base-class helpers (raw Playwright) ----

    // goto(subUrl) — resolves the relative sub-url against BASE_URL. `force`
    // reloads afterwards (base helper parity for the disable-module flow).
    private async goto(subPath: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' = 'domcontentloaded', force = false): Promise<void> {
        await this.page.goto(toPath(subPath), { waitUntil });
        if (force) {
            await this.page.reload({ waitUntil });
        }
    }

    // click(selector) then wait for the matching REST response.
    private async clickAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<void> {
        await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).click()]);
    }

    // fill(selector, text) then wait for the matching REST response.
    private async typeAndWaitForResponse(subUrl: string, selector: string, text: string, code = 200): Promise<void> {
        await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).fill(text)]);
    }

    // isVisible(selector) — polls up to `timeout` ms, returns boolean (no throw).
    private async isVisible(selector: string, timeout = 2000): Promise<boolean> {
        return await this.page
            .locator(selector)
            .first()
            .waitFor({ state: 'visible', timeout })
            .then(() => true)
            .catch(() => false);
    }

    // clickIfVisible(selector) — click only when present within ~1s.
    private async clickIfVisible(selector: string): Promise<void> {
        if (await this.isVisible(selector, 1000)) {
            await this.page.locator(selector).first().click().catch(() => undefined);
        }
    }

    // multipleElementVisible(selectorObject) — recursive; strings asserted
    // visible, functions skipped (mirrors AdminPage.multipleElementVisible).
    private async multipleElementVisible(obj: Record<string, unknown>): Promise<void> {
        for (const key of Object.keys(obj)) {
            const val = obj[key];
            if (typeof val === 'function') continue;
            if (val && typeof val === 'object' && !Array.isArray(val)) {
                await this.multipleElementVisible(val as Record<string, unknown>);
            } else if (typeof val === 'string') {
                await expect(this.page.locator(val)).toBeVisible();
            }
        }
    }

    // ---- Seller badge (admin) ----

    // enable seller badge module
    async enableSellerBadgeModule(): Promise<void> {
        // dokan menu
        await this.goto(data.subUrls.backend.dokan.dokan);
        await expect(this.page.locator(selectors.admin.menu.sellerBadge)).toBeVisible();

        // vendor dashboard menu (React shell nav link is the visible menu item)
        await this.goto(data.subUrls.frontend.vDashboard.dashboard);
        await expect(this.page.locator(`${selectors.vendor.menu.badgesNav}:visible`).first()).toBeVisible();
    }

    // disable seller badge module
    async disableSellerBadgeModule(): Promise<void> {
        // dokan menu
        await this.goto(data.subUrls.backend.dokan.dokan, 'domcontentloaded', true);
        await expect(this.page.locator(selectors.admin.menu.sellerBadge)).toBeHidden();

        // dokan menu page
        await this.goto(data.subUrls.backend.dokan.sellerBadge);
        await expect(this.page.locator(sellerBadgeAdmin.sellerBadgeDiv)).toBeHidden();

        // vendor dashboard menu (React shell nav link is removed when the module is off)
        await this.goto(data.subUrls.frontend.vDashboard.dashboard);
        await expect(this.page.locator(selectors.vendor.menu.badgesNav)).toHaveCount(0);

        // vendor dashboard menu page
        await this.goto(data.subUrls.frontend.vDashboard.badges);
        await expect(this.page.locator(selectors.vendor.dashboardDiv)).toBeHidden();
    }

    // seller badge render properly (admin)
    async adminSellerBadgeRenderProperly(): Promise<void> {
        await this.goto(data.subUrls.backend.dokan.sellerBadge);

        await expect(this.page.locator(sellerBadgeAdmin.sellerBadgeText)).toBeVisible();
        await expect(this.page.locator(sellerBadgeAdmin.createBadge)).toBeVisible();
        await this.multipleElementVisible(sellerBadgeAdmin.navTabs);
        await this.multipleElementVisible(sellerBadgeAdmin.bulkActions);
        await expect(this.page.locator(sellerBadgeAdmin.search)).toBeVisible();
        await this.multipleElementVisible(sellerBadgeAdmin.table);
    }

    // search seller badge
    async searchSellerBadge(badgeName: string): Promise<void> {
        await this.goto(data.subUrls.backend.dokan.sellerBadge);
        await this.page.locator(sellerBadgeAdmin.search).fill('');
        await this.typeAndWaitForResponse(data.subUrls.api.dokan.sellerBadge, sellerBadgeAdmin.search, badgeName);
        await expect(this.page.locator(sellerBadgeAdmin.numberOfRows)).toHaveCount(1);
        await expect(this.page.locator(sellerBadgeAdmin.sellerBadgeCell(badgeName))).toBeVisible();
    }

    // view seller badge
    async viewSellerBadge(badgeName: string): Promise<void> {
        await this.searchSellerBadge(badgeName);

        await this.page.locator(sellerBadgeAdmin.sellerBadgeRow(badgeName)).hover();
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadge, sellerBadgeAdmin.sellerBadgeEdit(badgeName));

        // badge condition box is visible
        await expect(this.page.locator(sellerBadgeAdmin.badgeDetails.badgeCondition.badgeConditionBox)).toBeVisible();

        // badge event elements are visible (drop the row-scoped function selectors)
        const { badgeEvent, badgePublishedStatus, ...badgeEvents } = sellerBadgeAdmin.badgeDetails.badgeEvents;
        await this.multipleElementVisible(badgeEvents);

        // badge photo elements are visible
        await this.multipleElementVisible(sellerBadgeAdmin.badgeDetails.badgePhoto);

        // badge status elements are visible (drop the create button)
        const { create, ...badgeStatus } = sellerBadgeAdmin.badgeDetails.badgeStatus;
        await this.multipleElementVisible(badgeStatus);
    }

    // create seller badge
    async createSellerBadge(badge: any): Promise<void> {
        await this.goto(data.subUrls.backend.dokan.sellerBadge);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadgeEvent, sellerBadgeAdmin.createBadge);
        await this.page.locator(sellerBadgeAdmin.badgeDetails.badgeEvents.badgeEventDropdown).click();
        await this.page.locator(sellerBadgeAdmin.badgeDetails.badgeEvents.badgeEvent(badge.badgeName)).click();
        await this.page.locator(sellerBadgeAdmin.badgeDetails.badgeEvents.badgeName).fill(badge.badgeName);

        const isLevelExists = await this.isVisible(sellerBadgeAdmin.badgeDetails.badgeCondition.startingLevelValue);
        if (isLevelExists) {
            await this.page.locator(sellerBadgeAdmin.badgeDetails.badgeCondition.startingLevelValue).fill(badge.startingLevelValue);
            for (let i = 1; i < badge.maxLevel; i++) {
                await this.page.locator(sellerBadgeAdmin.badgeDetails.badgeCondition.addBadgeLevel).click();
            }
        } else {
            if (badge.badgeName === 'Trending Product') {
                await this.page.selectOption(sellerBadgeAdmin.badgeDetails.badgeCondition.trendingProductPeriod, { value: badge.trendingProductPeriod });
                await this.page.locator(sellerBadgeAdmin.badgeDetails.badgeCondition.trendingProductTopBestSellingProduct).fill(badge.trendingProductTopBestSellingProduct);
            }
            if (badge.badgeName === 'Verified Seller') {
                const methods: string[] = Object.values(badge.verifiedSellerMethod);
                for (let i = 1; i <= methods.length; i++) {
                    await this.page.selectOption(sellerBadgeAdmin.badgeDetails.badgeCondition.verifiedSellerMethod1(i), { value: methods[i - 1] as string });
                    if (i === methods.length) {
                        continue;
                    }
                    await this.page.locator(sellerBadgeAdmin.badgeDetails.badgeCondition.addBadgeLevel).click();
                }
            }
        }

        await this.page.selectOption(sellerBadgeAdmin.badgeDetails.badgeStatus.badgeStatus, { value: badge.badgeStatus });
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadge, sellerBadgeAdmin.badgeDetails.badgeStatus.create);
        await this.page.locator(sellerBadgeAdmin.badgeDetails.badgeAddedSuccessfully).click();
    }

    // edit seller badge
    async editSellerBadge(badge: any): Promise<void> {
        await this.searchSellerBadge(badge.badgeName);

        await this.page.locator(sellerBadgeAdmin.sellerBadgeRow(badge.badgeName)).hover();
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadge, sellerBadgeAdmin.sellerBadgeEdit(badge.badgeName));

        await this.page.locator(sellerBadgeAdmin.badgeDetails.badgeEvents.badgeName).fill(badge.badgeName);

        const isLevelExists = await this.isVisible(sellerBadgeAdmin.badgeDetails.badgeCondition.startingLevelValue);
        if (isLevelExists) {
            // remove previous badge levels
            const maxLevel = await this.page.locator(sellerBadgeAdmin.badgeDetails.badgeCondition.badgeLevel).count();
            for (let i = 1; i < maxLevel; i++) {
                await this.page.locator(sellerBadgeAdmin.badgeDetails.badgeCondition.removeBadgeLevel).click();
            }
            // add badge levels
            await this.page.locator(sellerBadgeAdmin.badgeDetails.badgeCondition.startingLevelValue).fill(badge.startingLevelValue);
            for (let i = 1; i < badge.maxLevel; i++) {
                await this.page.locator(sellerBadgeAdmin.badgeDetails.badgeCondition.addBadgeLevel).click();
            }
        } else {
            if (badge.badgeName === 'Trending Product') {
                await this.page.selectOption(sellerBadgeAdmin.badgeDetails.badgeCondition.trendingProductPeriod, { value: badge.trendingProductPeriod });
                await this.page.locator(sellerBadgeAdmin.badgeDetails.badgeCondition.trendingProductTopBestSellingProduct).fill(badge.trendingProductTopBestSellingProduct);
            }
            if (badge.badgeName === 'Verified Seller') {
                // remove previous badge levels
                await this.page.locator(sellerBadgeAdmin.badgeDetails.badgeCondition.badgeLevel).waitFor();
                const maxLevel = await this.page.locator(sellerBadgeAdmin.badgeDetails.badgeCondition.badgeLevel).count();
                for (let i = 1; i < maxLevel; i++) {
                    await this.page.locator(sellerBadgeAdmin.badgeDetails.badgeCondition.removeBadgeLevel).click();
                }

                // add badge levels
                const methods: string[] = Object.values(badge.verifiedSellerMethod);
                for (let i = 1; i <= methods.length; i++) {
                    await this.page.selectOption(sellerBadgeAdmin.badgeDetails.badgeCondition.verifiedSellerMethod1(i), { value: methods[i - 1] as string });
                    if (i === methods.length) {
                        continue;
                    }
                    await this.page.locator(sellerBadgeAdmin.badgeDetails.badgeCondition.addBadgeLevel).click();
                }
            }
        }

        await this.page.selectOption(sellerBadgeAdmin.badgeDetails.badgeStatus.badgeStatus, { value: badge.badgeStatus });
        await this.page.locator(sellerBadgeAdmin.badgeDetails.badgeStatus.update).click();
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadge, sellerBadgeAdmin.badgeDetails.confirmBadgeUpdate);
        await this.page.locator(sellerBadgeAdmin.badgeDetails.badgeAddedSuccessfully).click();
    }

    // preview seller badge
    async previewSellerBadge(badgeName: string): Promise<void> {
        await this.searchSellerBadge(badgeName);

        const badgeLevel = await this.page.locator(sellerBadgeAdmin.sellerBadgeLevel(badgeName)).textContent();

        await this.page.locator(sellerBadgeAdmin.sellerBadgeRow(badgeName)).hover();
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadge, sellerBadgeAdmin.sellerBadgePreview(badgeName));

        // badge preview modal is visible
        await expect(this.page.locator(sellerBadgeAdmin.previewBadgeDetails.modal)).toBeVisible();

        // badge preview header elements are visible
        await this.multipleElementVisible(sellerBadgeAdmin.previewBadgeDetails.modalHeader);

        await expect(this.page.locator(sellerBadgeAdmin.previewBadgeDetails.levelBox)).toHaveCount(Number(badgeLevel));

        await this.page.locator(sellerBadgeAdmin.previewBadgeDetails.modalHeader.modalClose).click();
    }

    // filter vendors by badge
    async filterVendorsByBadge(badgeName: string): Promise<void> {
        await this.goto(data.subUrls.backend.dokan.vendors);

        await this.clickIfVisible(vendorsAdmin.filters.clearFilter);
        await this.page.selectOption(vendorsAdmin.filters.filterByBadges, { label: badgeName });
        await expect(this.page.locator(vendorsAdmin.numberOfRowsFound)).not.toHaveText('0 items');
        await expect(this.page.locator(vendorsAdmin.noRowsFound)).toBeHidden();
    }

    // seller badge vendors
    async sellerBadgeVendors(badgeName: string): Promise<void> {
        await this.searchSellerBadge(badgeName);

        await this.page.locator(sellerBadgeAdmin.sellerBadgeRow(badgeName)).hover();
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadge, sellerBadgeAdmin.sellerBadgeVendors(badgeName));
        await expect(this.page.locator(vendorsAdmin.numberOfRowsFound)).not.toHaveText('0 items');
        await expect(this.page.locator(vendorsAdmin.noRowsFound)).toBeHidden();
    }

    // badges acquired by vendor (inlines StoresPage.searchVendor)
    async sellerBadgeAcquiredByVendor(vendorName: string): Promise<void> {
        // search vendor
        await this.goto(data.subUrls.backend.dokan.vendors);
        await this.page.locator(vendorsAdmin.search).fill('');
        await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, vendorsAdmin.search, vendorName);
        await expect(this.page.locator(vendorsAdmin.numberOfRows)).toHaveCount(1);
        await expect(this.page.locator(vendorsAdmin.vendorCell(vendorName))).toBeVisible();

        await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadge, vendorsAdmin.vendorViewDetails(vendorName));
        await expect(this.page.locator(vendorsAdmin.badgesAcquired)).toBeVisible();
    }

    // update seller badge status
    async updateSellerBadge(badgeName: string, status: string): Promise<void> {
        await this.searchSellerBadge(badgeName);

        await this.page.locator(sellerBadgeAdmin.sellerBadgeRow(badgeName)).hover();

        switch (status) {
            case 'publish':
                await this.page.locator(sellerBadgeAdmin.sellerBadgePublish(badgeName)).click();
                break;

            case 'draft':
                await this.page.locator(sellerBadgeAdmin.sellerBadgeDraft(badgeName)).click();
                break;

            case 'delete':
                await this.page.locator(sellerBadgeAdmin.sellerBadgeDelete(badgeName)).click();
                break;

            default:
                break;
        }

        await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadge, sellerBadgeAdmin.confirmAction);
        await this.page.locator(sellerBadgeAdmin.successMessage).click();
    }

    // seller badge bulk action
    async sellerBadgeBulkAction(action: string, badgeName?: string): Promise<void> {
        if (badgeName) {
            await this.searchSellerBadge(badgeName);
        } else {
            await this.goto(data.subUrls.backend.dokan.sellerBadge);
        }

        // ensure a row exists
        await expect(this.page.locator(sellerBadgeAdmin.noRowsFound)).toBeHidden();

        await this.page.locator(sellerBadgeAdmin.bulkActions.selectAll).click();
        await this.page.selectOption(sellerBadgeAdmin.bulkActions.selectAction, { value: action });
        await this.page.locator(sellerBadgeAdmin.bulkActions.applyAction).click();
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.sellerBadge, sellerBadgeAdmin.confirmAction);
        await this.page.locator(sellerBadgeAdmin.successMessage).click();
    }

    // ---- Seller badge (vendor) ----

    // vendor seller badge render properly
    async vendorSellerBadgeRenderProperly(): Promise<void> {
        await this.goto(data.subUrls.frontend.vDashboard.badges);

        await expect(this.page.locator(sellerBadgeVendor.badgesText)).toBeVisible();
        await expect(this.page.locator(sellerBadgeVendor.description)).toBeVisible();
        await expect(this.page.locator(sellerBadgeVendor.search)).toBeVisible();
        await expect(this.page.locator(sellerBadgeVendor.filterBadges)).toBeVisible();
        await this.multipleElementVisible(sellerBadgeVendor.table);
    }

    // vendor achieved badges congrats popup
    async sellerBadgeCongratsPopup(): Promise<void> {
        await this.goto(data.subUrls.frontend.vDashboard.badges);

        const congratsModalIsVisible = await this.isVisible(sellerBadgeVendor.congratsModal.sellerBadgeModal);
        if (congratsModalIsVisible) {
            await this.multipleElementVisible(sellerBadgeVendor.congratsModal);
            await this.clickIfVisible(sellerBadgeVendor.congratsModal.closeModal);
        } else {
            console.log('No Congrats message appeared');
        }
    }

    // vendor search seller badge
    async vendorSearchSellerBadge(badgeName: string): Promise<void> {
        await this.clickIfVisible(sellerBadgeVendor.congratsModal.closeModal);
        await this.goto(data.subUrls.frontend.vDashboard.badges);
        // Wait for the badge list to finish loading before filtering. The vendor list
        // filters client-side, and while `loading` the component returns an empty result
        // set (rendering the "No badges found." row), which would otherwise race the search.
        await expect(this.page.locator(sellerBadgeVendor.sellerBadgeCell(badgeName))).toBeVisible();
        await this.page.locator(sellerBadgeVendor.search).fill(badgeName);
        await expect(this.page.locator(sellerBadgeVendor.numberOfRows)).toHaveCount(1);
        await expect(this.page.locator(sellerBadgeVendor.sellerBadgeCell(badgeName))).toBeVisible();
    }

    // vendor filter seller badges
    async filterSellerBadges(option: string): Promise<void> {
        await this.clickIfVisible(sellerBadgeVendor.congratsModal.closeModal);

        await this.goto(data.subUrls.frontend.vDashboard.badges);
        await this.page.selectOption(sellerBadgeVendor.filterBadges, { value: option });
        await expect(this.page.locator(sellerBadgeVendor.noRowsFound)).toBeHidden();
        await expect(this.page.locator(sellerBadgeVendor.numberOfRows)).not.toHaveCount(0);
    }
}
