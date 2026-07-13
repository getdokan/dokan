import { Page, expect } from '@playwright/test';
import { request as pwRequest, APIRequestContext } from '@playwright/test';
import { toPath, closeAnnouncementModal } from '@utils/helpers';
import { ApiUtils as RealApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';

// ============================================================================
// Product Advertising — de-stubbed by PORTING the pre-refactor page object
// (git e2ec507de:tests/pw/pages/productAdvertisingPage.ts + vendorPage.ts +
// vendorAuctionsPage.ts + selectors.ts) into the current self-contained style.
//
// The admin surface is the classic Vue SPA at page=dokan#/product-advertising
// (multiselect dropdowns, swal2 confirms, #product_advertisement_list_table).
// The vendor surface is the legacy product-listing dashboard. Selectors are
// inlined below (co-located), base-class helpers are converted to raw
// Playwright, and data / payloads / ApiUtils are re-exported REAL from @utils.
// ============================================================================

// Re-export the REAL test data + payloads the spec imports from this module.
export { data };
export { payloads } from '@utils/payloads';

// ---------------------------------------------------------------------------
// Null-tolerant ApiUtils wrapper (mirrors the vendor-return-request precedent).
// The spec constructs `new ApiUtils(null)`; the real ApiUtils requires an
// APIRequestContext, so when null is passed we lazily create our own context
// and swap it in before the first real REST call.
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

    override async createProductAdvertisement(...args: Parameters<RealApiUtils['createProductAdvertisement']>): ReturnType<RealApiUtils['createProductAdvertisement']> {
        await this.ready();
        return super.createProductAdvertisement(...args);
    }

    override async createProduct(...args: Parameters<RealApiUtils['createProduct']>): ReturnType<RealApiUtils['createProduct']> {
        await this.ready();
        return super.createProduct(...args);
    }

    override async createBookableProduct(...args: Parameters<RealApiUtils['createBookableProduct']>): ReturnType<RealApiUtils['createBookableProduct']> {
        await this.ready();
        return super.createBookableProduct(...args);
    }

    override async updateOrderStatus(...args: Parameters<RealApiUtils['updateOrderStatus']>): ReturnType<RealApiUtils['updateOrderStatus']> {
        await this.ready();
        return super.updateOrderStatus(...args);
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
// SELECTORS (inlined from pre-refactor selectors.ts)
// ============================================================================

// selector.admin.dokan.productAdvertising
const productAdvertisingAdmin = {
    productAdvertisingDiv: 'div.product-advertisement-list',
    productAdvertisingText: '.product-advertisement-list h1',

    addNewProductAdvertising: '//button[normalize-space()="Add New Advertisement"]',

    navTabs: {
        all: '//ul[@class="subsubsub"]//li//a[contains(text(),"All")]',
        active: '//ul[@class="subsubsub"]//li//a[contains(text(),"Active")]',
        expired: '//ul[@class="subsubsub"]//li//a[contains(text(),"Expired")]',
    },

    bulkActions: {
        selectAll: 'thead .manage-column input',
        selectAction: '.tablenav.top #bulk-action-selector-top', // delete
        applyAction: '//div[@class="tablenav top"]//button[normalize-space()="Apply"]',
    },

    filters: {
        allStoresDropdown: '//input[@placeholder="Filter by store"]/../..//div[@class="multiselect__select"]',
        createdViaDropdown: '(//div[@class="multiselect__select"])[2]',
        filterByStoreInput: 'input[placeholder="Filter by store"]',
        filterByCreatedVia: (createdVia: string) => `//li[@class="multiselect__element"]//span[contains(@class,"multiselect__option")]//span[contains(text(), "${createdVia}")]`,
        clearFilter: '//button[normalize-space()="Clear"]',
    },

    search: '#post-search-input',

    table: {
        productAdvertisingTable: '#product_advertisement_list_table table',
        productNameColumn: 'thead th.product_title',
        storeNameColumn: 'thead th.store',
        createdViaColumn: 'thead th.created_via',
        orderIdColumn: 'thead th.order_id',
        costColumn: 'thead th.price',
        expiresColumn: 'thead th.expires_at',
        dateColumn: 'thead th.added',
    },

    numberOfRowsFound: '.tablenav.top .displaying-num',
    numberOfRows: 'div#product_advertisement_list_table table tbody tr',
    noRowsFound: '//td[normalize-space()="No advertisement found."]',
    advertisedProductCell: (productName: string) => `//a[normalize-space()="${productName}"]/../..`,
    advertisedProductOrderIdCell: (orderNumber: number) => `//a[normalize-space()="${orderNumber}"]/../..`,
    advertisedProductExpire: (productName: string) => `//a[normalize-space()="${productName}"]/../..//span[@class="expire"]`,
    advertisedProductDelete: (productName: string) => `//a[normalize-space()="${productName}"]/../..//span[@class="delete"]`,

    confirmAction: '.swal2-actions .swal2-confirm',
    actionSuccessful: '.swal2-actions .swal2-confirm',

    addNewAdvertisement: {
        closeModal: '.modal-header button',
        selectStoreDropdown: '//label[normalize-space()="Select Store"]/..//div[@class="multiselect__select"]',
        selectStoreInput: '#filter-vendors',
        selectedStore: '//label[normalize-space()="Select Store"]/..//span[@class="multiselect__option multiselect__option--highlight"]//span',
        selectProductDropdown: '//label[normalize-space()="Select Product"]/..//div[@class="multiselect__select"]',
        selectProductInput: '#filter-products',
        selectedProduct: '//label[normalize-space()="Select Product"]/..//span[@class="multiselect__option multiselect__option--highlight"]//span',
        addNew: '.modal-footer button',
    },
};

// selector.admin.dokan.menus.advertising + selector.admin.dokan.settings.menus.productAdvertising
const dokanAdmin = {
    menuAdvertising: '//li[contains(@class,"toplevel_page_dokan")]//a[text()="Advertising"]',
    settingsMenuProductAdvertising: '//div[@class="nav-title" and contains(text(),"Product Advertising")]',
};

// selector.vendor.product (advertising-relevant subset)
const productsVendor = {
    table: {
        productAdvertisementColumn: '//th[@class="product-advertisement-th"]',
    },
    addNewProduct: 'span.dokan-add-product-link .dokan-btn.dokan-btn-theme:first-child',
    advertisement: {
        advertisementSection: 'div.dokan-proudct-advertisement',
        advertiseThisProduct: 'input#dokan_advertise_single_product',
        advertisementIsBought: '//label[contains(., "Product advertisement is currently ongoing.")]',
    },
    search: {
        searchInput: 'input[placeholder="Search Products"]',
        searchBtn: 'button[name="product_listing_search"]',
    },
    productLink: (productName: string) => `//strong//a[contains(text(),'${productName}')]`,
    productCell: (productName: string) => `//strong//a[contains(text(),'${productName}')]/../..`,
    rowActions: (productName: string) => `//a[contains(text(), '${productName}')]/../..//div[@class="row-actions"]`,
    editProduct: (productName: string) => `//a[contains(text(),'${productName}')]/../..//span[@class="edit"]//a`,
    title: '#post_title',
    buyAdvertisement: (productName: string) => `//a[contains(text(),'${productName}')]/../../..//td[@class="product-advertisement-td"]//span`,
    advertisementStatus: (productName: string) => `//a[contains(text(),'${productName}')]/../../..//td[@class="product-advertisement-td"]//i[contains(@class,'fa fa-circle')]`,
    confirmAction: '.swal2-actions .swal2-confirm',
    successMessage: '.swal2-actions .swal2-confirm',
};

// selector.vendor.vAuction (search/edit subset)
const auctionProductsVendor = {
    search: 'input[name ="search"]',
    filter: '//button[normalize-space()="Filter"]',
    productCell: (productName: string) => `//a[normalize-space()="${productName}"]/../..`,
    rowActions: (productName: string) => `//a[normalize-space()="${productName}"]/../..//div[@class='row-actions']`,
    edit: (productName: string) => `//a[normalize-space()="${productName}"]/../..//span[@class="edit"]`,
    productName: '.dokan-auction-post-title input[name="post_title"]',
};

// selector.vendor.vBooking (search/edit subset)
const bookingProductsVendor = {
    searchInput: 'input[name="product_search_name"]',
    searchBtn: 'button[name="product_listing_search"]',
    productCell: (name: string) => `//p//a[normalize-space()="${name}"]/../..`,
    edit: (name: string) => `//a[normalize-space()="${name}"]/../..//span[@class="edit"]`,
    productName: '#post_title',
};

// selector.customer.cCheckout + cOrderReceived (payment finalisation subset)
const customerCheckout = {
    directBankTransfer: '.payment_method_bacs label, label[for="radio-control-wc-payment-method-options-bacs"]',
    placeOrder: '#place_order, button.wc-block-components-checkout-place-order-button',
};
const cOrderReceived = {
    orderReceivedSuccessMessage: '.woocommerce-notice.woocommerce-notice--success.woocommerce-thankyou-order-received',
    orderNumber: '.woocommerce-order-overview__order.order strong',
};

// ============================================================================
// RAW PLAYWRIGHT HELPERS (ported from the removed basePage helpers)
// ============================================================================
async function gotoPath(page: Page, subPath: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' = 'domcontentloaded'): Promise<void> {
    await page.goto(toPath(subPath), { waitUntil });
}

async function goIfNotThere(page: Page, subPath: string): Promise<void> {
    const target = toPath(subPath).replace(/\/$/, '');
    if (page.url().replace(/\/$/, '') !== target) {
        await gotoPath(page, subPath);
    }
}

async function toBeVisible(page: Page, selector: string): Promise<void> {
    await expect(page.locator(selector)).toBeVisible();
}

async function notToBeVisible(page: Page, selector: string): Promise<void> {
    await expect(page.locator(selector)).toBeHidden();
}

async function toContainText(page: Page, selector: string, text: string): Promise<void> {
    await expect(page.locator(selector)).toContainText(text);
}

async function toHaveCount(page: Page, selector: string, count: number): Promise<void> {
    await expect(page.locator(selector)).toHaveCount(count);
}

async function toHaveValue(page: Page, selector: string, value: string): Promise<void> {
    await expect(page.locator(selector)).toHaveValue(value);
}

async function toBeChecked(page: Page, selector: string): Promise<void> {
    await expect(page.locator(selector)).toBeChecked();
}

async function notToHaveText(page: Page, selector: string, text: string): Promise<void> {
    await expect(page.locator(selector)).not.toHaveText(text);
}

async function toHaveColor(page: Page, selector: string, color: string): Promise<void> {
    await expect(async () => {
        const value = await page.locator(selector).evaluate(el => window.getComputedStyle(el).getPropertyValue('color'));
        expect(value).toBe(color);
    }).toPass();
}

async function click(page: Page, selector: string): Promise<void> {
    await page.locator(selector).click();
}

async function hover(page: Page, selector: string): Promise<void> {
    await page.locator(selector).hover();
}

async function press(page: Page, key: string): Promise<void> {
    await page.keyboard.press(key);
}

async function clearAndType(page: Page, selector: string, text: string): Promise<void> {
    await page.locator(selector).fill(text);
}

async function clearInputField(page: Page, selector: string): Promise<void> {
    await page.locator(selector).fill('');
}

async function selectByValue(page: Page, selector: string, value: string): Promise<void> {
    await page.selectOption(selector, { value });
}

async function removeAttribute(page: Page, selector: string, attribute: string): Promise<void> {
    await page.locator(selector).first().evaluate((el, attr) => el.removeAttribute(attr), attribute);
}

async function multipleElementVisible(page: Page, selectors: Record<string, unknown>): Promise<void> {
    for (const key in selectors) {
        const value = selectors[key];
        if (typeof value === 'string') {
            await toBeVisible(page, value);
        } else if (value && typeof value === 'object') {
            await multipleElementVisible(page, value as Record<string, unknown>);
        }
        // functions (dynamic selectors) are skipped
    }
}

async function clickAndWaitForLoadState(page: Page, selector: string, state: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'): Promise<void> {
    await Promise.all([page.waitForLoadState(state), page.locator(selector).click()]);
}

async function clickAndWaitForResponse(page: Page, subUrl: string, selector: string, code = 200): Promise<void> {
    await Promise.all([page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), page.locator(selector).click()]);
}

async function clickAndWaitForResponseAndLoadState(page: Page, subUrl: string, selector: string, code = 200): Promise<void> {
    const [, response] = await Promise.all([page.waitForLoadState('load'), page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), page.locator(selector).click()]);
    expect(response.status()).toBe(code);
}

async function clickAndWaitForResponseAndLoadStateUntilNetworkIdle(page: Page, subUrl: string, selector: string, code = 200): Promise<void> {
    // eslint-disable-next-line playwright/no-networkidle
    const [, response] = await Promise.all([page.waitForLoadState('networkidle'), page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), page.locator(selector).click()]);
    expect(response.status()).toBe(code);
}

async function typeAndWaitForResponse(page: Page, subUrl: string, selector: string, text: string, code = 200): Promise<void> {
    await Promise.all([page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), page.locator(selector).fill(text)]);
}

async function typeAndWaitForResponseAndLoadState(page: Page, subUrl: string, selector: string, text: string, code = 200): Promise<void> {
    await Promise.all([page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), page.waitForLoadState(), page.locator(selector).fill(text)]);
}

async function pressAndWaitForResponse(page: Page, subUrl: string, key: string, code = 200): Promise<void> {
    await Promise.all([page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), page.keyboard.press(key)]);
}

async function getElementText(page: Page, selector: string): Promise<string | null> {
    return await page.locator(selector).textContent();
}

// param type for addNewProductAdvertisement — the spec spreads data.productAdvertisement
type ProductAdvertisement = { advertisedProductStore: string; advertisedProduct: string; [key: string]: unknown };

// ============================================================================
// ADMIN — Product Advertising page object
// ============================================================================
export class ProductAdvertisingPage {
    constructor(readonly page: Page) {
        void closeAnnouncementModal(page);
    }

    // enable product advertising module (admin menu, settings menu, vendor surfaces)
    async enableProductAdvertisingModule(): Promise<void> {
        // dokan menu
        await gotoPath(this.page, data.subUrls.backend.dokan.dokan);
        await toBeVisible(this.page, dokanAdmin.menuAdvertising);

        // dokan settings
        await gotoPath(this.page, data.subUrls.backend.dokan.settings);
        await toBeVisible(this.page, dokanAdmin.settingsMenuProductAdvertising);

        // vendor dashboard
        await gotoPath(this.page, data.subUrls.frontend.vDashboard.products);
        await toBeVisible(this.page, productsVendor.table.productAdvertisementColumn);
        await clickAndWaitForLoadState(this.page, productsVendor.addNewProduct);
        await toBeVisible(this.page, productsVendor.advertisement.advertisementSection);
    }

    // disable product advertising module
    async disableProductAdvertisingModule(): Promise<void> {
        // dokan menu
        await gotoPath(this.page, data.subUrls.backend.dokan.dokan);
        await notToBeVisible(this.page, dokanAdmin.menuAdvertising);

        // dokan menu page
        await gotoPath(this.page, data.subUrls.backend.dokan.productAdvertising);
        await notToBeVisible(this.page, productAdvertisingAdmin.productAdvertisingDiv);

        // dokan settings
        await gotoPath(this.page, data.subUrls.backend.dokan.settings);
        await notToBeVisible(this.page, dokanAdmin.settingsMenuProductAdvertising);

        // vendor dashboard
        await gotoPath(this.page, data.subUrls.frontend.vDashboard.products);
        await notToBeVisible(this.page, productsVendor.table.productAdvertisementColumn);
        await clickAndWaitForLoadState(this.page, productsVendor.addNewProduct);
        await notToBeVisible(this.page, productsVendor.advertisement.advertisementSection);
    }

    // product advertising page renders properly
    async adminProductAdvertisingRenderProperly(): Promise<void> {
        await goIfNotThere(this.page, data.subUrls.backend.dokan.productAdvertising);

        // product advertising text is visible
        await toBeVisible(this.page, productAdvertisingAdmin.productAdvertisingText);

        // add new Advertisement is visible
        await toBeVisible(this.page, productAdvertisingAdmin.addNewProductAdvertising);

        // nav tabs are visible
        await multipleElementVisible(this.page, productAdvertisingAdmin.navTabs);

        // bulk action elements are visible
        await multipleElementVisible(this.page, productAdvertisingAdmin.bulkActions);

        // filter elements are visible (static selectors only)
        await toBeVisible(this.page, productAdvertisingAdmin.filters.allStoresDropdown);
        await toBeVisible(this.page, productAdvertisingAdmin.filters.createdViaDropdown);
        await toBeVisible(this.page, productAdvertisingAdmin.filters.clearFilter);

        // product advertising search is visible
        await toBeVisible(this.page, productAdvertisingAdmin.search);

        // product advertising table elements are visible
        await multipleElementVisible(this.page, productAdvertisingAdmin.table);

        // product advertising modal elements are visible
        await click(this.page, productAdvertisingAdmin.addNewProductAdvertising);
        await toBeVisible(this.page, productAdvertisingAdmin.addNewAdvertisement.selectStoreDropdown);
        await toBeVisible(this.page, productAdvertisingAdmin.addNewAdvertisement.selectProductDropdown);
        await click(this.page, productAdvertisingAdmin.addNewAdvertisement.closeModal);
    }

    // add new product advertisement
    async addNewProductAdvertisement(advertising: ProductAdvertisement): Promise<void> {
        await gotoPath(this.page, data.subUrls.backend.dokan.productAdvertising);

        await click(this.page, productAdvertisingAdmin.addNewProductAdvertising);

        await click(this.page, productAdvertisingAdmin.addNewAdvertisement.selectStoreDropdown);
        await typeAndWaitForResponse(this.page, data.subUrls.api.dokan.stores, productAdvertisingAdmin.addNewAdvertisement.selectStoreInput, advertising.advertisedProductStore);
        await toContainText(this.page, productAdvertisingAdmin.addNewAdvertisement.selectedStore, advertising.advertisedProductStore);
        await press(this.page, data.key.enter);

        await click(this.page, productAdvertisingAdmin.addNewAdvertisement.selectProductDropdown);
        await typeAndWaitForResponse(this.page, data.subUrls.api.dokan.products, productAdvertisingAdmin.addNewAdvertisement.selectProductInput, advertising.advertisedProduct);
        await toContainText(this.page, productAdvertisingAdmin.addNewAdvertisement.selectedProduct, advertising.advertisedProduct);
        await press(this.page, data.key.enter);

        await clickAndWaitForResponse(this.page, data.subUrls.api.dokan.productAdvertising, productAdvertisingAdmin.addNewAdvertisement.addNew);
        await click(this.page, productAdvertisingAdmin.actionSuccessful);

        // close modal
        await click(this.page, productAdvertisingAdmin.addNewAdvertisement.closeModal);
    }

    // search advertised product (by product name or by order id)
    async searchAdvertisedProduct(searchKey: string | number): Promise<void> {
        await gotoPath(this.page, data.subUrls.backend.dokan.productAdvertising);

        await clearInputField(this.page, productAdvertisingAdmin.search);

        await typeAndWaitForResponseAndLoadState(this.page, data.subUrls.api.dokan.productAdvertising, productAdvertisingAdmin.search, String(searchKey));
        await toHaveCount(this.page, productAdvertisingAdmin.numberOfRows, 1);
        if (typeof searchKey != 'number') {
            // searched by product
            await toBeVisible(this.page, productAdvertisingAdmin.advertisedProductCell(searchKey));
        } else {
            // searched by orderId
            await toBeVisible(this.page, productAdvertisingAdmin.advertisedProductOrderIdCell(searchKey));
        }
    }

    // filter advertised product
    async filterAdvertisedProduct(input: string, action: string): Promise<void> {
        await goIfNotThere(this.page, data.subUrls.backend.dokan.productAdvertising);

        switch (action) {
            case 'by-store':
                await click(this.page, productAdvertisingAdmin.filters.allStoresDropdown);
                await typeAndWaitForResponse(this.page, data.subUrls.api.dokan.productAdvertising, productAdvertisingAdmin.filters.filterByStoreInput, input);
                await pressAndWaitForResponse(this.page, data.subUrls.api.dokan.productAdvertising, data.key.enter);
                break;

            case 'by-creation':
                await click(this.page, productAdvertisingAdmin.filters.createdViaDropdown);
                await clickAndWaitForResponse(this.page, data.subUrls.api.dokan.productAdvertising, productAdvertisingAdmin.filters.filterByCreatedVia(input));
                break;

            default:
                break;
        }
        await notToHaveText(this.page, productAdvertisingAdmin.numberOfRowsFound, '0 items');
        await notToBeVisible(this.page, productAdvertisingAdmin.noRowsFound);

        // clear filter
        await clickAndWaitForResponse(this.page, data.subUrls.api.dokan.productAdvertising, productAdvertisingAdmin.filters.clearFilter);
    }

    // update advertised product (expire / delete)
    async updateAdvertisedProduct(productName: string, action: string): Promise<void> {
        await this.searchAdvertisedProduct(productName);

        await hover(this.page, productAdvertisingAdmin.advertisedProductCell(productName));
        switch (action) {
            case 'expire':
                await click(this.page, productAdvertisingAdmin.advertisedProductExpire(productName));
                break;

            case 'delete':
                await click(this.page, productAdvertisingAdmin.advertisedProductDelete(productName));
                break;

            default:
                break;
        }

        await clickAndWaitForResponse(this.page, data.subUrls.api.dokan.productAdvertising, productAdvertisingAdmin.confirmAction);
        await click(this.page, productAdvertisingAdmin.actionSuccessful);

        // refresh table by clicking filter
        await clickAndWaitForResponse(this.page, data.subUrls.api.dokan.productAdvertising, productAdvertisingAdmin.filters.clearFilter);
    }

    // product advertising bulk action
    async productAdvertisingBulkAction(action: string, productName?: string): Promise<void> {
        if (productName) {
            await this.searchAdvertisedProduct(productName);
        } else {
            await goIfNotThere(this.page, data.subUrls.backend.dokan.productAdvertising);
        }

        // ensure row exists
        await notToBeVisible(this.page, productAdvertisingAdmin.noRowsFound);

        await click(this.page, productAdvertisingAdmin.bulkActions.selectAll);
        await selectByValue(this.page, productAdvertisingAdmin.bulkActions.selectAction, action);
        await click(this.page, productAdvertisingAdmin.bulkActions.applyAction);
        await clickAndWaitForResponse(this.page, data.subUrls.api.dokan.productAdvertising, productAdvertisingAdmin.confirmAction);
        await click(this.page, productAdvertisingAdmin.actionSuccessful);
    }
}

// ============================================================================
// VENDOR — buy / assert product advertising (ported from vendorPage.ts)
// ============================================================================
export class VendorPage {
    constructor(readonly page: Page) {
        void closeAnnouncementModal(page);
    }

    // search a product on the vendor product-listing dashboard
    async searchProduct(productName: string): Promise<void> {
        await goIfNotThere(this.page, data.subUrls.frontend.vDashboard.products);

        await clearAndType(this.page, productsVendor.search.searchInput, productName);
        await clickAndWaitForResponse(this.page, data.subUrls.frontend.vDashboard.products, productsVendor.search.searchBtn);
        await toBeVisible(this.page, productsVendor.productLink(productName));
    }

    // open a product's edit screen from the vendor product listing
    async goToProductEdit(productName: string): Promise<void> {
        await this.searchProduct(productName);
        await removeAttribute(this.page, productsVendor.rowActions(productName), 'class'); // force row actions visible, avoid flakiness
        await hover(this.page, productsVendor.productCell(productName));
        await clickAndWaitForResponseAndLoadStateUntilNetworkIdle(this.page, data.subUrls.frontend.vDashboard.products, productsVendor.editProduct(productName));
        await toHaveValue(this.page, productsVendor.title, productName);
    }

    // finalise the advertisement checkout (bank transfer → place order → order received)
    private async paymentOrder(): Promise<string> {
        await click(this.page, customerCheckout.directBankTransfer);
        await this.page.locator(customerCheckout.placeOrder).focus();
        await clickAndWaitForResponseAndLoadState(this.page, data.subUrls.frontend.orderReceived, customerCheckout.placeOrder);
        await toBeVisible(this.page, cOrderReceived.orderReceivedSuccessMessage);
        return ((await getElementText(this.page, cOrderReceived.orderNumber)) ?? '') as string;
    }

    // buy product advertisement (simple / booking / auction)
    async buyProductAdvertising(productName: string, productType: string, testPage?: new (page: Page) => AuctionsPage | BookingPage): Promise<string> {
        if (!testPage) {
            await this.searchProduct(productName);
        } else {
            const page = new testPage(this.page);
            if (productType === 'booking') {
                await (page as BookingPage).searchBookingProduct(productName);
            } else {
                await (page as AuctionsPage).searchAuctionProduct(productName);
            }
        }
        await clickAndWaitForResponse(this.page, data.subUrls.ajax, productsVendor.buyAdvertisement(productName));
        await clickAndWaitForResponse(this.page, data.subUrls.ajax, productsVendor.confirmAction);
        await click(this.page, productsVendor.successMessage);
        const orderId = await this.paymentOrder();
        return orderId;
    }

    // assert a product advertisement is bought (status colour + edit-screen flags)
    async assertProductAdvertisementIsBought(productName: string, productType: string, testPage?: new (page: Page) => AuctionsPage | BookingPage): Promise<void> {
        if (!testPage) {
            await this.searchProduct(productName);
        } else {
            const page = new testPage(this.page);
            if (productType === 'booking') {
                await (page as BookingPage).searchBookingProduct(productName);
            } else {
                await (page as AuctionsPage).searchAuctionProduct(productName);
            }
        }
        // ongoing advertisement paints the row status the default tomato fallback colour
        await toHaveColor(this.page, productsVendor.advertisementStatus(productName), data.productAdvertisement.advertisementStatusColor);

        if (!testPage) {
            await this.goToProductEdit(productName);
        } else {
            const page = new testPage(this.page);
            if (productType === 'booking') {
                await (page as BookingPage).goToBookingProductEdit(productName);
            } else {
                await (page as AuctionsPage).goToAuctionProductEdit(productName);
            }
        }
        await toBeChecked(this.page, productsVendor.advertisement.advertiseThisProduct);
        await toBeVisible(this.page, productsVendor.advertisement.advertisementIsBought);
    }
}

// ============================================================================
// AUCTION — vendor auction product listing (ported from vendorAuctionsPage.ts)
// ============================================================================
export class AuctionsPage {
    constructor(readonly page: Page) {
        void closeAnnouncementModal(page);
    }

    // search an auction product on the vendor auction dashboard
    async searchAuctionProduct(productName: string): Promise<void> {
        await goIfNotThere(this.page, data.subUrls.frontend.vDashboard.auction);
        await clearAndType(this.page, auctionProductsVendor.search, productName);
        await clickAndWaitForResponseAndLoadState(this.page, data.subUrls.frontend.vDashboard.auction, auctionProductsVendor.filter);
        await toBeVisible(this.page, auctionProductsVendor.productCell(productName));
    }

    // open an auction product's edit screen
    async goToAuctionProductEdit(productName: string): Promise<void> {
        await this.searchAuctionProduct(productName);
        await removeAttribute(this.page, auctionProductsVendor.rowActions(productName), 'class'); // force row actions visible, avoid flakiness
        await hover(this.page, auctionProductsVendor.productCell(productName));
        await clickAndWaitForLoadState(this.page, auctionProductsVendor.edit(productName));
        await toHaveValue(this.page, auctionProductsVendor.productName, productName);
    }
}

// ============================================================================
// BOOKING — vendor booking product listing (modelled on the auction flow using
// the pre-refactor vBooking selectors; the booking spec case stays skipped).
// ============================================================================
export class BookingPage {
    constructor(readonly page: Page) {
        void closeAnnouncementModal(page);
    }

    // search a booking product on the vendor booking dashboard
    async searchBookingProduct(productName: string): Promise<void> {
        await goIfNotThere(this.page, data.subUrls.frontend.vDashboard.booking);
        await clearAndType(this.page, bookingProductsVendor.searchInput, productName);
        await clickAndWaitForResponseAndLoadState(this.page, data.subUrls.frontend.vDashboard.booking, bookingProductsVendor.searchBtn);
        await toBeVisible(this.page, bookingProductsVendor.productCell(productName));
    }

    // open a booking product's edit screen
    async goToBookingProductEdit(productName: string): Promise<void> {
        await this.searchBookingProduct(productName);
        await hover(this.page, bookingProductsVendor.productCell(productName));
        await clickAndWaitForLoadState(this.page, bookingProductsVendor.edit(productName));
        await toHaveValue(this.page, bookingProductsVendor.productName, productName);
    }
}
