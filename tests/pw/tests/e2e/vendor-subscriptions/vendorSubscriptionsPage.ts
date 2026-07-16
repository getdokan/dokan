import { Page, expect } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';
import { dbData } from '@utils/dbData';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';

// Re-export the REAL utilities so the spec's import contract
// (`{ VendorSubscriptionsPage, VendorPage, ApiUtils, data, payloads, dbUtils, dbData }`)
// resolves to the canonical suite implementations rather than local no-op stubs.
export { data, payloads, dbData, dbUtils, ApiUtils };

const { USER_PASSWORD } = process.env;

// Co-located selectors ported verbatim from the pre-refactor `selectors.ts`
// (admin.dokan.subscriptions, admin.dokan.vendors.editVendor, vendor.vSubscriptions,
//  frontend login, customer.cCheckout, customer.cOrderReceived).
export const vendorSubscriptionsSelectors = {
    admin: {
        // dokan settings nav-title
        settingsMenuVendorSubscription: '//div[@class="nav-title" and contains(text(),"Vendor Subscription")]',

        subscribedVendorList: '//h1[text()="Subscribed Vendor List"]',

        bulkActions: {
            selectAll: 'thead .manage-column input',
            selectAction: '.tablenav.top #bulk-action-selector-top',
            applyAction: '//div[@class="tablenav top"]//button[normalize-space()="Apply"]',
        },

        filters: {
            filterByVendors: '(//div[@class="multiselect__select"])[1]',
            filterByVendorsInput: '(//input[@class="multiselect__input"])[1]',
            filterBySubscriptionPack: '(//div[@class="multiselect__select"])[2]',
            filterBySubscriptionPackInput: '(//input[@class="multiselect__input"])[2]',
            filteredResult: (result: string) => `//span[text()='${result}']`,
        },

        table: {
            subscriptionTable: '.subscription-list table',
            storeColumn: 'thead th.store_name',
            subscriptionPackColumn: 'thead th.subscription_title',
            startDateColumn: 'thead th.start_date',
            endDateColumn: 'thead th.end_date',
            statusColumn: 'thead th.status',
            orderColumn: 'thead th.order_id',
            actionsColumn: 'thead th.action',
        },

        numberOfRowsFound: '.tablenav.top .displaying-num',
        numberOfRows: 'div.subscription-list table tbody tr',
        noRowsFound: '//td[normalize-space()="No subscribed vendors found."]',

        vendorSubscriptionsRow: (storeName: string) => `//td[@class="column store_name"]//a[contains(text(),'${storeName}')]/../../..`,
        vendorSubscriptionsActions: (storeName: string) => `//td[@class="column store_name"]//a[contains(text(),'${storeName}')]/../../..//td[@class="column action"]//span`,

        subscriptionAction: {
            cancelImmediately: '//input[@value="immediately"]',
            cancelAfterEndOfCurrentPeriod: '//input[@value="end_of_current_period"]',
            cancelSubscription: '.swal2-confirm',
        },

        // vendor edit (assign subscription pack)
        vendors: {
            assignSubscriptionPackDropdown: '//label[text()="Assign Subscription Pack"]/..//div[@class="multiselect__select"]',
            selectSubscriptionPack: (subscriptionPack: string) => `//li[contains(.,'${subscriptionPack}')]`,
            saveChanges: '//div[contains(@class, "action-links footer")]//button[contains(text(),"Save Changes")]',
            closeUpdateSuccessModal: 'button.swal2-confirm',
        },
    },

    vendor: {
        dashboardMenuSubscription: 'ul.dokan-dashboard-menu li.subscription a',
        dashboardDiv: 'div.dokan-dashboard-wrap',
        dokanSubscriptionDiv: 'div.dokan-subscription-content',
        noSubscriptionMessage: '//h3[text()="No subscription pack has been found!"]',

        sellerSubscriptionInfo: {
            sellerSubscriptionInfo: 'div.seller_subs_info',
            subscribedPack: (pack: string) => `//div[@class='seller_subs_info']//p//span[text()='${pack}']`,
            cancelSubscription: '//form[@id="dps_submit_form"]//input[@value="Cancel"]',
            confirmCancelSubscription: '.swal2-confirm',
            cancelSuccessMessage: '.dokan-message p',
        },

        productCardContainer: 'div.pack_content_wrapper',
        productCard: {
            item: 'div.product_pack_item',
            price: 'div.pack_price',
            content: 'div.pack_content',
            buyButton: 'div.buy_pack_button',
        },

        buySubscription: (subscriptionPack: string) => `//div[@class="pack_content"]//h2[text()='${subscriptionPack}']/../..//div[@class='buy_pack_button']`,
    },

    frontend: {
        username: '#username',
        userPassword: '#password',
        rememberMe: '#rememberme',
        logIn: '//button[@value="Log in"]',
        customerLogout: '.woocommerce-MyAccount-navigation-link--customer-logout > a',
    },

    checkout: {
        directBankTransfer: '.payment_method_bacs label, label[for="radio-control-wc-payment-method-options-bacs"]',
        placeOrder: '#place_order, button.wc-block-components-checkout-place-order-button',
    },

    orderReceived: {
        orderReceivedSuccessMessage: '.woocommerce-notice.woocommerce-notice--success.woocommerce-thankyou-order-received',
        orderNumber: '.woocommerce-order-overview__order.order strong',
        subOrders: {
            subOrders: '//h2[normalize-space()="Sub Orders"]',
            multiVendorNote: 'div.dokan-info',
            multiOrders: 'table.my_account_orders',
        },
    },
} as const;

const sel = vendorSubscriptionsSelectors;

export class VendorPage {
    constructor(readonly page: Page) {
        void closeAnnouncementModal(page);
    }

    /**
     * Register a vendor through `/vendor-onboarding/` (Dokan 5.0.0+) and
     * pick a subscription pack via the inline `#dokan-subscription-pack`
     * select rendered on the same page.
     */
    async vendorRegister(vendorInfo: any, _setupWizard: any): Promise<void> {
        const resolve = <T,>(v: T | (() => T)): T => (typeof v === 'function' ? (v as () => T)() : v);

        const firstName = String(resolve(vendorInfo?.firstName) ?? 'vendor');
        const lastName = String(resolve(vendorInfo?.lastName) ?? 'test');
        const base = (firstName + lastName).toLowerCase().replace(/[^a-z0-9]/g, '') + Date.now();
        const email = String(resolve(vendorInfo?.email) ?? `${base}@test.com`);
        const password = String(vendorInfo?.password ?? '01dokan01');
        const shopName = String(resolve(vendorInfo?.shopName) ?? `${base}store`);
        const phone = String(vendorInfo?.phone ?? '0123456789');

        await this.page.goto(toPath(`vendor-onboarding/`), { waitUntil: 'domcontentloaded' });

        await this.page.locator('#first-name').fill(firstName);
        await this.page.locator('#last-name').fill(lastName);
        await this.page.locator('#reg_email').fill(email);
        await this.page.locator('#shop-phone').fill(phone);

        const passwordField = this.page.locator('#reg_password');
        if (await passwordField.isVisible().catch(() => false)) {
            await passwordField.fill(password);
        }

        // Tab out of #company-name so the JS auto-populates #seller-url and
        // the AJAX availability check runs — submit stays disabled until the
        // slug indicator flips to text-success.
        await this.page.locator('#company-name').fill(shopName);
        await this.page.locator('#company-name').press('Tab');
        await this.page.locator('#url-alart-mgs.text-success').waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);

        if (vendorInfo?.vendorSubscriptionPack) {
            const pack = this.page.locator('#dokan-subscription-pack');
            if (await pack.isVisible().catch(() => false)) {
                await pack.selectOption({ label: String(vendorInfo.vendorSubscriptionPack) }).catch(async () => {
                    await pack.selectOption(String(vendorInfo.vendorSubscriptionPack));
                });
            }
        }

        const terms = this.page.locator('#tc_agree');
        if (await terms.isVisible().catch(() => false)) {
            await terms.check();
        }

        await this.page.locator('input[name="register"]').first().click();
        await this.page.waitForLoadState('load');
    }
}

export class VendorSubscriptionsPage {
    constructor(readonly page: Page) {
        void closeAnnouncementModal(page);
    }

    // ---------------------------------------------------------------
    // navigation + interaction helpers (ported from the pre-refactor
    // basePage: goto / goIfNotThere / isVisible / multipleElementVisible /
    // click+response / accept-dialog variants).
    // ---------------------------------------------------------------

    private async goto(subPath: string): Promise<void> {
        await this.page.goto(toPath(subPath), { waitUntil: 'domcontentloaded' });
    }

    private async goIfNotThere(subPath: string): Promise<void> {
        const target = toPath(subPath);
        if (this.page.url().replace(/\/$/, '') === target.replace(/\/$/, '')) {
            return;
        }
        await this.page.goto(target, { waitUntil: 'domcontentloaded' });
    }

    // poll for visibility (basePage.isVisible: 20ms → 100ms → 500ms cadence, default 2s window)
    private async isVisible(selector: string, timeoutSec = 2): Promise<boolean> {
        const start = Date.now();
        let interval = 20;
        while (Date.now() - start < timeoutSec * 1000) {
            try {
                if (await this.page.locator(selector).isVisible()) {
                    return true;
                }
            } catch {
                /* empty */
            }
            await this.page.waitForTimeout(interval);
            if (interval === 20) {
                interval = 100;
            } else if (interval === 100) {
                interval = 500;
            }
        }
        return false;
    }

    // assert every leaf selector in an object is visible; recurse into
    // nested objects and skip function-valued (parameterised) selectors.
    private async multipleElementVisible(selectors: { [key: string]: any }): Promise<void> {
        for (const key in selectors) {
            const value = selectors[key];
            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                await this.multipleElementVisible(value);
            } else if (typeof value === 'function') {
                continue;
            } else {
                await expect(this.page.locator(value)).toBeVisible();
            }
        }
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

    private async clickAndAcceptAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<void> {
        // page.once so only the next dialog is auto-accepted
        this.page.once('dialog', dialog => {
            void dialog.accept();
        });
        await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).click()]);
    }

    private async clickAndAcceptAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200): Promise<void> {
        this.page.once('dialog', dialog => {
            void dialog.accept();
        });
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.waitForLoadState('domcontentloaded'),
            this.page.locator(selector).click(),
        ]);
    }

    private async typeAndWaitForResponse(subUrl: string, selector: string, text: string, code = 200): Promise<void> {
        await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).fill(text)]);
    }

    // read the currently logged-in username from the wordpress_logged_in_* cookie
    private async getCurrentUser(): Promise<string | undefined> {
        const cookies = await this.page.context().cookies();
        const cookie = cookies.find(c => c?.name?.startsWith('wordpress_logged_in_'));
        if (!cookie?.value) {
            return undefined;
        }
        return decodeURIComponent(cookie.value).split('|')[0];
    }

    // frontend (my-account) login — ported from LoginPage.loginFrontend
    private async login(user: { username: string; password: string }): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.myAccount);
        const currentUser = await this.getCurrentUser();

        // already logged in as the requested user
        if (user.username === currentUser) {
            return;
        }

        // a different user is logged in — log them out first
        if (user.username !== currentUser && currentUser !== undefined) {
            await this.logout();
        }

        await this.page.locator(sel.frontend.username).fill(user.username);
        await this.page.locator(sel.frontend.userPassword).fill(user.password);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.myAccount, sel.frontend.logIn, 302);

        const loggedInUser = await this.getCurrentUser();
        expect(loggedInUser).toBe(user.username);
    }

    private async logout(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.myAccount);
        await Promise.all([this.page.waitForLoadState('domcontentloaded'), this.page.locator(sel.frontend.customerLogout).click()]);
        const loggedInUser = await this.getCurrentUser();
        expect(loggedInUser).toBeUndefined();
    }

    // place a bank-transfer order at checkout — ported from CustomerPage.placeOrder (bank path)
    private async placeOrder(): Promise<string> {
        await this.goIfNotThere(data.subUrls.frontend.checkout);

        await this.page.locator(sel.checkout.directBankTransfer).click();

        await this.page.locator(sel.checkout.placeOrder).focus();
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.orderReceived, sel.checkout.placeOrder);
        await expect(this.page.locator(sel.orderReceived.orderReceivedSuccessMessage)).toBeVisible();

        const ifMultiVendorOrder = await this.isVisible(sel.orderReceived.subOrders.subOrders);
        if (ifMultiVendorOrder) {
            await this.multipleElementVisible(sel.orderReceived.subOrders);
        }

        const orderNumber = await this.page.locator(sel.orderReceived.orderNumber).textContent();
        return orderNumber ?? '';
    }

    // ---------------------------------------------------------------
    // admin
    // ---------------------------------------------------------------

    // enable vendor subscription module
    async enableVendorSubscriptionModule(): Promise<void> {
        // dokan settings
        await this.goto(data.subUrls.backend.dokan.settings);
        await expect(this.page.locator(sel.admin.settingsMenuVendorSubscription)).toBeVisible();

        // vendor dashboard menu
        await this.goto(data.subUrls.frontend.vDashboard.dashboard);
        await expect(this.page.locator(sel.vendor.dashboardMenuSubscription)).toBeVisible();
    }

    // disable vendor subscription module
    async disableVendorSubscriptionModule(): Promise<void> {
        // dokan settings
        await this.goto(data.subUrls.backend.dokan.settings);
        await expect(this.page.locator(sel.admin.settingsMenuVendorSubscription)).toBeHidden();

        // vendor dashboard menu
        await this.goto(data.subUrls.frontend.vDashboard.dashboard);
        await expect(this.page.locator(sel.vendor.dashboardMenuSubscription)).toBeHidden();

        // vendor dashboard menu page
        await this.goto(data.subUrls.frontend.vDashboard.subscriptions);
        await expect(this.page.locator(sel.vendor.dashboardDiv)).toBeHidden();
    }

    // subscriptions render properly
    async subscriptionsRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.subscriptions);

        // subscribed vendor list is visible
        await expect(this.page.locator(sel.admin.subscribedVendorList)).toBeVisible();

        // bulk action elements are visible
        await this.multipleElementVisible(sel.admin.bulkActions);

        // filter elements are visible (exclude the input + result parameterised selectors)
        const { filterByVendorsInput, filterBySubscriptionPackInput, filteredResult, ...filters } = sel.admin.filters;
        void filterByVendorsInput;
        void filterBySubscriptionPackInput;
        void filteredResult;
        await this.multipleElementVisible(filters);

        // subscription table elements are visible
        await this.multipleElementVisible(sel.admin.table);

        const noSubscribedVendorsFound = await this.isVisible(sel.admin.noRowsFound);
        if (noSubscribedVendorsFound) {
            return;
        }

        await expect(this.page.locator(sel.admin.numberOfRowsFound)).not.toHaveCount(0);
    }

    // filter subscribed vendors
    async filterSubscribedVendors(input: string, action: string): Promise<void> {
        await this.goto(data.subUrls.backend.dokan.subscriptions);
        await this.page.reload(); // todo: fix this

        switch (action) {
            case 'by-vendor':
                await this.page.locator(sel.admin.filters.filterByVendors).click();
                await this.typeAndWaitForResponse(data.subUrls.api.dokan.subscriptions, sel.admin.filters.filterByVendorsInput, input);
                break;

            case 'by-pack':
                await this.page.locator(sel.admin.filters.filterBySubscriptionPack).click();
                await this.typeAndWaitForResponse(data.subUrls.api.dokan.subscriptions, sel.admin.filters.filterBySubscriptionPackInput, input);
                break;

            default:
                break;
        }

        await this.clickAndWaitForResponse(data.subUrls.api.dokan.subscriptions, sel.admin.filters.filteredResult(input));
        await expect(this.page.locator(sel.admin.numberOfRowsFound)).not.toHaveText('0 items');
        await expect(this.page.locator(sel.admin.noRowsFound)).toBeHidden();
    }

    // cancel subscriptions
    async cancelSubscription(vendor: string, option: string): Promise<void> {
        await this.goto(data.subUrls.backend.dokan.subscriptions);
        await this.page.reload(); // todo: fix this

        await this.page.locator(sel.admin.vendorSubscriptionsActions(vendor)).click();
        if (option === 'immediately') {
            await this.page.locator(sel.admin.subscriptionAction.cancelImmediately).click();
            await this.clickAndWaitForResponse(data.subUrls.api.dokan.subscriptions, sel.admin.subscriptionAction.cancelSubscription, 200);
            await expect(this.page.locator(sel.admin.vendorSubscriptionsRow(vendor))).toBeHidden();
        } else {
            await this.page.locator(sel.admin.subscriptionAction.cancelAfterEndOfCurrentPeriod).click();
            await this.clickAndWaitForResponse(data.subUrls.api.dokan.subscriptions, sel.admin.subscriptionAction.cancelSubscription, 200);
            await expect(this.page.locator(sel.admin.vendorSubscriptionsRow(vendor))).toBeVisible();
        }
    }

    // subscriptions bulk action
    async subscriptionsBulkAction(action: string, storeName?: string): Promise<void> {
        if (storeName) {
            await this.filterSubscribedVendors(storeName, 'by-vendor');
        } else {
            await this.goIfNotThere(data.subUrls.backend.dokan.subscriptions);
        }

        // ensure row exists
        await expect(this.page.locator(sel.admin.noRowsFound)).toBeHidden();

        await this.page.locator(sel.admin.bulkActions.selectAll).click();
        await this.page.selectOption(sel.admin.bulkActions.selectAction, { value: action });
        await this.clickAndAcceptAndWaitForResponse(data.subUrls.api.dokan.subscriptions, sel.admin.bulkActions.applyAction);
    }

    // assign subscription pack to vendor
    async assignSubscriptionPack(sellerId: string, subscriptionPack: string): Promise<void> {
        await this.goto(data.subUrls.backend.dokan.vendorDetailsEdit(sellerId));
        await this.page.locator(sel.admin.vendors.assignSubscriptionPackDropdown).click();
        await this.page.locator(sel.admin.vendors.selectSubscriptionPack(subscriptionPack)).click();
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.stores, sel.admin.vendors.saveChanges);
        await this.page.locator(sel.admin.vendors.closeUpdateSuccessModal).click();
    }

    // ---------------------------------------------------------------
    // vendor
    // ---------------------------------------------------------------

    // vendor subscriptions render properly
    async vendorSubscriptionsRenderProperly(link?: string): Promise<void> {
        if (link) {
            await this.goto(link);
        } else {
            await this.goIfNotThere(data.subUrls.frontend.vDashboard.subscriptions);
        }

        // subscribed pack info
        const hasSubscription = await this.isVisible(sel.vendor.sellerSubscriptionInfo.sellerSubscriptionInfo);
        if (!hasSubscription) {
            console.log('No subscribed pack found!');
        } else {
            await expect(this.page.locator(sel.vendor.sellerSubscriptionInfo.sellerSubscriptionInfo)).toBeVisible();
        }

        // subscription pack list
        const noSubscriptionPacks = await this.isVisible(sel.vendor.noSubscriptionMessage);

        if (noSubscriptionPacks) {
            await expect(this.page.locator(sel.vendor.noSubscriptionMessage)).toContainText('No subscription pack has been found!');
            console.log('No subscription pack found!');
        } else {
            await expect(this.page.locator(sel.vendor.dokanSubscriptionDiv)).toBeVisible();
            await expect(this.page.locator(sel.vendor.productCardContainer)).toBeVisible();

            await expect(this.page.locator(sel.vendor.productCard.item)).not.toHaveCount(0);
            await expect(this.page.locator(sel.vendor.productCard.price)).not.toHaveCount(0);
            await expect(this.page.locator(sel.vendor.productCard.content)).not.toHaveCount(0);
            await expect(this.page.locator(sel.vendor.productCard.buyButton)).not.toHaveCount(0);
        }
    }

    // vendor buy dokan subscription
    async buySubscription(username: string, subscriptionPack: string, switchPack = false): Promise<string> {
        await this.login({ username, password: USER_PASSWORD ?? '' });

        await this.goIfNotThere(data.subUrls.frontend.vDashboard.subscriptions);

        // cancel active subscription if switching
        if (switchPack) {
            await this.vendorCancelSubscription(username, false);
        }

        await this.clickAndAcceptAndWaitForResponseAndLoadState(data.subUrls.frontend.checkout, sel.vendor.buySubscription(subscriptionPack));
        const orderNumber = await this.placeOrder();
        return orderNumber;
    }

    // assert subscribed subscription
    async assertSubscription(subscriptionPack: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.subscriptions);
        await expect(this.page.locator(sel.vendor.sellerSubscriptionInfo.sellerSubscriptionInfo)).toBeVisible();
        await expect(this.page.locator(sel.vendor.sellerSubscriptionInfo.subscribedPack(subscriptionPack))).toBeVisible();
    }

    // vendor cancel dokan subscription
    async vendorCancelSubscription(username: string, login = true): Promise<void> {
        if (login) {
            await this.login({ username, password: USER_PASSWORD ?? '' });
        }

        await this.goIfNotThere(data.subUrls.frontend.vDashboard.subscriptions);
        await this.page.locator(sel.vendor.sellerSubscriptionInfo.cancelSubscription).click();
        await this.clickAndAcceptAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.subscriptions, sel.vendor.sellerSubscriptionInfo.confirmCancelSubscription);
        await expect(this.page.locator(sel.vendor.sellerSubscriptionInfo.cancelSuccessMessage)).toContainText('Your subscription has been cancelled! ');
    }
}
