import { Page, expect } from '@playwright/test';
import { request as pwRequest, APIRequestContext } from '@playwright/test';
import { closeAnnouncementModal, helpers } from '@utils/helpers';
import { toPath } from '@utils/helpers';
import { data } from '@utils/testData';
import { ApiUtils as RealApiUtils } from '@utils/apiUtils';
import { customer } from '@utils/interfaces';

// ============================================================================
// Vendor Product Subscription (WooCommerce Subscriptions integration) — legacy
// PHP/Woo surfaces de-stubbed by porting the pre-refactor page object
// (pre-#3173 `tests/pw/pages/vendorProductSubscriptionPage.ts`) into the current
// self-contained architecture.
//
// The pre-refactor object extended VendorPage and delegated the customer
// purchase/checkout/stripe steps to CustomerPage. Those base classes no longer
// exist, so every base-class helper is inlined as a private method below and the
// CustomerPage sub-flows (updateShippingFields / addProductToCart / placeOrder /
// paymentOrder / payWithStripe) are inlined faithfully with co-located selectors.
//
// data / payloads / ApiUtils are re-exported REAL from @utils so the spec's
// beforeAll seeds a real subscription product over REST and toggles the module.
// ============================================================================

// Re-export the REAL test data + payloads the spec imports from this module.
export { data } from '@utils/testData';
export { payloads } from '@utils/payloads';

/**
 * Null-tolerant ApiUtils wrapper (mirrors vendor-return-request / store-supports).
 *
 * The spec constructs `new ApiUtils(null)`. The real ApiUtils requires an
 * APIRequestContext, so when null is passed we lazily create our own context and
 * swap it in before the first real call.
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

    override async createProduct(...args: Parameters<RealApiUtils['createProduct']>): ReturnType<RealApiUtils['createProduct']> {
        await this.ready();
        return super.createProduct(...args);
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
// SUB-URLS (real values live on @utils/testData `data.subUrls` — aliased for
// readability; kept in sync with the pre-refactor references).
// ============================================================================
const subUrls = {
    dashboard: data.subUrls.frontend.vDashboard.dashboard,
    myAccount: data.subUrls.frontend.myAccount,
    userSubscriptions: data.subUrls.frontend.vDashboard.userSubscriptions,
    ajax: data.subUrls.ajax,
    cart: data.subUrls.frontend.cart,
    checkout: data.subUrls.frontend.checkout,
    shippingAddress: data.subUrls.frontend.shippingAddress,
    orderReceived: data.subUrls.frontend.orderReceived,
    addToCartResponse: data.subUrls.frontend.productCustomerPage,
    wcStore: data.subUrls.api.wc.store,
    productSubscriptionDetails: (id: string): string => data.subUrls.frontend.productSubscriptionDetails(id),
    productDetails: (name: string): string => data.subUrls.frontend.productDetails(helpers.slugify(name)),
};

// ============================================================================
// SELECTORS (recovered verbatim from the pre-refactor selectors.ts groups:
// vendor.vUserSubscriptions, customer.cSubscription, cMyAccount, cAddress.shipping,
// cSingleProduct, cCart, cCheckout, cPayWithStripe, cOrderReceived, cWooSelector).
// ============================================================================
const selectors = {
    // vendor dashboard menu + user-subscription screen
    vendor: {
        // Selector drift (Dokan 4.x React vendor dashboard): the legacy
        // `ul.dokan-dashboard-menu` sidebar is now kept only as a data source and
        // rendered with `visibility:hidden`; the real, visible navigation is the
        // React `aside.dokan-frontend-sidebar`. Verified live: the User
        // Subscriptions nav link is present when the vsp module is active and
        // removed when it is deactivated — so this remains a genuine module oracle.
        dashboardMenu: 'aside.dokan-frontend-sidebar a[href*="#user-subscription"]',
        dashboardDiv: 'div.dokan-dashboard-wrap',
        filters: {
            filterByCustomer: '//select[@id="dokan-filter-customer"]/..//span[@class="select2-selection__arrow"]',
            filterByCustomerInput: '.select2-search__field',
            filterByDate: 'input#order_date_filter',
            filter: '.dokan-btn',
            result: '.select2-results__option.select2-results__option--highlighted',
        },
        noSubscriptionsFound: '//div[@class="dokan-error" and contains(text(), "No subscription found")]',
        numberOfRowsFound: '.dokan-table.dokan-table tbody tr',
    },

    // customer my-account subscriptions menu
    myAccount: {
        subscriptionsMenu: '.woocommerce-MyAccount-navigation-link--subscriptions a',
    },

    // customer subscription details screen
    subscriptionDetails: {
        subscriptionHeading: 'h1.entry-title',
        actions: {
            cancel: 'td a.button.cancel',
            changeAddress: 'td a.button.change_address',
            changePayment: 'td a.button.change_payment_method',
            reActivate: 'td a.button.reactivate',
            renewNow: 'td a.button.subscription_renewal_early',
        },
        changePaymentMethod: '//input[@id="place_order"]',
    },

    // customer shipping-address form (my-account edit-address/shipping)
    shipping: {
        firstName: '#shipping_first_name',
        lastName: '#shipping_last_name',
        country: '//select[@id="shipping_country"]/..//span[@class="select2-selection__arrow"]',
        countryInput: '.select2-search.select2-search--dropdown .select2-search__field',
        countryValue: (country: string): string => `//li[contains(@class,"select2-results__option") and normalize-space(text())="${country}"]`,
        selectedCountry: '//span[@id="select2-shipping_country-container"]',
        streetAddress: '#shipping_address_1',
        streetAddress2: '#shipping_address_2',
        city: '#shipping_city',
        state: '//select[@id="shipping_state"]/..//span[@class="select2-selection__arrow"]',
        stateInput: '.select2-search.select2-search--dropdown .select2-search__field',
        stateValue: (state: string): string => `//li[contains(@class,"select2-results__option")and normalize-space(text())="${state}"]`,
        selectedState: '//span[@id="select2-shipping_state-container"]',
        zipCode: '#shipping_postcode',
        saveAddress: '//button[@name="save_address"]',
    },

    // single-product add-to-cart
    singleProduct: {
        quantity: 'div.quantity input.qty',
        addToCart: 'button.single_add_to_cart_button',
        productAddedSuccessMessage: (productName: string): string => `//div[@class="woocommerce-message" and contains(.,"“${productName}” has been added to your cart.")]`,
    },

    // block-cart
    cart: {
        removeFirstItem: '(//button[@class="wc-block-cart-item__remove-link"])[1]',
        cartEmptyMessage: '.wp-block-woocommerce-empty-cart-block .wc-block-cart__empty-cart__title',
    },

    // checkout payment methods + place order
    checkout: {
        directBankTransfer: '.payment_method_bacs label, label[for="radio-control-wc-payment-method-options-bacs"]',
        checkPayments: '.payment_method_cheque label, label[for="radio-control-wc-payment-method-options-cheque"]',
        cashOnDelivery: '.payment_method_cod label, label[for="radio-control-wc-payment-method-options-cod"]',
        stripeConnect: '.wc_payment_method.payment_method_dokan-stripe-connect label[for="payment_method_dokan-stripe-connect"]',
        placeOrder: '#place_order, button.wc-block-components-checkout-place-order-button',
    },

    // stripe connect card iframe
    stripe: {
        savedTestCard4242: '//label[contains(text(),"Visa ending in 4242")]/..//input',
        stripeConnectIframe: 'div#dokan-stripe-card-element iframe[title="Secure card payment input frame"]',
        cardNumber: 'input[name="cardnumber"]',
        expDate: 'input[name="exp-date"]',
        cvc: 'input[name="cvc"]',
        savePaymentInformation: '#wc-dokan-stripe-connect-new-payment-method',
    },

    // order-received (thank-you) page
    orderReceived: {
        orderReceivedSuccessMessage: '.woocommerce-notice.woocommerce-notice--success.woocommerce-thankyou-order-received',
        orderNumber: '.woocommerce-order-overview__order.order strong',
        subOrders: '//h2[normalize-space()="Sub Orders"]',
    },

    // woocommerce front-end success banner
    wooCommerceSuccessMessage: 'div.woocommerce-message',
};

export class VendorProductSubscriptionPage {
    constructor(readonly page: Page) {
        void closeAnnouncementModal(page);
    }

    // ------------------------------------------------------------------
    // Inlined base helpers (port of the pre-refactor VendorPage/CustomerPage
    // base-class methods to raw Playwright — mirrors vendor-return-request).
    // ------------------------------------------------------------------
    private createUrl(subPath: string): string {
        return toPath(subPath);
    }

    private async goto(subPath: string): Promise<void> {
        await this.page.goto(this.createUrl(subPath), { waitUntil: 'domcontentloaded' });
    }

    private async goIfNotThere(subPath: string): Promise<void> {
        const target = this.createUrl(subPath).replace(/\/$/, '');
        const current = this.page.url().replace(/\/$/, '');
        if (current !== target) {
            await this.goto(subPath);
        }
    }

    private async toBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector).first()).toBeVisible();
    }

    private async notToBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector).first()).toBeHidden();
    }

    private async toContainText(selector: string, text: string): Promise<void> {
        await expect(this.page.locator(selector).first()).toContainText(text);
    }

    private async toHaveText(selector: string, text: string): Promise<void> {
        await expect(this.page.locator(selector).first()).toHaveText(text);
    }

    private async notToHaveCount(selector: string, count: number): Promise<void> {
        await expect(this.page.locator(selector)).not.toHaveCount(count);
    }

    private async isVisible(selector: string, timeoutMs = 2000): Promise<boolean> {
        try {
            await this.page.locator(selector).first().waitFor({ state: 'visible', timeout: timeoutMs });
            return true;
        } catch {
            return false;
        }
    }

    private async multipleElementVisible(sels: Record<string, unknown>): Promise<void> {
        for (const key in sels) {
            const v = sels[key];
            if (typeof v === 'string') await this.toBeVisible(v);
        }
    }

    private async click(selector: string): Promise<void> {
        await this.page.locator(selector).first().click();
    }

    private async clearAndType(selector: string, text: string): Promise<void> {
        await this.page.locator(selector).first().fill(text);
    }

    private async press(key: string): Promise<void> {
        await this.page.keyboard.press(key);
    }

    private async focusOnLocator(selector: string): Promise<void> {
        await this.page.locator(selector).first().focus();
    }

    private async getElementText(selector: string): Promise<string> {
        return (await this.page.locator(selector).first().textContent()) ?? '';
    }

    private async setAttributeValue(selector: string, attribute: string, value: string): Promise<void> {
        await this.page.locator(selector).first().evaluate((el, { attribute, value }) => el.setAttribute(attribute, value), { attribute, value });
    }

    // frame-scoped fill for the stripe card iframe fields
    private async typeFrameSelector(frameSelector: string, fieldSelector: string, text: string): Promise<void> {
        await this.page.frameLocator(frameSelector).locator(fieldSelector).first().fill(text);
    }

    private async clickAndWaitForLoadState(selector: string, state: 'load' | 'domcontentloaded' | 'networkidle' = 'load'): Promise<void> {
        await Promise.all([this.page.waitForLoadState(state), this.page.locator(selector).first().click()]);
    }

    private async clickAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<void> {
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).first().click(),
        ]);
    }

    private async typeAndWaitForResponse(subUrl: string, selector: string, text: string, code = 200): Promise<void> {
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).first().fill(text),
        ]);
    }

    private async clickAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200): Promise<void> {
        await Promise.all([
            this.page.waitForLoadState('load'),
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).first().click(),
        ]);
    }

    // ------------------------------------------------------------------
    // Inlined customer sub-flows (were CustomerPage methods pre-refactor).
    // ------------------------------------------------------------------

    // update the customer shipping-address form fields (select2 country/state)
    private async updateShippingFields(shippingInfo: customer['customerInfo']['shipping']): Promise<void> {
        await this.clearAndType(selectors.shipping.firstName, shippingInfo.firstName);
        await this.clearAndType(selectors.shipping.lastName, shippingInfo.lastName);
        await this.click(selectors.shipping.country);
        await this.clearAndType(selectors.shipping.countryInput, shippingInfo.country);
        await this.click(selectors.shipping.countryValue(shippingInfo.country));
        await this.toHaveText(selectors.shipping.selectedCountry, shippingInfo.country);
        await this.clearAndType(selectors.shipping.streetAddress, shippingInfo.street1);
        await this.clearAndType(selectors.shipping.streetAddress2, shippingInfo.street2);
        await this.clearAndType(selectors.shipping.city, shippingInfo.city);
        await this.click(selectors.shipping.state);
        await this.clearAndType(selectors.shipping.stateInput, shippingInfo.state);
        await this.click(selectors.shipping.stateValue(shippingInfo.state));
        await this.toHaveText(selectors.shipping.selectedState, shippingInfo.state);
        await this.clearAndType(selectors.shipping.zipCode, shippingInfo.zipCode);
    }

    // empty the block-cart (recursively remove the first item until empty)
    private async clearCart(): Promise<void> {
        await this.goIfNotThere(subUrls.cart);
        const emptyCart = await this.isVisible(selectors.cart.cartEmptyMessage);
        if (!emptyCart) {
            await this.clickAndWaitForResponseAndLoadState(subUrls.wcStore, selectors.cart.removeFirstItem, 207);
            await this.clearCart();
        }
    }

    // add a product to cart from its single-product page
    private async addProductToCartFromSingleProductPage(productName: string): Promise<void> {
        await this.goIfNotThere(subUrls.productDetails(productName));
        await this.clickAndWaitForResponse(subUrls.addToCartResponse, selectors.singleProduct.addToCart);
        await this.toBeVisible(selectors.singleProduct.productAddedSuccessMessage(productName));
    }

    // add a product to cart (clears cart first, single-product source)
    private async addProductToCart(productName: string, from = 'single-product', clearCart = true): Promise<void> {
        if (clearCart) await this.clearCart();
        switch (from) {
            case 'single-product':
                await this.addProductToCartFromSingleProductPage(productName);
                break;
            default:
                break;
        }
    }

    // pay with stripe connect (new-card iframe path, or the saved 4242 token)
    private async payWithStripe(cardInfo: { cardNumber: string; expiryDate: string; cvc: string }): Promise<void> {
        await this.click(selectors.checkout.stripeConnect);
        const savedTestCardIsVisible = await this.isVisible(selectors.stripe.savedTestCard4242);
        if (!savedTestCardIsVisible) {
            await this.typeFrameSelector(selectors.stripe.stripeConnectIframe, selectors.stripe.cardNumber, cardInfo.cardNumber);
            await this.typeFrameSelector(selectors.stripe.stripeConnectIframe, selectors.stripe.expDate, cardInfo.expiryDate);
            await this.typeFrameSelector(selectors.stripe.stripeConnectIframe, selectors.stripe.cvc, cardInfo.cvc);
            await this.click(selectors.stripe.savePaymentInformation);
        } else {
            await this.click(selectors.stripe.savedTestCard4242);
        }
    }

    // select a checkout payment method (bank/check/cod/stripe)
    private async selectPaymentMethod(paymentMethod: string): Promise<void> {
        switch (paymentMethod) {
            case 'bank':
                await this.click(selectors.checkout.directBankTransfer);
                break;
            case 'check':
                await this.click(selectors.checkout.checkPayments);
                break;
            case 'cod':
                await this.click(selectors.checkout.cashOnDelivery);
                break;
            case 'stripe':
                await this.payWithStripe(data.paymentDetails.strip);
                break;
            default:
                break;
        }
    }

    // pay for an already-on-checkout order (used by the subscription renewal flow)
    private async paymentOrder(paymentMethod = 'bank'): Promise<string> {
        await this.selectPaymentMethod(paymentMethod);
        await this.focusOnLocator(selectors.checkout.placeOrder);
        await this.clickAndWaitForResponseAndLoadState(subUrls.orderReceived, selectors.checkout.placeOrder);
        await this.toBeVisible(selectors.orderReceived.orderReceivedSuccessMessage);
        return await this.getElementText(selectors.orderReceived.orderNumber);
    }

    // go to checkout and place the order with the given payment method
    private async placeOrder(paymentMethod = 'bank'): Promise<string> {
        await this.goIfNotThere(subUrls.checkout);
        await this.selectPaymentMethod(paymentMethod);
        await this.focusOnLocator(selectors.checkout.placeOrder);
        await this.clickAndWaitForResponseAndLoadState(subUrls.orderReceived, selectors.checkout.placeOrder);
        await this.toBeVisible(selectors.orderReceived.orderReceivedSuccessMessage);

        const ifMultiVendorOrder = await this.isVisible(selectors.orderReceived.subOrders);
        if (ifMultiVendorOrder) {
            await this.toBeVisible(selectors.orderReceived.subOrders);
        }
        return await this.getElementText(selectors.orderReceived.orderNumber);
    }

    // ==================================================================
    // ADMIN — product subscription module enable / disable oracles
    // ==================================================================

    // enable product subscription module (vendor menu + my-account menu appear)
    async enableProductSubscriptionModule(): Promise<void> {
        // vendor dashboard menu
        await this.goto(subUrls.dashboard);
        await this.toBeVisible(selectors.vendor.dashboardMenu);

        // my account menu
        await this.goto(subUrls.myAccount);
        await this.toBeVisible(selectors.myAccount.subscriptionsMenu);
    }

    // disable product subscription module (vendor menu + screen gone)
    async disableProductSubscriptionModule(): Promise<void> {
        // vendor dashboard menu
        await this.goto(subUrls.dashboard);
        await this.notToBeVisible(selectors.vendor.dashboardMenu);

        // vendor dashboard menu page
        await this.goto(subUrls.userSubscriptions);
        await this.notToBeVisible(selectors.vendor.dashboardDiv);

        // my account menu
        await this.goto(subUrls.myAccount);
        await this.toBeVisible(selectors.myAccount.subscriptionsMenu);
    }

    // ==================================================================
    // VENDOR — user subscriptions screen
    // ==================================================================

    // vendor user-subscriptions list renders (filters + rows/empty-state)
    async vendorUserSubscriptionsRenderProperly(): Promise<void> {
        await this.goIfNotThere(subUrls.userSubscriptions);

        // filter controls (excluding the select2 popup input + result option)
        const { filterByCustomerInput: _fci, result: _r, ...filters } = selectors.vendor.filters;
        await this.multipleElementVisible(filters);

        const noSubscriptionsFound = await this.isVisible(selectors.vendor.noSubscriptionsFound);
        if (noSubscriptionsFound) {
            return;
        }
    }

    // vendor view product subscription (navigate to a subscription value)
    async viewProductSubscription(value: string): Promise<void> {
        await this.goto(value);
        // todo: go to subscription details via link, get subscription id via api
    }

    // filter user subscriptions by customer or by date
    async filterProductSubscriptions(filterBy: string, inputValue: string): Promise<void> {
        await this.goIfNotThere(subUrls.userSubscriptions);

        switch (filterBy) {
            case 'by-customer':
                await this.click(selectors.vendor.filters.filterByCustomer);
                await this.typeAndWaitForResponse(subUrls.ajax, selectors.vendor.filters.filterByCustomerInput, inputValue);
                await this.toContainText(selectors.vendor.filters.result, inputValue);
                await this.press(data.key.enter);
                break;

            case 'by-date':
                await this.setAttributeValue(selectors.vendor.filters.filterByDate, 'value', inputValue);
                break;

            default:
                break;
        }

        await this.clickAndWaitForResponseAndLoadState(subUrls.userSubscriptions, selectors.vendor.filters.filter);
        await this.notToHaveCount(selectors.vendor.numberOfRowsFound, 0);
    }

    // ==================================================================
    // CUSTOMER — subscription details + lifecycle actions
    // ==================================================================

    // customer view product subscription details (heading + action buttons)
    async customerViewProductSubscription(subscriptionId: string): Promise<void> {
        await this.goIfNotThere(subUrls.productSubscriptionDetails(subscriptionId));

        // subscription heading is visible
        await this.toBeVisible(selectors.subscriptionDetails.subscriptionHeading);

        // subscription action elements are visible (an active sub has no reActivate)
        const { reActivate: _reActivate, ...actions } = selectors.subscriptionDetails.actions;
        await this.multipleElementVisible(actions);
        // todo: add more fields
    }

    // customer cancel product subscription
    async cancelProductSubscription(subscriptionId: string): Promise<void> {
        await this.goIfNotThere(subUrls.productSubscriptionDetails(subscriptionId));

        await this.clickAndWaitForResponseAndLoadState(subUrls.productSubscriptionDetails(subscriptionId), selectors.subscriptionDetails.actions.cancel, 302);
        await this.toBeVisible(selectors.wooCommerceSuccessMessage);
        await this.toContainText(selectors.wooCommerceSuccessMessage, 'Your subscription has been cancelled.');
    }

    // customer reactivate product subscription (cancel first if still active)
    async reactivateProductSubscription(subscriptionId: string): Promise<void> {
        await this.goIfNotThere(subUrls.productSubscriptionDetails(subscriptionId));
        const subscriptionIsActive = await this.isVisible(selectors.subscriptionDetails.actions.cancel);
        if (subscriptionIsActive) {
            await this.cancelProductSubscription(subscriptionId);
        }

        await this.clickAndWaitForResponseAndLoadState(subUrls.productSubscriptionDetails(subscriptionId), selectors.subscriptionDetails.actions.reActivate, 302);
        await this.toBeVisible(selectors.wooCommerceSuccessMessage);
        await this.toContainText(selectors.wooCommerceSuccessMessage, 'Your subscription has been reactivated.');
    }

    // customer change the shipping address of a subscription
    async changeAddressOfProductSubscription(subscriptionId: string, shippingInfo: customer['customerInfo']['shipping']): Promise<void> {
        await this.goIfNotThere(subUrls.productSubscriptionDetails(subscriptionId));

        await this.clickAndWaitForLoadState(selectors.subscriptionDetails.actions.changeAddress);
        await this.updateShippingFields(shippingInfo);
        await this.clickAndWaitForResponseAndLoadState(subUrls.shippingAddress, selectors.shipping.saveAddress, 302);
        await this.toBeVisible(selectors.wooCommerceSuccessMessage);
        await this.toContainText(selectors.wooCommerceSuccessMessage, data.customer.address.addressChangeSuccessMessage);
    }

    // customer change the payment method of a subscription
    async changePaymentOfProductSubscription(subscriptionId: string): Promise<void> {
        await this.goIfNotThere(subUrls.productSubscriptionDetails(subscriptionId));
        await this.clickAndWaitForLoadState(selectors.subscriptionDetails.actions.changePayment);
        // todo: change to new card
        await this.clickAndWaitForResponseAndLoadState(subUrls.productSubscriptionDetails(subscriptionId), selectors.subscriptionDetails.changePaymentMethod);
        await this.toBeVisible(selectors.wooCommerceSuccessMessage);
        await this.toContainText(selectors.wooCommerceSuccessMessage, 'Payment method updated.');
    }

    // customer renew a subscription early (pays via stripe)
    async renewProductSubscription(subscriptionId: string): Promise<void> {
        await this.goIfNotThere(subUrls.productSubscriptionDetails(subscriptionId));
        await this.clickAndWaitForLoadState(selectors.subscriptionDetails.actions.renewNow);
        await this.paymentOrder('stripe');
    }

    // customer buy a product subscription (add to cart + place order via stripe)
    async buyProductSubscription(productName: string): Promise<void> {
        await this.addProductToCart(productName, 'single-product');
        await this.placeOrder('stripe');
    }
}
