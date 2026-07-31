import { Page, expect, request as pwRequest, APIRequestContext } from '@playwright/test';
import { closeAnnouncementModal, toPath, helpers } from '@utils/helpers';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils as RealApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { reverseWithdraw, date } from '@utils/interfaces';

// Re-export the real utils so the spec keeps importing them from this module
// (the spec's import contract: { ReverseWithdrawsPage, ApiUtils, data, dbData, dbUtils, helpers, payloads }).
export { data, dbData, dbUtils, payloads, helpers };

/**
 * Null-tolerant ApiUtils wrapper (mirrors the sibling vendor-return-request page object).
 *
 * The spec constructs `new ApiUtils(null)`. The real ApiUtils requires an
 * APIRequestContext, so when null is passed we lazily create our own context and
 * swap it in before the first real REST call. Every ApiUtils method the spec
 * invokes is overridden to `ready()` first.
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

    override async createStore(...args: Parameters<RealApiUtils['createStore']>): ReturnType<RealApiUtils['createStore']> {
        await this.ready();
        return super.createStore(...args);
    }

    override async createProduct(...args: Parameters<RealApiUtils['createProduct']>): ReturnType<RealApiUtils['createProduct']> {
        await this.ready();
        return super.createProduct(...args);
    }

    override async createOrderWithStatus(...args: Parameters<RealApiUtils['createOrderWithStatus']>): ReturnType<RealApiUtils['createOrderWithStatus']> {
        await this.ready();
        return super.createOrderWithStatus(...args);
    }

    override async updateOrderStatus(...args: Parameters<RealApiUtils['updateOrderStatus']>): ReturnType<RealApiUtils['updateOrderStatus']> {
        await this.ready();
        return super.updateOrderStatus(...args);
    }

    override async dispose(): Promise<void> {
        await this.ready();
        await super.dispose();
    }
}

// ----------------------------------------------------------------------------
// Co-located selectors (ported verbatim from the pre-refactor selectors.ts groups
// selector.admin.dokan.reverseWithdraw / selector.vendor.vReverseWithdrawal, plus
// the checkout + order-received + announcement + dashboard selectors the flow uses).
// ----------------------------------------------------------------------------
export const reverseWithdrawsSelectors = {
    // admin: selector.admin.dokan.reverseWithdraw
    admin: {
        reverseWithdrawText: '.dokan-reverse-withdrawal h1',
        addNewReverseWithdrawal: '.dokan-reverse-withdrawal button.page-title-action',

        reverseWithdrawFactCards: {
            totalCollectedCard: '//p[normalize-space()="Total Collected"]/../..',
            totalCollected: '//p[normalize-space()="Total Collected"]/../..//h3',
            remainingBalanceCard: '//p[normalize-space()="Remaining Balance"]/../..',
            remainingBalance: '//p[normalize-space()="Remaining Balance"]/../..//h3',
            TotalTransactionsCard: '//p[normalize-space()="Total Transactions"]/../..',
            TotalTransactions: '//p[normalize-space()="Total Transactions"]/../..//h3',
            TotalVendorsCard: '//p[normalize-space()="Total Vendors"]/../..',
            TotalVendors: '//p[normalize-space()="Total Vendors"]/../..//h3',
        },

        filters: {
            filterByStore: '.multiselect__select',
            filterInput: '.multiselect__input',
            clearFilterCrossButton: '//i[@class="dashicons dashicons-no"]/..',
            clearFilter: '//button[normalize-space()="Clear"]',
            filteredResult: (storeName: string) => `//span[contains(text(), '${storeName}')]/..`,
        },

        table: {
            revereWithdrawTable: '#dokan_reverse_withdrawal_list_table table',
            storesColumn: 'thead th.store_name',
            balanceColumn: 'thead th.balance',
            lastPaymentDateColumn: 'thead th.last_payment_date',
        },

        reverseWithdrawCell: (storeName: string) => `//td//a[contains(text(), '${storeName}')]/../..`,

        addReverseWithdrawal: {
            selectVendorDropdown: '//span[normalize-space()="Search vendor"]/../..//div[@class="multiselect__select"]',
            selectVendorInput: '//input[@placeholder="Search vendor"]',
            transactionType: (type: string) => `//input[@value="${type}"]/..`, // manual_product, manual_order, other
            selectProductDropdown: '//span[normalize-space()="Search product"]/../..//div[@class="multiselect__select"]',
            selectProductInput: '//input[@placeholder="Search product"]',
            selectOption: (value: string) => `//div[@class="dokan-modal"]//li//span[contains(text(), "${value}")]/..`,
            withdrawalBalanceType: (type: string) => `//input[@value="${type}"]/..`, // debit, credit
            reverseWithdrawalAmount: 'input.regular-text.wc_input_decimal',
            note: '//textarea[@placeholder="Write reverse withdrawal note"]',
            save: 'button.dokan-rw-footer-btn',
        },
    },

    // vendor: selector.vendor.vReverseWithdrawal
    vendor: {
        reverseWithdrawalText: '//h1[normalize-space()="Reverse Withdrawal"]',

        reverseWithdrawalNotice: {
            noticeText: 'div.dokan-alert.dokan-alert-danger strong',
            noticeTextGracePeriod: '//strong[contains(text(),"You have a reverse withdrawal balance of")]/..',
            noticeTextAfterGracePeriod: '//strong[contains(text(),"Below actions have been taken due to unpaid reverse withdrawal balance:")]/..',
        },

        reverseBalanceSection: {
            reverseBalanceSection: 'div.reverse-balance-section',
            reversePayBalance: 'div.reverse-balance',
            reversePayBalanceAmount: 'div.reverse-balance .woocommerce-Price-amount.amount',
            reverseThreshold: 'div.reverse-threshold',
            reverseThresholdAmount: 'div.reverse-threshold .woocommerce-Price-amount.amount',
        },

        payNow: 'input#reverse_pay',
        confirmAction: '.swal2-actions .swal2-confirm',

        filters: {
            dateRangeInput: 'input#trn_date_filter',
            startDateInput: 'input#trn_date_form_filter_alt',
            endDateInput: 'input#trn_date_to_filter_alt',
            filter: '//input[@value="Filter"]',
        },

        table: {
            reverseWithdrawalTable: '.dokan-table.dokan-table-striped',
            transactionIdColumn: '//th[normalize-space()="Transaction ID"]',
            dateColumn: '//th[normalize-space()="Date"]',
            transactionTypeColumn: '//th[normalize-space()="Transaction Type"]',
            noteColumn: '//th[normalize-space()="Note"]',
            debitColumn: '//th[normalize-space()="Debit"]',
            creditColumn: '//th[normalize-space()="Credit"]',
            balanceColumn: '//th[normalize-space()="Balance"]',
        },

        numberOfRowsFound: '.dokan-table.dokan-table-striped tbody tr',
        openingBalanceRow: '//td[normalize-space()="Opening Balance"]/..',
    },

    // selector.vendor.vAnnouncement
    announcement: {
        firstAnnouncementLink: (title: string) => `(//div[@class="dokan-announcement-heading"]//h3[contains(text(),"${title}")]/..)[1]`,
        title: '.dokan-notice-single-notice-area .entry-title',
    },

    // selector.vendor.vDashboard
    vendorDashboard: {
        withdraw: 'ul.dokan-dashboard-menu li.withdraw a',
        dokanNotice: 'div.dokan-alert.dokan-alert-warning',
    },

    // selector.customer.cSingleStore.productCard
    singleStore: {
        readMore: '//ul[contains(@class,"products")]//a[normalize-space(text())="Read more"]',
    },

    // selector.customer.cCheckout
    checkout: {
        directBankTransfer: '.payment_method_bacs label, label[for="radio-control-wc-payment-method-options-bacs"]',
        placeOrder: '#place_order, button.wc-block-components-checkout-place-order-button',
    },

    // selector.customer.cOrderReceived
    orderReceived: {
        orderReceivedSuccessMessage: '.woocommerce-notice.woocommerce-notice--success.woocommerce-thankyou-order-received',
        orderNumber: '.woocommerce-order-overview__order.order strong',
    },
} as const;

const adminSel = reverseWithdrawsSelectors.admin;
const vendorSel = reverseWithdrawsSelectors.vendor;

// Sub-URLs (mirrors data.subUrls used by the reference).
const urls = {
    // frontend / backend page URLs (full)
    adminReverseWithdraws: toPath('wp-admin/admin.php?page=dokan#/reverse-withdrawal'),
    vendorReverseWithdrawal: toPath('dashboard/reverse-withdrawal'),
    vendorAnnouncements: toPath('dashboard/announcement'),
    vendorDashboard: toPath('dashboard'),
    checkoutPage: toPath('checkout'),
    store: (slug: string) => toPath(`store/${slug}`),
    // API sub-urls (substring-matched against response URLs)
    api: {
        reverseWithdraws: 'dokan/v1/reverse-withdrawal',
        stores: 'dokan/v1/stores',
        products: 'dokan/v1/products',
    },
    ajax: 'admin-ajax.php',
    checkout: 'checkout',
    orderReceived: 'checkout/order-received',
};

export class ReverseWithdrawsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---------------------------------------------------------------- helpers

    // navigate to a full page URL (goIfNotThere / gotoUntilNetworkidle equivalent).
    private async navigate(url: string): Promise<void> {
        await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    }

    // assert an element is visible (base toBeVisible).
    private async toBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeVisible();
    }

    // assert an element is hidden (base notToBeVisible).
    private async notToBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeHidden();
    }

    // assert an element does NOT resolve to `count` matches (base notToHaveCount).
    private async notToHaveCount(selector: string, count: number): Promise<void> {
        await expect(this.page.locator(selector)).not.toHaveCount(count);
    }

    // recursively assert every string selector in an object is visible (base multipleElementVisible):
    // recurse into plain objects, skip function selectors.
    private async multipleElementVisible(selectors: Record<string, unknown>): Promise<void> {
        for (const key in selectors) {
            const value = selectors[key];
            if (typeof value === 'function') continue;
            if (value && typeof value === 'object') {
                await this.multipleElementVisible(value as Record<string, unknown>);
            } else if (typeof value === 'string') {
                await this.toBeVisible(value);
            }
        }
    }

    // click and wait for a matching 2xx API response (base clickAndWaitForResponse).
    private async clickAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<void> {
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).click(),
        ]);
    }

    // click and wait for the API response AND the load state (base clickAndWaitForResponseAndLoadState).
    private async clickAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200): Promise<void> {
        await Promise.all([
            this.page.waitForLoadState('load'),
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).click(),
        ]);
    }

    // click and wait for the load state to settle (base clickAndWaitForLoadState).
    private async clickAndWaitForLoadState(selector: string): Promise<void> {
        await Promise.all([this.page.waitForLoadState('domcontentloaded'), this.page.locator(selector).click()]);
    }

    // fill an input and wait for a matching 2xx API response (base typeAndWaitForResponse).
    private async typeAndWaitForResponse(subUrl: string, selector: string, text: string, code = 200): Promise<void> {
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).fill(text),
        ]);
    }

    // set a DOM attribute on an element (base setAttributeValue).
    private async setAttributeValue(selector: string, attribute: string, value: string): Promise<void> {
        await this.page.locator(selector).evaluate((el, [attr, val]) => el.setAttribute(attr as string, val as string), [attribute, value]);
    }

    // get an element's text content (base getElementText).
    private async getElementText(selector: string): Promise<string | null> {
        return await this.page.locator(selector).textContent();
    }

    // ------------------------------------------------------------------ admin

    // reverse withdraw render properly
    async adminReverseWithdrawRenderProperly(): Promise<void> {
        await this.navigate(urls.adminReverseWithdraws);

        // reverse withdraw text is visible
        await this.toBeVisible(adminSel.reverseWithdrawText);

        // add new reverse withdrawal is visible
        await this.toBeVisible(adminSel.addNewReverseWithdrawal);

        // fact cards elements are visible
        await this.multipleElementVisible(adminSel.reverseWithdrawFactCards);

        // filter elements are visible (exclude the input/cross/function-only members)
        const { filterInput, clearFilterCrossButton, filteredResult, ...filters } = adminSel.filters;
        void filterInput;
        void clearFilterCrossButton;
        void filteredResult;
        await this.multipleElementVisible(filters);

        // reverse withdraw table elements are visible
        await this.multipleElementVisible(adminSel.table);
    }

    // filter reverse withdraws
    async filterReverseWithdraws(vendorName: string): Promise<void> {
        await this.navigate(urls.adminReverseWithdraws);

        await this.page.locator(adminSel.filters.filterByStore).click();
        await this.typeAndWaitForResponse(urls.api.reverseWithdraws, adminSel.filters.filterInput, vendorName);
        await this.clickAndWaitForResponseAndLoadState(urls.api.reverseWithdraws, adminSel.filters.filteredResult(vendorName));
        await this.toBeVisible(adminSel.reverseWithdrawCell(vendorName));
    }

    // clear filter reverse withdraws
    async clearFilterReverseWithdraws(vendorName: string): Promise<void> {
        await this.filterReverseWithdraws(vendorName);
        await this.toBeVisible(adminSel.filters.clearFilterCrossButton);
        await this.clickAndWaitForResponse(urls.api.reverseWithdraws, adminSel.filters.clearFilter);
        await this.notToBeVisible(adminSel.filters.clearFilterCrossButton);
    }

    // add new reverse withdrawal
    async addReverseWithdrawal(reverseWithdrawal: reverseWithdraw): Promise<void> {
        await this.navigate(urls.adminReverseWithdraws);

        await this.page.locator(adminSel.addNewReverseWithdrawal).click();

        await this.page.locator(adminSel.addReverseWithdrawal.selectVendorDropdown).click();
        await this.typeAndWaitForResponse(urls.api.stores, adminSel.addReverseWithdrawal.selectVendorInput, reverseWithdrawal.store);
        await this.page.locator(adminSel.addReverseWithdrawal.selectOption(reverseWithdrawal.store)).click();

        await this.page.locator(adminSel.addReverseWithdrawal.transactionType(reverseWithdrawal.transactionType)).click();

        await this.page.locator(adminSel.addReverseWithdrawal.selectProductDropdown).click();
        await this.typeAndWaitForResponse(urls.api.products, adminSel.addReverseWithdrawal.selectProductInput, reverseWithdrawal.product);
        await this.page.locator(adminSel.addReverseWithdrawal.selectOption(reverseWithdrawal.product)).click();

        await this.page.locator(adminSel.addReverseWithdrawal.withdrawalBalanceType(reverseWithdrawal.withdrawalBalanceType)).click();

        await this.page.locator(adminSel.addReverseWithdrawal.reverseWithdrawalAmount).fill(reverseWithdrawal.amount);
        await this.page.locator(adminSel.addReverseWithdrawal.note).fill(reverseWithdrawal.note);

        await this.clickAndWaitForResponseAndLoadState(urls.api.reverseWithdraws, adminSel.addReverseWithdrawal.save);
    }

    // ----------------------------------------------------------------- vendor

    // reverse withdrawal render properly
    async vendorReverseWithdrawalRenderProperly(): Promise<void> {
        await this.navigate(urls.vendorReverseWithdrawal);

        // reverse withdrawal text is visible
        await this.toBeVisible(vendorSel.reverseWithdrawalText);

        // reverse balance section elements are visible
        await this.multipleElementVisible(vendorSel.reverseBalanceSection);

        // filter elements are visible
        await this.toBeVisible(vendorSel.filters.dateRangeInput);
        await this.toBeVisible(vendorSel.filters.filter);

        // reverse withdrawal table elements are visible
        await this.multipleElementVisible(vendorSel.table);

        // opening balance row is visible
        await this.toBeVisible(vendorSel.openingBalanceRow);
    }

    // reverse withdraw notice render properly
    async vendorViewReverseWithdrawalNotice(gracePeriod?: string): Promise<void> {
        await this.navigate(urls.vendorReverseWithdrawal);

        await this.notToHaveCount(vendorSel.reverseWithdrawalNotice.noticeText, 0);

        if (gracePeriod == 'grace-period') {
            const noticeText = await this.getElementText(vendorSel.reverseWithdrawalNotice.noticeTextGracePeriod);
            // while in grace period
            expect(noticeText).toContain('Your products add to cart will be hidden. Hence users will not be able to purchase any of your products.');
            expect(noticeText).toContain('Withdraw menu will be hidden. Hence you will not be able to make any withdraw request from your account.');
            expect(noticeText).toContain('Your account will be disabled for selling. Hence you will no longer be able to sell any products.');
        } else {
            const noticeText = await this.getElementText(vendorSel.reverseWithdrawalNotice.noticeTextAfterGracePeriod);
            // after grace period
            expect(noticeText).toContain('Your products add to cart button has been temporarily hidden. Hence users are not able to purchase any of your products');
            expect(noticeText).toContain('Withdraw menu has been temporarily hidden. Hence you are not able to make any withdrawal requests from your account.');
            expect(noticeText).toContain('Kindly pay your due to start selling again.');
        }
    }

    // view reverse withdraw announcement
    async vendorViewReverseWithdrawalAnnouncement(): Promise<void> {
        await this.navigate(urls.vendorAnnouncements);
        await this.clickAndWaitForLoadState(reverseWithdrawsSelectors.announcement.firstAnnouncementLink('You have a reverse withdrawal balance of'));
        await expect(this.page.locator(reverseWithdrawsSelectors.announcement.title)).toContainText('You have a reverse withdrawal balance of');
    }

    // filter reverse withdraws
    async vendorFilterReverseWithdrawals(inputValue: date['dateRange']): Promise<void> {
        await this.navigate(urls.vendorReverseWithdrawal);

        await this.setAttributeValue(vendorSel.filters.dateRangeInput, 'value', helpers.dateFormatFYJ(inputValue.startDate) + ' - ' + helpers.dateFormatFYJ(inputValue.endDate));
        await this.setAttributeValue(vendorSel.filters.startDateInput, 'value', inputValue.startDate);
        await this.setAttributeValue(vendorSel.filters.endDateInput, 'value', inputValue.endDate);
        await this.clickAndWaitForLoadState(vendorSel.filters.filter);
        await this.notToHaveCount(vendorSel.numberOfRowsFound, 3);
    }

    // vendor can't withdraw when reverse withdrawal rule applied
    async vendorCantWithdraw(): Promise<void> {
        await this.navigate(urls.vendorDashboard);
        await this.notToBeVisible(reverseWithdrawsSelectors.vendorDashboard.withdraw);
    }

    // vendor status is inactive when reverse withdrawal rule applied
    async vendorStatusInactive(): Promise<void> {
        await this.navigate(urls.vendorDashboard);
        await expect(this.page.locator(reverseWithdrawsSelectors.vendorDashboard.dokanNotice)).toContainText('Error! Your account is not enabled for selling, please contact the admin');
    }

    // vendor product in catalog mode when reverse withdrawal rule applied
    async vendorProductsInCatalogMode(storeName: string): Promise<void> {
        await this.navigate(urls.store(helpers.slugify(storeName)));
        await this.notToHaveCount(reverseWithdrawsSelectors.singleStore.readMore, 0);
    }

    // pay reverse pay balance
    async vendorPayReversePayBalance(): Promise<string> {
        await this.navigate(urls.vendorReverseWithdrawal);

        await this.clickAndWaitForResponse(urls.ajax, vendorSel.payNow);
        await this.clickAndWaitForResponseAndLoadState(urls.checkout, vendorSel.confirmAction);
        const orderId = await this.paymentOrder();
        return orderId;
    }

    // checkout flow via bank transfer, returns the order number (base paymentOrder, 'bank').
    private async paymentOrder(): Promise<string> {
        await this.page.locator(reverseWithdrawsSelectors.checkout.directBankTransfer).click();
        await this.page.locator(reverseWithdrawsSelectors.checkout.placeOrder).focus();
        await this.clickAndWaitForResponseAndLoadState(urls.orderReceived, reverseWithdrawsSelectors.checkout.placeOrder);
        await this.toBeVisible(reverseWithdrawsSelectors.orderReceived.orderReceivedSuccessMessage);
        return (await this.getElementText(reverseWithdrawsSelectors.orderReceived.orderNumber)) as string;
    }
}
