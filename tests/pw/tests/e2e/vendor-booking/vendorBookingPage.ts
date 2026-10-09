import { Page, expect } from '@playwright/test';
import { helpers, toPath, closeAnnouncementModal } from '@utils/helpers';
import { data } from '@utils/testData';

// The suite's strict tsconfig doesn't include @types/node — declare process locally.
declare const process: { env: Record<string, string | undefined> };
// The booking add-to-cart / place-order round-trips post back to WordPress; on loaded CI runners those
// responses can take well over the Playwright waitForResponse default (30s). Give them CI headroom so a
// slow-but-successful round-trip isn't misread as a failure (matches the suite's slow-render policy).
const RESPONSE_TIMEOUT = helpers.parseBoolean(process.env.CI) ? 90_000 : 30_000;

// Re-export the real utils the spec imports from this module (contract preserved).
export { ApiUtils } from '@utils/apiUtils';
export { payloads } from '@utils/payloads';
export { dbUtils } from '@utils/dbUtils';
export { dbData } from '@utils/dbData';
export { data };

// ---------------------------------------------------------------------------
// Types (shapes come from `data.product.booking` / `data.bookings`)
// ---------------------------------------------------------------------------
export type BookingProductData = {
    name: string;
    productName: () => string;
    productType: string;
    category: string;
    storeName: string;
    calendarDisplayMode: string;
    duration: {
        bookingDurationType: string;
        bookingDurationUnit: string;
        bookingDurationMin: string;
        bookingDurationMax: string;
    };
    availability: {
        maxBookingsPerBlock: string;
        minimumBookingWindowIntoTheFutureDate: string;
        minimumBookingWindowIntoTheFutureDateUnit: string;
        maximumBookingWindowIntoTheFutureDate: string;
        maximumBookingWindowIntoTheFutureDateUnit: string;
    };
    costs: { baseCost: string; blockCost: string };
    saveSuccessMessage: string;
};

export type BookingResourceData = { name: string; quantity: string };

export type Bookings = { startDate: Date; endDate: Date };

// ---------------------------------------------------------------------------
// Co-located selectors (inlined from the pre-refactor selectors.ts groups)
// ---------------------------------------------------------------------------
export const bookingSelectors = {
    // vendor dashboard navigation
    vDashboard: {
        dashboardDiv: 'div.dokan-dashboard-wrap',
        bookingMenu: 'ul.dokan-dashboard-menu li.booking a',
        // The legacy sidebar (`li.booking a`) is rendered but kept display-hidden now that the
        // vendor dashboard nav is React; the actually-visible Booking menu entry is this nav link.
        bookingMenuVisible: 'a[href*="#booking"]:visible',
    },

    // customer my-account navigation
    cMyAccount: {
        bookingsMenu: '.woocommerce-MyAccount-navigation-link--bookings a',
    },

    // vendor product (generic success banner)
    vProduct: {
        updatedSuccessMessage: 'div.dokan-message',
    },

    // admin WooCommerce "Add New Product" page (booking product)
    adminProduct: {
        productName: '#title',
        productType: '#product-type',
        subMenus: {
            general: '.general_options a',
            bookingCosts: '.bookings_pricing_options a',
        },
        bookingDurationType: '#\\_wc_booking_duration_type',
        bookingDurationMax: '#\\_wc_booking_max_duration',
        calendarDisplayMode: '#\\_wc_booking_calendar_display_mode',
        baseCost: '#\\_wc_booking_cost',
        blockCost: '#\\_wc_booking_block_cost',
        category: (categoryName: string) => `//label[contains(text(), ' ${categoryName}')]/input`,
        storeName: '//div[contains(@id, "sellerdiv")]//span[@class="select2-selection__arrow"]',
        storeNameInput: '.select2-search.select2-search--dropdown .select2-search__field',
        publish: '#publishing-action #publish',
        updatedSuccessMessage: '.updated.notice.notice-success p',
    },

    // customer booking (product detail calendar + book now)
    cBookings: {
        calendarLoader: '//div[@class="blockUI blockOverlay"]',
        selectCalendarDay: (month: number, day: number) => `//td[not(contains(@class,"not-bookable")) and @data-month="${month}"]//a[@data-date="${day}"]`,
        // Month navigation. jQuery UI's datepicker renders ONE month at a time and emits
        // data-month/data-year on every day cell, so "is the target month on screen" is answerable
        // from the DOM and does not need to track clicks.
        nextMonth: 'a.ui-datepicker-next',
        calendarDayAnyState: (year: number, month: number, day: number) => `//td[@data-month="${month}" and @data-year="${year}"]//a[@data-date="${day}"]`,
        bookNow: 'button.wc-bookings-booking-form-button',
    },

    // customer checkout (place order flow for buyBookableProduct)
    checkout: {
        directBankTransfer: '.payment_method_bacs label, label[for="radio-control-wc-payment-method-options-bacs"]',
        placeOrder: '#place_order, button.wc-block-components-checkout-place-order-button',
        orderReceivedSuccessMessage: '.woocommerce-notice.woocommerce-notice--success.woocommerce-thankyou-order-received',
    },

    // vendor booking dashboard
    vBooking: {
        allBookingProductText: '.dokan-dashboard-content h1',
        addNewBookingProduct: '//a[contains(text(),"Add New Booking Product")]',
        addBookingBtn: '//a[normalize-space()="Add Booking"]',

        menus: {
            allBookingProduct: '//ul[@class="dokan_tabs"]//a[contains(text(),"All Booking Product")]',
            manageBookings: '//ul[@class="dokan_tabs"]//a[contains(text(),"Manage Bookings")]',
            calendar: '//ul[@class="dokan_tabs"]//a[contains(text(),"Calendar")]',
            manageResources: '//ul[@class="dokan_tabs"]//a[contains(text(),"Manage Resources")]',
        },

        filters: {
            filterByDate: '#filter-by-date',
            filterByCategory: '#product_cat',
            filterByOther: 'select[name="filter_by_other"]',
            filter: '//button[normalize-space()="Filter"]',
        },

        search: {
            searchInput: 'input[name="product_search_name"]',
            search: 'button[name="product_listing_search"]',
        },

        table: {
            table: 'table.dokan-table.product-listing-table',
            imageColumn: '//th[normalize-space()="Image"]',
            nameColumn: '//th[normalize-space()="Name"]',
            statusColumn: '//th[normalize-space()="Status"]',
            skuColumn: '//th[normalize-space()="SKU"]',
            stockColumn: '//th[normalize-space()="Stock"]',
            priceColumn: '//th[normalize-space()="Price"]',
            typeColumn: '//th[normalize-space()="Type"]',
            viewsColumn: '//th[normalize-space()="Views"]',
            dateColumn: '//th[normalize-space()="Date"]',
        },

        numberOfRowsFound: '.product-listing-table tbody tr',
        productCell: (name: string) => `//p//a[normalize-space()="${name}"]/../..`,
        edit: (name: string) => `//a[normalize-space()="${name}"]/../..//span[@class="edit"]`,
        permanentlyDelete: (name: string) => `//a[normalize-space()="${name}"]/../..//span[@class="delete"]`,
        duplicate: (name: string) => `//a[normalize-space()="${name}"]/../..//span[@class="duplicate"]`,
        view: (name: string) => `//a[normalize-space()="${name}"]/../..//span[@class="view"]`,

        confirmDelete: '.swal2-confirm',
        dokanSuccessMessage: '.dokan-alert.dokan-alert-success strong',

        // create / edit booking product
        booking: {
            productName: '#post_title',
            bookingDurationType: '#\\_wc_booking_duration_type',
            bookingDurationMin: 'input#\\_wc_booking_min_duration',
            bookingDurationMax: 'input#\\_wc_booking_max_duration',
            bookingDurationUnit: '#\\_wc_booking_duration_unit',
            calendarDisplayMode: '#\\_wc_booking_calendar_display_mode',
            enableCalendarRangePicker: '#\\_wc_booking_enable_range_picker',
            maxBookingsPerBlock: '#\\_wc_booking_qty',
            minimumBookingWindowIntoTheFutureDate: '#\\_wc_booking_min_date',
            minimumBookingWindowIntoTheFutureDateUnit: '#\\_wc_booking_min_date_unit',
            maximumBookingWindowIntoTheFutureDate: '#\\_wc_booking_max_date',
            maximumBookingWindowIntoTheFutureDateUnit: '#\\_wc_booking_max_date_unit',
            baseCost: '#\\_wc_booking_cost',
            blockCost: '#\\_wc_booking_block_cost',
            saveProduct: '.dokan-btn-lg',
        },

        viewBooking: {
            productImage: '.woocommerce-product-gallery__image--placeholder img.wp-post-image',
            productName: '.product_title.entry-title',
            bookingCalendar: 'div#wc-bookings-booking-form',
            bookNow: '.single_add_to_cart_button',
        },

        addBooking: {
            selectCustomerDropdown: '//span[@id="select2-customer_id-container"]/..//span[@class="select2-selection__arrow"]',
            selectCustomerInput: '.select2-search__field',
            searchedResult: '.select2-results__option.select2-results__option--highlighted',
            searchedResultByName: (customerName: string) => `//li[contains(text(), "${customerName}") and @class="select2-results__option select2-results__option--highlighted"]`,
            selectABookableProductDropdown: '//span[@id="select2-bookable_product_id-container"]/..//span[@class="select2-selection__arrow"]',
            selectABookableProduct: (productName: string) => `//li[contains(@class,"select2-results__option") and contains(text(), '${productName}')]`,
            createANewCorrespondingOrderForThisNewBooking: '//input[@name="booking_order" and @value="new"]',
            next: 'input[name="create_booking"]',
            addBooking: 'input[value="Add Booking"][type="submit"]',
            successMessage: '.woocommerce-message',
        },

        manageBookings: {
            manageBookingsText: '//h1[normalize-space()="Manage Bookings"]',
            menus: {
                all: '//ul[contains(@class,"order-statuses-filter")]//a[contains(text(),"All")]',
            },
            noBookingsFound: '//div[normalize-space()="No Bookings found"]',
        },

        calendar: {
            calendarText: '//h1[normalize-space()="Calendar"]',
            calendar: '.wc_bookings_calendar_form',
            filterBookings: '#calendar-bookings-filter',
            month: {
                month: '//select[@name="calendar_month"]',
                year: '//select[@name="calendar_year"]',
                dayView: '.day',
            },
            day: {
                calendarDay: '//input[@placeholder="yyyy-mm-dd"]',
                monthView: '.month',
            },
        },

        manageResources: {
            manageResourcesText: '.dokan-dashboard-content h1',
            addNewResource: '.dokan-btn.dokan-right',
            table: {
                table: 'table.dokan-table.product-listing-table',
                nameColumn: '//th[normalize-space()="Name"]',
                parentColumn: '//th[normalize-space()="Parent"]',
            },
            noResourceFound: '//td[normalize-space()="No Resource found"]',
            resource: {
                resourceName: '.swal2-input',
                confirmAddNewResource: '.swal2-confirm',
                resourceCell: (resourceName: string) => `//a[contains(text(),'${resourceName}')]/..`,
                editResource: (resourceName: string) => `//a[contains(text(),'${resourceName}')]/../..//a[contains(text(),'Edit')]`,
                deleteResource: (resourceName: string) => `//a[contains(text(),'${resourceName}')]/../..//button[contains(text(),'Remove')]`,
                resourceTitle: '#post_title',
                availableQuantity: '#\\_wc_booking_qty',
                saveResource: '.dokan-btn-lg',
            },
        },
    },
} as const;

// ---------------------------------------------------------------------------
// Page object
// ---------------------------------------------------------------------------
export class BookingPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- raw Playwright helpers (ported from the pre-refactor base classes) ----

    private async goto(subPath: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' = 'domcontentloaded'): Promise<void> {
        await this.page.goto(toPath(subPath), { waitUntil });
    }

    // Public single-product permalink for a product name. The shared data.subUrls helper points at
    // `shop/uncategorized/<slug>`, which 404s on this site's `/product/<slug>/` permalink structure.
    private productPath(productName: string): string {
        return `${data.subUrls.frontend.productCustomerPage}/${helpers.slugify(productName)}/`;
    }

    private async gotoUntilNetworkidle(subPath: string): Promise<void> {
        await this.page.goto(toPath(subPath), { waitUntil: 'networkidle' });
    }

    private async isVisible(selector: string, timeoutSec = 2): Promise<boolean> {
        const start = Date.now();
        while (Date.now() - start < timeoutSec * 1000) {
            if (await this.page.locator(selector).first().isVisible().catch(() => false)) return true;
            await this.page.waitForTimeout(50);
        }
        return false;
    }

    private async multipleElementVisible(selectors: Record<string, unknown>): Promise<void> {
        for (const key in selectors) {
            const value = selectors[key];
            if (typeof value === 'function') continue;
            if (value && typeof value === 'object') {
                await this.multipleElementVisible(value as Record<string, unknown>);
            } else if (typeof value === 'string') {
                await expect(this.page.locator(value)).toBeVisible();
            }
        }
    }

    private async clickAndWaitForLoadState(selector: string, state: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'): Promise<void> {
        await Promise.all([this.page.waitForLoadState(state), this.page.locator(selector).click()]);
    }

    private async clickAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<void> {
        const element = this.page.locator(selector);
        await element.scrollIntoViewIfNeeded();
        await element.waitFor({ state: 'visible' });
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code, { timeout: RESPONSE_TIMEOUT }),
            element.click(),
        ]);
    }

    /**
     * Page the datepicker forward until `target`'s day cell is rendered.
     *
     * The picker shows one month but DOES render the leading days of the next one, so
     * `endDate = start + 1` is normally on screen even on the last day of a month — which is why
     * this is a no-op almost every day. Not always: a month whose last day ends the final week row
     * renders NO trailing cells, and there `endDate` genuinely cannot be found. Measured against
     * this build: February 2027 renders 0 trailing cells; every other month in the following year
     * renders between 4 and 31.
     *
     * Navigation is driven by the DOM — "is the target cell present yet?" — not by counting clicks,
     * so it is correct whichever month the picker opens on and costs nothing when the cell is
     * already rendered.
     *
     * `force: true` is required: jQuery UI's `.ui-datepicker-header` overlays the nav anchor and
     * intercepts pointer events, so a normal click retries until it times out.
     *
     * Deliberately does NOT assert the day is bookable: that is the caller's assertion, and
     * absorbing it here would turn "the date is not offered" into a silent pass.
     */
    private async ensureCalendarMonth(target: Date): Promise<void> {
        const cell = bookingSelectors.cBookings.calendarDayAnyState(target.getFullYear(), target.getMonth(), target.getDate());
        for (let hop = 0; hop < 12; hop++) {
            if ((await this.page.locator(cell).count()) > 0) return;
            const next = this.page.locator(bookingSelectors.cBookings.nextMonth);
            if ((await next.count()) === 0) return; // no nav rendered — let the caller's click report it
            await next.first().click({ force: true });
            await expect(this.page.locator(bookingSelectors.cBookings.calendarLoader)).toBeHidden();
        }
    }

    private async clickAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200): Promise<void> {
        const [, response] = await Promise.all([
            this.page.waitForLoadState('load'),
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code, { timeout: RESPONSE_TIMEOUT }),
            this.page.locator(selector).click(),
        ]);
        expect(response.status()).toBe(code);
    }

    private async typeAndWaitForResponse(subUrl: string, selector: string, text: string, code = 200): Promise<void> {
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).fill(text),
        ]);
    }

    // select2 dropdown: open, type (ajax), assert highlighted, confirm with Enter
    private async select2ByText(selectSelector: string, optionSelector: string, text: string): Promise<void> {
        await this.page.locator(selectSelector).click();
        await this.typeAndWaitForResponse(data.subUrls.ajax, optionSelector, text);
        await expect(this.page.locator('.select2-results__option.select2-results__option--highlighted')).toContainText(text);
        await this.page.keyboard.press('Enter');
    }

    // ---- module enable / disable ----

    async enableBookingModule(): Promise<void> {
        // vendor dashboard menu (Booking nav entry is present once the module is enabled)
        await this.goto(data.subUrls.frontend.vDashboard.dashboard);
        await expect(this.page.locator(bookingSelectors.vDashboard.bookingMenuVisible).filter({ hasText: 'Booking' }).first()).toBeVisible();

        // customer dashboard menu
        await this.goto(data.subUrls.frontend.myAccount);
        await expect(this.page.locator(bookingSelectors.cMyAccount.bookingsMenu)).toBeVisible();
    }

    async disableBookingModule(): Promise<void> {
        // vendor dashboard menu
        await this.goto(data.subUrls.frontend.vDashboard.dashboard);
        await expect(this.page.locator(bookingSelectors.vDashboard.bookingMenu)).toBeHidden();

        // vendor dashboard menu page
        await this.goto(data.subUrls.frontend.vDashboard.booking);
        await expect(this.page.locator(bookingSelectors.vDashboard.dashboardDiv)).toBeHidden();

        // customer dashboard menu
        await this.goto(data.subUrls.frontend.myAccount);
        await expect(this.page.locator(bookingSelectors.cMyAccount.bookingsMenu)).toBeVisible();
    }

    // ---- admin ----

    async adminAddBookingProduct(product: BookingProductData): Promise<void> {
        await this.goto(data.subUrls.backend.wc.addNewProducts);

        // name
        await this.page.locator(bookingSelectors.adminProduct.productName).fill(product.productName());
        await this.page.selectOption(bookingSelectors.adminProduct.productType, { value: product.productType });
        await this.page.locator(bookingSelectors.adminProduct.subMenus.general).click();
        await this.page.selectOption(bookingSelectors.adminProduct.bookingDurationType, { value: product.duration.bookingDurationType });
        await this.page.locator(bookingSelectors.adminProduct.bookingDurationMax).fill(product.duration.bookingDurationMax);
        await this.page.selectOption(bookingSelectors.adminProduct.calendarDisplayMode, { value: product.calendarDisplayMode });

        // costs
        await this.page.locator(bookingSelectors.adminProduct.subMenus.bookingCosts).click();
        await this.page.locator(bookingSelectors.adminProduct.baseCost).fill(product.costs.baseCost);
        await this.page.locator(bookingSelectors.adminProduct.blockCost).fill(product.costs.blockCost);

        // category
        await this.page.locator(bookingSelectors.adminProduct.category(product.category)).click();

        // vendor store name
        await this.select2ByText(bookingSelectors.adminProduct.storeName, bookingSelectors.adminProduct.storeNameInput, product.storeName);
        await this.page.keyboard.press('Home'); // scroll to top

        // publish
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.post, bookingSelectors.adminProduct.publish, 302);
        await expect(this.page.locator(bookingSelectors.adminProduct.updatedSuccessMessage)).toContainText(data.product.publishSuccessMessage);
    }

    // ---- vendor: render checks ----

    async vendorBookingRenderProperly(): Promise<void> {
        await this.goto(data.subUrls.frontend.vDashboard.booking);

        await expect(this.page.locator(bookingSelectors.vBooking.allBookingProductText)).toBeVisible();
        await this.multipleElementVisible(bookingSelectors.vBooking.menus);
        await expect(this.page.locator(bookingSelectors.vBooking.addNewBookingProduct)).toBeVisible();
        await expect(this.page.locator(bookingSelectors.vBooking.addBookingBtn)).toBeVisible();
        await this.multipleElementVisible(bookingSelectors.vBooking.filters);
        await this.multipleElementVisible(bookingSelectors.vBooking.search);
        await this.multipleElementVisible(bookingSelectors.vBooking.table);
    }

    async vendorManageBookingRenderProperly(): Promise<void> {
        await this.goto(data.subUrls.frontend.vDashboard.manageBooking);

        await expect(this.page.locator(bookingSelectors.vBooking.manageBookings.manageBookingsText)).toBeVisible();
        await expect(this.page.locator(bookingSelectors.vBooking.manageBookings.menus.all)).toBeVisible();

        const noBookingsFound = await this.isVisible(bookingSelectors.vBooking.manageBookings.noBookingsFound);
        if (noBookingsFound) {
            return;
        }
    }

    async vendorBookingCalendarRenderProperly(): Promise<void> {
        await this.goto(data.subUrls.frontend.vDashboard.bookingCalendar);

        await expect(this.page.locator(bookingSelectors.vBooking.calendar.calendarText)).toBeVisible();
        await expect(this.page.locator(bookingSelectors.vBooking.calendar.calendar)).toBeVisible();
        await expect(this.page.locator(bookingSelectors.vBooking.calendar.filterBookings)).toBeVisible();
        await this.multipleElementVisible(bookingSelectors.vBooking.calendar.month);

        await this.clickAndWaitForLoadState(bookingSelectors.vBooking.calendar.month.dayView);
        await this.multipleElementVisible(bookingSelectors.vBooking.calendar.day);
    }

    async vendorManageResourcesRenderProperly(): Promise<void> {
        await this.goto(data.subUrls.frontend.vDashboard.manageResources);

        await expect(this.page.locator(bookingSelectors.vBooking.manageResources.manageResourcesText)).toBeVisible();
        await expect(this.page.locator(bookingSelectors.vBooking.manageResources.addNewResource)).toBeVisible();
        await this.multipleElementVisible(bookingSelectors.vBooking.manageResources.table);

        const noResourceFound = await this.isVisible(bookingSelectors.vBooking.manageResources.noResourceFound);
        if (noResourceFound) {
            return;
        }
    }

    // ---- vendor: product create / edit ----

    private async updateBookingProductFields(product: BookingProductData): Promise<void> {
        const booking = bookingSelectors.vBooking.booking;
        await this.page.locator(booking.productName).fill(product.name);
        // booking duration options
        await this.page.selectOption(booking.bookingDurationType, { value: product.duration.bookingDurationType });
        await this.page.locator(booking.bookingDurationMin).fill(product.duration.bookingDurationMin);
        await this.page.locator(booking.bookingDurationMax).fill(product.duration.bookingDurationMax);
        await this.page.selectOption(booking.bookingDurationUnit, { value: product.duration.bookingDurationUnit });
        // calendar display mode
        await this.page.selectOption(booking.calendarDisplayMode, { value: product.calendarDisplayMode });
        await this.page.locator(booking.enableCalendarRangePicker).check();
        // availability
        await this.page.locator(booking.maxBookingsPerBlock).fill(product.availability.maxBookingsPerBlock);
        await this.page.locator(booking.minimumBookingWindowIntoTheFutureDate).fill(product.availability.minimumBookingWindowIntoTheFutureDate);
        await this.page.selectOption(booking.minimumBookingWindowIntoTheFutureDateUnit, { value: product.availability.minimumBookingWindowIntoTheFutureDateUnit });
        await this.page.locator(booking.maximumBookingWindowIntoTheFutureDate).fill(product.availability.maximumBookingWindowIntoTheFutureDate);
        await this.page.selectOption(booking.maximumBookingWindowIntoTheFutureDateUnit, { value: product.availability.maximumBookingWindowIntoTheFutureDateUnit });
        // costs
        await this.page.locator(booking.baseCost).fill(product.costs.baseCost);
        await this.page.locator(booking.blockCost).fill(product.costs.blockCost);
    }

    private async goToBookingProductEdit(productName: string): Promise<void> {
        await this.searchBookingProduct(productName);
        await this.page.locator(bookingSelectors.vBooking.productCell(productName)).hover();
        await this.clickAndWaitForLoadState(bookingSelectors.vBooking.edit(productName));
        await expect(this.page.locator(bookingSelectors.vBooking.booking.productName)).toHaveValue(productName);
    }

    async addBookingProduct(product: BookingProductData): Promise<void> {
        // The classic "Add New Booking Product" button now links into the React dashboard SPA
        // (#booking/new-product, which 404s), so drive the still-live classic form by its direct URL.
        await this.goto(data.subUrls.frontend.vDashboard.addBookingProduct);
        await this.updateBookingProductFields(product);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.addBookingProduct, bookingSelectors.vBooking.booking.saveProduct, 302);
        await expect(this.page.locator(bookingSelectors.vProduct.updatedSuccessMessage)).toContainText(product.saveSuccessMessage);
    }

    async editBookingProduct(product: BookingProductData): Promise<void> {
        await this.goToBookingProductEdit(product.name);
        await this.updateBookingProductFields(product);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.booking, bookingSelectors.vBooking.booking.saveProduct, 302);
        await expect(this.page.locator(bookingSelectors.vProduct.updatedSuccessMessage)).toContainText(product.saveSuccessMessage);
    }

    async viewBookingProduct(productName: string): Promise<void> {
        await this.searchBookingProduct(productName);
        await this.page.locator(bookingSelectors.vBooking.productCell(productName)).hover();
        await this.page.locator(bookingSelectors.vBooking.view(productName)).click();

        // booking product view elements (excluding the buy/support/price elements the vendor can't see on own product)
        await expect(this.page.locator(bookingSelectors.vBooking.viewBooking.productImage)).toBeVisible();
        await expect(this.page.locator(bookingSelectors.vBooking.viewBooking.productName)).toBeVisible();
    }

    async cantBuyOwnBookingProduct(productName: string): Promise<void> {
        await this.goto(this.productPath(productName));
        await expect(this.page.locator(bookingSelectors.vBooking.viewBooking.bookingCalendar)).toBeHidden();
        await expect(this.page.locator(bookingSelectors.vBooking.viewBooking.bookNow)).toBeHidden();
    }

    async searchBookingProduct(productName: string): Promise<void> {
        await this.goto(data.subUrls.frontend.vDashboard.booking);
        await this.page.locator(bookingSelectors.vBooking.search.searchInput).fill(productName);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.booking, bookingSelectors.vBooking.search.search);
        await expect(this.page.locator(bookingSelectors.vBooking.productCell(productName))).toBeVisible();
    }

    async duplicateBookingProduct(productName: string): Promise<void> {
        await this.searchBookingProduct(productName);
        await this.page.locator(bookingSelectors.vBooking.productCell(productName)).hover();
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.booking, bookingSelectors.vBooking.duplicate(productName));
        await expect(this.page.locator(bookingSelectors.vBooking.dokanSuccessMessage)).toContainText('Product successfully duplicated');
    }

    async filterBookingProducts(filterBy: string, value: string): Promise<void> {
        await this.goto(data.subUrls.frontend.vDashboard.booking);

        switch (filterBy) {
            case 'by-date':
                await this.page.selectOption(bookingSelectors.vBooking.filters.filterByDate, { index: Number(value) });
                break;
            case 'by-category':
                await this.page.selectOption(bookingSelectors.vBooking.filters.filterByCategory, { label: value });
                break;
            case 'by-other':
                await this.page.selectOption(bookingSelectors.vBooking.filters.filterByOther, { value });
                break;
            default:
                break;
        }

        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.booking, bookingSelectors.vBooking.filters.filter);
        await this.page.waitForLoadState('domcontentloaded');
        await expect(this.page.locator(bookingSelectors.vBooking.numberOfRowsFound)).not.toHaveCount(0);
    }

    async deleteBookingProduct(productName: string): Promise<void> {
        await this.searchBookingProduct(productName);
        await this.page.locator(bookingSelectors.vBooking.productCell(productName)).hover();
        await this.page.locator(bookingSelectors.vBooking.permanentlyDelete(productName)).click();
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.booking, bookingSelectors.vBooking.confirmDelete);
        await expect(this.page.locator(bookingSelectors.vBooking.dokanSuccessMessage)).toContainText('Product successfully deleted');
    }

    // ---- vendor: resources ----

    async addBookingResource(resourceName: string): Promise<void> {
        await this.goto(data.subUrls.frontend.vDashboard.manageResources);
        await this.clickAndWaitForLoadState(bookingSelectors.vBooking.manageResources.addNewResource);
        await this.page.locator(bookingSelectors.vBooking.manageResources.resource.resourceName).fill(resourceName);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, bookingSelectors.vBooking.manageResources.resource.confirmAddNewResource);
        await expect(this.page.locator(bookingSelectors.vBooking.manageResources.resource.resourceCell(resourceName))).toBeVisible();
    }

    async editBookingResource(resource: BookingResourceData): Promise<void> {
        await this.goto(data.subUrls.frontend.vDashboard.manageResources);
        await this.clickAndWaitForLoadState(bookingSelectors.vBooking.manageResources.resource.editResource(resource.name));

        await this.page.locator(bookingSelectors.vBooking.manageResources.resource.resourceTitle).fill(resource.name);
        await this.page.locator(bookingSelectors.vBooking.manageResources.resource.availableQuantity).fill(resource.quantity);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.manageResources, bookingSelectors.vBooking.manageResources.resource.saveResource);
        await expect(this.page.locator(bookingSelectors.vProduct.updatedSuccessMessage)).toContainText('Success! The Resource has been updated successfully.');
    }

    async deleteBookingResource(resourceName: string): Promise<void> {
        await this.goto(data.subUrls.frontend.vDashboard.manageResources);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, bookingSelectors.vBooking.manageResources.resource.deleteResource(resourceName));
        await expect(this.page.locator(bookingSelectors.vBooking.manageResources.resource.resourceCell(resourceName))).toBeHidden();
    }

    // ---- vendor: add booking (guest or existing customer) ----

    async addBooking(productName: string, bookings: Bookings, customerName?: string): Promise<void> {
        await this.goto(data.subUrls.frontend.vDashboard.addBooking);

        if (customerName) {
            await this.page.locator(bookingSelectors.vBooking.addBooking.selectCustomerDropdown).click();
            await this.typeAndWaitForResponse(data.subUrls.ajax, bookingSelectors.vBooking.addBooking.selectCustomerInput, customerName);
            await expect(this.page.locator(bookingSelectors.vBooking.addBooking.searchedResult)).toContainText(customerName);
            await this.page.locator(bookingSelectors.vBooking.addBooking.searchedResultByName(customerName)).click();
        }

        await this.page.locator(bookingSelectors.vBooking.addBooking.selectABookableProductDropdown).click();
        await this.page.locator(bookingSelectors.vBooking.addBooking.selectABookableProduct(productName)).click();

        await this.page.locator(bookingSelectors.vBooking.addBooking.createANewCorrespondingOrderForThisNewBooking).click();
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.bookedDayBlocks, bookingSelectors.vBooking.addBooking.next);
        await this.ensureCalendarMonth(bookings.startDate);
        await this.clickAndWaitForResponse(data.subUrls.ajax, bookingSelectors.cBookings.selectCalendarDay(bookings.startDate.getMonth(), bookings.startDate.getDate()));
        await this.ensureCalendarMonth(bookings.endDate);
        await this.clickAndWaitForResponse(data.subUrls.ajax, bookingSelectors.cBookings.selectCalendarDay(bookings.endDate.getMonth(), bookings.endDate.getDate()));
        await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.addBooking, bookingSelectors.vBooking.addBooking.addBooking);
        await expect(this.page.locator(bookingSelectors.vBooking.addBooking.successMessage)).toContainText('The booking has been added successfully.');
    }

    // ---- customer: buy bookable product ----

    async buyBookableProduct(productName: string, bookings: Bookings): Promise<void> {
        const productPath = this.productPath(productName);
        await this.gotoUntilNetworkidle(productPath);
        await expect(this.page.locator(bookingSelectors.cBookings.calendarLoader)).toBeHidden();
        await this.ensureCalendarMonth(bookings.startDate);
        await this.clickAndWaitForResponse(data.subUrls.ajax, bookingSelectors.cBookings.selectCalendarDay(bookings.startDate.getMonth(), bookings.startDate.getDate()));
        await this.ensureCalendarMonth(bookings.endDate);
        await this.clickAndWaitForResponse(data.subUrls.ajax, bookingSelectors.cBookings.selectCalendarDay(bookings.endDate.getMonth(), bookings.endDate.getDate()));
        await this.clickAndWaitForResponse(productPath, bookingSelectors.cBookings.bookNow);
        await this.placeOrder();
    }

    // place order via direct bank transfer (default customer checkout)
    private async placeOrder(): Promise<void> {
        await this.goto(data.subUrls.frontend.checkout);
        await this.page.locator(bookingSelectors.checkout.directBankTransfer).click();
        await this.page.locator(bookingSelectors.checkout.placeOrder).focus();
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.orderReceived, bookingSelectors.checkout.placeOrder);
        await expect(this.page.locator(bookingSelectors.checkout.orderReceivedSuccessMessage)).toBeVisible();
    }
}
