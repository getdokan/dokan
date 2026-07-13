import { Page, expect } from '@playwright/test';
import { request as pwRequest, APIRequestContext } from '@playwright/test';
import { closeAnnouncementModal, toPath, parseBoolean } from '@utils/helpers';
import { ApiUtils as RealApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';

// ============================================================================
// Auction Product details functionality — VENDOR de-stub.
//
// Ported from the pre-refactor page object (git e2ec507de:tests/pw/pages/
// vendorAuctionsPage.ts). It drives the classic Simple-Auctions product-edit
// form rendered at /dashboard/auction/?product_id=<id>&action=edit inside the
// vendor dashboard. Every method below is a faithful, raw-Playwright port of
// the original flow/assertions — the base-class helpers (toBeVisible,
// clearAndType, saveProduct, uploadMedia, …) are inlined here.
//
// data / dbData / dbUtils / payloads / ApiUtils are re-exported REAL from
// @utils so the spec's beforeAll seeds real auction products over REST.
// ============================================================================

// Re-export the REAL test data / db + payloads used across the spec.
export { data };
export { dbData } from '@utils/dbData';
export { dbUtils } from '@utils/dbUtils';
export { payloads } from '@utils/payloads';

/**
 * Null-tolerant ApiUtils wrapper (mirrors the convention used by sibling
 * de-stubbed page objects, e.g. vendorReturnRequestPage).
 *
 * The spec constructs `new ApiUtils(null)`. The real ApiUtils requires an
 * APIRequestContext, so when null is passed we lazily create our own context
 * and swap it in before the first real REST call. All higher-level helpers
 * (createProduct, getCategoryId, createProductWithAddon, createAttributeTerm)
 * funnel through get/post/put/delete, so gating those primitives is enough.
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
        if (this.lazyCtx) {
            const ctx = await this.lazyCtx;
            this.lazyCtx = null;
            await ctx.dispose();
            return;
        }
        await super.dispose();
    }
}

// ---- Co-located selectors (inlined from pre-refactor selectors.ts) ----------
// auction.*  == selector.vendor.vAuction.auction
// product.*  == selector.vendor.product
// wpMedia.*  == selector.wpMedia
const selectors = {
    // classic Simple-Auctions product-edit form
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
        enableAutomaticRelisting: '#\\_auction_automatic_relist',
        relistIfFailAfterNHours: '#\\_auction_relist_fail_time',
        relistIfNotPaidAfterNHours: '#\\_auction_relist_not_paid_time',
        relistAuctionDurationInH: '#\\_auction_relist_duration',
        shortDescription: 'textarea#post_excerpt',
        descriptionIframe: '.dokan-auction-post-content iframe',
        descriptionHtmlBody: '#tinymce',
        addAuctionProduct: '//input[@name="update_auction_product"]',
        tags: {
            tagInput: '//div[@class="dokan-form-group dokan-auction-tags"]//input[@class="select2-search__field"]',
            searchedTag: (tagName: string) => `//li[@class="select2-results__option select2-results__option--highlighted" and normalize-space(text())="${tagName}"]`,
            selectedTags: (tagName: string) => `//li[@class="select2-selection__choice" and contains(., "${tagName}")]`,
        },
    },

    // shared product-edit surface (category/tags/image/inventory/…)
    product: {
        updatedSuccessMessage: 'div.dokan-message',

        category: {
            categoryModal: 'div.dokan-product-category-modal-content',
            openCategoryModal: 'div.dokan-select-product-category.dokan-category-open-modal',
            addNewCategory: 'div.dokan-single-cat-add-btn span', // multiple-category mode
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
            selectedTags: (tagName: string) => `//li[@class="select2-selection__choice" and contains(., "${tagName}")]`,
            removeSelectedTags: (tagName: string) => `//li[@class="select2-selection__choice" and contains(., "${tagName}")]//span[@class="select2-selection__choice__remove"]`,
        },

        image: {
            cover: 'a.dokan-feat-image-btn',
            uploadImageText: '//a[normalize-space(text())="Upload a product cover image"]',
            coverImageDiv: 'div.dokan-new-product-featured-img, div.dokan-feat-image-upload', // 2nd = auction product
            removeFeatureImage: 'a.dokan-remove-feat-image',
            uploadedFeatureImage: 'div.dokan-new-product-featured-img img, div.dokan-feat-image-upload img', // 2nd = auction product
            gallery: 'a.add-product-images',
            galleryImageDiv: '(//div[@class="dokan-product-gallery"]//li[contains(@class,"image")])[1]',
            removeGalleryImage: '(//a[@class="action-delete"])[1]',
            uploadedGalleryImage: 'div.dokan-product-gallery img',
        },

        downloadable: '#\\_downloadable',
        downloadableOptions: {
            addFile: 'a.insert-file-row.dokan-btn',
            fileName: '(//input[@placeholder="File Name"])[last()]',
            chooseFile: '(//a[contains(@class,"upload_file_button")])[last()]',
            deleteFile: 'a.dokan-product-delete',
            downloadLimit: '#\\_download_limit',
            downloadExpiry: '#\\_download_expiry',
        },

        virtual: '#\\_virtual',

        inventory: {
            sku: '#\\_sku',
            enableStockManagement: '#\\_manage_stock',
        },

        otherOptions: {
            productStatus: '#post_status, #status',
            visibility: '#\\_visibility',
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

        geolocation: {
            sameAsStore: '#\\_dokan_geolocation_use_store_settings',
            productLocation: '#\\_dokan_geolocation_product_location',
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
            excludeAddons: 'input#\\_product_addons_exclude_global',
            import: 'button.wc-pao-import-addons',
            export: 'button.wc-pao-export-addons',
            importInput: 'textarea.wc-pao-import-field',
            exportInput: 'textarea.wc-pao-export-field',
            addonRow: (addon: string) => `//h3[@class="wc-pao-addon-name" and contains(text(), '${addon}')]/../..`,
            removeAddon: (addon: string) => `//h3[@class="wc-pao-addon-name" and contains(text(), '${addon}')]/../..//button[contains(@class, "wc-pao-remove-addon")]`,
            confirmRemove: 'button.swal2-confirm',
            option: {
                enterAnOption: '//input[@placeholder="Enter an option"]',
                optionPriceType: 'select.wc-pao-addon-option-price-type',
                optionPriceInput: 'div.wc-pao-addon-content-price input.wc_input_price',
            },
        },
    },

    // WP media modal (cover / gallery / downloadable file upload)
    wpMedia: {
        uploadFiles: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[@id="menu-item-upload"]',
        mediaLibrary: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[@id="menu-item-browse"]',
        uploadedMediaFirst: '(//div[contains(@class,"attachment-preview")])[1]',
        selectFilesInput: '//div[@class="supports-drag-drop" and @style="position: relative;"]//input[@type="file"]',
        selectUploadedMedia: '(//h2[contains(text(),"Media list")]/..//ul//li)[1]',
        select: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[contains(@class, "media-button-select")]',
        crop: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[contains(@class, "media-button-insert")]',
    },
} as const;

export class AuctionsPage {
    constructor(readonly page: Page) {
        void closeAnnouncementModal(page);
    }

    // ---- internal helpers (raw-Playwright ports of base-class helpers) ------

    // navigate to the auction product edit page by id
    private async goToAuctionProductEditById(productId: string): Promise<void> {
        await this.page.goto(toPath(data.subUrls.frontend.vDashboard.auctionProductEdit(productId)), { waitUntil: 'networkidle' });
    }

    // save the auction product & assert the success message
    private async saveProduct(): Promise<void> {
        const [, response] = await Promise.all([
            this.page.waitForLoadState('load'),
            this.page.waitForResponse(resp => resp.url().includes(data.subUrls.frontend.vDashboard.auction) && resp.status() === 200),
            this.page.locator(selectors.auction.addAuctionProduct).click(),
        ]);
        expect(response.status()).toBe(200);
        await expect(this.page.locator(selectors.product.updatedSuccessMessage)).toContainText('Success! The product has been updated successfully.');
    }

    // click a locator & wait for a matching XHR/response
    private async clickAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<void> {
        await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).click()]);
    }

    // fill a locator & wait for a matching XHR/response
    private async typeAndWaitForResponse(subUrl: string, selector: string, text: string, code = 200): Promise<void> {
        await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).fill(text)]);
    }

    // poll-based visibility check (mirrors base isVisible: up to `timeoutSec`s)
    private async isVisible(selector: string, timeoutSec = 2): Promise<boolean> {
        try {
            await this.page.locator(selector).first().waitFor({ state: 'visible', timeout: timeoutSec * 1000 });
            return true;
        } catch {
            return false;
        }
    }

    // assert a <select> element's selected option label
    private async expectSelectedLabel(selector: string, label: string): Promise<void> {
        await expect.poll(async () => this.page.locator(selector).evaluate((s: HTMLSelectElement) => s.options[s.selectedIndex]?.text)).toBe(label);
    }

    // WP media upload flow: reuse an already-uploaded file, else upload `file`
    private async uploadMedia(file: string): Promise<void> {
        await this.page.locator(selectors.wpMedia.mediaLibrary).click();
        const uploadedMediaIsVisible = await this.isVisible(selectors.wpMedia.uploadedMediaFirst, 3);
        if (uploadedMediaIsVisible) {
            await this.page.locator(selectors.wpMedia.uploadedMediaFirst).click();
        } else {
            await this.page.locator(selectors.wpMedia.uploadFiles).click();
            await this.page.setInputFiles(selectors.wpMedia.selectFilesInput, file);
        }

        await expect(async () => {
            const isSelected = await this.page.locator(selectors.wpMedia.select).isEnabled();
            if (!isSelected) {
                await this.page.locator(selectors.wpMedia.selectUploadedMedia).click();
            }
            await expect(this.page.locator(selectors.wpMedia.select)).toBeEnabled();
        }).toPass();

        await this.page.locator(selectors.wpMedia.select).click();
        if (await this.isVisible(selectors.wpMedia.crop, 1)) {
            await this.page.locator(selectors.wpMedia.crop).click();
        }
    }

    // remove all currently-uploaded gallery images
    private async removeGalleryImages(): Promise<void> {
        const imageCount = await this.page.locator(selectors.product.image.uploadedGalleryImage).count();
        for (let i = 0; i < imageCount; i++) {
            await this.page.locator(selectors.product.image.galleryImageDiv).hover();
            await this.page.locator(selectors.product.image.removeGalleryImage).click();
        }
        await expect(this.page.locator(selectors.product.image.uploadedGalleryImage)).toHaveCount(0);
    }

    // add a single category through the category modal (neg = expect Done disabled)
    private async vendorAddProductCategory(category: string, multiple: boolean, neg?: boolean): Promise<void> {
        const c = selectors.product.category;
        if (!multiple) {
            await this.page.locator(c.openCategoryModal).click();
        } else {
            await this.page.locator(c.addNewCategory).click();
            await this.page.locator(c.selectACategory).click();
        }
        await expect(this.page.locator(c.categoryModal)).toBeVisible();
        await this.page.locator(c.searchInput).pressSequentially(category, { delay: 100 });
        await expect(this.page.locator(c.searchedResultText)).toContainText(category);
        await this.page.locator(c.searchedResult).click();
        await this.page.locator(c.categoryOnList(category)).click();
        if (neg) {
            await expect(this.page.locator(c.done)).toBeDisabled();
            return;
        }
        await this.page.locator(c.done).click();

        const categoryAlreadySelectedPopup = await this.isVisible(c.categoryAlreadySelectedPopup);
        if (categoryAlreadySelectedPopup) {
            await this.page.locator(c.categoryAlreadySelectedPopup).click();
            await this.page.locator(c.categoryModalClose).click();
        }
        await expect(this.page.locator(c.selectedCategory(category))).toBeVisible();
    }

    // ---- auction product options (public API used by the spec) --------------

    // add product title
    async addProductTitle(productId: string, title: string): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        await this.page.locator(selectors.auction.productName).fill(title);
        await this.saveProduct();
        await expect(this.page.locator(selectors.auction.productName)).toHaveValue(title);
    }

    // add product category
    async addProductCategory(productId: string, categories: string[], multiple = false): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        for (const category of categories) {
            await this.vendorAddProductCategory(category, multiple);
        }
        await this.saveProduct();
        for (const category of categories) {
            await expect(this.page.locator(selectors.product.category.selectedCategory(category))).toBeVisible();
        }
    }

    // remove product category
    async removeProductCategory(productId: string, categories: string[]): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        for (const category of categories) {
            await this.page.locator(selectors.product.category.removeSelectedCategory(category)).click();
            await expect(this.page.locator(selectors.product.category.selectedCategory(category))).toBeHidden();
        }
        await this.saveProduct();
        for (const category of categories) {
            await expect(this.page.locator(selectors.product.category.selectedCategory(category))).toBeHidden();
        }
    }

    // can't add product category (negative)
    async cantAddCategory(productId: string, category: string): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        await this.vendorAddProductCategory(category, false, true);
    }

    // add product tags
    async addProductTags(productId: string, tags: string[]): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        for (const tag of tags) {
            await this.page.locator(selectors.auction.tags.tagInput).fill(tag);
            await expect(this.page.locator(selectors.auction.tags.searchedTag(tag))).toBeVisible();
            await this.page.locator(selectors.auction.tags.searchedTag(tag)).click();
            await expect(this.page.locator(selectors.auction.tags.selectedTags(tag))).toBeVisible();
        }
        await this.saveProduct();
        for (const tag of tags) {
            await this.page.locator(selectors.auction.tags.tagInput).focus();
            await expect(this.page.locator(selectors.auction.tags.selectedTags(tag))).toBeVisible();
        }
    }

    // remove product tags
    async removeProductTags(productId: string, tags: string[]): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        for (const tag of tags) {
            await this.page.locator(selectors.product.tags.removeSelectedTags(tag)).click();
            await this.page.keyboard.press('Escape'); // shift focus from element
        }
        await this.saveProduct();
        for (const tag of tags) {
            await expect(this.page.locator(selectors.product.tags.selectedTags(tag))).toBeHidden();
        }
    }

    // add product cover image
    async addProductCoverImage(productId: string, coverImage: string, removePrevious = false): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        if (removePrevious) {
            await this.page.locator(selectors.product.image.coverImageDiv).hover();
            await this.page.locator(selectors.product.image.removeFeatureImage).click();
            await expect(this.page.locator(selectors.product.image.uploadImageText)).toBeVisible();
        }
        await this.page.locator(selectors.product.image.cover).click();
        await this.uploadMedia(coverImage);
        await this.saveProduct();
        await expect(this.page.locator(selectors.product.image.uploadedFeatureImage)).toHaveAttribute('src', /.+/); // any non-empty src
        await expect(this.page.locator(selectors.product.image.uploadImageText)).toBeHidden();
    }

    // remove product cover image
    async removeProductCoverImage(productId: string): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        await this.page.locator(selectors.product.image.coverImageDiv).hover();
        await this.page.locator(selectors.product.image.removeFeatureImage).click();
        await this.saveProduct();
        await expect(this.page.locator(selectors.product.image.uploadedFeatureImage)).toHaveAttribute('src', /^$/);
        await expect(this.page.locator(selectors.product.image.uploadImageText)).toBeVisible();
    }

    // add product gallery images
    async addProductGalleryImages(productId: string, galleryImages: string[], removePrevious = false): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        if (removePrevious) {
            await this.removeGalleryImages();
        }
        for (const galleryImage of galleryImages) {
            await this.page.locator(selectors.product.image.gallery).click();
            await this.uploadMedia(galleryImage);
        }
        await this.saveProduct();
        await expect(this.page.locator(selectors.product.image.uploadedGalleryImage)).toHaveCount(galleryImages.length);
    }

    // remove product gallery images
    async removeProductGalleryImages(productId: string): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        await this.removeGalleryImages();
        await this.saveProduct();
        await expect(this.page.locator(selectors.product.image.uploadedGalleryImage)).toHaveCount(0);
    }

    // add product short description
    async addProductShortDescription(productId: string, shortDescription: string): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        await this.page.locator(selectors.auction.shortDescription).fill(shortDescription);
        await this.saveProduct();
        await expect(this.page.locator(selectors.auction.shortDescription)).toHaveValue(shortDescription);
    }

    // add product description (TinyMCE iframe)
    async addProductDescription(productId: string, description: string): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        await this.page.frameLocator(selectors.auction.descriptionIframe).locator(selectors.auction.descriptionHtmlBody).fill(description);
        await this.saveProduct();
        await expect(this.page.frameLocator(selectors.auction.descriptionIframe).locator(selectors.auction.descriptionHtmlBody)).toContainText(description);
    }

    // add product downloadable options
    async addProductDownloadableOptions(productId: string, downloadableOption: any): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        await this.page.locator(selectors.product.downloadable).check();
        await this.page.locator(selectors.product.downloadableOptions.addFile).click();
        await this.page.locator(selectors.product.downloadableOptions.fileName).fill(downloadableOption.fileName);
        await this.page.locator(selectors.product.downloadableOptions.chooseFile).click();
        await this.uploadMedia(downloadableOption.fileUrl);
        await this.page.locator(selectors.product.downloadableOptions.downloadLimit).fill(downloadableOption.downloadLimit);
        await this.page.locator(selectors.product.downloadableOptions.downloadExpiry).fill(downloadableOption.downloadExpiry);
        await this.saveProduct();
        await expect(this.page.locator(selectors.product.downloadable)).toBeChecked();
        await expect(this.page.locator(selectors.product.downloadableOptions.fileName)).toHaveValue(downloadableOption.fileName);
        await expect(this.page.locator(selectors.product.downloadableOptions.downloadLimit)).toHaveValue(downloadableOption.downloadLimit);
        await expect(this.page.locator(selectors.product.downloadableOptions.downloadExpiry)).toHaveValue(downloadableOption.downloadExpiry);
    }

    // remove product downloadable file
    async removeDownloadableFile(productId: string, downloadableOption: any): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        const fileCount = await this.page.locator(selectors.product.downloadableOptions.deleteFile).count();
        for (let i = 0; i < fileCount; i++) {
            await this.page.locator(selectors.product.downloadableOptions.deleteFile).first().click();
        }
        await this.page.locator(selectors.product.downloadableOptions.downloadLimit).fill(downloadableOption.downloadLimit);
        await this.page.locator(selectors.product.downloadableOptions.downloadExpiry).fill(downloadableOption.downloadExpiry);
        await this.saveProduct();
        await expect(this.page.locator(selectors.product.downloadableOptions.deleteFile)).toBeHidden();
        await expect(this.page.locator(selectors.product.downloadableOptions.downloadLimit)).toHaveValue(downloadableOption.downloadLimit);
        await expect(this.page.locator(selectors.product.downloadableOptions.downloadExpiry)).toHaveValue(downloadableOption.downloadExpiry);
    }

    // add product virtual option
    async addProductVirtualOption(productId: string, enable: boolean): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        if (enable) {
            await this.page.locator(selectors.product.virtual).check();
        } else {
            await this.page.locator(selectors.product.virtual).focus();
            await this.page.locator(selectors.product.virtual).uncheck();
        }
        await this.saveProduct();
        if (enable) {
            await expect(this.page.locator(selectors.product.virtual)).toBeChecked();
            if (parseBoolean(process.env.DOKAN_PRO)) {
                await expect(this.page.locator(selectors.product.shipping.shippingContainer)).toBeHidden();
            }
        } else {
            await expect(this.page.locator(selectors.product.virtual)).not.toBeChecked();
        }
    }

    // update product general options
    async addProductGeneralOption(productId: string, generalOption: any): Promise<void> {
        const regularPrice = generalOption.regularPrice();
        const bidIncrement = generalOption.bidIncrement();
        const reservedPrice = generalOption.reservedPrice();
        const buyItNowPrice = generalOption.buyItNowPrice();
        await this.goToAuctionProductEditById(productId);
        await this.page.selectOption(selectors.auction.itemCondition, { value: generalOption.itemCondition });
        await this.page.selectOption(selectors.auction.auctionType, { value: generalOption.auctionType });
        await this.page.locator(selectors.auction.enableProxyBidding).check();
        await this.page.locator(selectors.auction.startPrice).fill(regularPrice);
        await this.page.locator(selectors.auction.bidIncrement).fill(bidIncrement);
        await this.page.locator(selectors.auction.reservedPrice).fill(reservedPrice);
        await this.page.locator(selectors.auction.buyItNowPrice).fill(buyItNowPrice);
        await this.page.locator(selectors.auction.auctionStartDate).evaluate(el => el.removeAttribute('readonly'));
        await this.page.locator(selectors.auction.auctionEndDate).evaluate(el => el.removeAttribute('readonly'));
        await this.page.locator(selectors.auction.auctionStartDate).fill(generalOption.startDate);
        await this.page.locator(selectors.auction.auctionEndDate).fill(generalOption.endDate);

        await this.saveProduct();

        await expect(this.page.locator(selectors.auction.itemCondition)).toHaveValue(generalOption.itemCondition);
        await expect(this.page.locator(selectors.auction.auctionType)).toHaveValue(generalOption.auctionType);
        await expect(this.page.locator(selectors.auction.enableProxyBidding)).toBeChecked();
        await expect(this.page.locator(selectors.auction.startPrice)).toHaveValue(regularPrice);
        await expect(this.page.locator(selectors.auction.bidIncrement)).toHaveValue(bidIncrement);
        await expect(this.page.locator(selectors.auction.reservedPrice)).toHaveValue(reservedPrice);
        await expect(this.page.locator(selectors.auction.buyItNowPrice)).toHaveValue(buyItNowPrice);
        await expect(this.page.locator(selectors.auction.auctionStartDate)).toHaveValue(generalOption.startDate);
        await expect(this.page.locator(selectors.auction.auctionEndDate)).toHaveValue(generalOption.endDate);
    }

    // enable/update product relisting options
    async addProductRelistingOption(productId: string, generalOption: any): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        await this.page.locator(selectors.auction.enableAutomaticRelisting).check();
        await this.page.locator(selectors.auction.relistIfFailAfterNHours).fill(generalOption.relistIfFailAfterNHours);
        await this.page.locator(selectors.auction.relistIfNotPaidAfterNHours).fill(generalOption.relistIfNotPaidAfterNHours);
        await this.page.locator(selectors.auction.relistAuctionDurationInH).fill(generalOption.relistAuctionDurationInH);

        await this.saveProduct();

        await expect(this.page.locator(selectors.auction.enableAutomaticRelisting)).toBeChecked();
        await expect(this.page.locator(selectors.auction.relistIfFailAfterNHours)).toHaveValue(generalOption.relistIfFailAfterNHours);
        await expect(this.page.locator(selectors.auction.relistIfNotPaidAfterNHours)).toHaveValue(generalOption.relistIfNotPaidAfterNHours);
        await expect(this.page.locator(selectors.auction.relistAuctionDurationInH)).toHaveValue(generalOption.relistAuctionDurationInH);
    }

    // add product inventory (SKU)
    async addProductInventory(productId: string, inventory: any): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        await this.page.locator(selectors.product.inventory.sku).fill(inventory.sku);
        await this.saveProduct();
        await expect(this.page.locator(selectors.product.inventory.sku)).toHaveValue(inventory.sku);
    }

    // add product other options (status / visibility)
    async addProductOtherOptions(productId: string, otherOption: any, choice: string): Promise<void> {
        await this.goToAuctionProductEditById(productId);

        switch (choice) {
            case 'status':
                await this.page.selectOption(selectors.product.otherOptions.productStatus, { value: otherOption.status });
                break;
            case 'visibility':
                await this.page.selectOption(selectors.product.otherOptions.visibility, { value: otherOption.visibility });
                break;
            default:
                break;
        }

        await this.saveProduct();

        switch (choice) {
            case 'status':
                await expect(this.page.locator(selectors.product.otherOptions.productStatus)).toHaveValue(otherOption.status);
                break;
            case 'visibility':
                await expect(this.page.locator(selectors.product.otherOptions.visibility)).toHaveValue(otherOption.visibility);
                break;
            default:
                break;
        }
    }

    // add product shipping
    async addProductShipping(productId: string, shipping: any): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        await this.page.locator(selectors.product.shipping.requiresShipping).check();
        await this.page.locator(selectors.product.shipping.weight).fill(shipping.weight);
        await this.page.locator(selectors.product.shipping.length).fill(shipping.length);
        await this.page.locator(selectors.product.shipping.width).fill(shipping.width);
        await this.page.locator(selectors.product.shipping.height).fill(shipping.height);
        await this.page.selectOption(selectors.product.shipping.shippingClass, { label: shipping.shippingClass });
        await this.saveProduct();
        await expect(this.page.locator(selectors.product.shipping.requiresShipping)).toBeChecked();
        await expect(this.page.locator(selectors.product.shipping.weight)).toHaveValue(shipping.weight);
        await expect(this.page.locator(selectors.product.shipping.length)).toHaveValue(shipping.length);
        await expect(this.page.locator(selectors.product.shipping.width)).toHaveValue(shipping.width);
        await expect(this.page.locator(selectors.product.shipping.height)).toHaveValue(shipping.height);
        await this.expectSelectedLabel(selectors.product.shipping.shippingClass, shipping.shippingClass);
    }

    // remove product shipping
    async removeProductShipping(productId: string): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        await this.page.locator(selectors.product.shipping.requiresShipping).uncheck();
        await this.saveProduct();
        await expect(this.page.locator(selectors.product.shipping.requiresShipping)).not.toBeChecked();
    }

    // add product tax
    async addProductTax(productId: string, tax: any, hasClass = false): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        await this.page.selectOption(selectors.product.tax.status, { value: tax.status });
        if (hasClass) await this.page.selectOption(selectors.product.tax.class, { value: tax.class });
        await this.saveProduct();
        await expect(this.page.locator(selectors.product.tax.status)).toHaveValue(tax.status);
        if (hasClass) await expect(this.page.locator(selectors.product.tax.class)).toHaveValue(tax.class);
    }

    // add product attribute
    async addProductAttribute(productId: string, attribute: any, addTerm = false): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        await this.page.selectOption(selectors.product.attribute.customAttribute, { label: attribute.attributeName });
        await this.clickAndWaitForResponse(data.subUrls.ajax, selectors.product.attribute.addAttribute);
        await this.page.locator(selectors.product.attribute.visibleOnTheProductPage).check();
        await this.page.locator(selectors.product.attribute.selectAll).click();
        await expect(this.page.locator(selectors.product.attribute.attributeTerms)).not.toHaveCount(0);
        if (addTerm) {
            await this.page.locator(selectors.product.attribute.addNew).click();
            await this.page.locator(selectors.product.attribute.attributeTermInput).fill(attribute.attributeTerm);
            await this.clickAndWaitForResponse(data.subUrls.ajax, selectors.product.attribute.confirmAddAttributeTerm);
            await expect(this.page.locator(selectors.product.attribute.selectedAttributeTerm(attribute.attributeTerm))).toBeVisible();
        }
        await this.clickAndWaitForResponse(data.subUrls.ajax, selectors.product.attribute.saveAttribute);
        await this.saveProduct();
        await expect(this.page.locator(selectors.product.attribute.savedAttribute(attribute.attributeName))).toBeVisible();
    }

    // can't add already-added attribute
    async cantAddAlreadyAddedAttribute(productId: string, attributeName: string): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        await expect(this.page.locator(selectors.product.attribute.savedAttribute(attributeName))).toBeVisible();
        await expect(this.page.locator(selectors.product.attribute.disabledAttribute(attributeName))).toHaveAttribute('disabled', 'disabled');
    }

    // remove product attribute
    async removeProductAttribute(productId: string, attribute: string): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        await this.page.locator(selectors.product.attribute.removeAttribute(attribute)).click();
        await this.page.locator(selectors.product.attribute.confirmRemoveAttribute).click();
        await expect(this.page.locator(selectors.product.attribute.savedAttribute(attribute))).toBeHidden();
        await this.saveProduct();
        await expect(this.page.locator(selectors.product.attribute.savedAttribute(attribute))).toBeHidden();
    }

    // remove product attribute term
    async removeProductAttributeTerm(productId: string, attribute: string, attributeTerm: string): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        await this.page.locator(selectors.product.attribute.savedAttribute(attribute)).click();
        await this.page.locator(selectors.product.attribute.removeSelectedAttributeTerm(attributeTerm)).click();
        await this.page.keyboard.press('Escape'); // shift focus from element
        await expect(this.page.locator(selectors.product.attribute.selectedAttributeTerm(attributeTerm))).toBeHidden();
        await this.clickAndWaitForResponse(data.subUrls.ajax, selectors.product.attribute.saveAttribute);
        await this.saveProduct();
        await this.page.locator(selectors.product.attribute.savedAttribute(attribute)).click();
        await expect(this.page.locator(selectors.product.attribute.selectedAttributeTerm(attributeTerm))).toBeHidden();
    }

    // add product geolocation
    async addProductGeolocation(productId: string, location: string): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        await this.page.locator(selectors.product.geolocation.sameAsStore).uncheck();
        await this.typeAndWaitForResponse(data.subUrls.gmap, selectors.product.geolocation.productLocation, location);
        await this.page.keyboard.press(data.key.arrowDown);
        await this.page.keyboard.press(data.key.enter);
        await this.saveProduct();
        await expect(this.page.locator(selectors.product.geolocation.sameAsStore)).not.toBeChecked();
        await expect(this.page.locator(selectors.product.geolocation.productLocation)).toHaveValue(location);
    }

    // remove product geolocation
    async removeProductGeolocation(productId: string): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        await this.page.locator(selectors.product.geolocation.sameAsStore).check();
        await this.saveProduct();
        await expect(this.page.locator(selectors.product.geolocation.sameAsStore)).toBeChecked();
    }

    // add product addon
    async addProductAddon(productId: string, addon: any): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        await expect(async () => {
            await this.clickAndWaitForResponse(data.subUrls.ajax, selectors.product.addon.addField);
            await expect(this.page.locator(selectors.product.addon.addonForm)).toBeVisible();
        }).toPass();

        await this.page.selectOption(selectors.product.addon.type, { value: addon.type });
        await this.page.selectOption(selectors.product.addon.displayAs, { value: addon.displayAs });
        await this.page.locator(selectors.product.addon.titleRequired).fill(addon.title);
        await this.page.selectOption(selectors.product.addon.formatTitle, { value: addon.formatTitle });
        await this.page.locator(selectors.product.addon.addDescription).check();
        await this.page.locator(selectors.product.addon.descriptionInput).fill(addon.addDescription);
        await this.page.locator(selectors.product.addon.requiredField).check();
        // option
        await this.page.locator(selectors.product.addon.option.enterAnOption).fill(addon.enterAnOption);
        await this.page.selectOption(selectors.product.addon.option.optionPriceType, { value: addon.optionPriceType });
        await this.page.locator(selectors.product.addon.option.optionPriceInput).fill(addon.optionPriceInput);
        await this.page.locator(selectors.product.addon.excludeAddons).check();

        await this.saveProduct();

        await expect(this.page.locator(selectors.product.addon.addonRow(addon.title))).toBeVisible();
        await this.page.locator(selectors.product.addon.addonRow(addon.title)).click();

        await expect(this.page.locator(selectors.product.addon.type)).toHaveValue(addon.type);
        await expect(this.page.locator(selectors.product.addon.displayAs)).toHaveValue(addon.displayAs);
        await expect(this.page.locator(selectors.product.addon.titleRequired)).toHaveValue(addon.title);
        await expect(this.page.locator(selectors.product.addon.formatTitle)).toHaveValue(addon.formatTitle);
        await expect(this.page.locator(selectors.product.addon.addDescription)).toBeChecked();
        await expect(this.page.locator(selectors.product.addon.descriptionInput)).toHaveValue(addon.addDescription);
        await expect(this.page.locator(selectors.product.addon.requiredField)).toBeChecked();
        // option
        await expect(this.page.locator(selectors.product.addon.option.enterAnOption)).toHaveValue(addon.enterAnOption);
        await expect(this.page.locator(selectors.product.addon.option.optionPriceType)).toHaveValue(addon.optionPriceType);
        await expect(this.page.locator(selectors.product.addon.option.optionPriceInput)).toHaveValue(addon.optionPriceInput);
        await expect(this.page.locator(selectors.product.addon.excludeAddons)).toBeChecked();
    }

    // import addon
    async importAddon(productId: string, addon: string, addonTitle: string): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        await this.page.locator(selectors.product.addon.import).click();
        await this.page.locator(selectors.product.addon.importInput).fill(addon);
        await this.saveProduct();
        await expect(this.page.locator(selectors.product.addon.addonRow(addonTitle))).toBeVisible();
    }

    // export addon
    async exportAddon(productId: string, addon: string): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        await this.page.locator(selectors.product.addon.export).click();
        await expect(this.page.locator(selectors.product.addon.exportInput)).toContainText(addon);
    }

    // remove addon
    async removeAddon(productId: string, addonName: string): Promise<void> {
        await this.goToAuctionProductEditById(productId);
        await this.page.locator(selectors.product.addon.removeAddon(addonName)).click();
        await this.page.locator(selectors.product.addon.confirmRemove).click();
        await expect(this.page.locator(selectors.product.addon.addonRow(addonName))).toBeHidden();
        await this.saveProduct();
        await expect(this.page.locator(selectors.product.addon.addonRow(addonName))).toBeHidden();
    }
}
