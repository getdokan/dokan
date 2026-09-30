import { Page, expect, request as pwRequest, APIRequestContext } from '@playwright/test';
import { toPath, closeAnnouncementModal } from '@utils/helpers';
import { ApiUtils as RealApiUtils } from '@utils/apiUtils';
import { product, vendor } from '@utils/interfaces';

// ============================================================================
// Product-details (single product edit) — VENDOR revival.
//
// Ported from the pre-refactor page object (git e2ec507de:pages/productsPage.ts
// product-detail methods + pages/selectors.ts selector.vendor.product) into the
// current self-contained style, matching the sibling ported page objects
// (tests/e2e/products/productsPage.ts + product-addons/productAddonsPage.ts).
//
// The classic PHP product-edit screen is driven by id via the nonce URL
// (dashboard/products/?product_id=<id>&action=edit&_dokan_edit_product_nonce=..).
// Base-class helpers (toBeVisible / clearAndType / typeFrameSelector / uploadMedia
// / clickAndWaitForResponse / ...) are inlined as raw Playwright methods below.
// Selector strings are recovered verbatim from pre-refactor selectors.ts.
//
// data / dbData / dbUtils / payloads / ApiUtils / responseBody are re-exported
// REAL from @utils so the spec's beforeAll seeds real products/attributes/addons
// over REST and toggles real dokan options.
// ============================================================================

// ---- Re-exported REAL test utils (import contract for productsDetails.spec.ts) --
export { data } from '@utils/testData';
export { dbData } from '@utils/dbData';
export { dbUtils } from '@utils/dbUtils';
export { payloads } from '@utils/payloads';
export type { responseBody } from '@utils/interfaces';

const { DOKAN_PRO } = process.env;

/**
 * Null-tolerant ApiUtils wrapper (mirrors the sibling legacy page objects).
 *
 * The spec constructs `new ApiUtils(null)`. The real ApiUtils requires an
 * APIRequestContext, so when null is passed we lazily create our own context and
 * swap it in before the first real HTTP call. Every high-level method the spec
 * uses (createProduct / createProductWc / updateProduct / getCategoryId /
 * createProductWithAddon / createAttributeTerm) funnels through get/post/put/
 * delete, so gating those four (plus dispose) is enough.
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

    override async get(...args: Parameters<RealApiUtils['get']>): ReturnType<RealApiUtils['get']> {
        await this.ready();
        return super.get(...args);
    }

    override async post(...args: Parameters<RealApiUtils['post']>): ReturnType<RealApiUtils['post']> {
        await this.ready();
        return super.post(...args);
    }

    override async put(...args: Parameters<RealApiUtils['put']>): ReturnType<RealApiUtils['put']> {
        await this.ready();
        return super.put(...args);
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
// HELPERS
// ============================================================================
function slugify(str: string): string {
    return str
        .toString()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/-$/g, '');
}

// ============================================================================
// URL SUB-PATHS + MESSAGES (recovered from pre-refactor testData.ts)
// ============================================================================
const subUrls = {
    ajax: '/admin-ajax.php',
    gmap: '/maps/api',
    products: 'dashboard/products',
    productEdit: (productId: string, nonce: string) => `dashboard/products/?product_id=${productId}&action=edit&_dokan_edit_product_nonce=${nonce}`,
};

const messages = {
    productSaved: 'Success! The product has been saved successfully.',
};

// ============================================================================
// WP MEDIA MODAL SELECTORS
// ============================================================================
const wpMedia = {
    uploadFiles: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[@id="menu-item-upload"]',
    mediaLibrary: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[@id="menu-item-browse"]',
    uploadedMediaFirst: '(//div[contains(@class,"attachment-preview")])[1]',
    selectFilesInput: '//div[@class="supports-drag-drop" and @style="position: relative;"]//input[@type="file"]',
    selectUploadedMedia: '(//h2[contains(text(),"Media list")]/..//ul//li)[1]',
    select: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[contains(@class, "media-button-select")]',
    crop: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[contains(@class, "media-button-insert")]',
};

// ============================================================================
// PRODUCT EDIT SELECTORS (selector.vendor.product)
// ============================================================================
const productsVendor = {
    search: {
        searchInput: 'input[placeholder="Search Products"]',
        searchBtn: 'button[name="product_listing_search"]',
    },
    numberOfRowsFound: '#dokan-product-list-table tbody tr',
    productCell: (productName: string) => `//strong//a[contains(text(),'${productName}')]/../..`,
    productLink: (productName: string) => `//strong//a[contains(text(),'${productName}')]`,
    editProduct: (productName: string) => `//a[contains(text(),'${productName}')]/../..//span[@class="edit"]//a`,
    rowActions: (productName: string) => `//a[contains(text(), '${productName}')]/../..//div[@class="row-actions"]`,
    addNewProduct: 'span.dokan-add-product-link .dokan-btn.dokan-btn-theme:first-child',

    title: '#post_title',
    NoTitleError: 'span#post_title-error',

    permalink: {
        productLink: 'span#sample-permalink a',
        permalink: 'span#editable-post-name',
        permalinkEdit: 'button.edit-slug',
        permalinkInput: 'input#new-post-slug',
        confirmPermalinkEdit: 'button.save',
    },

    downloadable: '#\\_downloadable',
    virtual: '#\\_virtual',
    price: '#\\_regular_price',

    discount: {
        discountedPrice: '#\\_sale_price',
        schedule: '//label[@for="_sale_price"]//a[normalize-space()="Schedule"]',
        scheduleCancel: '//label[@for="_sale_price"]//a[normalize-space()="Cancel"]',
        scheduleFrom: 'input[name="_sale_price_dates_from"]',
        scheduleTo: 'input[name="_sale_price_dates_to"]',
        greaterDiscountError: '//div[@class="wc_error_tip i18n_sale_less_than_regular_error" and contains(.,"Please enter in a value less than the regular price.")]',
    },

    category: {
        categoryModal: 'div.dokan-product-category-modal-content',
        openCategoryModal: 'div.dokan-select-product-category.dokan-category-open-modal',
        addNewCategory: 'div.dokan-single-cat-add-btn span',
        selectACategory: '//span[@id="dokan_product_cat_res" and normalize-space(text())="- Select a category -"]',
        searchInput: 'input#dokan-single-cat-search-input',
        searchedResult: '#dokan-cat-search-res-ul li',
        searchedResultText: '(//div[@class="dokan-cat-search-res-item"])[1]',
        categoryOnList: (categoryName: string) => `//span[contains(@class,"dokan-product-category") and normalize-space()="${categoryName}"]`,
        done: '#dokan-single-cat-select-btn',
        categoryAlreadySelectedPopup: 'button.swal2-confirm',
        categoryModalClose: 'span#dokan-category-close-modal',
        selectedCategory: (categoryName: string) => `//div[@id="dokan-category-open-modal"]//span[contains(@class,'dokan-selected-category-product') and normalize-space()="${categoryName}"]`,
        removeSelectedCategory: (categoryName: string) => `//div[@id="dokan-category-open-modal"]//span[contains(@class,'dokan-selected-category-product') and normalize-space()="${categoryName}"]/../../..//span[@class="dokan-select-product-category-remove"]`,
    },

    tags: {
        tagInput: '//select[@id="product_tag_edit"]/..//input[@class="select2-search__field"] | //select[@id="product_tag[]"]/..//input[@class="select2-search__field"]',
        searchedTag: (tagName: string) => `//li[@class="select2-results__option select2-results__option--highlighted"]//span[normalize-space(text())="${tagName}"]`,
        selectedTags: (tagName: string) => `//li[@class="select2-selection__choice" and contains(., "${tagName}")]`,
        removeSelectedTags: (tagName: string) => `//li[@class="select2-selection__choice" and contains(., "${tagName}")]//span[@class="select2-selection__choice__remove"]`,
    },

    image: {
        cover: 'a.dokan-feat-image-btn',
        uploadImageText: '//a[normalize-space(text())="Upload a product cover image"]',
        coverImageDiv: 'div.dokan-new-product-featured-img, div.dokan-feat-image-upload',
        removeFeatureImage: 'a.dokan-remove-feat-image',
        uploadedFeatureImage: 'div.dokan-new-product-featured-img img, div.dokan-feat-image-upload img',
        gallery: 'a.add-product-images',
        galleryImageDiv: '(//div[@class="dokan-product-gallery"]//li[contains(@class,"image")])[1]',
        removeGalleryImage: '(//a[@class="action-delete"])[1]',
        uploadedGalleryImage: 'div.dokan-product-gallery img',
    },

    shortDescription: {
        shortDescriptionIframe: '.dokan-product-short-description iframe',
        shortDescriptionHtmlBody: '#tinymce',
    },

    description: {
        descriptionIframe: '.dokan-product-description iframe',
        descriptionHtmlBody: '#tinymce',
    },

    inventory: {
        sku: '#\\_sku',
        stockStatus: '#\\_stock_status',
        enableStockManagement: '#\\_manage_stock',
        stockQuantity: '//input[@name="_stock"]',
        lowStockThreshold: '//input[@name="_low_stock_amount"]',
        allowBackorders: '#\\_backorders',
        allowOnlyOneQuantity: '#\\_sold_individually',
    },

    downloadableOptions: {
        addFile: 'a.insert-file-row.dokan-btn',
        fileName: '(//input[@placeholder="File Name"])[last()]',
        fileUrl: '(//input[@placeholder="https://"])[last()]',
        chooseFile: '(//a[contains(@class,"upload_file_button")])[last()]',
        deleteFile: 'a.dokan-product-delete',
        downloadLimit: '#\\_download_limit',
        downloadExpiry: '#\\_download_expiry',
    },

    geolocation: {
        sameAsStore: '#\\_dokan_geolocation_use_store_settings',
        productLocation: '#\\_dokan_geolocation_product_location',
    },

    euComplianceFields: {
        saleLabel: 'select#_sale_price_label',
        saleRegularLabel: 'select#_sale_price_regular_label',
        unit: 'select#_unit',
        minimumAge: 'select#_min_age',
        productUnits: 'input#_unit_product',
        basePriceUnits: 'input#_unit_base',
        freeShipping: 'input#_free_shipping',
        regularUnitPrice: 'input#_unit_price_regular',
        saleUnitPrice: 'input#_unit_price_sale',
        optionalMiniDescription: {
            descriptionIframe: '.dokan-product-description iframe',
            descriptionHtmlBody: '#tinymce',
        },
    },

    addon: {
        addonForm: 'div.wc-pao-addon.open',
        addField: 'button.wc-pao-add-field',
        type: 'select#wc-pao-addon-content-type-0',
        displayAs: 'select#wc-pao-addon-content-display-0',
        titleRequired: 'input#wc-pao-addon-content-name-0',
        formatTitle: 'select#wc-pao-addon-content-title-format',
        addDescription: 'input#wc-pao-addon-description-enable-0',
        descriptionInput: 'textarea#wc-pao-addon-description-0',
        requiredField: 'input#wc-pao-addon-required-0',
        import: 'button.wc-pao-import-addons',
        export: 'button.wc-pao-export-addons',
        importInput: 'textarea.wc-pao-import-field',
        exportInput: 'textarea.wc-pao-export-field',
        excludeAddons: 'input#\\_product_addons_exclude_global',
        addonRow: (addon: string) => `//h3[@class="wc-pao-addon-name" and contains(text(), '${addon}')]/../..`,
        removeAddon: (addon: string) => `//h3[@class="wc-pao-addon-name" and contains(text(), '${addon}')]/../..//button[contains(@class, "wc-pao-remove-addon")]`,
        confirmRemove: 'button.swal2-confirm',
        option: {
            enterAnOption: '//input[@placeholder="Enter an option"]',
            optionPriceType: 'select.wc-pao-addon-option-price-type',
            optionPriceInput: 'div.wc-pao-addon-content-price input.wc_input_price',
        },
    },

    shipping: {
        shippingContainer: 'div.dokan-shipping-container.hide_if_virtual',
        requiresShipping: '#\\_disable_shipping',
        weight: '#\\_weight',
        length: '#\\_length',
        width: '#\\_width',
        height: '#\\_height',
        shippingClass: '#product_shipping_class',
    },

    tax: {
        status: '#\\_tax_status',
        class: '#\\_tax_class',
    },

    linkedProducts: {
        upSells: '//label[contains(text(),"Upsells")]/..//input[@class="select2-search__field"]',
        crossSells: '//label[contains(text(),"Cross-sells ")]/..//input[@class="select2-search__field"]',
        searchedResult: (productName: string) => `//li[contains(text(), "${productName}") and @class="select2-results__option select2-results__option--highlighted"]`,
        selectedUpSellProduct: (productName: string) => `//select[@id="upsell_ids"]/..//li[@class="select2-selection__choice" and contains(., "${productName}")]`,
        selectedCrossSellProduct: (productName: string) => `//select[@id="crosssell_ids"]/..//li[@class="select2-selection__choice" and contains(., "${productName}")]`,
        removeSelectedUpSellProduct: (productName: string) => `//select[@id="upsell_ids"]/..//li[@class="select2-selection__choice" and contains(., "${productName}")]//span[@class="select2-selection__choice__remove"]`,
        removeSelectedCrossSellProduct: (productName: string) => `//select[@id="crosssell_ids"]/..//li[@class="select2-selection__choice" and contains(., "${productName}")]//span[@class="select2-selection__choice__remove"]`,
    },

    attribute: {
        customAttribute: 'select#predefined_attribute',
        addAttribute: 'a.add_new_attribute',
        disabledAttribute: (attribute: string) => `//select[@id="predefined_attribute"]//option[normalize-space(text())='${attribute}']`,
        visibleOnTheProductPage: '//input[contains(@name, "attribute_visibility")]',
        attributeTerms: 'div.dokan-attribute-values li.select2-selection__choice',
        selectAll: 'button.dokan-select-all-attributes',
        addNew: 'button.dokan-add-new-attribute',
        attributeTermInput: 'div.swal2-modal input.swal2-input',
        confirmAddAttributeTerm: 'button.swal2-confirm',
        selectedAttributeTerm: (attributeTerm: string) => `//li[text()='${attributeTerm}']`,
        removeSelectedAttributeTerm: (attributeTerm: string) => `//li[text()='${attributeTerm}']//span`,
        saveAttribute: 'a.dokan-save-attribute',
        savedAttribute: (attributeName: string) => `//span[i and strong[normalize-space(text())="${attributeName}"]]/../..`,
        removeAttribute: (attributeName: string) => `//strong[normalize-space(text())="${attributeName}"]/../..//a[@class="dokan-product-remove-attribute"]`,
        confirmRemoveAttribute: 'button.swal2-confirm',
    },

    bulkDiscount: {
        enableBulkDiscount: 'input#\\_is_lot_discount',
        lotMinimumQuantity: 'input#\\_lot_discount_quantity',
        lotDiscountInPercentage: 'input#\\_lot_discount_amount',
    },

    rma: {
        overrideDefaultRmaSettings: '#dokan_rma_product_override',
        label: '#dokan-rma-label',
        type: '#dokan-warranty-type',
        length: '#dokan-warranty-length',
        lengthValue: '//input[@name="warranty_length_value"]',
        lengthDuration: '#dokan-warranty-length-duration',
        addonCost: 'input#warranty_addon_price\\[\\]',
        addonDurationLength: 'input#warranty_addon_length\\[\\]',
        addonDurationType: 'select#warranty_addon_duration\\[\\]',
        refundReasonsFirst: '(//label[normalize-space()="Refund Reasons:"]/..//input)[1]',
        refundReasons: '//label[normalize-space()="Refund Reasons:"]/..//input',
        rmaPolicyIframe: '#wp-warranty_policy-wrap iframe',
        rmaPolicyHtmlBody: '#tinymce',
    },

    wholesale: {
        enableWholesale: '#wholesale\\[enable_wholesale\\]',
        wholesalePrice: '#dokan-wholesale-price',
        minimumQuantity: '#dokan-wholesale-qty',
    },

    minMax: {
        minimumQuantity: 'input#min_quantity',
        maximumQuantity: 'input#max_quantity',
    },

    otherOptions: {
        productStatus: '#post_status, #status',
        visibility: '#\\_visibility',
        purchaseNote: '#\\_purchase_note',
        enableProductReviews: '#\\_enable_reviews, #comment_status',
    },

    catalogMode: {
        removeAddToCart: '#catalog_mode_hide_add_to_cart_button',
        hideProductPrice: '#catalog_mode_hide_product_price',
    },

    saveProduct: 'input#publish',
    updatedSuccessMessage: 'div.dokan-message',
};

// ============================================================================
// PRODUCT DETAILS (single product-edit screen) — vendor
// ============================================================================
export class ProductsPage {
    readonly page: Page;
    private cachedProductEditNonce: string | null = null;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // Fetch a session-valid product-edit nonce live from the vendor dashboard
    // (window.dokan.product_edit_nonce). The static PRODUCT_EDIT_NONCE env var goes stale between
    // auth runs (esp. under NO_SETUP=true); a stale nonce makes the edit URL silently fall back to
    // the product listing, so reading it live keeps the by-id edit navigation deterministic.
    async getProductEditNonce(): Promise<string> {
        if (this.cachedProductEditNonce) return this.cachedProductEditNonce;
        await this.goIfNotThere(subUrls.products);
        const nonce = await this.page.evaluate(() => (window as unknown as { dokan?: { product_edit_nonce?: string } }).dokan?.product_edit_nonce);
        if (!nonce) throw new Error('Unable to read window.dokan.product_edit_nonce from the vendor products page');
        this.cachedProductEditNonce = nonce;
        return nonce;
    }

    // ------------------------------------------------------------------
    // Base-class helpers inlined as raw Playwright
    // ------------------------------------------------------------------

    private createUrl(subPath: string): string {
        return toPath(subPath);
    }

    private isCurrentUrl(subPath: string): boolean {
        const currentURL = this.page.url().replace(/[/]$/, '');
        return currentURL === this.createUrl(subPath).replace(/[/]$/, '');
    }

    async goIfNotThere(subPath: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' = 'domcontentloaded'): Promise<void> {
        if (this.isCurrentUrl(subPath)) return;
        const url = this.createUrl(subPath);
        await this.toPass(async () => {
            await this.page.goto(url, { waitUntil });
            expect(this.page.url()).toMatch(subPath);
        });
    }

    async gotoUntilNetworkidle(subPath: string): Promise<void> {
        await this.page.goto(this.createUrl(subPath), { waitUntil: 'load' });
    }

    // ---- clicks ----
    async click(selector: string): Promise<void> {
        await this.page.locator(selector).click();
    }

    async clickFirstLocator(selector: string): Promise<void> {
        await this.page.locator(selector).first().click();
    }

    async clickIfVisible(selector: string): Promise<void> {
        if (await this.isVisible(selector, 1)) {
            await this.click(selector);
        }
    }

    async clickAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<void> {
        const element = this.page.locator(selector);
        await element.scrollIntoViewIfNeeded();
        await element.waitFor({ state: 'visible' });
        await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), element.click()]);
    }

    async clickAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200): Promise<void> {
        const [, response] = await Promise.all([
            this.page.waitForLoadState('load'),
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).click(),
        ]);
        expect(response.status()).toBe(code);
    }

    async clickAndWaitForResponseAndLoadStateUntilNetworkIdle(subUrl: string, selector: string, code = 200): Promise<void> {
        const [, response] = await Promise.all([
            this.page.waitForLoadState('load'),
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).click(),
        ]);
        expect(response.status()).toBe(code);
    }

    // ---- inputs ----
    async clearAndType(selector: string, text: string): Promise<void> {
        await this.page.locator(selector).fill(text);
    }

    async type(selector: string, text: string): Promise<void> {
        await this.page.locator(selector).pressSequentially(text, { delay: 100 });
    }

    async typeFrameSelector(frame: string, frameSelector: string, text: string): Promise<void> {
        await this.page.frameLocator(frame).locator(frameSelector).fill(text);
    }

    async typeAndWaitForResponse(subUrl: string, selector: string, text: string, code = 200): Promise<void> {
        await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).fill(text)]);
    }

    // ---- selects ----
    async selectByValue(selector: string, value: string): Promise<string[]> {
        return await this.page.selectOption(selector, { value });
    }

    async selectByLabel(selector: string, value: string): Promise<string[]> {
        return await this.page.selectOption(selector, { label: value });
    }

    // ---- keyboard ----
    async press(key: string): Promise<void> {
        await this.page.keyboard.press(key);
    }

    // ---- check/uncheck ----
    async check(selector: string): Promise<void> {
        await this.toPass(async () => {
            await this.page.locator(selector).check();
            await expect(this.page.locator(selector)).toBeChecked({ timeout: 200 });
        });
    }

    async uncheck(selector: string): Promise<void> {
        await this.page.uncheck(selector);
    }

    async checkMultiple(selector: string): Promise<void> {
        for (const element of await this.page.locator(selector).all()) {
            await this.toPass(async () => {
                await element.check();
                await expect(element).toBeChecked();
            });
        }
    }

    // ---- hover/focus ----
    async hover(selector: string): Promise<void> {
        await this.page.locator(selector).hover();
    }

    async focus(selector: string): Promise<void> {
        await this.page.focus(selector);
    }

    // ---- file/media ----
    async uploadFile(selector: string, files: string | string[]): Promise<void> {
        await this.page.setInputFiles(selector, files);
    }

    async uploadMedia(file: string): Promise<void> {
        await this.click(wpMedia.mediaLibrary);
        const uploadedMediaIsVisible = await this.isVisible(wpMedia.uploadedMediaFirst, 3);
        if (uploadedMediaIsVisible) {
            await this.click(wpMedia.uploadedMediaFirst);
        } else {
            await this.click(wpMedia.uploadFiles);
            await this.uploadFile(wpMedia.selectFilesInput, file);
        }
        await this.toPass(async () => {
            const isSelected = await this.page.locator(wpMedia.select).isEnabled();
            if (!isSelected) {
                await this.click(wpMedia.selectUploadedMedia);
            }
            await expect(this.page.locator(wpMedia.select)).toBeEnabled();
        });
        await this.click(wpMedia.select);
        await this.clickIfVisible(wpMedia.crop);
    }

    // ---- element helpers ----
    async isVisible(selector: string, timeout = 2): Promise<boolean> {
        const start = Date.now();
        let interval = 20;
        while (Date.now() - start < timeout * 1000) {
            try {
                if (await this.page.locator(selector).isVisible()) return true;
            } catch {
                /* empty */
            }
            await this.page.waitForTimeout(interval);
            if (interval === 20) interval = 100;
            else if (interval === 100) interval = 500;
        }
        return false;
    }

    async removeAttribute(selector: string, attribute: string): Promise<void> {
        await this.page.locator(selector).evaluate((el, attr) => el.removeAttribute(attr), attribute);
    }

    async getElementCount(selector: string): Promise<number> {
        return await this.page.locator(selector).count();
    }

    // ---- assertions ----
    async toBeVisible(selector: string, options?: { timeout?: number }): Promise<void> {
        await expect(this.page.locator(selector)).toBeVisible(options);
    }

    async notToBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeHidden();
    }

    async toContainText(selector: string, text: string | RegExp): Promise<void> {
        await expect(this.page.locator(selector)).toContainText(text);
    }

    async toContainTextFrameLocator(frame: string, frameSelector: string, text: string | RegExp): Promise<void> {
        await this.toPass(async () => {
            await expect(this.page.frameLocator(frame).locator(frameSelector)).toContainText(text);
        });
    }

    async toBeChecked(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeChecked();
    }

    async notToBeChecked(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).not.toBeChecked();
    }

    async toBeCheckedMultiple(selector: string): Promise<void> {
        for (const element of await this.page.locator(selector).all()) {
            await expect(element).toBeChecked();
        }
    }

    async toBeDisabled(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeDisabled();
    }

    async toHaveValue(selector: string, value: string | RegExp): Promise<void> {
        await expect(this.page.locator(selector)).toHaveValue(value);
    }

    async toHaveSelectedValue(selector: string, value: string): Promise<void> {
        await this.toPass(async () => {
            const selectValue = await this.page.locator(selector).evaluate((select: HTMLSelectElement) => select.value);
            expect(selectValue).toBe(value);
        });
    }

    async toHaveSelectedLabel(selector: string, value: string): Promise<void> {
        await this.toPass(async () => {
            const selectedText = await this.page.locator(selector).evaluate((select: HTMLSelectElement) => select.options[select.selectedIndex]?.text);
            expect(selectedText).toBe(value);
        });
    }

    async toHaveAttribute(selector: string, attribute: string, value: string | RegExp): Promise<void> {
        await expect(this.page.locator(selector)).toHaveAttribute(attribute, value);
    }

    async toHaveCount(selector: string, count: number): Promise<void> {
        await expect(this.page.locator(selector)).toHaveCount(count);
    }

    async notToHaveCount(selector: string, count: number): Promise<void> {
        await this.page.waitForLoadState('domcontentloaded');
        await expect(this.page.locator(selector)).not.toHaveCount(count);
    }

    async toPass(asyncFn: () => Promise<void>, options?: { timeout?: number; intervals?: number[] }): Promise<void> {
        await expect(async () => {
            await asyncFn();
        }).toPass(options);
    }

    // ------------------------------------------------------------------
    // Navigation
    // ------------------------------------------------------------------

    // search product on vendor dashboard
    async searchProduct(productName: string): Promise<void> {
        await this.goIfNotThere(subUrls.products);
        await this.clearAndType(productsVendor.search.searchInput, productName);
        await this.clickAndWaitForResponse(subUrls.products, productsVendor.search.searchBtn);
        await this.toBeVisible(productsVendor.productLink(productName));
    }

    // go to product edit (search-based, name is not numeric)
    async goToProductEdit(productName: string): Promise<void> {
        await this.searchProduct(productName);
        await this.removeAttribute(productsVendor.rowActions(productName), 'class'); // forcing the row actions to be visible, to avoid flakiness
        await this.hover(productsVendor.productCell(productName));
        await this.clickAndWaitForResponseAndLoadStateUntilNetworkIdle(subUrls.products, productsVendor.editProduct(productName));
        await this.toHaveValue(productsVendor.title, productName);
    }

    // go to product edit by id (numeric -> direct nonce URL, else search)
    async goToProductEditById(productId: string, nonce?: string): Promise<void> {
        if (productId && !Number.isNaN(Number(productId))) {
            const editNonce = nonce ?? (await this.getProductEditNonce());
            await this.gotoUntilNetworkidle(subUrls.productEdit(productId, editNonce));
        } else {
            await this.goToProductEdit(productId);
        }
    }

    // save product
    async saveProduct(): Promise<void> {
        // The classic product editor binds its form-submit handler asynchronously (RankMath SEO /
        // WooCommerce product init). Clicking "Save Product" before that handler is ready silently
        // no-ops the first submit (the save request never fires), so wait for the page to settle,
        // then re-click until the save request actually fires. Mirrors tests/e2e/products/productsPage.ts.
        await this.page.waitForLoadState('networkidle');
        await this.toPass(
            async () => {
                const [response] = await Promise.all([
                    this.page.waitForResponse(resp => resp.url().includes(subUrls.products) && resp.status() === 200, { timeout: 15000 }),
                    this.page.locator(productsVendor.saveProduct).click(),
                ]);
                expect(response.status()).toBe(200);
            },
            { intervals: [1000, 2000, 3000], timeout: 90000 },
        );
        await this.toContainText(productsVendor.updatedSuccessMessage, messages.productSaved);
    }

    // ------------------------------------------------------------------
    // Product options
    // ------------------------------------------------------------------

    // add product title
    async addProductTitle(productName: string, title: string): Promise<void> {
        await this.goToProductEditById(productName);
        await this.clearAndType(productsVendor.title, title);
        await this.saveProduct();
        await this.toHaveValue(productsVendor.title, title);
    }

    // add product permalink
    async addProductPermalink(productName: string, permalink: string): Promise<void> {
        await this.goToProductEditById(productName);
        await this.click(productsVendor.permalink.permalinkEdit);
        await this.clearAndType(productsVendor.permalink.permalinkInput, permalink);
        await this.clickAndWaitForResponse(subUrls.ajax, productsVendor.permalink.confirmPermalinkEdit);
        await this.saveProduct();
        await this.toContainText(productsVendor.permalink.permalink, slugify(permalink));
    }

    // add product price
    async addPrice(productName: string, price: string): Promise<void> {
        await this.goToProductEditById(productName);
        await this.clearAndType(productsVendor.price, price);
        await this.saveProduct();
        await this.toHaveValue(productsVendor.price, price);
    }

    // remove product price
    async removePrice(productName: string): Promise<void> {
        await this.goToProductEditById(productName);
        await this.clearAndType(productsVendor.price, '');
        await this.saveProduct();
        await this.toHaveValue(productsVendor.price, '');
    }

    // can't add product discount greater than regular price
    async cantAddGreaterDiscount(productName: string, discount: product['discount']): Promise<void> {
        const regularPrice = discount.regularPrice.replace('.', ',');
        const discountPrice = String(Number(discount.regularPrice) + Number(discount.discountPrice)).replace('.', ',');
        await this.goToProductEditById(productName);
        await this.clearAndType(productsVendor.price, regularPrice);
        await this.type(productsVendor.discount.discountedPrice, discountPrice);
        await this.toBeVisible(productsVendor.discount.greaterDiscountError);
    }

    // add product discount
    async addDiscount(productName: string, discount: product['discount'], schedule = false, hasSchedule = false): Promise<void> {
        const regularPrice = discount.regularPrice.replace('.', ',');
        const discountPrice = String(Number(discount.regularPrice) - Number(discount.discountPrice)).replace('.', ',');
        await this.goToProductEditById(productName);
        await this.clearAndType(productsVendor.price, regularPrice);
        await this.clearAndType(productsVendor.discount.discountedPrice, discountPrice);
        if (schedule) {
            if (!hasSchedule) await this.click(productsVendor.discount.schedule);
            await this.clearAndType(productsVendor.discount.scheduleFrom, discount.startDate!);
            await this.clearAndType(productsVendor.discount.scheduleTo, discount.endDate!);
        }
        await this.saveProduct();
        await this.toHaveValue(productsVendor.discount.discountedPrice, discountPrice);
        if (schedule) {
            await this.toBeVisible(productsVendor.discount.scheduleCancel);
            await this.toHaveValue(productsVendor.discount.scheduleFrom, discount.startDate!);
            await this.toHaveValue(productsVendor.discount.scheduleTo, discount.endDate!);
        }
    }

    // remove product discount
    async removeDiscount(productName: string, schedule = false): Promise<void> {
        await this.goToProductEditById(productName);
        await this.clearAndType(productsVendor.discount.discountedPrice, '');
        if (schedule) {
            await this.click(productsVendor.discount.scheduleCancel);
        }
        await this.saveProduct();
        await this.toHaveValue(productsVendor.discount.discountedPrice, '');
        if (schedule) {
            await this.toBeVisible(productsVendor.discount.schedule);
            await this.notToBeVisible(productsVendor.discount.scheduleFrom);
            await this.notToBeVisible(productsVendor.discount.scheduleTo);
        }
    }

    // vendor add product category (single/multiple, neg = expect disabled)
    private async vendorAddProductCategory(category: string, multiple: boolean, neg?: boolean): Promise<void> {
        if (!multiple) {
            await this.click(productsVendor.category.openCategoryModal);
        } else {
            await this.click(productsVendor.category.addNewCategory);
            // In multiple-category (Pro) mode the product already renders a trailing empty
            // "- Select a category -" selector by default, so clicking "+ Add new category"
            // leaves TWO empty selectors on the page. Open the one we just appended (last)
            // instead of letting the plain locator trip strict mode on both.
            await this.page.locator(productsVendor.category.selectACategory).last().click();
        }
        await this.toBeVisible(productsVendor.category.categoryModal);
        await this.type(productsVendor.category.searchInput, category);
        await this.toContainText(productsVendor.category.searchedResultText, category);
        await this.click(productsVendor.category.searchedResult);
        await this.click(productsVendor.category.categoryOnList(category));
        if (neg) {
            await this.toBeDisabled(productsVendor.category.done);
            return;
        }
        await this.click(productsVendor.category.done);

        const categoryAlreadySelectedPopup = await this.isVisible(productsVendor.category.categoryAlreadySelectedPopup);
        if (categoryAlreadySelectedPopup) {
            await this.click(productsVendor.category.categoryAlreadySelectedPopup);
            await this.click(productsVendor.category.categoryModalClose);
        }
        await this.toBeVisible(productsVendor.category.selectedCategory(category));
    }

    // add product category
    async addProductCategory(productName: string, categories: string[], multiple = false): Promise<void> {
        await this.goToProductEditById(productName);
        for (const category of categories) {
            await this.vendorAddProductCategory(category, multiple);
        }
        await this.saveProduct();
        for (const category of categories) {
            await this.toBeVisible(productsVendor.category.selectedCategory(category));
        }
    }

    // remove product category
    async removeProductCategory(productName: string, categories: string[]): Promise<void> {
        await this.goToProductEditById(productName);
        for (const category of categories) {
            await this.click(productsVendor.category.removeSelectedCategory(category));
            await this.notToBeVisible(productsVendor.category.selectedCategory(category));
        }
        await this.saveProduct();
        for (const category of categories) {
            await this.notToBeVisible(productsVendor.category.selectedCategory(category));
        }
    }

    // can't add product category
    async cantAddCategory(productName: string, category: string): Promise<void> {
        await this.goToProductEditById(productName);
        await this.vendorAddProductCategory(category, false, true);
    }

    // add product tags
    async addProductTags(productName: string, tags: string[]): Promise<void> {
        await this.goToProductEditById(productName);
        for (const tag of tags) {
            await this.typeAndWaitForResponse(subUrls.ajax, productsVendor.tags.tagInput, tag);
            await this.click(productsVendor.tags.searchedTag(tag));
            await this.toBeVisible(productsVendor.tags.selectedTags(tag));
        }
        await this.saveProduct();
        for (const tag of tags) {
            await this.toBeVisible(productsVendor.tags.selectedTags(tag));
        }
    }

    // remove product tags
    async removeProductTags(productName: string, tags: string[]): Promise<void> {
        await this.goToProductEditById(productName);
        for (const tag of tags) {
            await this.click(productsVendor.tags.removeSelectedTags(tag));
            await this.press('Escape'); // shift focus from element
        }
        await this.saveProduct();
        for (const tag of tags) {
            await this.notToBeVisible(productsVendor.tags.selectedTags(tag));
        }
    }

    // add product cover image
    async addProductCoverImage(productName: string, coverImage: string, removePrevious = false): Promise<void> {
        await this.goToProductEditById(productName);
        // remove previous cover image
        if (removePrevious) {
            await this.hover(productsVendor.image.coverImageDiv);
            await this.click(productsVendor.image.removeFeatureImage);
            await this.toBeVisible(productsVendor.image.uploadImageText);
        }
        await this.click(productsVendor.image.cover);
        await this.uploadMedia(coverImage);
        await this.saveProduct();
        await this.toHaveAttribute(productsVendor.image.uploadedFeatureImage, 'src', /.+/); // Ensures 'src' has any non-falsy value
        await this.notToBeVisible(productsVendor.image.uploadImageText);
    }

    // remove product cover image
    async removeProductCoverImage(productName: string): Promise<void> {
        await this.goToProductEditById(productName);
        await this.hover(productsVendor.image.coverImageDiv);
        await this.click(productsVendor.image.removeFeatureImage);
        await this.saveProduct();
        await this.toHaveAttribute(productsVendor.image.uploadedFeatureImage, 'src', /^$/);
        await this.toBeVisible(productsVendor.image.uploadImageText);
    }

    // add product gallery images
    async addProductGalleryImages(productName: string, galleryImages: string[], removePrevious = false): Promise<void> {
        await this.goToProductEditById(productName);
        // remove previous gallery images
        if (removePrevious) {
            await this.removeGalleryImages();
        }
        for (const galleryImage of galleryImages) {
            await this.click(productsVendor.image.gallery);
            await this.uploadMedia(galleryImage);
        }
        await this.saveProduct();
        await this.toHaveCount(productsVendor.image.uploadedGalleryImage, galleryImages.length);
    }

    // remove product gallery images (in-place, no save)
    private async removeGalleryImages(): Promise<void> {
        const imageCount = await this.getElementCount(productsVendor.image.uploadedGalleryImage);
        for (let i = 0; i < imageCount; i++) {
            await this.hover(productsVendor.image.galleryImageDiv);
            await this.click(productsVendor.image.removeGalleryImage);
        }
        await this.toHaveCount(productsVendor.image.uploadedGalleryImage, 0);
    }

    // remove product gallery images
    async removeProductGalleryImages(productName: string): Promise<void> {
        await this.goToProductEditById(productName);
        await this.removeGalleryImages();
        await this.saveProduct();
        await this.toHaveCount(productsVendor.image.uploadedGalleryImage, 0);
    }

    // add product short description
    async addProductShortDescription(productName: string, shortDescription: string): Promise<void> {
        await this.goToProductEditById(productName);
        await this.typeFrameSelector(productsVendor.shortDescription.shortDescriptionIframe, productsVendor.shortDescription.shortDescriptionHtmlBody, shortDescription);
        await this.saveProduct();
        await this.toContainTextFrameLocator(productsVendor.shortDescription.shortDescriptionIframe, productsVendor.shortDescription.shortDescriptionHtmlBody, shortDescription);
    }

    // add product description
    async addProductDescription(productName: string, description: string): Promise<void> {
        await this.goToProductEditById(productName);
        await this.typeFrameSelector(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, description);
        await this.saveProduct();
        await this.toContainTextFrameLocator(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, description);
    }

    // add product downloadable options
    async addProductDownloadableOptions(productName: string, downloadableOption: product['productInfo']['downloadableOptions']): Promise<void> {
        await this.goToProductEditById(productName);
        await this.check(productsVendor.downloadable);
        await this.click(productsVendor.downloadableOptions.addFile);
        await this.clearAndType(productsVendor.downloadableOptions.fileName, downloadableOption.fileName);
        await this.click(productsVendor.downloadableOptions.chooseFile);
        await this.uploadMedia(downloadableOption.fileUrl);
        await this.clearAndType(productsVendor.downloadableOptions.downloadLimit, downloadableOption.downloadLimit);
        await this.clearAndType(productsVendor.downloadableOptions.downloadExpiry, downloadableOption.downloadExpiry);
        await this.saveProduct();
        await this.toBeChecked(productsVendor.downloadable);
        await this.toHaveValue(productsVendor.downloadableOptions.fileName, downloadableOption.fileName);
        await this.toHaveValue(productsVendor.downloadableOptions.downloadLimit, downloadableOption.downloadLimit);
        await this.toHaveValue(productsVendor.downloadableOptions.downloadExpiry, downloadableOption.downloadExpiry);
    }

    // remove product downloadable files
    async removeDownloadableFile(productName: string, downloadableOption: product['productInfo']['downloadableOptions']): Promise<void> {
        await this.goToProductEditById(productName);
        const fileCount = await this.getElementCount(productsVendor.downloadableOptions.deleteFile);
        for (let i = 0; i < fileCount; i++) {
            await this.clickFirstLocator(productsVendor.downloadableOptions.deleteFile);
        }
        await this.clearAndType(productsVendor.downloadableOptions.downloadLimit, downloadableOption.downloadLimit);
        await this.clearAndType(productsVendor.downloadableOptions.downloadExpiry, downloadableOption.downloadExpiry);
        await this.saveProduct();
        await this.notToBeVisible(productsVendor.downloadableOptions.deleteFile);
        await this.toHaveValue(productsVendor.downloadableOptions.downloadLimit, downloadableOption.downloadLimit);
        await this.toHaveValue(productsVendor.downloadableOptions.downloadExpiry, downloadableOption.downloadExpiry);
    }

    // add product virtual option
    async addProductVirtualOption(productName: string, enable: boolean): Promise<void> {
        await this.goToProductEditById(productName);
        if (enable) {
            await this.check(productsVendor.virtual);
        } else {
            await this.focus(productsVendor.virtual);
            await this.uncheck(productsVendor.virtual);
        }
        await this.saveProduct();
        if (enable) {
            await this.toBeChecked(productsVendor.virtual);
            if (DOKAN_PRO) {
                await this.notToBeVisible(productsVendor.shipping.shippingContainer);
            }
        } else {
            await this.notToBeChecked(productsVendor.virtual);
        }
    }

    // add product inventory (sku, stock-status, stock-management, one-quantity)
    async addProductInventory(productName: string, inventory: product['productInfo']['inventory'], choice: string): Promise<void> {
        await this.goToProductEditById(productName);

        switch (choice) {
            case 'sku':
                await this.clearAndType(productsVendor.inventory.sku, inventory.sku);
                break;
            case 'stock-status':
                await this.selectByValue(productsVendor.inventory.stockStatus, inventory.stockStatus);
                break;
            case 'stock-management':
                await this.check(productsVendor.inventory.enableStockManagement);
                await this.clearAndType(productsVendor.inventory.stockQuantity, inventory.stockQuantity);
                await this.clearAndType(productsVendor.inventory.lowStockThreshold, inventory.lowStockThreshold);
                await this.selectByValue(productsVendor.inventory.allowBackorders, inventory.backorders);
                break;
            case 'one-quantity':
                if (inventory.oneQuantity) {
                    await this.check(productsVendor.inventory.allowOnlyOneQuantity);
                } else {
                    await this.uncheck(productsVendor.inventory.allowOnlyOneQuantity);
                }
                break;
            default:
                break;
        }

        await this.saveProduct();

        switch (choice) {
            case 'sku':
                await this.toHaveValue(productsVendor.inventory.sku, inventory.sku);
                break;
            case 'stock-status':
                await this.toHaveSelectedValue(productsVendor.inventory.stockStatus, inventory.stockStatus);
                break;
            case 'stock-management':
                await this.toBeChecked(productsVendor.inventory.enableStockManagement);
                await this.toHaveValue(productsVendor.inventory.stockQuantity, inventory.stockQuantity);
                await this.toHaveValue(productsVendor.inventory.lowStockThreshold, inventory.lowStockThreshold);
                await this.toHaveSelectedValue(productsVendor.inventory.allowBackorders, inventory.backorders);
                await this.notToBeVisible(productsVendor.inventory.stockStatus);
                break;
            case 'one-quantity':
                if (inventory.oneQuantity) {
                    await this.toBeChecked(productsVendor.inventory.allowOnlyOneQuantity);
                } else {
                    await this.notToBeChecked(productsVendor.inventory.allowOnlyOneQuantity);
                }
                break;
            default:
                break;
        }
    }

    // remove product inventory [stock management]
    async removeProductInventory(productName: string): Promise<void> {
        await this.goToProductEditById(productName);
        await this.uncheck(productsVendor.inventory.enableStockManagement);
        await this.saveProduct();
        await this.notToBeChecked(productsVendor.inventory.enableStockManagement);
    }

    // add product other options (product status, visibility, purchase note, reviews)
    async addProductOtherOptions(productName: string, otherOption: product['productInfo']['otherOptions'], choice: string): Promise<void> {
        await this.goToProductEditById(productName);

        switch (choice) {
            case 'status':
                await this.selectByValue(productsVendor.otherOptions.productStatus, otherOption.status);
                break;
            case 'visibility':
                await this.selectByValue(productsVendor.otherOptions.visibility, otherOption.visibility);
                break;
            case 'purchaseNote':
                await this.clearAndType(productsVendor.otherOptions.purchaseNote, otherOption.purchaseNote);
                break;
            case 'reviews':
                if (otherOption.enableReview) {
                    await this.check(productsVendor.otherOptions.enableProductReviews);
                } else {
                    await this.uncheck(productsVendor.otherOptions.enableProductReviews);
                }
                break;
            default:
                break;
        }

        await this.saveProduct();

        switch (choice) {
            case 'status':
                await this.toHaveSelectedValue(productsVendor.otherOptions.productStatus, otherOption.status);
                break;
            case 'visibility':
                await this.toHaveSelectedValue(productsVendor.otherOptions.visibility, otherOption.visibility);
                break;
            case 'purchaseNote':
                await this.toHaveValue(productsVendor.otherOptions.purchaseNote, otherOption.purchaseNote);
                break;
            case 'reviews':
                if (otherOption.enableReview) {
                    await this.toBeChecked(productsVendor.otherOptions.enableProductReviews);
                } else {
                    await this.notToBeChecked(productsVendor.otherOptions.enableProductReviews);
                }
                break;
            default:
                break;
        }
    }

    // add product catalog mode
    async addProductCatalogMode(productName: string, hidePrice = false): Promise<void> {
        await this.goToProductEditById(productName);
        await this.check(productsVendor.catalogMode.removeAddToCart);
        if (hidePrice) await this.check(productsVendor.catalogMode.hideProductPrice);
        await this.saveProduct();
        await this.toBeChecked(productsVendor.catalogMode.removeAddToCart);
        if (hidePrice) await this.toBeChecked(productsVendor.catalogMode.hideProductPrice);
    }

    // remove product catalog mode
    async removeProductCatalogMode(productName: string, onlyPrice = false): Promise<void> {
        await this.goToProductEditById(productName);

        if (onlyPrice) {
            await this.uncheck(productsVendor.catalogMode.hideProductPrice);
        } else {
            await this.uncheck(productsVendor.catalogMode.removeAddToCart);
        }

        await this.saveProduct();

        if (onlyPrice) {
            await this.notToBeChecked(productsVendor.catalogMode.hideProductPrice);
        } else {
            await this.notToBeChecked(productsVendor.catalogMode.removeAddToCart);
        }
    }

    // ---- dokan pro features ----

    // add product shipping
    async addProductShipping(productName: string, shipping: product['productInfo']['shipping']): Promise<void> {
        await this.goToProductEditById(productName);
        // An earlier test ("vendor can add product virtual option") turns productIdBasic virtual, and
        // the shipping panel is hidden for virtual products (div.dokan-shipping-container.hide_if_virtual).
        // Ensure the product is physical so the shipping fields exist before editing them, instead of
        // relying on the ambient (test-order-dependent) virtual state.
        if (await this.page.locator(productsVendor.virtual).isChecked()) {
            await this.uncheck(productsVendor.virtual);
        }
        await this.toBeVisible(productsVendor.shipping.shippingContainer);
        await this.check(productsVendor.shipping.requiresShipping);
        await this.clearAndType(productsVendor.shipping.weight, shipping.weight);
        await this.clearAndType(productsVendor.shipping.length, shipping.length);
        await this.clearAndType(productsVendor.shipping.width, shipping.width);
        await this.clearAndType(productsVendor.shipping.height, shipping.height);
        await this.selectByLabel(productsVendor.shipping.shippingClass, shipping.shippingClass);
        await this.saveProduct();
        await this.toBeChecked(productsVendor.shipping.requiresShipping);
        await this.toHaveValue(productsVendor.shipping.weight, shipping.weight);
        await this.toHaveValue(productsVendor.shipping.length, shipping.length);
        await this.toHaveValue(productsVendor.shipping.width, shipping.width);
        await this.toHaveValue(productsVendor.shipping.height, shipping.height);
        await this.toHaveSelectedLabel(productsVendor.shipping.shippingClass, shipping.shippingClass);
    }

    // remove product shipping
    async removeProductShipping(productName: string): Promise<void> {
        await this.goToProductEditById(productName);
        await this.uncheck(productsVendor.shipping.requiresShipping);
        await this.saveProduct();
        await this.notToBeChecked(productsVendor.shipping.requiresShipping);
    }

    // add product tax
    async addProductTax(productName: string, tax: product['productInfo']['tax'], hasClass = false): Promise<void> {
        await this.goToProductEditById(productName);
        await this.selectByValue(productsVendor.tax.status, tax.status);
        if (hasClass) await this.selectByValue(productsVendor.tax.class, tax.class);
        await this.saveProduct();
        await this.toHaveSelectedValue(productsVendor.tax.status, tax.status);
        if (hasClass) await this.toHaveSelectedValue(productsVendor.tax.class, tax.class);
    }

    // add product linked products (up-sells, cross-sells)
    async addProductLinkedProducts(productName: string, linkedProducts: product['productInfo']['linkedProducts'], choice: string): Promise<void> {
        await this.goToProductEditById(productName);
        switch (choice) {
            case 'up-sells':
                for (const linkedProduct of linkedProducts.upSells) {
                    await this.typeAndWaitForResponse(subUrls.ajax, productsVendor.linkedProducts.upSells, linkedProduct);
                    await this.click(productsVendor.linkedProducts.searchedResult(linkedProduct));
                    await this.toBeVisible(productsVendor.linkedProducts.selectedUpSellProduct(linkedProduct));
                }
                break;
            case 'cross-sells':
                for (const linkedProduct of linkedProducts.crossSells) {
                    await this.typeAndWaitForResponse(subUrls.ajax, productsVendor.linkedProducts.crossSells, linkedProduct);
                    await this.click(productsVendor.linkedProducts.searchedResult(linkedProduct));
                    await this.toBeVisible(productsVendor.linkedProducts.selectedCrossSellProduct(linkedProduct));
                }
                break;
            default:
                break;
        }

        await this.saveProduct();

        switch (choice) {
            case 'up-sells':
                for (const linkedProduct of linkedProducts.upSells) {
                    await this.toBeVisible(productsVendor.linkedProducts.selectedUpSellProduct(linkedProduct));
                }
                break;
            case 'cross-sells':
                for (const linkedProduct of linkedProducts.crossSells) {
                    await this.toBeVisible(productsVendor.linkedProducts.selectedCrossSellProduct(linkedProduct));
                }
                break;
            default:
                break;
        }
    }

    // remove product linked products (up-sells, cross-sells)
    async removeProductLinkedProducts(productName: string, linkedProducts: product['productInfo']['linkedProducts'], choice: string): Promise<void> {
        await this.goToProductEditById(productName);
        switch (choice) {
            case 'up-sells':
                for (const linkedProduct of linkedProducts.upSells) {
                    await this.click(productsVendor.linkedProducts.removeSelectedUpSellProduct(linkedProduct));
                    await this.press('Escape'); // shift focus from element
                }
                break;
            case 'cross-sells':
                for (const linkedProduct of linkedProducts.crossSells) {
                    await this.click(productsVendor.linkedProducts.removeSelectedCrossSellProduct(linkedProduct));
                    await this.press('Escape'); // shift focus from element
                }
                break;
            default:
                break;
        }

        await this.saveProduct();

        switch (choice) {
            case 'up-sells':
                for (const linkedProduct of linkedProducts.upSells) {
                    await this.notToBeVisible(productsVendor.linkedProducts.selectedUpSellProduct(linkedProduct));
                }
                break;
            case 'cross-sells':
                for (const linkedProduct of linkedProducts.crossSells) {
                    await this.notToBeVisible(productsVendor.linkedProducts.selectedCrossSellProduct(linkedProduct));
                }
                break;
            default:
                break;
        }
    }

    // add product attribute
    async addProductAttribute(productName: string, attribute: product['productInfo']['attribute'], addTerm = false): Promise<void> {
        await this.goToProductEditById(productName);
        await this.selectByLabel(productsVendor.attribute.customAttribute, attribute.attributeName);
        await this.clickAndWaitForResponse(subUrls.ajax, productsVendor.attribute.addAttribute);
        await this.check(productsVendor.attribute.visibleOnTheProductPage);
        await this.click(productsVendor.attribute.selectAll);
        await this.notToHaveCount(productsVendor.attribute.attributeTerms, 0);
        if (addTerm) {
            await this.click(productsVendor.attribute.addNew);
            await this.clearAndType(productsVendor.attribute.attributeTermInput, attribute.attributeTerm);
            await this.clickAndWaitForResponse(subUrls.ajax, productsVendor.attribute.confirmAddAttributeTerm);
            await this.toBeVisible(productsVendor.attribute.selectedAttributeTerm(attribute.attributeTerm));
        }
        await this.clickAndWaitForResponse(subUrls.ajax, productsVendor.attribute.saveAttribute);
        await this.saveProduct();
        await this.toBeVisible(productsVendor.attribute.savedAttribute(attribute.attributeName));
    }

    // can't add already added attribute
    async cantAddAlreadyAddedAttribute(productName: string, attributeName: string): Promise<void> {
        await this.goToProductEditById(productName);
        await this.toBeVisible(productsVendor.attribute.savedAttribute(attributeName));
        await this.toHaveAttribute(productsVendor.attribute.disabledAttribute(attributeName), 'disabled', 'disabled');
    }

    // remove product attribute
    async removeProductAttribute(productName: string, attribute: string): Promise<void> {
        await this.goToProductEditById(productName);
        await this.click(productsVendor.attribute.removeAttribute(attribute));
        await this.click(productsVendor.attribute.confirmRemoveAttribute);
        await this.notToBeVisible(productsVendor.attribute.savedAttribute(attribute));
        await this.saveProduct();
        await this.notToBeVisible(productsVendor.attribute.savedAttribute(attribute));
    }

    // remove product attribute term
    async removeProductAttributeTerm(productName: string, attribute: string, attributeTerm: string): Promise<void> {
        await this.goToProductEditById(productName);
        await this.click(productsVendor.attribute.savedAttribute(attribute));
        await this.click(productsVendor.attribute.removeSelectedAttributeTerm(attributeTerm));
        await this.press('Escape'); // shift focus from element
        await this.notToBeVisible(productsVendor.attribute.selectedAttributeTerm(attributeTerm));
        await this.clickAndWaitForResponse(subUrls.ajax, productsVendor.attribute.saveAttribute);
        await this.saveProduct();
        await this.click(productsVendor.attribute.savedAttribute(attribute));
        await this.notToBeVisible(productsVendor.attribute.selectedAttributeTerm(attributeTerm));
    }

    // add product bulk discount options
    async addProductBulkDiscountOptions(productName: string, quantityDiscount: product['productInfo']['quantityDiscount']): Promise<void> {
        await this.goToProductEditById(productName);
        await this.check(productsVendor.bulkDiscount.enableBulkDiscount);
        await this.clearAndType(productsVendor.bulkDiscount.lotMinimumQuantity, quantityDiscount.minimumQuantity);
        await this.clearAndType(productsVendor.bulkDiscount.lotDiscountInPercentage, quantityDiscount.discountPercentage);
        await this.saveProduct();
        await this.toBeChecked(productsVendor.bulkDiscount.enableBulkDiscount);
        await this.toHaveValue(productsVendor.bulkDiscount.lotMinimumQuantity, quantityDiscount.minimumQuantity);
        await this.toHaveValue(productsVendor.bulkDiscount.lotDiscountInPercentage, quantityDiscount.discountPercentage);
    }

    // remove product bulk discount options
    async removeProductBulkDiscountOptions(productName: string): Promise<void> {
        await this.goToProductEditById(productName);
        await this.uncheck(productsVendor.bulkDiscount.enableBulkDiscount);
        await this.saveProduct();
        await this.notToBeChecked(productsVendor.bulkDiscount.enableBulkDiscount);
    }

    // ---- dokan pro modules ----

    // add product geolocation
    async addProductGeolocation(productName: string, location: string): Promise<void> {
        await this.goToProductEditById(productName);
        await this.uncheck(productsVendor.geolocation.sameAsStore);
        await this.typeAndWaitForResponse(subUrls.gmap, productsVendor.geolocation.productLocation, location);
        await this.press('ArrowDown');
        await this.press('Enter');
        await this.saveProduct();
        await this.notToBeChecked(productsVendor.geolocation.sameAsStore);
        await this.toHaveValue(productsVendor.geolocation.productLocation, location);
    }

    // remove product geolocation
    async removeProductGeolocation(productName: string): Promise<void> {
        await this.goToProductEditById(productName);
        await this.check(productsVendor.geolocation.sameAsStore);
        await this.saveProduct();
        await this.toBeChecked(productsVendor.geolocation.sameAsStore);
    }

    // add product EU compliance
    async addProductEuCompliance(productName: string, euCompliance: product['productInfo']['euCompliance']): Promise<void> {
        await this.goToProductEditById(productName);
        await this.selectByValue(productsVendor.euComplianceFields.saleLabel, euCompliance.saleLabel);
        await this.selectByValue(productsVendor.euComplianceFields.saleRegularLabel, euCompliance.saleRegularLabel);
        await this.selectByValue(productsVendor.euComplianceFields.unit, euCompliance.unit);
        await this.selectByValue(productsVendor.euComplianceFields.minimumAge, euCompliance.minimumAge);
        await this.clearAndType(productsVendor.euComplianceFields.productUnits, euCompliance.productUnits);
        await this.clearAndType(productsVendor.euComplianceFields.basePriceUnits, euCompliance.basePriceUnits);
        if (euCompliance.freeShipping) {
            await this.check(productsVendor.euComplianceFields.freeShipping);
        } else {
            await this.uncheck(productsVendor.euComplianceFields.freeShipping);
        }
        await this.clearAndType(productsVendor.euComplianceFields.regularUnitPrice, euCompliance.regularUnitPrice);
        await this.clearAndType(productsVendor.euComplianceFields.saleUnitPrice, euCompliance.saleUnitPrice);
        await this.typeFrameSelector(productsVendor.euComplianceFields.optionalMiniDescription.descriptionIframe, productsVendor.euComplianceFields.optionalMiniDescription.descriptionHtmlBody, euCompliance.optionalMiniDescription);

        await this.saveProduct();

        await this.toHaveValue(productsVendor.euComplianceFields.saleLabel, euCompliance.saleLabel);
        await this.toHaveValue(productsVendor.euComplianceFields.saleRegularLabel, euCompliance.saleRegularLabel);
        await this.toHaveValue(productsVendor.euComplianceFields.unit, euCompliance.unit);
        await this.toHaveValue(productsVendor.euComplianceFields.minimumAge, euCompliance.minimumAge);
        await this.toHaveValue(productsVendor.euComplianceFields.productUnits, euCompliance.productUnits);
        await this.toHaveValue(productsVendor.euComplianceFields.basePriceUnits, euCompliance.basePriceUnits);
        if (euCompliance.freeShipping) {
            await this.toBeChecked(productsVendor.euComplianceFields.freeShipping);
        } else {
            await this.notToBeChecked(productsVendor.euComplianceFields.freeShipping);
        }
        await this.toHaveValue(productsVendor.euComplianceFields.regularUnitPrice, euCompliance.regularUnitPrice);
        await this.toHaveValue(productsVendor.euComplianceFields.saleUnitPrice, euCompliance.saleUnitPrice);
        await this.toContainTextFrameLocator(productsVendor.euComplianceFields.optionalMiniDescription.descriptionIframe, productsVendor.euComplianceFields.optionalMiniDescription.descriptionHtmlBody, euCompliance.optionalMiniDescription);
    }

    // add product addon
    async addProductAddon(productName: string, addon: product['productInfo']['addon']): Promise<void> {
        await this.goToProductEditById(productName);
        await this.toPass(async () => {
            await this.clickAndWaitForResponse(subUrls.ajax, productsVendor.addon.addField);
            await this.toBeVisible(productsVendor.addon.addonForm);
        });

        await this.selectByValue(productsVendor.addon.type, addon.type);
        await this.selectByValue(productsVendor.addon.displayAs, addon.displayAs);
        await this.clearAndType(productsVendor.addon.titleRequired, addon.title);
        await this.selectByValue(productsVendor.addon.formatTitle, addon.formatTitle);
        await this.check(productsVendor.addon.addDescription);
        await this.clearAndType(productsVendor.addon.descriptionInput, addon.addDescription);
        await this.check(productsVendor.addon.requiredField);
        // option
        await this.clearAndType(productsVendor.addon.option.enterAnOption, addon.enterAnOption);
        await this.selectByValue(productsVendor.addon.option.optionPriceType, addon.optionPriceType);
        await this.clearAndType(productsVendor.addon.option.optionPriceInput, addon.optionPriceInput);
        await this.check(productsVendor.addon.excludeAddons);

        await this.saveProduct();

        await this.toBeVisible(productsVendor.addon.addonRow(addon.title));
        await this.click(productsVendor.addon.addonRow(addon.title));

        await this.toHaveSelectedValue(productsVendor.addon.type, addon.type);
        await this.toHaveSelectedValue(productsVendor.addon.displayAs, addon.displayAs);
        await this.toHaveValue(productsVendor.addon.titleRequired, addon.title);
        await this.toHaveSelectedValue(productsVendor.addon.formatTitle, addon.formatTitle);
        await this.toBeChecked(productsVendor.addon.addDescription);
        await this.toHaveValue(productsVendor.addon.descriptionInput, addon.addDescription);
        await this.toBeChecked(productsVendor.addon.requiredField);
        // option
        await this.toHaveValue(productsVendor.addon.option.enterAnOption, addon.enterAnOption);
        await this.toHaveSelectedValue(productsVendor.addon.option.optionPriceType, addon.optionPriceType);
        await this.toHaveValue(productsVendor.addon.option.optionPriceInput, addon.optionPriceInput);
        await this.toBeChecked(productsVendor.addon.excludeAddons);
    }

    // import addon
    async importAddon(productName: string, addon: string, addonTitle: string): Promise<void> {
        await this.goToProductEditById(productName);
        await this.click(productsVendor.addon.import);
        // The Import button reveals the textarea via a jQuery slideToggle('300') whose completion
        // callback clears it once (`$(this).val('')`). A fill that lands inside that ~300ms window is
        // silently wiped, so nothing is imported and the save produces no addon. Wait past the one-shot
        // clear before filling, then confirm the value survived (retrying as a safety net) so the
        // serialized addon is actually present in the field at save time.
        const importField = this.page.locator(productsVendor.addon.importInput);
        await expect(importField).toBeVisible();
        await this.page.waitForTimeout(600);
        await this.toPass(
            async () => {
                await importField.fill(addon);
                await this.page.waitForTimeout(300);
                await expect(importField).toHaveValue(addon);
            },
            { timeout: 20_000, intervals: [500, 1_000, 1_000] },
        );
        await this.saveProduct();
        await this.toBeVisible(productsVendor.addon.addonRow(addonTitle));
    }

    // export addon
    async exportAddon(productName: string, addon: string): Promise<void> {
        await this.goToProductEditById(productName);
        await this.click(productsVendor.addon.export);
        await this.toContainText(productsVendor.addon.exportInput, addon);
    }

    // remove addon
    async removeAddon(productName: string, addonName: string): Promise<void> {
        await this.goToProductEditById(productName);
        await this.click(productsVendor.addon.removeAddon(addonName));
        await this.click(productsVendor.addon.confirmRemove);
        await this.notToBeVisible(productsVendor.addon.addonRow(addonName));
        await this.saveProduct();
        await this.notToBeVisible(productsVendor.addon.addonRow(addonName));
    }

    // add product rma options
    async addProductRmaOptions(productName: string, rma: vendor['rma']): Promise<void> {
        await this.goToProductEditById(productName);
        await this.check(productsVendor.rma.overrideDefaultRmaSettings);
        await this.clearAndType(productsVendor.rma.label, rma.label);
        await this.selectByValue(productsVendor.rma.type, rma.type);

        if (rma.type === 'included_warranty') {
            await this.selectByValue(productsVendor.rma.length, rma.length);
            if (rma.length === 'limited') {
                await this.clearAndType(productsVendor.rma.lengthValue, rma.lengthValue);
                await this.selectByValue(productsVendor.rma.lengthDuration, rma.lengthDuration);
            }
        } else if (rma.type === 'addon_warranty') {
            await this.clearAndType(productsVendor.rma.addonCost, rma.addon.cost);
            await this.clearAndType(productsVendor.rma.addonDurationLength, rma.addon.durationLength);
            await this.selectByValue(productsVendor.rma.addonDurationType, rma.addon.durationType);
        }
        const refundReasonIsVisible = await this.isVisible(productsVendor.rma.refundReasonsFirst);
        if (refundReasonIsVisible) {
            await this.checkMultiple(productsVendor.rma.refundReasons);
        }
        await this.typeFrameSelector(productsVendor.rma.rmaPolicyIframe, productsVendor.rma.rmaPolicyHtmlBody, rma.refundPolicy);

        await this.saveProduct();

        await this.toBeChecked(productsVendor.rma.overrideDefaultRmaSettings);
        await this.toHaveValue(productsVendor.rma.label, rma.label);
        await this.toHaveSelectedValue(productsVendor.rma.type, rma.type);
        if (rma.type === 'included_warranty') {
            await this.toHaveSelectedValue(productsVendor.rma.length, rma.length);
            if (rma.length === 'limited') {
                await this.toHaveValue(productsVendor.rma.lengthValue, rma.lengthValue);
                await this.toHaveSelectedValue(productsVendor.rma.lengthDuration, rma.lengthDuration);
            }
        } else if (rma.type === 'addon_warranty') {
            await this.toHaveValue(productsVendor.rma.addonCost, rma.addon.cost);
            await this.toHaveValue(productsVendor.rma.addonDurationLength, rma.addon.durationLength);
            await this.toHaveSelectedValue(productsVendor.rma.addonDurationType, rma.addon.durationType);
        }

        if (refundReasonIsVisible) {
            await this.toBeCheckedMultiple(productsVendor.rma.refundReasons);
        }
        await this.toContainTextFrameLocator(productsVendor.rma.rmaPolicyIframe, productsVendor.rma.rmaPolicyHtmlBody, rma.refundPolicy);
    }

    // remove product rma options
    async removeProductRmaOptions(productName: string): Promise<void> {
        await this.goToProductEditById(productName);
        await this.uncheck(productsVendor.rma.overrideDefaultRmaSettings);
        await this.saveProduct();
        await this.notToBeChecked(productsVendor.rma.overrideDefaultRmaSettings);
    }

    // add product wholesale options
    async addProductWholesaleOptions(productName: string, wholesaleOption: product['productInfo']['wholesaleOption']): Promise<void> {
        await this.goToProductEditById(productName);
        await this.check(productsVendor.wholesale.enableWholesale);
        await this.clearAndType(productsVendor.wholesale.wholesalePrice, wholesaleOption.wholesalePrice);
        await this.clearAndType(productsVendor.wholesale.minimumQuantity, wholesaleOption.minimumQuantity);
        await this.saveProduct();
        await this.toBeChecked(productsVendor.wholesale.enableWholesale);
        await this.toHaveValue(productsVendor.wholesale.wholesalePrice, wholesaleOption.wholesalePrice);
        await this.toHaveValue(productsVendor.wholesale.minimumQuantity, wholesaleOption.minimumQuantity);
    }

    // remove product wholesale options
    async removeProductWholesaleOptions(productName: string): Promise<void> {
        await this.goToProductEditById(productName);
        await this.uncheck(productsVendor.wholesale.enableWholesale);
        await this.saveProduct();
        await this.notToBeChecked(productsVendor.wholesale.enableWholesale);
    }

    // add product min-max options
    async addProductMinMaxOptions(productName: string, minMaxOption: product['productInfo']['minMax']): Promise<void> {
        await this.goToProductEditById(productName);
        await this.clearAndType(productsVendor.minMax.minimumQuantity, minMaxOption.minimumProductQuantity);
        await this.clearAndType(productsVendor.minMax.maximumQuantity, minMaxOption.maximumProductQuantity);
        await this.saveProduct();
        await this.toHaveValue(productsVendor.minMax.minimumQuantity, minMaxOption.minimumProductQuantity);
        await this.toHaveValue(productsVendor.minMax.maximumQuantity, minMaxOption.maximumProductQuantity);
    }

    // can't add product min greater than max
    async cantAddGreaterMin(productName: string, minMaxOption: product['productInfo']['minMax']): Promise<void> {
        await this.goToProductEditById(productName);
        // Type the maximum BEFORE the minimum. When the product already carries a maximum quantity
        // (a prior test set one), filling the larger minimum first makes the min-max validation bump
        // the max field up to the minimum, and the new max digits then concatenate onto that value
        // (e.g. "100" + "50" => "10050"). Filling max first — while the minimum is still small so no
        // premature correction fires — then the minimum, leaves the validation to correct exactly once.
        await this.clearAndType(productsVendor.minMax.maximumQuantity, minMaxOption.maximumProductQuantity);
        await this.clearAndType(productsVendor.minMax.minimumQuantity, minMaxOption.minimumProductQuantity);
        await this.press('Tab'); // to trigger validation
        await this.toHaveValue(productsVendor.minMax.maximumQuantity, minMaxOption.minimumProductQuantity);
        await this.saveProduct();
        await this.toHaveValue(productsVendor.minMax.minimumQuantity, minMaxOption.minimumProductQuantity);
        await this.toHaveValue(productsVendor.minMax.maximumQuantity, minMaxOption.minimumProductQuantity);
    }

    // remove product min-max options
    async removeProductMinMaxOptions(productName: string, minMaxOption: product['productInfo']['minMax']): Promise<void> {
        await this.goToProductEditById(productName);
        await this.clearAndType(productsVendor.minMax.minimumQuantity, minMaxOption.minimumProductQuantity);
        await this.clearAndType(productsVendor.minMax.maximumQuantity, minMaxOption.maximumProductQuantity);
        await this.saveProduct();
        await this.toHaveValue(productsVendor.minMax.minimumQuantity, '0');
        await this.toHaveValue(productsVendor.minMax.maximumQuantity, '0');
    }
}
