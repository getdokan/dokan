import { Page, expect, request as pwRequest, APIRequestContext } from '@playwright/test';
import { toPath, closeAnnouncementModal, parseBoolean, helpers } from '@utils/helpers';
import { ApiUtils as RealApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import type { vendor, deliveryTime } from '@utils/interfaces';

// ============================================================================
// Vendor Delivery Time — de-stubbed by porting the pre-refactor page object
// (git e2ec507de:tests/pw/pages/vendorDeliveryTimePage.ts) into the current
// self-contained architecture. Selector strings are inlined verbatim from the
// pre-refactor selectors.ts groups (admin.dokan.settings.menus, vendor.vDashboard,
// vendor.vDeliveryTime, vendor.vDeliveryTimeSettings, customer.cDeliveryTime and
// the customer shop/single-product/cart/checkout groups used by the inherited
// CustomerPage flow). Base-class helpers (toBeVisible, clearAndType, check,
// clickAndWaitForResponse, etc.) are converted to raw Playwright.
//
// `data` + `payloads` + `ApiUtils` are re-exported REAL from @utils so the spec's
// beforeAll/afterAll module toggling runs against the real REST API.
// ============================================================================

// Re-export the REAL test data + payloads consumed by the spec.
export { data };
export { payloads } from '@utils/payloads';

// ---------------------------------------------------------------------------
// Co-located selectors (inlined from the pre-refactor selectors.ts).
// ---------------------------------------------------------------------------
const selectors = {
    admin: {
        // Dokan admin settings → Modules nav-title for the Delivery Time module.
        settings: {
            deliveryTime: '//div[@class="nav-title" and contains(text(),"Delivery Time")]',
        },
    },
    vendor: {
        dashboardDiv: 'div.dokan-dashboard-wrap',
        menus: {
            // Dokan 5.0 React vendor dashboard renders the nav from the same
            // `dokan_get_dashboard_nav` data; the delivery-time nav links are only
            // present in the DOM while the module is active (verified live: module
            // off => 0 anchors, module on => visible anchor). Match by href so the
            // check is agnostic to the legacy-vs-React menu markup.
            primary: {
                deliveryTime: 'a[href*="delivery-time-dashboard"]',
            },
            subMenus: {
                deliveryTime: 'a[href*="settings/delivery-time"]',
            },
        },
        deliveryTime: {
            deliveryTimeAndStorePickup: '//h1[normalize-space()="Delivery Time & Store Pickup"]',
            filter: {
                deliveryTimeFilter: '#delivery-type-filter', // delivery, store-pickup
                filter: '//button[normalize-space()="Filter"]',
            },
            navigation: {
                month: '.fc-dayGridMonth-button',
                week: '.fc-timeGridWeek-button',
                day: '.fc-timeGridDay-button',
                list: '.fc-listWeek-button',
                today: '.fc-today-button',
                previous: '.fc-prev-button',
                next: '.fc-next-button',
            },
            deliveryTimeCalendar: 'div#delivery-time-calendar',
        },
        deliveryTimeSettings: {
            deliveryTimeSettingsDiv: 'div.dokan-delivery-time-wrapper',
            settingsText: '.dokan-settings-content h1',
            visitStore: '//a[normalize-space()="Visit Store"]',
            // Delivery Support
            homeDelivery: '//input[@type="checkbox" and @name="delivery"]',
            storePickup: '#enable-store-location-pickup',
            deliveryBlockedBuffer: '#pre_order_date',
            timeSlot: '#delivery_time_slot',
            orderPerSlot: '#order_per_slot',
            // Delivery Day
            deliveryDaySwitches: '.dokan-status p.switch.tips',
            deliveryDaySwitch: (day: string) => `//label[@for='${day}-working-status']//p[@class='switch tips']`,
            // Individual Day Settings
            openingTime: (day: string) => `input#delivery-opening-time-${day}`,
            openingTimeHiddenInput: (day: string) => `//input[@name='delivery_opening_time[${day}][]']`,
            closingTime: (day: string) => `input#delivery-closing-time-${day}`,
            closingTimeHiddenInput: (day: string) => `//input[@name='delivery_closing_time[${day}][]']`,
            updateSettings: '.dokan-btn.dokan-btn-danger.dokan-btn-theme',
            settingsSuccessMessage: '.dokan-message strong',
        },
    },
    customer: {
        deliveryTime: {
            delivery: '//div[@class="dokan-store-location-selector"]//div[@data-selector="delivery"]',
            storePickup: '//div[@class="dokan-store-location-selector"]//div[@data-selector="store-pickup"]',
            deliveryTimeInput: 'input.delivery-time-date-picker.input',
            deliveryDate: (date: string) =>
                `//div[contains(@class,"flatpickr-calendar animate open")]//div[@class="dayContainer"]//span[contains(@class,"flatpickr-day") and @aria-label="${date}"]`,
            // WooCommerce block checkout renders the delivery time-slot picker as a
            // Gutenberg SelectControl (.delivery-time-vendor-select) instead of the
            // legacy shortcode `<select class="delivery-time-slot-picker">`.
            timePicker: '.delivery-time-vendor-select select',
            locationPicker: '//option[normalize-space()="Select store location"]/..',
            storeLocation: 'div.store-address.vendor-info',
            orderDetails: {
                deliveryTimeDetails: 'div#dokan-delivery-time-slot-order-details',
                storePickupDetails: 'div#dokan-store-location-order-details',
                deliveryTimeTitle: 'div#dokan-delivery-time-slot-order-details .main strong',
                storePickupTitle: 'div#dokan-store-location-order-details .main strong',
            },
        },
        shop: {
            searchProductLite: '(//input[@class="search-field"])[1]',
            filters: {
                searchProduct: 'input.dokan-form-control[placeholder="Search Products"]',
                search: '.dokan-btn',
            },
            productCard: {
                productTitle: '#main .products .woocommerce-loop-product__title',
                addToCart: '#main .products a.add_to_cart_button',
                viewCart: 'a.added_to_cart',
            },
        },
        singleProduct: {
            productTitle: '.product_title.entry-title',
            quantity: 'div.quantity input.qty',
            addToCart: 'button.single_add_to_cart_button',
            addOnSelect: '.wc-pao-addon-select',
            productAddedSuccessMessage: (productName: string) =>
                `//div[@class="woocommerce-message" and contains(.,"“${productName}” has been added to your cart.")]`,
            productWithQuantityAddedSuccessMessage: (productName: string, quantity: string) =>
                `//div[@class="woocommerce-message" and contains(.,"${quantity} × “${productName}” have been added to your cart.")]`,
        },
        cart: {
            removeFirstItem: '(//button[@class="wc-block-cart-item__remove-link"])[1]',
            cartEmptyMessage: '.wp-block-woocommerce-empty-cart-block .wc-block-cart__empty-cart__title',
        },
        checkout: {
            directBankTransfer: '.payment_method_bacs label, label[for="radio-control-wc-payment-method-options-bacs"]',
            checkPayments: '.payment_method_cheque label, label[for="radio-control-wc-payment-method-options-cheque"]',
            cashOnDelivery: '.payment_method_cod label, label[for="radio-control-wc-payment-method-options-cod"]',
            placeOrder: '#place_order, button.wc-block-components-checkout-place-order-button',
        },
        orderReceived: {
            orderReceivedSuccessMessage: '.woocommerce-notice.woocommerce-notice--success.woocommerce-thankyou-order-received',
            orderNumber: '.woocommerce-order-overview__order.order strong',
        },
    },
} as const;

// Local aliases mirroring the pre-refactor reference variable names.
const deliveryTimeVendor = selectors.vendor.deliveryTime;
const deliveryTimeSettingsVendor = selectors.vendor.deliveryTimeSettings;
const deliveryTimeCustomer = selectors.customer.deliveryTime;

// ---------------------------------------------------------------------------
// Null-tolerant ApiUtils wrapper (mirrors vendor-return-request / store-supports).
//
// The spec constructs `new ApiUtils(null)`. The real ApiUtils requires an
// APIRequestContext, so when null is passed we lazily create our own context
// and swap it in before the first real call.
// ---------------------------------------------------------------------------
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

    override async activateModules(...args: Parameters<RealApiUtils['activateModules']>): ReturnType<RealApiUtils['activateModules']> {
        await this.ready();
        return super.activateModules(...args);
    }

    override async deactivateModules(...args: Parameters<RealApiUtils['deactivateModules']>): ReturnType<RealApiUtils['deactivateModules']> {
        await this.ready();
        return super.deactivateModules(...args);
    }

    override async updatePaymentGateway(...args: Parameters<RealApiUtils['updatePaymentGateway']>): ReturnType<RealApiUtils['updatePaymentGateway']> {
        await this.ready();
        return super.updatePaymentGateway(...args);
    }

    override async checkProductExistence(...args: Parameters<RealApiUtils['checkProductExistence']>): ReturnType<RealApiUtils['checkProductExistence']> {
        await this.ready();
        return super.checkProductExistence(...args);
    }

    override async createProduct(...args: Parameters<RealApiUtils['createProduct']>): ReturnType<RealApiUtils['createProduct']> {
        await this.ready();
        return super.createProduct(...args);
    }

    override async dispose(): Promise<void> {
        await this.ready();
        await super.dispose();
    }
}

// ---------------------------------------------------------------------------
// Page object.
// ---------------------------------------------------------------------------
export class VendorDeliveryTimePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Raw-Playwright equivalents of the pre-refactor base helpers ----

    // goto(subUrl) / goIfNotThere(subUrl) → plain navigation to the full path.
    private async goto(subUrl: string): Promise<void> {
        await this.page.goto(toPath(subUrl), { waitUntil: 'domcontentloaded' });
    }

    // isVisible(selector, timeout) → poll (mirrors base 2s default).
    private async isVisible(selector: string, timeoutMs = 2000): Promise<boolean> {
        try {
            await this.page.locator(selector).first().waitFor({ state: 'visible', timeout: timeoutMs });
            return true;
        } catch {
            return false;
        }
    }

    // multipleElementVisible(group) → assert every string selector in the object.
    private async multipleElementVisible(group: Record<string, unknown>): Promise<void> {
        for (const key in group) {
            const value = group[key];
            if (typeof value === 'function') continue;
            if (value && typeof value === 'object') {
                await this.multipleElementVisible(value as Record<string, unknown>);
            } else {
                await expect(this.page.locator(value as string)).toBeVisible();
            }
        }
    }

    // setAttributeValue(selector, attribute, value) → set DOM attribute in-page.
    private async setAttributeValue(selector: string, attribute: string, value: string): Promise<void> {
        await this.page
            .locator(selector)
            .evaluate((element, [attr, val]) => element.setAttribute(attr as string, val as string), [attribute, value]);
    }

    // enableSwitcherDeliveryTime(selector) → toggle the minitoggle unless already active.
    private async enableSwitcherDeliveryTime(switchSelector: string): Promise<void> {
        const toggleSelector = switchSelector + '//div[contains(@class,"minitoggle")]';
        const className = (await this.page.getAttribute(toggleSelector, 'class')) || '';
        if (!className.includes('active')) {
            await this.page.locator(toggleSelector).click();
        }
    }

    // clickAndWaitForResponse(subUrl, selector, code)
    private async clickAndWaitForResponse(subUrl: string, selector: string, code = 200) {
        const [response] = await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).click(),
        ]);
        return response;
    }

    // clickAndWaitForResponseAndLoadState(subUrl, selector, code)
    private async clickAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200) {
        const [, response] = await Promise.all([
            this.page.waitForLoadState('load'),
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).click(),
        ]);
        expect(response.status()).toBe(code);
        return response;
    }

    // ---- Delivery time (admin module toggles) ----

    // enable delivery time module
    async enableDeliveryTimeModule(): Promise<void> {
        // dokan settings
        await this.goto(data.subUrls.backend.dokan.settings);
        await expect(this.page.locator(selectors.admin.settings.deliveryTime)).toBeVisible();

        // vendor dashboard menu — the Dokan 5.0 React vendor dashboard renders the
        // navigation from the same `dokan_get_dashboard_nav` data as the legacy menu.
        // When the module is active the delivery-time nav links are rendered & visible.
        await this.goto(data.subUrls.frontend.vDashboard.dashboard);
        await expect(this.page.locator(selectors.vendor.menus.primary.deliveryTime + ':visible').first()).toBeVisible();

        // vendor dashboard settings submenu (delivery time settings link)
        await expect(this.page.locator(selectors.vendor.menus.subMenus.deliveryTime + ':visible').first()).toBeVisible();
    }

    // disable delivery time module
    async disableDeliveryTimeModule(): Promise<void> {
        // dokan settings
        await this.goto(data.subUrls.backend.dokan.settings);
        await expect(this.page.locator(selectors.admin.settings.deliveryTime)).toBeHidden();

        // vendor dashboard menu — with the module deactivated the delivery-time nav
        // links are not registered at all (verified live: 0 anchors in the DOM).
        await this.goto(data.subUrls.frontend.vDashboard.dashboard);
        await expect(this.page.locator(selectors.vendor.menus.primary.deliveryTime)).toHaveCount(0);

        // vendor dashboard settings submenu (delivery time settings link) is gone too
        await expect(this.page.locator(selectors.vendor.menus.subMenus.deliveryTime)).toHaveCount(0);

        // vendor dashboard menu page — the delivery-time dashboard content is not rendered
        await this.goto(data.subUrls.frontend.vDashboard.deliveryTime);
        await expect(this.page.locator(selectors.vendor.dashboardDiv)).toBeHidden();

        // vendor dashboard settings menu page — the delivery settings form is not rendered
        await this.goto(data.subUrls.frontend.vDashboard.settingsDeliveryTime);
        await expect(this.page.locator(deliveryTimeSettingsVendor.deliveryTimeSettingsDiv)).toBeHidden();
    }

    // ---- Vendor render checks ----

    // vendor delivery time render properly
    async vendorDeliveryTimeRenderProperly(): Promise<void> {
        await this.goto(data.subUrls.frontend.vDashboard.deliveryTime);

        // delivery time and store pickup text is visible
        await expect(this.page.locator(deliveryTimeVendor.deliveryTimeAndStorePickup)).toBeVisible();

        // delivery time calendar is visible
        await expect(this.page.locator(deliveryTimeVendor.deliveryTimeCalendar)).toBeVisible();

        // delivery time filter elements are visible
        await this.multipleElementVisible(deliveryTimeVendor.filter);

        // delivery time navigation elements are visible
        await this.multipleElementVisible(deliveryTimeVendor.navigation);
    }

    // vendor delivery time settings render properly
    async vendorDeliveryTimeSettingsRenderProperly(): Promise<void> {
        await this.goto(data.subUrls.frontend.vDashboard.settingsDeliveryTime);

        // settings text is visible
        await expect(this.page.locator(deliveryTimeSettingsVendor.settingsText)).toBeVisible();

        // visit store link is visible (the React dashboard header also renders a
        // "Visit Store" link, so scope to the first match to avoid strict-mode).
        await expect(this.page.locator(deliveryTimeSettingsVendor.visitStore).first()).toBeVisible();

        // delivery support elements are visible
        await expect(this.page.locator(deliveryTimeSettingsVendor.homeDelivery)).toBeVisible();
        await expect(this.page.locator(deliveryTimeSettingsVendor.storePickup)).toBeVisible();
        await expect(this.page.locator(deliveryTimeSettingsVendor.deliveryBlockedBuffer)).toBeVisible();
        await expect(this.page.locator(deliveryTimeSettingsVendor.timeSlot)).toBeVisible();
        await expect(this.page.locator(deliveryTimeSettingsVendor.orderPerSlot)).toBeVisible();
        await expect(this.page.locator(deliveryTimeSettingsVendor.deliveryDaySwitches)).not.toHaveCount(0);

        // update settings is visible
        await expect(this.page.locator(deliveryTimeSettingsVendor.updateSettings)).toBeVisible();
    }

    // ---- Vendor set / filter / calendar ----

    // vendor set delivery settings
    async setDeliveryTimeSettings(deliveryTimeData: vendor['deliveryTime']): Promise<void> {
        await this.goto(data.subUrls.frontend.vDashboard.settingsDeliveryTime);

        // delivery support
        await this.page.locator(deliveryTimeSettingsVendor.homeDelivery).check();
        await this.page.locator(deliveryTimeSettingsVendor.storePickup).check();
        await this.page.locator(deliveryTimeSettingsVendor.deliveryBlockedBuffer).fill(deliveryTimeData.deliveryBlockedBuffer);
        await this.page.locator(deliveryTimeSettingsVendor.timeSlot).fill(deliveryTimeData.timeSlot);
        await this.page.locator(deliveryTimeSettingsVendor.orderPerSlot).fill(deliveryTimeData.orderPerSlot);

        for (const day of deliveryTimeData.days) {
            await this.enableSwitcherDeliveryTime(deliveryTimeSettingsVendor.deliveryDaySwitch(day));
            if (deliveryTimeData.choice === 'full-day') {
                await this.page.locator(deliveryTimeSettingsVendor.openingTime(day)).click();
                await this.page.getByRole('listitem').filter({ hasText: 'Full day' }).click();
            } else {
                await this.setAttributeValue(deliveryTimeSettingsVendor.openingTime(day), 'value', deliveryTimeData.openingTime);
                await this.setAttributeValue(deliveryTimeSettingsVendor.openingTimeHiddenInput(day), 'value', deliveryTimeData.openingTime);
                await this.setAttributeValue(deliveryTimeSettingsVendor.closingTime(day), 'value', deliveryTimeData.closingTime);
                await this.setAttributeValue(deliveryTimeSettingsVendor.closingTimeHiddenInput(day), 'value', deliveryTimeData.closingTime);
            }
        }

        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.settingsDeliveryTime, deliveryTimeSettingsVendor.updateSettings, 302);
        await expect(this.page.locator(deliveryTimeSettingsVendor.settingsSuccessMessage)).toContainText(deliveryTimeData.saveSuccessMessage);
    }

    // filter delivery time
    async filterDeliveryTime(value: string): Promise<void> {
        await this.goto(data.subUrls.frontend.vDashboard.deliveryTime);
        await this.page.selectOption(deliveryTimeVendor.filter.deliveryTimeFilter, { value });
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.deliveryTime, deliveryTimeVendor.filter.filter);
        // todo: add more assertion
        // todo: need order via delivery time; via api for assertion
    }

    // update calendar views
    async updateCalendarView(value: string): Promise<void> {
        await this.goto(data.subUrls.frontend.vDashboard.deliveryTime);

        const navSelector = deliveryTimeVendor.navigation[value as keyof typeof deliveryTimeVendor.navigation];
        await this.page.locator(navSelector).click();
        const currentView = await this.page.getAttribute(navSelector, 'aria-pressed');
        expect(currentView).toContain('true');
    }

    // ---- Customer buy flow (ported from the inherited CustomerPage) ----

    // search product (used by the shop add-to-cart path)
    private async searchProduct(productName: string): Promise<void> {
        await this.goto(data.subUrls.frontend.shop);
        if (!parseBoolean(process.env.DOKAN_PRO)) {
            // search on lite
            await this.page.locator(selectors.customer.shop.searchProductLite).fill(productName);
            await Promise.all([this.page.waitForLoadState('domcontentloaded'), this.page.keyboard.press(data.key.enter)]);
            await expect(this.page.locator(selectors.customer.singleProduct.productTitle)).toContainText(productName);
        } else {
            await this.page.locator(selectors.customer.shop.filters.searchProduct).fill(productName);
            await Promise.all([this.page.waitForLoadState('domcontentloaded'), this.page.locator(selectors.customer.shop.filters.search).click()]);
            await expect(this.page.locator(selectors.customer.shop.productCard.productTitle)).toContainText(productName);
        }
    }

    // clear cart
    private async clearCart(): Promise<void> {
        await this.goto(data.subUrls.frontend.cart);
        const emptyCart = await this.isVisible(selectors.customer.cart.cartEmptyMessage);
        if (!emptyCart) {
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.wc.store, selectors.customer.cart.removeFirstItem, 207);
            await this.clearCart();
        }
    }

    // add product to cart from shop page
    private async addProductToCartFromShop(productName: string): Promise<void> {
        await this.searchProduct(productName);
        await this.clickAndWaitForResponse(data.subUrls.frontend.addToCart, selectors.customer.shop.productCard.addToCart);
        await expect(this.page.locator(selectors.customer.shop.productCard.viewCart)).toBeVisible();
    }

    // add product to cart from single product page
    private async addProductToCartFromSingleProductPage(productName: string, quantity?: string): Promise<void> {
        // WooCommerce product permalink base is `/product/<slug>/` on this install
        // (the legacy `shop/uncategorized/<slug>` path 404s), so build it directly.
        await this.goto(`product/${helpers.slugify(productName)}`);
        const addonIsVisible = await this.isVisible(selectors.customer.singleProduct.addOnSelect);
        if (addonIsVisible) await this.page.selectOption(selectors.customer.singleProduct.addOnSelect, { index: 1 });
        if (quantity) await this.page.locator(selectors.customer.singleProduct.quantity).fill(String(quantity));
        await this.clickAndWaitForResponse(data.subUrls.frontend.productCustomerPage, selectors.customer.singleProduct.addToCart);
        if (!quantity) {
            await expect(this.page.locator(selectors.customer.singleProduct.productAddedSuccessMessage(productName))).toBeVisible();
        } else {
            await expect(this.page.locator(selectors.customer.singleProduct.productWithQuantityAddedSuccessMessage(productName, quantity))).toBeVisible();
        }
    }

    // add product to cart
    async addProductToCart(productName: string, from: string, clearCart = true, quantity?: string): Promise<void> {
        // clear cart
        if (clearCart) await this.clearCart();
        switch (from) {
            case 'shop':
                await this.addProductToCartFromShop(productName);
                break;
            case 'single-product':
                await this.addProductToCartFromSingleProductPage(productName, quantity);
                break;
            default:
                break;
        }
    }

    // navigate to checkout
    async goToCheckout(): Promise<void> {
        await this.goto(data.subUrls.frontend.checkout);
    }

    // pay & place order
    async paymentOrder(paymentMethod = 'bank'): Promise<string> {
        switch (paymentMethod) {
            case 'bank':
                await this.page.locator(selectors.customer.checkout.directBankTransfer).click();
                break;
            case 'check':
                await this.page.locator(selectors.customer.checkout.checkPayments).click();
                break;
            case 'cod':
                await this.page.locator(selectors.customer.checkout.cashOnDelivery).click();
                break;
            default:
                break;
        }

        await this.page.locator(selectors.customer.checkout.placeOrder).focus();
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.orderReceived, selectors.customer.checkout.placeOrder);
        await expect(this.page.locator(selectors.customer.orderReceived.orderReceivedSuccessMessage)).toBeVisible();
        return (await this.page.locator(selectors.customer.orderReceived.orderNumber).textContent()) as string;
    }

    // place order with delivery time and store pickup
    async placeOrderWithDeliverTimeStorePickup(deliveryType: 'delivery-time' | 'store-pickup', deliveryTimeData: deliveryTime, paymentMethod = 'bank'): Promise<void> {
        await this.goToCheckout();

        // Pick a near-future delivery date (tomorrow) rather than the passed-in
        // "today" so open time slots always exist regardless of the current time of
        // day — the vendor's remaining slots for today are progressively filtered
        // out as the clock advances (none remain late at night).
        const target = new Date();
        target.setDate(target.getDate() + 1);
        const deliveryDate = deliveryTimeData.date && new Date(deliveryTimeData.date).toDateString() !== new Date().toDateString()
            ? deliveryTimeData.date
            : target.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

        switch (deliveryType) {
            case 'delivery-time':
                await this.page.locator(deliveryTimeCustomer.delivery).click();
                await this.page.locator(deliveryTimeCustomer.deliveryTimeInput).click();
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.deliveryTime, deliveryTimeCustomer.deliveryDate(deliveryDate));
                await expect(this.page.locator(deliveryTimeCustomer.timePicker)).toBeVisible();
                await this.page.selectOption(deliveryTimeCustomer.timePicker, { index: 0 });
                break;

            case 'store-pickup':
                await this.page.locator(deliveryTimeCustomer.storePickup).click();
                await this.page.locator(deliveryTimeCustomer.deliveryTimeInput).click();
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.deliveryTime, deliveryTimeCustomer.deliveryDate(deliveryDate));
                await expect(this.page.locator(deliveryTimeCustomer.timePicker)).toBeVisible();
                await this.page.selectOption(deliveryTimeCustomer.timePicker, { index: 0 });
                await this.page.selectOption(deliveryTimeCustomer.locationPicker, { index: 0 });
                await expect(this.page.locator(deliveryTimeCustomer.storeLocation)).toBeVisible();
                break;

            default:
                break;
        }

        await this.paymentOrder(paymentMethod);

        if (deliveryType === 'delivery-time') {
            await expect(this.page.locator(deliveryTimeCustomer.orderDetails.deliveryTimeDetails)).toBeVisible();
            await expect(this.page.locator(deliveryTimeCustomer.orderDetails.deliveryTimeTitle)).toContainText('Delivery Date');
        } else {
            await expect(this.page.locator(deliveryTimeCustomer.orderDetails.storePickupDetails)).toBeVisible();
            await expect(this.page.locator(deliveryTimeCustomer.orderDetails.storePickupTitle)).toContainText('Store location pickup');
        }
    }
}
