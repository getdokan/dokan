import { Page, expect, request as pwRequest, APIRequestContext } from '@playwright/test';
import { toPath, helpers, parseBoolean, closeAnnouncementModal } from '@utils/helpers';
import { ApiUtils as RealApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { vendor } from '@utils/interfaces';

// ============================================================================
// Admin Vendors (Stores) — legacy Vue admin de-stub.
//
// stores.spec.ts drives the CLASSIC Vue admin vendors screen at
// `wp-admin/admin.php?page=dokan#/vendors` (the `.vendor-list` list-table SPA,
// distinct from the new React `page=dokan-dashboard#/vendors` surface the
// spec's separate "Admin Vendors (React)" block exercises inline). Ported
// verbatim from the pre-refactor pages/storesPage.ts + pages/selectors.ts into
// raw Playwright with co-located selectors.
//
// data / payloads / ApiUtils are re-exported REAL from @utils so the spec seeds
// stores/orders over REST (createStore, updateStoreStatus, createOrder).
// ============================================================================

// Re-export the REAL test data + payloads consumed by the spec.
export { data };
export { payloads } from '@utils/payloads';

const DOKAN_PRO = parseBoolean(process.env.DOKAN_PRO);

/**
 * Null-tolerant ApiUtils wrapper (mirrors vendor-return-request / store-supports).
 *
 * The spec constructs `new ApiUtils(null)`. The real ApiUtils requires an
 * APIRequestContext, so when null is passed we lazily create our own context
 * and swap it in before the first real request primitive fires.
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

    override async post(...args: Parameters<RealApiUtils['post']>): ReturnType<RealApiUtils['post']> {
        await this.ready();
        return super.post(...args);
    }

    override async get(...args: Parameters<RealApiUtils['get']>): ReturnType<RealApiUtils['get']> {
        await this.ready();
        return super.get(...args);
    }

    override async put(...args: Parameters<RealApiUtils['put']>): ReturnType<RealApiUtils['put']> {
        await this.ready();
        return super.put(...args);
    }

    override async patch(...args: Parameters<RealApiUtils['patch']>): ReturnType<RealApiUtils['patch']> {
        await this.ready();
        return super.patch(...args);
    }

    override async delete(...args: Parameters<RealApiUtils['delete']>): ReturnType<RealApiUtils['delete']> {
        await this.ready();
        return super.delete(...args);
    }

    override async dispose(): Promise<void> {
        await this.ready();
        await super.dispose();
    }
}

// ============================================================================
// SELECTORS (recovered from pre-refactor pages/selectors.ts → admin.dokan.vendors)
// ============================================================================
const vendors = {
    vendorsText: '.vendor-list h1',
    addNewVendor: '//button[contains(text(), "Add New")]',
    storeCategories: '//a[normalize-space()="Store Categories"]',

    // Nav Tabs
    navTabs: {
        all: '//ul[@class="subsubsub"]//li//a[contains(text(),"All")]',
        approved: '//ul[@class="subsubsub"]//li//a[contains(text(),"Approved")]',
        pending: '//ul[@class="subsubsub"]//li//a[contains(text(),"Pending")]',
    },

    // Bulk Actions
    bulkActions: {
        selectAll: 'thead .manage-column input',
        selectAction: '.tablenav.top #bulk-action-selector-top', // approved, cancelled, delete, paypal
        applyAction: '.tablenav.top .button.action',
    },

    // Filters
    filters: {
        filterByBadges: '#badge_name',
        clearFilter: '//select[@id="badge_name"]/..//button',
    },

    search: '#post-search-input',

    // Table
    table: {
        vendorTable: '.vendor-list table',
        storeColumn: 'thead th.store_name',
        emailColumn: 'thead th.email',
        categoryColumn: 'thead th.categories',
        phoneColumn: 'thead th.phone',
        RegisteredColumn: 'thead th.registered',
        StatusColumn: 'thead th.enabled',
    },

    numberOfRowsFound: '.tablenav.top .displaying-num',
    numberOfRows: 'div.vendor-list table tbody tr',
    noRowsFound: '//td[normalize-space()="No vendors found."]',
    vendorViewDetails: (username: string) => `//td//a[contains(text(), '${username}')]`,
    vendorRow: (username: string) => `//td//a[contains(text(), '${username}')]/../../..`,
    vendorCell: (username: string) => `//td//a[contains(text(), '${username}')]/../..`,
    vendorRowActions: (username: string) => `//td//a[contains(text(), '${username}')]/../..//div[@class="row-actions"]`,
    vendorEdit: (username: string) => `//td//a[contains(text(), '${username}')]/../..//span[@class="edit"]//a`,
    vendorProducts: (username: string) => `//td//a[contains(text(), '${username}')]/../..//span[@class="products"]//a`,
    vendorOrders: (username: string) => `//td//a[contains(text(), '${username}')]/../..//span[@class="orders"]//a`,
    statusSlider: (username: string) => `//td//a[contains(text(), '${username}')]/../../..//label[@class='switch tips']`,

    // Add New Vendors
    newVendor: {
        // menus
        accountInfo: '//div[@class="tab-link"]//a[contains(text(), "Account Info")]',
        address: '//div[@class="tab-link"]//a[contains(text(), "Address")]',
        paymentOptions: '//div[@class="tab-link"]//a[contains(text(), "Payment Options")]',
        addNewVendorCloseModal: '.modal-close',
        next: 'footer.modal-footer .button.button-primary',

        // Account Info
        vendorPicture: '.profile-image .dokan-upload-image',
        banner: '.banner-image .dokan-upload-image button',
        firstName: 'input#first-name',
        lastName: 'input#last-name',
        storeName: 'input#store-name',
        storeUrl: 'input#user-nicename',
        phoneNumber: 'input#store-phone',
        email: 'input#store-email',
        username: 'input#user-login',
        generatePassword: '.button.button-secondary',
        password: 'input#store-password',
        companyName: 'input#company-name',
        companyIdEuidNumber: 'input#company-id-number',
        vatOrTaxNumber: 'input#vat-tax-number',
        nameOfBank: 'input#dokan-bank-name',
        bankIban: 'input#dokan-bank-iban',
        // Address
        street1: 'input#street-1',
        street2: 'input#street-2',
        city: 'input#city',
        zip: 'input#zip',
        country: '//label[@for="country"]/..//div[@class="multiselect__select"]',
        countryInput: '#country',
        state: '//label[@for="state"]/..//div[@class="multiselect__select"]',
        stateInput: '#state',
        // Payment Options
        accountName: 'input#account-name',
        accountNumber: 'input#account-number',
        accountType: 'select#account-type', // personal, business
        bankName: 'input#bank-name',
        bankAddress: 'input#bank-address',
        routingNumber: 'input#routing-number',
        iban: 'input#iban',
        swift: 'input#swift',
        payPalEmail: 'input#paypal-email',
        enableSelling: '//span[contains(text(),"Enable Selling")]/..//span[@class="slider round"]',
        publishProductDirectly: '//span[contains(text(), "Publish Product Directly")]/..//span[@class="slider round"]',
        makeVendorFeature: '//span[contains(text(), "Make Vendor Featured")]/..//span[@class="slider round"]',
        createVendor: '.button.button-primary.button-hero',
    },

    // Sweet Alert
    createAnother: '.swal2-confirm', // Sweet Alert Confirm
    editVendorInfo: '.swal2-cancel', // Sweet Alert Cancel
    closeSweetAlert: '.swal2-close', // Sweet Alert Close
    sweetAlertTitle: '#swal2-title', // sweet alert title

    vendorDetails: {
        profileInfo: {
            profileInfoDiv: 'div.profile-info',
            profileImage: '.profile-info .profile-icon img',
            featuredVendor: 'span[title="Featured Vendor"]',

            storeName: '.profile-info .store-name',
            storeRating: '.profile-info .star-rating',
            storeCategory: '.profile-info .store-categoy-names',
            storeAddress: '.profile-info .address',
            phone: '.profile-info .phone',

            sendEmail: '.profile-info .message',
            sellingStatus: '.profile-info .status',
        },

        sendEmail: {
            closeModal: '.modal-close.modal-close-link',
            replyTo: 'input#replyto',
            subject: 'input#subject',
            message: 'textarea#message',
            sendEmail: '.modal-footer button',
        },

        profileBanner: {
            profileBanner: 'div.profile-banner',
            visitStore: 'div.action-links a.visit-store ',
            editStore: 'div.action-links a.router-link-active',
        },

        vendorSummary: {
            vendorSummarySection: 'section.vendor-summary',

            // badges
            badgesAcquired: {
                badgesAcquired: 'div.seller-badge-list-card',
                noBadgesAvailable: '.no-badge-available',
                badgesGallery: '.myGallery',
            },

            // products-revenue
            productRevenue: {
                productRevenueSection: '.vendor-summary div.products-revenue',

                products: {
                    products: 'div.products-revenue .stat-summary.products',
                    productCount: 'ul.counts li.products .count',
                    soldItemCount: 'ul.counts li.items .count',
                    visitorsCount: 'ul.counts li.visitors .count',
                },

                revenue: {
                    revenue: 'div.products-revenue .revenue',
                    ordersCount: 'ul.counts li.orders .count',
                    grossSales: 'ul.counts li.gross .count',
                    totalEarning: 'ul.counts li.earning .count',
                },

                others: {
                    others: 'div.products-revenue .others',
                    commissionRate: 'ul.counts li.commision .count',
                    balance: 'ul.counts li.balance .count',
                    reviewsCount: 'ul.counts li.reviews .count',
                },
            },

            // vendor info
            vendorInfo: {
                registeredSection: 'li.registered',
                registeredDate: 'li.registered .date',

                socialProfilesSection: 'li.social-profiles',
                socialProfilesList: 'li.social-profiles .profiles',

                paymentsSection: 'li.payments',
                paymentMethods: 'li.payments .payment-methods',

                publishStatusSection: 'li.publishing',
            },
        },
    },

    // Edit Vendor
    editVendor: {
        editVendorIcon: '.dashicons-edit',
        changeStorePhoto: '.profile-icon .dokan-upload-image img',
        changeStoreBanner: '.profile-banner .dokan-upload-image img',

        // Account Info
        firstName: '#first-name',
        lastName: '#last-name',
        storeName: '#store-name',
        phoneNumber: '#store-phone',
        email: '#store-email',
        companyName: '#company-name',
        companyIdEuidNumber: '#company-id-number',
        vatOrTaxNumber: '#vat-tax-number',
        nameOfBank: '#dokan-bank-name',
        bankIban: '#dokan-bank-iban',

        // Address
        street1: '#street-1',
        street2: '#street-2',
        city: '#city',
        zipCode: '#zip',
        country: '//input[@id="country"]/../..//div[@class="multiselect__select"]',
        countryInput: '#country',
        state: '//input[@id="state"]/../..//div[@class="multiselect__select"]',
        stateInput: '#state',

        // Social Options
        facebook: '#facebook',
        flickr: '#flickr',
        twitter: '#twitter',
        youtube: '#youtube',
        linkedin: '#linkedin',
        pinterest: '//label[@id="pinterest"]/..//input',
        instagram: '#instagram',

        // Payment Options
        accountName: '#account-name',
        accountNumber: '#account-number',
        bankName: '#bank-name',
        accountType: '#account-type', // personal, business
        bankAddress: '#bank-address',
        routingNumber: '#routing-number',
        iban: '#iban',
        swift: '#swift',
        payPalEmail: '#paypal-email',

        // other options
        enableSelling: '//span[contains(text(), "Enable Selling")]/..//label[@class="switch tips"]',
        publishProductDirectly: '//span[contains(text(), "Publish Product Directly")]/..//label[@class="switch tips"]',
        makeVendorFeature: '//span[contains(text(), "Make Vendor Featured")]/..//label[@class="switch tips"]',

        // Commission
        commissionType: 'select#_subscription_product_admin_commission_type', // fixed, category_based
        percentage: 'input#percentage-val-id',
        fixed: 'input#fixed-val-id',

        // Edit Options
        cancelEdit: '//div[contains(@class, "action-links footer")]//button[contains(text(),"Cancel")]',
        saveChanges: '//div[contains(@class, "action-links footer")]//button[contains(text(),"Save Changes")]',
        closeUpdateSuccessModal: 'button.swal2-confirm',
    },
} as const;

// WooCommerce admin list-table row-count selectors reached from the vendor
// row-actions "Products" / "Orders" links (pre-refactor admin.products / admin.wooCommerce.orders).
const adminProducts = {
    numberOfRowsFound: '(//span[@class="displaying-num"])[1]',
    noRowsFound: '//td[normalize-space(text())="No products found"]',
} as const;

const adminOrders = {
    numberOfRowsFound: '(//span[@class="displaying-num"])[1]',
    noRowsFound: '//td[normalize-space(text())="No items found."]',
} as const;

export class StoresPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ------------------------------------------------------------------
    // Inlined base helpers (raw Playwright equivalents of the old basePage)
    // ------------------------------------------------------------------
    private createUrl(subPath: string): string {
        return toPath(subPath);
    }

    private async goIfNotThere(subPath: string): Promise<void> {
        const target = this.createUrl(subPath);
        const alreadyThere = this.page.url().replace(/\/$/, '') === target.replace(/\/$/, '');
        if (alreadyThere) return;
        await expect(async () => {
            await this.page.goto(target, { waitUntil: 'domcontentloaded' });
            expect(this.page.url()).toContain(subPath);
        }).toPass();
    }

    private async goto(subPath: string): Promise<void> {
        await this.page.goto(this.createUrl(subPath), { waitUntil: 'domcontentloaded' });
    }

    private async toBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeVisible();
    }

    private async toContainText(selector: string, text: string): Promise<void> {
        await expect(this.page.locator(selector)).toContainText(text);
    }

    private async toHaveCount(selector: string, count: number): Promise<void> {
        await expect(this.page.locator(selector)).toHaveCount(count);
    }

    private async notToHaveCount(selector: string, count: number): Promise<void> {
        await expect(this.page.locator(selector)).not.toHaveCount(count);
    }

    private async notToHaveText(selector: string, text: string): Promise<void> {
        await expect(this.page.locator(selector)).not.toHaveText(text);
    }

    private async notToBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeHidden();
    }

    // polling visibility probe (mirrors basePage.isVisible; timeout in seconds)
    private async isVisible(selector: string, timeout = 2): Promise<boolean> {
        try {
            await this.page.locator(selector).first().waitFor({ state: 'visible', timeout: timeout * 1000 });
            return true;
        } catch {
            return false;
        }
    }

    // recurse plain-object selector maps, skipping functions (matches basePage)
    private async multipleElementVisible(selectors: Record<string, unknown>): Promise<void> {
        for (const key in selectors) {
            const value = selectors[key];
            if (helpers.isPlainObject(value)) {
                await this.multipleElementVisible(value as Record<string, unknown>);
            } else if (typeof value === 'function') {
                continue;
            } else if (typeof value === 'string') {
                await this.toBeVisible(value);
            }
        }
    }

    private async click(selector: string): Promise<void> {
        await this.page.locator(selector).click();
    }

    private async clearAndType(selector: string, text: string): Promise<void> {
        await this.page.locator(selector).fill(text);
    }

    private async clearInputField(selector: string): Promise<void> {
        await this.page.locator(selector).fill('');
    }

    private async type(selector: string, text: string): Promise<void> {
        await this.page.locator(selector).pressSequentially(text, { delay: 100 });
    }

    private async press(key: string): Promise<void> {
        await this.page.keyboard.press(key);
    }

    private async check(selector: string): Promise<void> {
        await expect(async () => {
            await this.page.locator(selector).check();
            await expect(this.page.locator(selector)).toBeChecked({ timeout: 200 });
        }).toPass();
    }

    private async selectByValue(selector: string, value: string): Promise<void> {
        await this.page.selectOption(selector, { value });
    }

    private async hover(selector: string): Promise<void> {
        await this.page.locator(selector).hover();
    }

    private async removeAttribute(selector: string, attribute: string): Promise<void> {
        await this.page.locator(selector).evaluate((el, attr) => el.removeAttribute(attr), attribute);
    }

    private async waitForVisibleLocator(selector: string): Promise<void> {
        await this.page.locator(selector).waitFor({ state: 'visible' });
    }

    private async getElementBackgroundColor(selector: string): Promise<string> {
        return await this.page.locator(selector).evaluate(el => window.getComputedStyle(el).getPropertyValue('background-color'));
    }

    private async clickAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<void> {
        await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).click()]);
    }

    private async clickAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200): Promise<void> {
        const [, response] = await Promise.all([
            this.page.waitForLoadState('load'),
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).click(),
        ]);
        expect(response.status()).toBe(code);
    }

    private async clickAndWaitForLoadState(selector: string, state: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'): Promise<void> {
        await Promise.all([this.page.waitForLoadState(state), this.page.locator(selector).click()]);
    }

    private async typeAndWaitForResponse(subUrl: string, selector: string, text: string, code = 200): Promise<void> {
        await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).fill(text)]);
    }

    private async typeAndWaitForResponseAndLoadState(subUrl: string, selector: string, text: string, code = 200): Promise<void> {
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.waitForLoadState(),
            this.page.locator(selector).fill(text),
        ]);
    }

    // enable a dokan switcher (skip if already on): probe the slider span's bg color
    private async enableSwitcherAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<void> {
        const spanSelector = /^(\/\/|\(\/\/)/.test(selector) ? `${selector}//span` : `${selector} span`;
        const value = await this.getElementBackgroundColor(spanSelector);
        if (!value.includes('rgb(0, 144, 255)')) {
            await this.clickAndWaitForResponse(subUrl, spanSelector, code);
        }
    }

    // disable a dokan switcher (skip if already off)
    private async disableSwitcherAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<void> {
        const spanSelector = /^(\/\/|\(\/\/)/.test(selector) ? `${selector}//span` : `${selector} span`;
        const value = await this.getElementBackgroundColor(spanSelector);
        if (value.includes('rgb(0, 144, 255)')) {
            await this.clickAndWaitForResponse(subUrl, spanSelector, code);
        }
    }

    // ==================================================================
    // VENDORS
    // ==================================================================

    // vendors render properly
    async adminVendorsRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.vendors);

        // vendor text is visible
        await this.toBeVisible(vendors.vendorsText);

        // and new vendor is visible
        await this.toBeVisible(vendors.addNewVendor);

        // nav tabs are visible
        await this.multipleElementVisible(vendors.navTabs);

        // bulk action elements are visible
        await this.multipleElementVisible(vendors.bulkActions);

        // search vendor input is visible
        await this.toBeVisible(vendors.search);

        // vendor table elements are visible
        const { categoryColumn, ...table } = vendors.table;
        await this.multipleElementVisible(table);
    }

    // view vendor details
    async viewVendorDetails(storeName: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.vendorDetails(storeName));

        // profile info elements are visible
        const { featuredVendor, storeRating, storeCategory, ...profileInfo } = vendors.vendorDetails.profileInfo;
        await this.multipleElementVisible(profileInfo);

        // profile banner elements are visible
        await this.multipleElementVisible(vendors.vendorDetails.profileBanner);

        // badges acquired elements are visible
        const badgesAcquired = await this.isVisible(vendors.vendorDetails.vendorSummary.badgesAcquired.badgesAcquired);
        if (badgesAcquired) {
            await this.toBeVisible(vendors.vendorDetails.vendorSummary.badgesAcquired.badgesAcquired);
        }

        // product & revenue elements are visible
        await this.toBeVisible(vendors.vendorDetails.vendorSummary.productRevenue.productRevenueSection);
        await this.multipleElementVisible(vendors.vendorDetails.vendorSummary.productRevenue.products);
        await this.multipleElementVisible(vendors.vendorDetails.vendorSummary.productRevenue.revenue);
        await this.multipleElementVisible(vendors.vendorDetails.vendorSummary.productRevenue.others);

        // vendor info elements are visible
        await this.multipleElementVisible(vendors.vendorDetails.vendorSummary.vendorInfo);
    }

    // email vendor
    async emailVendor(storeName: string, email: vendor['vendorInfo']['sendEmail']): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.vendorDetails(storeName));

        await this.click(vendors.vendorDetails.profileInfo.sendEmail);

        await this.clearAndType(vendors.vendorDetails.sendEmail.subject, email.subject);
        await this.clearAndType(vendors.vendorDetails.sendEmail.message, email.message);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.stores, vendors.vendorDetails.sendEmail.sendEmail);
    }

    // admin add new vendors
    async addVendor(vendorInfo: vendor['vendorInfo']): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.vendors);

        const firstName = vendorInfo.firstName();
        const email = vendorInfo.email();
        const shopName = vendorInfo.shopName();
        const username = firstName + vendorInfo.nanoid;

        // add new vendor
        await this.click(vendors.addNewVendor);

        // account info
        await this.clearAndType(vendors.newVendor.firstName, firstName);
        await this.clearAndType(vendors.newVendor.lastName, vendorInfo.lastName());
        await this.clearAndType(vendors.newVendor.storeName, shopName);
        await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, vendors.newVendor.storeUrl, shopName);
        await this.clearAndType(vendors.newVendor.phoneNumber, vendorInfo.phoneNumber);
        await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, vendors.newVendor.email, email);
        await this.click(vendors.newVendor.generatePassword);
        await this.clearAndType(vendors.newVendor.password, vendorInfo.password);
        await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, vendors.newVendor.username, username);

        // eu compliance data
        if (DOKAN_PRO) {
            await this.clearAndType(vendors.newVendor.companyName, vendorInfo.companyName);
            await this.clearAndType(vendors.newVendor.companyIdEuidNumber, vendorInfo.companyId);
            await this.clearAndType(vendors.newVendor.vatOrTaxNumber, vendorInfo.vatNumber);
            await this.clearAndType(vendors.newVendor.nameOfBank, vendorInfo.bankName);
            await this.clearAndType(vendors.newVendor.bankIban, vendorInfo.bankIban);
        }

        await this.click(vendors.newVendor.next);
        await this.click(vendors.newVendor.address); // added to avoid flakiness

        // address
        await this.waitForVisibleLocator(vendors.newVendor.street1);
        await this.clearAndType(vendors.newVendor.street1, vendorInfo.street1);
        await this.clearAndType(vendors.newVendor.street2, vendorInfo.street2);
        await this.clearAndType(vendors.newVendor.city, vendorInfo.city);
        await this.clearAndType(vendors.newVendor.zip, vendorInfo.zipCode);
        await this.click(vendors.newVendor.country);
        await this.type(vendors.newVendor.countryInput, vendorInfo.country);
        await this.press(data.key.enter);
        await this.click(vendors.newVendor.state);
        await this.type(vendors.newVendor.stateInput, vendorInfo.state);
        await this.press(data.key.enter);

        await this.click(vendors.newVendor.next);
        await this.click(vendors.newVendor.paymentOptions); // added to avoid flakiness

        // payment options
        await this.clearAndType(vendors.newVendor.accountName, vendorInfo.accountName);
        await this.clearAndType(vendors.newVendor.accountNumber, vendorInfo.accountNumber);
        await this.selectByValue(vendors.newVendor.accountType, vendorInfo.accountType);
        await this.clearAndType(vendors.newVendor.bankName, vendorInfo.bankName);
        await this.clearAndType(vendors.newVendor.bankAddress, vendorInfo.bankAddress);
        await this.clearAndType(vendors.newVendor.routingNumber, vendorInfo.routingNumber);
        await this.clearAndType(vendors.newVendor.iban, vendorInfo.iban);
        await this.clearAndType(vendors.newVendor.swift, vendorInfo.swiftCode);
        await this.clearAndType(vendors.newVendor.payPalEmail, vendorInfo.email());

        await this.check(vendors.newVendor.enableSelling);
        await this.check(vendors.newVendor.publishProductDirectly);
        await this.check(vendors.newVendor.makeVendorFeature);

        // create vendor
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.stores, vendors.newVendor.createVendor);
        await this.toContainText(vendors.sweetAlertTitle, 'Vendor Created');
        await this.click(vendors.closeSweetAlert);
    }

    // edit vendor
    async editVendor(sellerId: string, vendorData: vendor): Promise<void> {
        await this.goto(data.subUrls.backend.dokan.vendorDetailsEdit(sellerId));

        // basic
        await this.clearAndType(vendors.editVendor.firstName, vendorData.username);
        await this.clearAndType(vendors.editVendor.lastName, vendorData.lastname);
        await this.clearAndType(vendors.editVendor.storeName, vendorData.vendorInfo.storeName);
        await this.clearAndType(vendors.editVendor.phoneNumber, vendorData.vendorInfo.phoneNumber);
        await this.clearAndType(vendors.editVendor.email, vendorData.username + data.vendor.vendorInfo.emailDomain);

        if (DOKAN_PRO) {
            await this.clearAndType(vendors.editVendor.companyName, vendorData.vendorInfo.companyName);
            await this.clearAndType(vendors.editVendor.companyIdEuidNumber, vendorData.vendorInfo.companyId);
            await this.clearAndType(vendors.editVendor.vatOrTaxNumber, vendorData.vendorInfo.vatNumber);
            await this.clearAndType(vendors.editVendor.nameOfBank, vendorData.vendorInfo.bankName);
            await this.clearAndType(vendors.editVendor.bankIban, vendorData.vendorInfo.bankIban);
        }

        // address
        await this.clearAndType(vendors.editVendor.street1, vendorData.vendorInfo.street1);
        await this.clearAndType(vendors.editVendor.street2, vendorData.vendorInfo.street2);
        await this.clearAndType(vendors.editVendor.city, vendorData.vendorInfo.city);
        await this.clearAndType(vendors.editVendor.zipCode, vendorData.vendorInfo.zipCode);
        await this.click(vendors.editVendor.country);
        await this.clearAndType(vendors.editVendor.countryInput, vendorData.vendorInfo.country);
        await this.press(data.key.enter);
        await this.click(vendors.editVendor.state);
        await this.clearAndType(vendors.editVendor.stateInput, vendorData.vendorInfo.state);
        await this.press(data.key.enter);

        // social options
        await this.clearAndType(vendors.editVendor.facebook, vendorData.vendorInfo.socialProfileUrls.facebook);
        await this.clearAndType(vendors.editVendor.flickr, vendorData.vendorInfo.socialProfileUrls.flickr);
        await this.clearAndType(vendors.editVendor.twitter, vendorData.vendorInfo.socialProfileUrls.twitter);
        await this.clearAndType(vendors.editVendor.youtube, vendorData.vendorInfo.socialProfileUrls.youtube);
        await this.clearAndType(vendors.editVendor.linkedin, vendorData.vendorInfo.socialProfileUrls.linkedin);
        await this.clearAndType(vendors.editVendor.pinterest, vendorData.vendorInfo.socialProfileUrls.pinterest);
        await this.clearAndType(vendors.editVendor.instagram, vendorData.vendorInfo.socialProfileUrls.instagram);

        // payment options - bank
        await this.clearAndType(vendors.editVendor.accountName, vendorData.vendorInfo.payment.bankAccountName);
        await this.clearAndType(vendors.editVendor.accountNumber, vendorData.vendorInfo.payment.bankAccountNumber);
        await this.selectByValue(vendors.editVendor.accountType, vendorData.vendorInfo.payment.bankAccountType);
        await this.clearAndType(vendors.editVendor.bankName, vendorData.vendorInfo.payment.bankName);
        await this.clearAndType(vendors.editVendor.bankAddress, vendorData.vendorInfo.payment.bankAddress);
        await this.clearAndType(vendors.editVendor.routingNumber, vendorData.vendorInfo.payment.bankRoutingNumber);
        await this.clearAndType(vendors.editVendor.iban, vendorData.vendorInfo.payment.bankIban);
        await this.clearAndType(vendors.editVendor.swift, vendorData.vendorInfo.payment.bankSwiftCode);

        // paypal
        await this.clearAndType(vendors.editVendor.payPalEmail, vendorData.vendorInfo.payment.email());

        // other settings
        await this.enableSwitcherAndWaitForResponse(data.subUrls.api.dokan.stores, vendors.editVendor.enableSelling);
        await this.enableSwitcherAndWaitForResponse(data.subUrls.api.dokan.stores, vendors.editVendor.publishProductDirectly);
        await this.enableSwitcherAndWaitForResponse(data.subUrls.api.dokan.stores, vendors.editVendor.makeVendorFeature);

        // commission
        await this.selectByValue(vendors.editVendor.commissionType, vendorData.vendorInfo.commission.commissionType);
        await this.clearAndType(vendors.editVendor.percentage, vendorData.vendorInfo.commission.commissionType);
        await this.clearAndType(vendors.editVendor.fixed, vendorData.vendorInfo.commission.commissionFixed);

        await this.clickAndWaitForResponse(data.subUrls.api.dokan.stores, vendors.editVendor.saveChanges);
        await this.click(vendors.editVendor.closeUpdateSuccessModal);
    }

    // search vendor
    async searchVendor(vendorName: string, neg = false): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.vendors);
        await this.clearInputField(vendors.search);
        await this.typeAndWaitForResponseAndLoadState(data.subUrls.api.dokan.stores, vendors.search, vendorName);
        await this.toHaveCount(vendors.numberOfRows, 1);
        await this.toBeVisible(vendors.vendorCell(vendorName));

        // negative scenario
        if (neg) {
            await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, vendors.search, vendorName + 'abcdefgh');
            await this.toBeVisible(vendors.noRowsFound);
        }
    }

    // filter vendors
    async filterVendors(filterBy: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.vendors);

        switch (filterBy) {
            case 'pending':
                await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.stores, vendors.navTabs.pending);
                break;

            case 'approved':
                await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.stores, vendors.navTabs.approved);
                break;

            default:
                break;
        }
        await this.notToHaveCount(vendors.numberOfRows, 0);
    }

    // update vendor (enable/disable selling)
    async updateVendor(vendorName: string, action: string): Promise<void> {
        await this.searchVendor(vendorName);

        switch (action) {
            case 'enable':
                await this.enableSwitcherAndWaitForResponse(data.subUrls.api.dokan.stores, vendors.statusSlider(vendorName));
                break;

            case 'disable':
                await this.disableSwitcherAndWaitForResponse(data.subUrls.api.dokan.stores, vendors.statusSlider(vendorName));
                break;

            default:
                break;
        }
    }

    // view vendor orders, products
    async viewVendor(vendorName: string, action: string): Promise<void> {
        await this.searchVendor(vendorName);

        await this.removeAttribute(vendors.vendorRowActions(vendorName), 'class'); // forcing the row actions to be visible, to avoid flakiness
        await this.hover(vendors.vendorRow(vendorName));

        switch (action) {
            case 'products':
                await this.clickAndWaitForLoadState(vendors.vendorProducts(vendorName));
                await this.notToHaveText(adminProducts.numberOfRowsFound, '0 items');
                await this.notToBeVisible(adminProducts.noRowsFound);
                break;

            case 'orders':
                await this.clickAndWaitForLoadState(vendors.vendorOrders(vendorName));
                await this.notToHaveText(adminOrders.numberOfRowsFound, '0 items');
                await this.notToBeVisible(adminOrders.noRowsFound);
                break;

            default:
                break;
        }
    }

    // vendor bulk action
    async vendorBulkAction(action: string, vendorName?: string): Promise<void> {
        if (vendorName) {
            await this.searchVendor(vendorName);
        } else {
            await this.goIfNotThere(data.subUrls.backend.dokan.vendors);
        }

        // ensure row exists
        await this.notToBeVisible(vendors.noRowsFound);

        await this.click(vendors.bulkActions.selectAll);
        await this.selectByValue(vendors.bulkActions.selectAction, action);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.stores, vendors.bulkActions.applyAction);
    }
}
