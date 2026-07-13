import { Page, expect } from '@playwright/test';
import { closeAnnouncementModal, toPath, helpers } from '@utils/helpers';
import { data } from '@utils/testData';

// The spec imports { AuctionsPage, ApiUtils, data, payloads } from this file. Wire the
// data/payloads/ApiUtils exports to the REAL @utils implementations (not local stubs) so
// the import contract resolves to production behaviour.
export { data };
export { ApiUtils } from '@utils/apiUtils';
export { payloads } from '@utils/payloads';

// ---- Navigation targets (relative sub-paths; toPath() prepends BASE_URL) ----
const urls = {
    adminSettings: 'wp-admin/admin.php?page=dokan#/settings',
    wcAddNewProduct: 'wp-admin/post-new.php?post_type=product',
    myAccount: 'my-account',
    vendorDashboard: 'dashboard',
    auction: 'dashboard/auction',
    auctionActivity: 'dashboard/auction-activity',
    checkout: 'checkout',
    productDetails: (productName: string) => `shop/uncategorized/${helpers.slugify(productName)}`,
} as const;

// Response-URL match substrings (used with page.waitForResponse).
const responseUrls = {
    post: '/post.php',
    ajax: '/admin-ajax.php',
    auction: 'dashboard/auction',
    auctionActivity: 'dashboard/auction-activity',
    product: 'product',
    orderReceived: 'checkout/order-received',
} as const;

// ---- Co-located selectors (ported verbatim from the pre-refactor selectors.ts groups
// admin.products.product, admin.dokan.settings, vendor.vAuction, vendor.vDashboard,
// vendor.product and customer.*). ----
export const auctionSelectors = {
    // admin > Dokan settings (Selling Options)
    settings: {
        sellingOptionsMenu: '//div[@class="nav-title" and contains(text(),"Selling Options")]',
        newVendorEnableAuction: '.new_seller_enable_auction .switch',
    },

    // admin > WooCommerce add new product (auction type)
    adminProduct: {
        productName: '#title',
        productType: '#product-type',
        auctionSubMenu: '.auction_tab_options a',
        itemCondition: '#\\_auction_item_condition',
        auctionType: '#\\_auction_type',
        startPrice: '#\\_auction_start_price',
        bidIncrement: '#\\_auction_bid_increment',
        reservedPrice: '#\\_auction_reserved_price',
        buyItNowPrice: '//label[contains(text(),"Buy it now price")]/..//input[@id="_regular_price"]',
        auctionDatesFrom: '#\\_auction_dates_from',
        auctionDatesTo: '#\\_auction_dates_to',
        category: (categoryName: string) => `//label[contains(text(), ' ${categoryName}')]/input`,
        storeName: '//div[contains(@id, "sellerdiv")]//span[@class="select2-selection__arrow"]',
        storeNameInput: '.select2-search.select2-search--dropdown .select2-search__field',
        publish: '#publishing-action #publish',
        updatedSuccessMessage: '.updated.notice.notice-success p',
        // select2 results dropdown (shared)
        select2Highlighted: '.select2-results__option.select2-results__option--highlighted',
    },

    // vendor dashboard menu + customer my-account menu
    menus: {
        vendorAuctionMenu: 'ul.dokan-dashboard-menu li.auction a',
        dashboardDiv: 'div.dokan-dashboard-wrap',
        myAccountAuctions: '.woocommerce-MyAccount-navigation-link--auctions-endpoint a',
    },

    // vendor > Auction listing + editor (selector.vendor.vAuction)
    vAuction: {
        menus: {
            all: '//ul[contains(@class,"dokan-listing-filter")]//a[contains(text(),"All")]',
            online: '//ul[contains(@class,"dokan-listing-filter")]//a[contains(text(),"Online")]',
            pendingReview: '//ul[contains(@class,"dokan-listing-filter")]//a[contains(text(),"Pending Review")]',
            draft: '//ul[contains(@class,"dokan-listing-filter")]//a[contains(text(),"Draft")]',
        },

        addNewActionProduct: '.dokan-add-product-link .dokan-btn-theme',
        actionsActivity: '.button-ml .dokan-btn',

        filters: {
            dateRange: 'input#auction_date_range',
            filter: '//button[normalize-space()="Filter"]',
            filterReset: '//a[normalize-space()="Reset"]',
        },

        search: 'input[name ="search"]',

        table: {
            table: 'table.dokan-table.product-listing-table',
            imageColumn: '//th[normalize-space()="Image"]',
            nameColumn: '//th[normalize-space()="Name"]',
            statusColumn: '//th[normalize-space()="Status"]',
            sKUColumn: '//th[normalize-space()="SKU"]',
            stockColumn: '//th[normalize-space()="Stock"]',
            priceColumn: '//th[normalize-space()="Price"]',
            typeColumn: '//th[normalize-space()="Type"]',
            viewsColumn: '//th[normalize-space()="Views"]',
            dateColumn: '//th[normalize-space()="Date"]',
        },

        productCell: (productName: string) => `//a[normalize-space()="${productName}"]/../..`,
        rowActions: (productName: string) => `//a[normalize-space()="${productName}"]/../..//div[@class='row-actions']`,
        edit: (productName: string) => `//a[normalize-space()="${productName}"]/../..//span[@class="edit"]`,
        permanentlyDelete: (productName: string) => `//a[normalize-space()="${productName}"]/../..//span[@class="delete"]`,
        view: (productName: string) => `//a[normalize-space()="${productName}"]/../..//span[@class="view"]`,
        duplicate: (productName: string) => `//a[normalize-space()="${productName}"]/../..//span[@class="duplicate"]`,
        duplicateSuccessMessage:
            '//div[contains(@class,"dokan-alert dokan-alert-success")]//strong[normalize-space(text())="Product successfully duplicated"]',

        confirmDelete: '.swal2-confirm',
        cancelDelete: '.swal2-cancel',
        dokanSuccessMessage: '.dokan-alert.dokan-alert-success',

        // create/edit auction product form
        auction: {
            productName: '.dokan-auction-post-title input[name="post_title"]',
            itemCondition: '#\\_auction_item_condition',
            auctionType: '#\\_auction_type',
            enableProxyBidding: 'input#_auction_proxy',
            startPrice: '#\\_auction_start_price',
            bidIncrement: '#\\_auction_bid_increment',
            reservedPrice: '#\\_auction_reserved_price',
            buyItNowPrice: '#\\_regular_price',
            auctionStartDate: '#\\_auction_dates_from',
            auctionEndDate: '#\\_auction_dates_to',
            addAuctionProduct: '//input[@name="update_auction_product"]',
            updateAuctionProduct: '//input[@name="update_auction_product"]',
        },

        // single product (view) page
        viewAuction: {
            productImage: '.woocommerce-product-gallery__image--placeholder img.wp-post-image',
            productName: '.product_title.entry-title',
            startingOrCurrentBid: '.summary .auction-price .amount',
            itemCondition: '.curent-bid',
            auctionTime: '#countdown.auction-time',
            auctionEnd: '.auction-end',
            reversePriceStatus: '.reserve.hold',
            noBidOption: '//div[@class="woocommerce-info" and contains(text(), "You are not allowed to bid your own product.")]',
            bidQuantity: 'div.quantity.buttons_added',
            bidButton: '.bid_button',
            buyNow: '.single_add_to_cart_button',
            getSupport: '.dokan-store-support-btn',
            auctionHistoryTab: '#tab-title-simle_auction_history',
        },

        // Auction Activity page
        actionActivity: {
            actionActivityText: '//h1[contains(text(), "Auctions Activity")]',
            backToActions: '//a[normalize-space()="Auctions"]',
            filters: {
                filterByDate: {
                    dateRangeInput: 'input#auction-activity-datetime-range',
                    startDateInput: 'input#_auction_dates_from',
                    endDateInput: 'input#_auction_dates_to',
                },
                filter: 'button[name="auction_activity_date_filter"]',
                filterReset: 'button#auction-clear-filter-button',
            },
            search: {
                searchInput: 'input[name="auction_activity_search"]',
                search: '.search-box .dokan-btn',
            },
            table: {
                table: 'table.dokan-table.product-listing-table',
                auctionColumn: '//th[normalize-space()="Auction"]',
                userNameColumn: '//th[normalize-space()="User Name"]',
                userEmailColumn: '//th[normalize-space()="User Email"]',
                bidColumn: '//th[normalize-space()="Bid"]',
                dateColumn: '//th[normalize-space()="Date"]',
                proxyColumn: '//th[normalize-space()="Proxy"]',
            },
            numOfRowsFound: '.dokan-table.product-listing-table tbody tr',
        },
    },

    // vendor > generic product save success banner (selector.vendor.product.updatedSuccessMessage)
    vendorProduct: {
        updatedSuccessMessage: 'div.dokan-message',
    },

    // customer buy flow (selector.customer.*)
    customer: {
        addOnSelect: '.wc-pao-addon-select',
        singleAddToCart: 'button.single_add_to_cart_button',
        productAddedSuccessMessage: (productName: string) =>
            `//div[@class="woocommerce-message" and contains(.,"“${productName}” has been added to your cart.")]`,
        directBankTransfer: '.payment_method_bacs label, label[for="radio-control-wc-payment-method-options-bacs"]',
        placeOrder: '#place_order, button.wc-block-components-checkout-place-order-button',
        orderReceivedSuccessMessage: '.woocommerce-notice.woocommerce-notice--success.woocommerce-thankyou-order-received',
    },
} as const;

// Convenience aliases (mirror the pre-refactor `auctionProductsAdmin` / `auctionProductsVendor`).
const adminProduct = auctionSelectors.adminProduct;
const vAuction = auctionSelectors.vAuction;

export class AuctionsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---------------------------------------------------------------------------
    // Internal helpers (raw Playwright equivalents of the old basePage helpers)
    // ---------------------------------------------------------------------------

    private async goto(subPath: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'): Promise<void> {
        await this.page.goto(toPath(subPath), { waitUntil });
    }

    // click & wait for a matching response + 'load' state (basePage.clickAndWaitForResponseAndLoadState)
    private async clickAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200): Promise<void> {
        const [, response] = await Promise.all([
            this.page.waitForLoadState('load'),
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).click(),
        ]);
        expect(response.status()).toBe(code);
    }

    // click & wait for a matching response (basePage.clickAndWaitForResponse)
    private async clickAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<void> {
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).click(),
        ]);
    }

    // click & wait for load state (basePage.clickAndWaitForLoadState)
    private async clickAndWaitForLoadState(selector: string, state: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'): Promise<void> {
        await Promise.all([this.page.waitForLoadState(state), this.page.locator(selector).click()]);
    }

    // assert every leaf selector in the (possibly nested) object is visible, skipping functions
    private async multipleElementVisible(selectors: Record<string, unknown>): Promise<void> {
        for (const key in selectors) {
            const value = selectors[key];
            if (typeof value === 'function') continue;
            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                await this.multipleElementVisible(value as Record<string, unknown>);
            } else {
                await expect(this.page.locator(value as string)).toBeVisible();
            }
        }
    }

    private async removeAttribute(selector: string, attribute: string): Promise<void> {
        await this.page.locator(selector).evaluate((el, attr) => el.removeAttribute(attr), attribute);
    }

    private async setAttributeValue(selector: string, attribute: string, value: string): Promise<void> {
        await this.page
            .locator(selector)
            .evaluate((el, [attr, val]) => el.setAttribute(attr as string, val as string), [attribute, value]);
    }

    // dokan select2 by text (basePage.select2ByText): open, type (wait for ajax), assert highlighted, Enter
    private async select2ByText(selectSelector: string, optionSelector: string, text: string): Promise<void> {
        await this.page.locator(selectSelector).click();
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(responseUrls.ajax) && resp.status() === 200),
            this.page.locator(optionSelector).fill(text),
        ]);
        await expect(this.page.locator(adminProduct.select2Highlighted)).toContainText(text);
        await this.page.keyboard.press('Enter');
    }

    private async goToProductDetails(productName: string): Promise<void> {
        await this.goto(urls.productDetails(productName));
    }

    // ---------------------------------------------------------------------------
    // admin
    // ---------------------------------------------------------------------------

    // enable auction integration module
    async enableAuctionIntegrationModule(): Promise<void> {
        // dokan settings
        await this.goto(urls.adminSettings);
        await this.page.locator(auctionSelectors.settings.sellingOptionsMenu).click();
        await expect(this.page.locator(auctionSelectors.settings.newVendorEnableAuction)).toBeVisible();

        // vendor dashboard menu
        await this.goto(urls.vendorDashboard);
        await expect(this.page.locator(auctionSelectors.menus.vendorAuctionMenu)).toBeVisible();

        // customer dashboard menu
        await this.goto(urls.myAccount);
        await expect(this.page.locator(auctionSelectors.menus.myAccountAuctions)).toBeVisible();
    }

    // disable auction integration module
    async disableAuctionIntegrationModule(): Promise<void> {
        // admin dashboard
        await this.goto(urls.adminSettings);
        await this.page.locator(auctionSelectors.settings.sellingOptionsMenu).click();
        await expect(this.page.locator(auctionSelectors.settings.newVendorEnableAuction)).toBeHidden();

        // vendor dashboard menu
        await this.goto(urls.vendorDashboard);
        await expect(this.page.locator(auctionSelectors.menus.vendorAuctionMenu)).toBeHidden();

        // vendor dashboard menu page
        await this.goto(urls.auction);
        await expect(this.page.locator(auctionSelectors.menus.dashboardDiv)).toBeHidden();

        // customer dashboard menu
        await this.goto(urls.myAccount);
        await expect(this.page.locator(auctionSelectors.menus.myAccountAuctions)).toBeVisible();
    }

    // admin add auction product (wp-admin)
    async adminAddAuctionProduct(product: any): Promise<void> {
        await this.goto(urls.wcAddNewProduct);

        // Name + product data
        await this.page.locator(adminProduct.productName).fill(product.productName());
        await this.page.selectOption(adminProduct.productType, { value: product.productType });
        await this.page.locator(adminProduct.auctionSubMenu).click();
        await this.page.selectOption(adminProduct.itemCondition, { value: product.itemCondition });
        await this.page.selectOption(adminProduct.auctionType, { value: product.auctionType });
        await this.page.locator(adminProduct.startPrice).fill(product.regularPrice());
        await this.page.locator(adminProduct.bidIncrement).fill(product.bidIncrement());
        await this.page.locator(adminProduct.reservedPrice).fill(product.reservedPrice());
        await this.page.locator(adminProduct.buyItNowPrice).fill(product.buyItNowPrice());
        await this.page.locator(adminProduct.auctionDatesFrom).fill(product.startDate);
        await this.page.locator(adminProduct.auctionDatesTo).fill(product.endDate);

        // Category
        await this.page.locator(adminProduct.category(product.category)).click();

        // Vendor store name (select2)
        await this.select2ByText(adminProduct.storeName, adminProduct.storeNameInput, product.storeName);

        // scroll to top (basePage.scrollToTop -> keyboard Home)
        await this.page.keyboard.down(data.key.home);

        // Publish
        await this.clickAndWaitForResponseAndLoadState(responseUrls.post, adminProduct.publish, 302);
        await expect(this.page.locator(adminProduct.updatedSuccessMessage)).toContainText(data.product.publishSuccessMessage);
    }

    // ---------------------------------------------------------------------------
    // vendor
    // ---------------------------------------------------------------------------

    // vendor auction listing page renders properly
    async vendorAuctionRenderProperly(): Promise<void> {
        await this.goto(urls.auction);

        // auctions "All" menu is visible
        await expect(this.page.locator(vAuction.menus.all)).toBeVisible();

        // add new auction product button is visible
        await expect(this.page.locator(vAuction.addNewActionProduct)).toBeVisible();

        // auction activity button is visible
        await expect(this.page.locator(vAuction.actionsActivity)).toBeVisible();

        // filter elements are visible
        await this.multipleElementVisible(vAuction.filters);

        // search element is visible
        await expect(this.page.locator(vAuction.search)).toBeVisible();

        // auction product table elements are visible
        await this.multipleElementVisible(vAuction.table);
    }

    // go to auction product edit (search -> hover row -> edit -> assert name)
    private async goToAuctionProductEdit(productName: string): Promise<void> {
        await this.searchAuctionProduct(productName);
        // force the row actions visible to avoid flakiness
        await this.removeAttribute(vAuction.rowActions(productName), 'class');
        await this.page.locator(vAuction.productCell(productName)).hover();
        await this.clickAndWaitForLoadState(vAuction.edit(productName));
        await expect(this.page.locator(vAuction.auction.productName)).toHaveValue(productName);
    }

    // update auction product editor fields
    private async updateAuctionProductFields(product: any): Promise<void> {
        await this.page.locator(vAuction.auction.productName).fill(product.name);
        await this.page.selectOption(vAuction.auction.itemCondition, { value: product.itemCondition });
        await this.page.selectOption(vAuction.auction.auctionType, { value: product.auctionType });
        await this.page.locator(vAuction.auction.startPrice).fill(product.regularPrice());
        await this.page.locator(vAuction.auction.bidIncrement).fill(product.bidIncrement());
        await this.page.locator(vAuction.auction.reservedPrice).fill(product.reservedPrice());
        await this.page.locator(vAuction.auction.buyItNowPrice).fill(product.buyItNowPrice());
        await this.removeAttribute(vAuction.auction.auctionStartDate, 'readonly');
        await this.removeAttribute(vAuction.auction.auctionEndDate, 'readonly');
        await this.page.locator(vAuction.auction.auctionStartDate).fill(product.startDate);
        await this.page.locator(vAuction.auction.auctionEndDate).fill(product.endDate);
    }

    // add auction product
    async addAuctionProduct(product: any): Promise<void> {
        await this.goto(urls.auction);
        await this.clickAndWaitForLoadState(vAuction.addNewActionProduct);
        await this.updateAuctionProductFields(product);
        await this.clickAndWaitForResponseAndLoadState(responseUrls.auction, vAuction.auction.addAuctionProduct);
        await expect(this.page.locator(auctionSelectors.vendorProduct.updatedSuccessMessage)).toContainText(product.saveSuccessMessage);
    }

    // edit auction product
    async editAuctionProduct(product: any): Promise<void> {
        await this.goToAuctionProductEdit(product.name);
        await this.updateAuctionProductFields(product);
        await this.clickAndWaitForResponseAndLoadState(responseUrls.auction, vAuction.auction.updateAuctionProduct);
        await expect(this.page.locator(auctionSelectors.vendorProduct.updatedSuccessMessage)).toContainText(product.saveSuccessMessage);
    }

    // view auction product single page
    async viewAuctionProduct(productName: string): Promise<void> {
        await this.searchAuctionProduct(productName);
        await this.page.locator(vAuction.productCell(productName)).hover();
        await this.clickAndWaitForLoadState(vAuction.view(productName));

        // assert single-product elements (skip bid/buy/support + starting bid — not reliably
        // rendered for api-seeded products, matching the pre-refactor exclusion)
        const { bidQuantity, bidButton, buyNow, getSupport, startingOrCurrentBid, ...viewAuction } = vAuction.viewAuction;
        void bidQuantity;
        void bidButton;
        void buyNow;
        void getSupport;
        void startingOrCurrentBid;
        await this.multipleElementVisible(viewAuction);
    }

    // vendor can't bid own auction product
    async cantBidOwnProduct(productName: string): Promise<void> {
        await this.goToProductDetails(productName);
        await expect(this.page.locator(vAuction.viewAuction.noBidOption)).toBeVisible();
    }

    // search auction product
    async searchAuctionProduct(productName: string): Promise<void> {
        await this.goto(urls.auction);
        await this.page.locator(vAuction.search).fill(productName);
        await this.clickAndWaitForResponseAndLoadState(responseUrls.auction, vAuction.filters.filter);
        await expect(this.page.locator(vAuction.productCell(productName))).toBeVisible();
    }

    // duplicate auction product
    async duplicateAuctionProduct(productName: string): Promise<void> {
        await this.searchAuctionProduct(productName);
        await this.removeAttribute(vAuction.rowActions(productName), 'class');
        await this.page.locator(vAuction.productCell(productName)).hover();
        await this.clickAndWaitForResponseAndLoadState(responseUrls.auction, vAuction.duplicate(productName), 302);
        await expect(this.page.locator(vAuction.duplicateSuccessMessage)).toBeVisible();
        await expect(this.page.locator(vAuction.productCell(productName + ' (Copy)'))).toBeVisible();
    }

    // delete auction product (permanent)
    async deleteAuctionProduct(productName: string): Promise<void> {
        await this.searchAuctionProduct(productName);
        await this.page.locator(vAuction.productCell(productName)).hover();
        await this.page.locator(vAuction.permanentlyDelete(productName)).click();
        await this.clickAndWaitForResponseAndLoadState(responseUrls.auction, vAuction.confirmDelete);
        await expect(this.page.locator(vAuction.dokanSuccessMessage)).toContainText('Product successfully deleted');
    }

    // vendor auction activity page renders properly
    async vendorAuctionActivityRenderProperly(): Promise<void> {
        await this.goto(urls.auctionActivity);

        // auction activity heading + back link
        await expect(this.page.locator(vAuction.actionActivity.actionActivityText)).toBeVisible();
        await expect(this.page.locator(vAuction.actionActivity.backToActions)).toBeVisible();

        // filter elements (date range asserted via its own input)
        const { filterByDate, ...filters } = vAuction.actionActivity.filters;
        await this.multipleElementVisible(filters);
        await expect(this.page.locator(filterByDate.dateRangeInput)).toBeVisible();

        // search elements
        await this.multipleElementVisible(vAuction.actionActivity.search);

        // table elements
        await this.multipleElementVisible(vAuction.actionActivity.table);
    }

    // filter auction activity by date range
    async filterAuctionActivity(inputValue: any): Promise<void> {
        await this.goto(urls.auctionActivity);
        const { filterByDate, filter } = vAuction.actionActivity.filters;
        await this.setAttributeValue(
            filterByDate.dateRangeInput,
            'value',
            helpers.dateFormatFYJ(inputValue.startDate) + ' - ' + helpers.dateFormatFYJ(inputValue.endDate),
        );
        await this.setAttributeValue(filterByDate.startDateInput, 'value', inputValue.startDate);
        await this.setAttributeValue(filterByDate.endDateInput, 'value', inputValue.endDate);
        await this.clickAndWaitForResponseAndLoadState(responseUrls.auctionActivity, filter);
        await expect(this.page.locator(vAuction.actionActivity.numOfRowsFound)).not.toHaveCount(0);
    }

    // search auction activity
    async searchAuctionActivity(input: string): Promise<void> {
        await this.goto(urls.auctionActivity);
        await this.page.locator(vAuction.actionActivity.search.searchInput).fill(input);
        await this.clickAndWaitForResponseAndLoadState(responseUrls.auctionActivity, vAuction.actionActivity.search.search);
        await expect(this.page.locator(vAuction.actionActivity.numOfRowsFound)).not.toHaveCount(0);
    }

    // ---------------------------------------------------------------------------
    // customer
    // ---------------------------------------------------------------------------

    // bid on an auction product
    async bidAuctionProduct(productName: string): Promise<void> {
        await this.goToProductDetails(productName);
        await this.page.locator(vAuction.viewAuction.bidButton).click();
    }

    // buy an auction product with its "buy it now" price (add to cart + place order)
    async buyAuctionProduct(productName: string): Promise<void> {
        // add product to cart from the single product page
        await this.goToProductDetails(productName);
        if (await this.page.locator(auctionSelectors.customer.addOnSelect).isVisible().catch(() => false)) {
            await this.page.selectOption(auctionSelectors.customer.addOnSelect, { index: 1 });
        }
        await this.clickAndWaitForResponse(responseUrls.product, auctionSelectors.customer.singleAddToCart);
        await expect(this.page.locator(auctionSelectors.customer.productAddedSuccessMessage(productName))).toBeVisible();

        // place order (direct bank transfer)
        await this.goto(urls.checkout);
        await this.page.locator(auctionSelectors.customer.directBankTransfer).click();
        await this.clickAndWaitForResponseAndLoadState(responseUrls.orderReceived, auctionSelectors.customer.placeOrder);
        await expect(this.page.locator(auctionSelectors.customer.orderReceivedSuccessMessage)).toBeVisible();
    }
}
