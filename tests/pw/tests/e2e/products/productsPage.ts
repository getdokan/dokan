import { Page, expect, request, APIRequestContext } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { toPath, SERVER_URL, closeAnnouncementModal } from '@utils/helpers';

// ============================================
// ENVIRONMENT VARIABLES
// ============================================
const {
    ADMIN,
    ADMIN_PASSWORD,
    VENDOR,
    USER_PASSWORD,
    DOKAN_PRO,
} = process.env;

// ============================================
// HELPER FUNCTIONS
// ============================================
export function basicAuth(username: string, password: string): string {
    return 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
}

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

function isPlainObject(value: any): boolean {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// ============================================
// SELECTORS
// ============================================

const wpMedia = {
    uploadFiles: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[@id="menu-item-upload"]',
    mediaLibrary: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[@id="menu-item-browse"]',
    uploadedMediaFirst: '(//div[contains(@class,"attachment-preview")])[1]',
    selectFilesInput: '//div[@class="supports-drag-drop" and @style="position: relative;"]//input[@type="file"]',
    selectUploadedMedia: '(//h2[contains(text(),"Media list")]/..//ul//li)[1]',
    select: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[contains(@class, "media-button-select")]',
    crop: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[contains(@class, "media-button-insert")]',
};

const productsAdmin = {
    search: {
        searchInput: 'input#post-search-input',
        searchButton: 'input#search-submit',
    },
    productRow: (productName: string) => `//a[@class="row-title" and normalize-space(text())='${productName}']/../../..`,

    product: {
        productName: '#title',
        productType: '#product-type',
        virtual: '#\\_virtual',
        downloadable: '#\\_downloadable',
        subMenus: {
            general: '.general_options a',
            inventory: '.inventory_options a',
            shipping: '.shipping_options a',
            linkedProducts: '.linked_product_options a',
            attributes: '.attribute_options a',
            generateVariations: 'button.generate_variations',
            variations: '.variations_options a',
            advanced: '.advanced_options a',
        },
        regularPrice: 'div#general_product_data  input#\\_regular_price',
        salePrice: '#\\_sale_price',
        taxStatus: '#\\_tax_status',
        taxClass: '#\\_tax_class',
        productUrl: '#\\_product_url',
        buttonText: '#\\_button_text',
        subscriptionPrice: '#\\_subscription_price',
        subscriptionPeriodInterval: '#\\_subscription_period_interval',
        subscriptionPeriod: '#\\_subscription_period',
        expireAfter: '#\\_subscription_length',
        subscriptionTrialLength: '#\\_subscription_trial_length',
        subscriptionTrialPeriod: '#\\_subscription_trial_period',
        numberOfProducts: '#\\_no_of_product',
        packValidity: '#\\_pack_validity',
        advertisementSlot: '#\\_dokan_advertisement_slot_count',
        expireAfterDays: '#\\_dokan_advertisement_validity',
        recurringPayment: '#\\_enable_recurring_payment',
        sku: '#\\_sku',
        manageStock: '#\\_manage_stock',
        stockQuantity: '#\\_stock',
        stockStatus: '#\\_stock_status',
        customProductAttribute: '.attribute_taxonomy',
        addAttribute: '.add_attribute',
        addExistingAttribute: '#product_attributes .select2-selection__arrow',
        addExistingAttributeInput: '.select2-search.select2-search--dropdown .select2-search__field',
        selectAll: '.select_all_attributes',
        usedForVariations: '//input[contains(@name, "attribute_variation")]',
        saveAttributes: '.save_attributes',
        addVariations: '#field_to_edit',
        go: '.bulk_edit',
        addVariationPrice: 'button.add_price_for_variations',
        variationPriceInput: 'input.wc_input_variations_price',
        addPrice: 'button.add_variations_price_button',
        storeName: '//div[contains(@id, "sellerdiv")]//span[@class="select2-selection__arrow"]',
        storeNameInput: '.select2-search.select2-search--dropdown .select2-search__field',
        category: (categoryName: string) => `//label[contains(text(), ' ${categoryName}')]/input`,
        editStatus: '.edit-post-status.hide-if-no-js',
        status: '#post-status-select #post_status',
        saveDraft: '#save-post',
        publish: '#publishing-action #publish',
        updatedSuccessMessage: '.updated.notice.notice-success p',
        productPublishSuccessMessage: '//p[contains(.,"Product published. View Product")]',
    },

    category: {
        name: '#tag-name',
        slug: '#tag-slug',
        addNewCategory: '#submit',
        categoryCell: (categoryName: string) => `//td[contains(text(), '${categoryName.toLowerCase()}')]/..`,
    },

    attribute: {
        name: '#attribute_label',
        slug: '#attribute_name',
        addAttribute: '#submit',
        attributeCell: (attributeName: string) => `//td[contains(text(), '${attributeName.toLowerCase()}')]/..`,
        configureTerms: (attributeName: string) => `//td[contains(text(), '${attributeName.toLowerCase()}')]/..//a[normalize-space()="Configure terms"]`,
        attributeTerm: '#tag-name',
        attributeTermSlug: '#tag-slug',
        addAttributeTerm: 'input#submit',
        attributeTermCell: (attributeTerm: string) => `//td[contains(text(), '${attributeTerm.toLowerCase()}')]/..`,
    },
};

const productsVendor = {
    menus: {
        all: '//ul[contains(@class,"subsubsub")]//a[contains(text(),"All")]',
        publish: '//ul[contains(@class,"subsubsub")]//a[contains(text(),"Publish")]',
        draft: '//ul[contains(@class,"subsubsub")]//a[contains(text(),"Draft")]',
        pendingReview: '//ul[contains(@class,"subsubsub")]//a[contains(text(),"Pending Review")]',
        inStock: '//ul[contains(@class,"subsubsub")]//a[contains(text(),"In stock")]',
    },
    importExport: {
        import: '//span[@class="dokan-add-product-link"]//a[contains(text(),"Import")]',
        export: '//span[@class="dokan-add-product-link"]//a[contains(text(),"Export")]',
    },
    filters: {
        filterByDate: 'select#filter-by-date',
        filterByCategory: 'select#product_cat',
        filterByType: 'select#filter-by-type',
        filterByOther: '//select[@name="filter_by_other"]',
        filter: '//button[normalize-space()="Filter"]',
        reset: '//a[normalize-space()="Reset"]',
    },
    search: {
        searchInput: 'input[placeholder="Search Products"]',
        searchBtn: 'button[name="product_listing_search"]',
    },
    bulkActions: {
        selectAll: '#cb-select-all',
        selectAction: '#bulk-product-action-selector',
        applyAction: '#bulk-product-action',
    },
    table: {
        productTable: '#dokan-product-list-table',
        imageColumn: '//th[normalize-space()="Image"]',
        nameColumn: '//th[normalize-space()="Name"]',
        statusColumn: '//th[normalize-space()="Status"]',
        productAdvertisementColumn: '//th[@class="product-advertisement-th"]',
        skuColumn: '//th[normalize-space()="SKU"]',
        stockColumn: '//th[normalize-space()="Stock"]',
        priceColumn: '//th[normalize-space()="Price"]',
        earningColumn: '//th[normalize-space()="Earning"]',
        typeColumn: '//th[normalize-space()="Type"]',
        viewsColumn: '//th[normalize-space()="Views"]',
        dateColumn: '//th[normalize-space()="Date"]',
    },
    numberOfRowsFound: '#dokan-product-list-table tbody tr',
    noProductsFound: '//td[normalize-space()="No product found"]',
    productCell: (productName: string) => `//strong//a[contains(text(),'${productName}')]/../..`,
    productLink: (productName: string) => `//strong//a[contains(text(),'${productName}')]`,
    editProduct: (productName: string) => `//a[contains(text(),'${productName}')]/../..//span[@class="edit"]//a`,
    permanentlyDelete: (productName: string) => `//a[contains(text(),'${productName}')]/../..//span[@class="delete"]//a`,
    rowActions: (productName: string) => `//a[contains(text(), '${productName}')]/../..//div[@class="row-actions"]`,
    view: (productName: string) => `//a[contains(text(),'${productName}')]/../..//span[@class="view"]//a`,
    quickEdit: (productName: string) => `//a[contains(text(),'${productName}')]/../..//span[@class="item-inline-edit editline"]//a`,
    duplicate: (productName: string) => `//a[contains(text(),'${productName}')]/../..//span[@class="duplicate"]//a`,
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
    productType: '#product_type',
    downloadable: '#\\_downloadable',
    virtual: '#\\_virtual',
    price: '#\\_regular_price',
    earning: 'span.vendor-earning span.vendor-price',
    discount: {
        discountedPrice: '#\\_sale_price',
        schedule: "//label[@for='_sale_price']//a[contains(@class,'sale_schedule')][normalize-space()='Schedule']",
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
    productUrl: '#\\_product_url',
    buttonText: '#\\_button_text',
    subscriptionPrice: '#\\_subscription_price',
    subscriptionPeriodInterval: '#\\_subscription_period_interval',
    subscriptionPeriod: '#\\_subscription_period',
    expireAfter: '#\\_subscription_length',
    subscriptionTrialLength: '#\\_subscription_trial_length',
    subscriptionTrialPeriod: '#\\_subscription_trial_period',
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
        deliveryTime: {
            dropDown: 'div#dokan-germanized-options .select2-selection .select2-selection__arrow',
            input: '.select2-search__field',
            searchedResult: '.select2-results__option--highlighted',
        },
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
        groupProducts: '//label[contains(text(),"Grouped products")]/..//input[@class="select2-search__field"]',
        selectedGroupedProduct: (productName: string) => `//select[@id="grouped_products"]/..//li[@class="select2-selection__choice" and contains(., "${productName}")]`,
    },
    attribute: {
        customAttribute: 'select#predefined_attribute',
        addAttribute: 'a.add_new_attribute',
        disabledAttribute: (attribute: string) => `//select[@id="predefined_attribute"]//option[normalize-space(text())='${attribute}']`,
        visibleOnTheProductPage: '//input[contains(@name, "attribute_visibility")]',
        usedForVariations: '//input[contains(@name, "attribute_variation")]',
        selectTerms: '.dokan-attribute-values .select2-search__field',
        attributeTerms: 'div.dokan-attribute-values li.select2-selection__choice',
        selectAll: 'button.dokan-select-all-attributes',
        selectNone: 'button.dokan-select-no-attributes',
        addNew: 'button.dokan-add-new-attribute',
        attributeTermInput: 'div.swal2-modal input.swal2-input',
        confirmAddAttributeTerm: 'button.swal2-confirm',
        selectedAttributeTerm: (attributeTerm: string) => `//li[text()='${attributeTerm}']`,
        removeSelectedAttributeTerm: (attributeTerm: string) => `//li[text()='${attributeTerm}']//span`,
        saveAttribute: 'a.dokan-save-attribute',
        addVariations: '#field_to_edit',
        go: '.do_variation_action',
        confirmGo: 'button.swal2-confirm',
        okSuccessAlertGo: 'button.swal2-confirm',
        cancelGo: 'button.swal2-cancel.swal2-styled',
        variationPrice: '.swal2-input',
        okVariationPrice: '.swal2-confirm',
        saveVariationChanges: '.save-variation-changes',
        defaultAttribute: '.dokan-variation-default-select > .dokan-form-control',
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
        wholesaleSection: 'div.dokan-wholesale-options',
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
    advertisement: {
        needsPublishNotice: '//p[normalize-space(text())="You can not advertise this product. Product needs to be published before you can advertise."]',
        advertiseThisProduct: 'input#dokan_advertise_single_product',
    },
    catalogMode: {
        removeAddToCart: '#catalog_mode_hide_add_to_cart_button',
        hideProductPrice: '#catalog_mode_hide_product_price',
    },
    saveProduct: 'input#publish',
    updatedSuccessMessage: 'div.dokan-message',
    quickEditProduct: {
        title: '(//tr[@class="dokan-product-list-inline-edit-form"]//input[@class="dokan-form-control"])[1]',
        update: '(//button[@type="button"][normalize-space()="Update"])[1]',
    },
    confirmAction: '.swal2-actions .swal2-confirm',
    dokanErrorMessage: 'div.dokan-alert.dokan-alert-danger',
    dokanSuccessMessage: '.dokan-alert.dokan-alert-success strong',
};

const vendorTools = {
    import: {
        csv: {
            chooseCsv: '#upload',
            updateExistingProducts: '#woocommerce-importer-update-existing',
            continue: '//button[@value="Continue"]',
            runTheImporter: '//button[@value="Run the importer"]',
            completionMessage: 'section.woocommerce-importer-done',
        },
    },
    export: {
        csv: {
            generateCsv: '.woocommerce-exporter-button',
        },
    },
};

const customerProductDetails = {
    productImage: '.woocommerce-product-gallery__wrapper img.wp-post-image',
    productTitle: '.product_title.entry-title',
    price: '//div[@class="summary entry-summary"]//p[@class="price"]',
    quantity: 'div.quantity input.qty',
    addToCart: 'button.single_add_to_cart_button',
    chatNow: 'button.dokan-live-chat',
    viewCart: '.woocommerce .woocommerce-message > .button',
    category: '.product_meta .posted_in',
    euComplianceData: {
        price: '//div[@class="summary entry-summary"]//p[@class="price"]',
        unitPrice: 'div.summary p.wc-gzd-additional-info.price-unit',
        productUnit: 'div.summary p.wc-gzd-additional-info.product-units',
        deliveryTime: 'div.summary p.wc-gzd-additional-info.delivery-time-info',
    },
    productAddedSuccessMessage: (productName: string) => `//div[@class="woocommerce-message" and contains(.,"\u201c${productName}\u201d has been added to your cart.")]`,
    productWithQuantityAddedSuccessMessage: (productName: string, quantity: string) => `//div[@class="woocommerce-message" and contains(.,"${quantity} \u00d7 \u201c${productName}\u201d have been added to your cart.")]`,
};

// ============================================
// URL SUB-PATHS
// ============================================
const subUrls = {
    ajax: '/admin-ajax.php',
    post: '/post.php',
    gmap: '/maps/api',
    backend: {
        wc: {
            products: 'wp-admin/edit.php?post_type=product',
            addNewProducts: 'wp-admin/post-new.php?post_type=product',
            addNewCategories: 'wp-admin/edit-tags.php?taxonomy=product_cat&post_type=product',
            addNewAttributes: 'wp-admin/edit.php?post_type=product&page=product_attributes',
            searchAttribute: 'wp-admin/admin-ajax.php?action=woocommerce_json_search_product_attributes',
            term: 'wp-admin/admin-ajax.php?term',
            taxonomyTerms: 'wp-admin/admin-ajax.php?action=woocommerce_json_search_taxonomy_terms',
            taxonomy: 'wp-admin/edit-tags.php?taxonomy',
        },
    },
    frontend: {
        myAccount: 'my-account',
        productDetails: (productName: string) => `product/${productName}`,
        vDashboard: {
            dashboard: 'dashboard',
            newDashboard: 'dashboard/?path=%2Fanalytics%2FOverview',
            products: 'dashboard/products',
            productEdit: (productId: string, nonce: string) => `dashboard/products/?product_id=${productId}&action=edit&_dokan_edit_product_nonce=${nonce}`,
            csvImport: 'dashboard/tools/csv-import',
        },
    },
};

// ============================================
// TEST DATA
// ============================================
export const productData = {
    publishSuccessMessage: 'Product published. ',
    draftUpdateSuccessMessage: 'Product draft updated. ',
    pendingProductUpdateSuccessMessage: 'Product updated. ',
    createUpdateSaveSuccessMessage: 'Success! The product has been saved successfully.',

    status: {
        publish: 'publish',
        draft: 'draft',
        pending: 'pending',
    },

    stockStatus: {
        outOfStock: 'outofstock',
    },

    category: {
        randomCategory: () => `category_${faker.string.alpha(5)}`,
    },

    attribute: {
        randomAttribute: () => ({
            attributeName: `attribute_${faker.string.alpha(5)}`,
            attributeTerms: [`attributeTerm_${faker.string.alpha(5)}`],
        }),
    },

    simple: {
        productType: 'simple',
        productName: () => `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Simple)`,
        category: 'Uncategorized',
        regularPrice: () => faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([1, 2]) }).replace('.', ','),
        storeName: `${VENDOR}store`,
        status: 'publish',
        stockStatus: false,
        editProduct: '',
        description: 'test description',
        saveSuccessMessage: 'Success! The product has been saved successfully. View Product \u2192',
    },

    downloadable: {
        productType: 'simple',
        productName: () => `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Downloadable)`,
        category: 'Uncategorized',
        regularPrice: () => faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([1, 2]) }).replace('.', ','),
        storeName: `${VENDOR}store`,
        status: 'publish',
        stockStatus: false,
        editProduct: '',
        description: 'test description',
        downloadableOptions: {
            fileName: 'avatar',
            fileUrl: 'utils/sampleData/avatar.png',
            downloadLimit: '200',
            downloadExpiry: '361',
        },
    },

    virtual: {
        productType: 'simple',
        productName: () => `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Virtual)`,
        category: 'Uncategorized',
        regularPrice: () => faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([1, 2]) }).replace('.', ','),
        storeName: `${VENDOR}store`,
        status: 'publish',
        stockStatus: false,
        editProduct: '',
        description: 'test description',
    },

    variable: {
        productType: 'variable',
        productName: () => `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Variable)`,
        category: 'Uncategorized',
        regularPrice: () => faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([1, 2]) }).replace('.', ','),
        storeName: `${VENDOR}store`,
        status: 'publish',
        stockStatus: false,
        attribute: 'sizes',
        attributeTerms: ['s', 'l', 'm'],
        variationPrice: () => faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([1, 2]) }).replace('.', ','),
        variations: {
            linkAllVariation: 'link_all_variations',
            variableRegularPrice: 'variable_regular_price',
        },
        description: 'test description',
    },

    external: {
        productType: 'external',
        productName: () => `${faker.commerce.productName()}_${faker.string.nanoid(5)} (External)`,
        productUrl: '/product/p1_v1-simple/',
        buttonText: 'Buy product',
        category: 'Uncategorized',
        regularPrice: () => faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([1, 2]) }).replace('.', ','),
        storeName: `${VENDOR}store`,
        status: 'publish',
        description: 'test description',
    },

    grouped: {
        productType: 'grouped',
        productName: () => `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Grouped)`,
        groupedProducts: ['p1_v1 (simple)'],
        category: 'Uncategorized',
        storeName: `${VENDOR}store`,
        status: 'publish',
        description: 'test description',
    },

    simpleSubscription: {
        productType: 'subscription',
        productName: () => `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Simple Subscription)`,
        category: 'Uncategorized',
        regularPrice: () => faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([1, 2]) }).replace('.', ','),
        subscriptionPrice: () => faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([1, 2]) }).replace('.', ','),
        subscriptionPeriodInterval: '1',
        subscriptionPeriod: 'month',
        expireAfter: '0',
        subscriptionTrialLength: '0',
        subscriptionTrialPeriod: 'day',
        storeName: `${VENDOR}store`,
        status: 'publish',
        description: 'test description',
    },

    variableSubscription: {
        productType: 'variable-subscription',
        productName: () => `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Variable Subscription)`,
        category: 'Uncategorized',
        regularPrice: () => faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([1, 2]) }).replace('.', ','),
        storeName: `${VENDOR}store`,
        status: 'publish',
        attribute: 'sizes',
        attributeTerms: ['s', 'l', 'm'],
        variationPrice: () => faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([1, 2]) }).replace('.', ','),
        variations: {
            linkAllVariation: 'link_all_variations',
            variableRegularPrice: 'variable_regular_price',
        },
        description: 'test description',
    },

    vendorSubscription: {
        productType: 'product_pack',
        productName: () => `Dokan Subscription_${faker.string.alpha({ length: 5, casing: 'upper' })} (Product Pack)`,
        category: 'Uncategorized',
        regularPrice: () => faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([1, 2]) }).replace('.', ','),
        numberOfProducts: '-1',
        packValidity: '0',
        advertisementSlot: '-1',
        expireAfterDays: '-1',
        storeName: `${VENDOR}store`,
        status: 'publish',
        description: 'test description',
    },
};

export const predefined = {
    simpleProduct: {
        product1: {
            name: 'p1_v1 (simple)',
        },
    },
};

// ============================================
// API PAYLOAD
// ============================================
const createProductPayload = () => ({
    name: `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Simple)`,
    type: 'simple',
    regular_price: faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([0, 2]) }),
    status: 'publish',
    categories: [{}],
    tags: [{}],
    featured: true,
    description: '<p>test description</p>',
    short_description: '<p>test short description</p>',
    meta_data: [
        { key: '_dokan_geolocation_use_store_settings', value: 'yes' },
        { key: 'dokan_geo_latitude', value: '40.7127753' },
        { key: 'dokan_geo_longitude', value: '-74.0059728' },
        { key: 'dokan_geo_public', value: '1' },
        { key: 'dokan_geo_address', value: 'New York, NY, USA' },
    ],
});

// ============================================
// API UTILITIES
// ============================================
export const api = {
    _context: null as APIRequestContext | null,

    async init() {
        this._context = await request.newContext();
    },

    async dispose() {
        await this._context?.dispose();
    },

    adminAuth() {
        return { Authorization: basicAuth(ADMIN!, ADMIN_PASSWORD!) };
    },

    userAuth(username: string) {
        return { Authorization: basicAuth(username, USER_PASSWORD!) };
    },

    vendorAuth() {
        return { Authorization: basicAuth(VENDOR!, USER_PASSWORD!) };
    },

    async post(endpoint: string, data: any, headers?: Record<string, string>): Promise<any> {
        if (!headers) headers = this.adminAuth();
        const response = await this._context!.post(`${SERVER_URL}${endpoint}`, {
            headers,
            data,
        });
        return response.json();
    },

    async del(endpoint: string, headers?: Record<string, string>): Promise<any> {
        if (!headers) headers = this.adminAuth();
        const response = await this._context!.delete(`${SERVER_URL}${endpoint}`, {
            headers,
        });
        return response.json();
    },

    async createStore(): Promise<[any, string, string, string]> {
        const storeName = `store_${faker.string.nanoid(10)}`;
        const payload = {
            user_login: storeName,
            user_pass: USER_PASSWORD,
            email: `${storeName}@email.com`,
            role: 'seller',
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            store_name: `${storeName}store`,
            phone: faker.phone.number(),
            social: {},
            payment: {},
            address: {},
        };
        const json = await this.post('/dokan/v1/stores', payload);
        return [json, String(json.id), json.store_name, json.user_login];
    },

    async createProduct(meta?: Record<string, any>, headers?: Record<string, string>): Promise<[any, string, string]> {
        const payload = meta ? { ...createProductPayload(), ...meta } : createProductPayload();
        const json = await this.post('/dokan/v1/products', payload, headers || this.vendorAuth());
        return [json, String(json.id), json.name];
    },

    async ensureCategory(name: string): Promise<string> {
        // Idempotent seed that returns the category's term id. The e2e setup deletes the default WC
        // "Uncategorized" term and reseeds a custom category set, so this spec must create the category it
        // needs instead of relying on ambient state. WooCommerce returns 200 with the new term on create,
        // or a 400 { code: 'term_exists', data: { resource_id } } (a JSON body, not a thrown error) when it
        // already exists — both give us the id, and a plain lookup is the final fallback.
        const json = await this.post('/wc/v3/products/categories', { name }, this.adminAuth());
        if (json?.id) return String(json.id);
        if (json?.data?.resource_id) return String(json.data.resource_id);
        const listResp = await this._context!.get(`${SERVER_URL}/wc/v3/products/categories?search=${encodeURIComponent(name)}&per_page=100`, { headers: this.adminAuth() });
        const cats = await listResp.json();
        const found = Array.isArray(cats) ? cats.find((c: any) => String(c.name).toLowerCase() === name.toLowerCase()) : null;
        return found ? String(found.id) : '';
    },

    async deleteAllProducts(prefix: string, headers?: Record<string, string>): Promise<void> {
        // This is a simplified version - deletes products by prefix
        const response = await this._context!.get(`${SERVER_URL}/dokan/v1/products?search=${prefix}&per_page=100`, {
            headers: headers || this.vendorAuth(),
        });
        const products = await response.json();
        if (Array.isArray(products)) {
            for (const product of products) {
                await this.del(`/dokan/v1/products/${product.id}?force=true`, headers || this.vendorAuth());
            }
        }
    },
};

// ============================================
// PAGE CLASS
// ============================================
export class ProductsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- BasePage inlined helpers ----

    private isCurrentUrl(subPath: string): boolean {
        const url = new URL(this.page.url());
        const currentURL = url.href.replace(/[/]$/, '');
        return currentURL === this.createUrl(subPath);
    }

    private createUrl(subPath: string): string {
        return toPath(subPath);
    }

    getBaseUrl(): string {
        const url = this.page.url();
        return new URL(url).origin;
    }

    async goIfNotThere(subPath: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' = 'domcontentloaded', force = false): Promise<void> {
        const alreadyThere = this.isCurrentUrl(subPath);
        if (!alreadyThere) {
            const url = this.createUrl(subPath);
            await this.toPass(async () => {
                await this.page.goto(url, { waitUntil });
                const currentUrl = this.page.url();
                expect(currentUrl).toMatch(subPath);
            });
        }
        if (force) {
            await this.page.reload();
        }
    }

    async goto(subPath: string, options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' }): Promise<void> {
        const url = this.createUrl(subPath);
        await this.page.goto(url, options);
    }

    async gotoUntilNetworkidle(subPath: string): Promise<void> {
        await this.goto(subPath, { waitUntil: 'load' });
    }

    // ---- Click helpers ----

    async click(selector: string): Promise<void> {
        await this.page.locator(selector).click();
    }

    async clickAndWaitForLoadState(selector: string, state: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'): Promise<void> {
        await Promise.all([this.page.waitForLoadState(state), this.page.locator(selector).click()]);
    }

    async clickAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<any> {
        const element = this.page.locator(selector);
        await element.scrollIntoViewIfNeeded();
        await element.waitFor({ state: 'visible' });
        const [response] = await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            element.click(),
        ]);
        return response;
    }

    async clickAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200): Promise<any> {
        const [, response] = await Promise.all([
            this.page.waitForLoadState('load'),
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).click(),
        ]);
        expect(response.status()).toBe(code);
        return response;
    }

    async clickAndWaitForResponseAndLoadStateUntilNetworkIdle(subUrl: string, selector: string, code = 200): Promise<any> {
        const [, response] = await Promise.all([
            this.page.waitForLoadState('load'),
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).click(),
        ]);
        expect(response.status()).toBe(code);
        return response;
    }

    async clickAndAcceptAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<any> {
        const [response] = await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.acceptAlert(),
            this.page.locator(selector).click(),
        ]);
        return response;
    }

    async clickAndAcceptAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200): Promise<any> {
        const [response] = await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.acceptAlert(),
            this.page.waitForLoadState(),
            this.page.locator(selector).click(),
        ]);
        return response;
    }

    async clickIfVisible(selector: string): Promise<void> {
        const isVis = await this.isVisible(selector, 1);
        if (isVis) {
            await this.click(selector);
        }
    }

    async clickFirstLocator(selector: string): Promise<void> {
        await this.page.locator(selector).first().click();
    }

    async clickAndWaitForDownload(selector: string): Promise<void> {
        await Promise.all([this.page.waitForEvent('download'), this.page.locator(selector).click()]);
    }

    // ---- Accept dialog ----

    acceptAlert(): void {
        this.page.once('dialog', dialog => {
            void dialog.accept();
        });
    }

    // ---- Input helpers ----

    async clearAndType(selector: string, text: string): Promise<void> {
        await this.page.locator(selector).fill(text);
    }

    async fill(selector: string, text: string): Promise<void> {
        await this.page.locator(selector).fill(text);
    }

    async type(selector: string, text: string): Promise<void> {
        await this.page.locator(selector).pressSequentially(text, { delay: 100 });
    }

    async typeFrameSelector(frame: string, frameSelector: string, text: string): Promise<void> {
        const locator = this.page.frameLocator(frame).locator(frameSelector);
        await locator.fill(text);
    }

    async typeAndWaitForResponse(subUrl: string, selector: string, text: string, code = 200): Promise<any> {
        const [response] = await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).fill(text),
        ]);
        return response;
    }

    // ---- Select helpers ----

    async selectByValue(selector: string, value: string): Promise<string[]> {
        return await this.page.selectOption(selector, { value });
    }

    async selectByLabel(selector: string, value: string): Promise<string[]> {
        return await this.page.selectOption(selector, { label: value });
    }

    async selectByNumber(selector: string, value: string | number): Promise<string[]> {
        return await this.page.selectOption(selector, { index: Number(value) });
    }

    async select2ByText(selectSelector: string, optionSelector: string, text: string): Promise<void> {
        await this.click(selectSelector);
        await this.typeAndWaitForResponse(subUrls.ajax, optionSelector, text);
        await this.toContainText('.select2-results__option.select2-results__option--highlighted', text);
        await this.press('Enter');
    }

    // ---- Keyboard helpers ----

    async press(key: string): Promise<void> {
        await this.page.keyboard.press(key);
    }

    async pressAndWaitForResponse(subUrl: string, key: string, code = 200): Promise<any> {
        const [response] = await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.press(key),
        ]);
        return response;
    }

    // ---- Check/uncheck ----

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

    // ---- Hover/focus ----

    async hover(selector: string): Promise<void> {
        await this.page.locator(selector).hover();
    }

    async focus(selector: string): Promise<void> {
        await this.page.focus(selector);
    }

    // ---- Scroll ----

    async scrollToTop(): Promise<void> {
        await this.page.keyboard.down('Home');
    }

    // ---- File upload ----

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

    // ---- Visibility ----

    async isVisible(selector: string, timeout: number = 2): Promise<boolean> {
        const start = Date.now();
        let interval = 20;
        while (Date.now() - start < timeout * 1000) {
            try {
                const visible = await this.page.locator(selector).isVisible();
                if (visible) return true;
            } catch {
                /* empty */
            }
            await this.page.waitForTimeout(interval);
            if (interval === 20) interval = 100;
            else if (interval === 100) interval = 500;
        }
        return false;
    }

    async isVisibleLocator(selector: string): Promise<boolean> {
        return await this.page.locator(selector).isVisible();
    }

    // ---- Element helpers ----

    async removeAttribute(selector: string, attribute: string): Promise<void> {
        const element = this.page.locator(selector);
        await element.evaluate((el, attr) => el.removeAttribute(attr), attribute);
    }

    async getElementCount(selector: string): Promise<number> {
        return await this.page.locator(selector).count();
    }

    // ---- Assertions ----

    async toBeVisible(selector: string, options?: { timeout?: number }): Promise<void> {
        await expect(this.page.locator(selector)).toBeVisible(options);
    }

    async notToBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeHidden();
    }

    async toContainText(selector: string, text: string | RegExp, options?: { timeout?: number }): Promise<void> {
        await expect(this.page.locator(selector)).toContainText(text, options);
    }

    async toContainTextFrameLocator(frame: string, frameSelector: string, text: string | RegExp, options?: { timeout?: number; intervals?: number[] }): Promise<void> {
        await this.toPass(async () => {
            const locator = this.page.frameLocator(frame).locator(frameSelector);
            await expect(locator).toContainText(text);
        }, options);
    }

    async toBeChecked(selector: string, options?: { checked?: boolean; timeout?: number }): Promise<void> {
        await expect(this.page.locator(selector)).toBeChecked(options);
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

    async toHaveSelectedValue(selector: string, value: string, options?: { timeout?: number; intervals?: number[] }): Promise<void> {
        await this.toPass(async () => {
            const locator = this.page.locator(selector);
            const selectValue = await locator.evaluate((select: HTMLSelectElement) => select.value);
            expect(selectValue).toBe(value);
        }, options);
    }

    async toHaveSelectedLabel(selector: string, value: string, options?: { timeout?: number; intervals?: number[] }): Promise<void> {
        await this.toPass(async () => {
            const locator = this.page.locator(selector);
            const selectedText = await locator.evaluate((select: HTMLSelectElement) => select.options[select.selectedIndex]?.text);
            expect(selectedText).toBe(value);
        }, options);
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

    async multipleElementVisible(selectors: { [key: string]: any }): Promise<void> {
        for (const key in selectors) {
            if (isPlainObject(selectors[key])) {
                await this.multipleElementVisible(selectors[key]);
            } else if (typeof selectors[key] === 'function') {
                continue;
            } else {
                await this.toBeVisible(selectors[key]);
            }
        }
    }

    // ============================================
    // PRODUCT PAGE METHODS
    // ============================================

    // admin search product
    async adminSearchProduct(productName: string): Promise<void> {
        await this.gotoUntilNetworkidle(subUrls.backend.wc.products);
        await this.clearAndType(productsAdmin.search.searchInput, productName);
        await this.clickAndWaitForLoadState(productsAdmin.search.searchButton, 'load');
        await this.toBeVisible(productsAdmin.productRow(productName));
    }

    // admin add product category
    async addCategory(categoryName: string): Promise<void> {
        await this.goIfNotThere(subUrls.backend.wc.addNewCategories);
        await this.fill(productsAdmin.category.name, categoryName);
        await this.fill(productsAdmin.category.slug, categoryName);
        await this.clickAndWaitForResponse(subUrls.ajax, productsAdmin.category.addNewCategory);
        await this.toBeVisible(productsAdmin.category.categoryCell(categoryName));
    }

    // admin add product attribute
    async addAttribute(attribute: { attributeName: string; attributeTerms: string[] }): Promise<void> {
        await this.goIfNotThere(subUrls.backend.wc.addNewAttributes);
        await this.fill(productsAdmin.attribute.name, attribute.attributeName);
        await this.fill(productsAdmin.attribute.slug, attribute.attributeName);
        await this.clickAndWaitForResponse(subUrls.backend.wc.addNewAttributes, productsAdmin.attribute.addAttribute);
        await this.toBeVisible(productsAdmin.attribute.attributeCell(attribute.attributeName));
        await this.clickAndWaitForResponseAndLoadState(subUrls.backend.wc.taxonomy, productsAdmin.attribute.configureTerms(attribute.attributeName));

        for (const attributeTerm of attribute.attributeTerms) {
            await this.fill(productsAdmin.attribute.attributeTerm, attributeTerm);
            await this.fill(productsAdmin.attribute.attributeTermSlug, attributeTerm);
            await this.clickAndWaitForResponse(subUrls.ajax, productsAdmin.attribute.addAttributeTerm);
            await this.toBeVisible(productsAdmin.attribute.attributeTermCell(attributeTerm));
        }
    }

    // admin add product name and type
    async addProductNameAndType(productName: string, productType: string): Promise<void> {
        await this.clearAndType(productsAdmin.product.productName, productName);
        await this.selectByValue(productsAdmin.product.productType, productType);
    }

    // admin assign category
    async assignCategoryToProduct(categoryName: string): Promise<void> {
        await this.click(productsAdmin.product.category(categoryName));
    }

    // admin assign vendor
    async assignVendorToProduct(vendorName: string): Promise<void> {
        await this.select2ByText(productsAdmin.product.storeName, productsAdmin.product.storeNameInput, vendorName);
    }

    // admin publish product
    async publishProduct(): Promise<void> {
        await this.click(productsAdmin.product.publish);
        await this.page.waitForLoadState('load');
        await this.page.waitForLoadState('load');
        try {
            await this.toBeVisible(productsAdmin.product.productPublishSuccessMessage);
        } catch {
            await this.toBeVisible(productsAdmin.product.updatedSuccessMessage);
        }
    }

    // admin add simple product
    async addSimpleProduct(product: typeof productData.simple): Promise<void> {
        await this.goIfNotThere(subUrls.backend.wc.addNewProducts);
        await this.addProductNameAndType(product.productName(), product.productType);
        await this.click(productsAdmin.product.subMenus.general);
        await this.type(productsAdmin.product.regularPrice, product.regularPrice());
        await this.assignCategoryToProduct(product.category);

        if (product.stockStatus) {
            await this.click(productsAdmin.product.subMenus.inventory);
            await this.selectByValue(productsAdmin.product.stockStatus, productData.stockStatus.outOfStock);
        }

        await this.assignVendorToProduct(product.storeName);
        await this.scrollToTop();

        switch (product.status) {
            case 'publish':
                await this.clickAndWaitForResponseAndLoadState(subUrls.ajax, productsAdmin.product.publish);
                await this.toContainText(productsAdmin.product.updatedSuccessMessage, productData.publishSuccessMessage);
                break;
            case 'draft':
                await this.clickAndWaitForResponseAndLoadState(subUrls.post, productsAdmin.product.saveDraft, 302);
                await this.toContainText(productsAdmin.product.updatedSuccessMessage, productData.draftUpdateSuccessMessage);
                break;
            case 'pending':
                await this.click(productsAdmin.product.editStatus);
                await this.selectByValue(productsAdmin.product.status, productData.status.pending);
                await this.clickAndWaitForResponseAndLoadState(subUrls.post, productsAdmin.product.saveDraft, 302);
                await this.toContainText(productsAdmin.product.updatedSuccessMessage, productData.pendingProductUpdateSuccessMessage);
                break;
            default:
                break;
        }
    }

    // admin add variable product
    async addVariableProduct(product: typeof productData.variable): Promise<void> {
        await this.goIfNotThere(subUrls.backend.wc.addNewProducts);
        await this.addProductNameAndType(product.productName(), product.productType);

        await this.clickAndWaitForResponse(subUrls.ajax, productsAdmin.product.subMenus.attributes);

        if (await this.isVisibleLocator(productsAdmin.product.customProductAttribute)) {
            await this.selectByValue(productsAdmin.product.customProductAttribute, `pa_${product.attribute}`);
            await this.click(productsAdmin.product.addAttribute);
        } else {
            await this.clickAndWaitForResponse(subUrls.backend.wc.searchAttribute, productsAdmin.product.addExistingAttribute);
            await this.typeAndWaitForResponse(subUrls.backend.wc.term, productsAdmin.product.addExistingAttributeInput, product.attribute);
            await this.pressAndWaitForResponse(subUrls.ajax, 'Enter');
        }

        await this.clickAndWaitForResponse(subUrls.backend.wc.taxonomyTerms, productsAdmin.product.selectAll);
        await this.check(productsAdmin.product.usedForVariations);
        await this.clickAndWaitForResponse(subUrls.ajax, productsAdmin.product.saveAttributes);

        await this.clickAndWaitForResponse(subUrls.ajax, productsAdmin.product.subMenus.variations);
        await this.clickAndAcceptAndWaitForResponse(subUrls.ajax, productsAdmin.product.subMenus.generateVariations);

        await this.click(productsAdmin.product.addVariationPrice);
        await this.type(productsAdmin.product.variationPriceInput, product.variationPrice());
        await this.clickAndWaitForResponse(subUrls.ajax, productsAdmin.product.addPrice);

        await this.assignCategoryToProduct(product.category);
        await this.assignVendorToProduct(product.storeName);
        await this.scrollToTop();
        await this.publishProduct();
    }

    // admin add simple subscription
    async addSimpleSubscription(product: typeof productData.simpleSubscription): Promise<void> {
        await this.goIfNotThere(subUrls.backend.wc.addNewProducts);
        await this.addProductNameAndType(product.productName(), product.productType);
        await this.click(productsAdmin.product.subMenus.general);
        await this.type(productsAdmin.product.subscriptionPrice, product.subscriptionPrice());
        await this.selectByValue(productsAdmin.product.subscriptionPeriodInterval, product.subscriptionPeriodInterval);
        await this.selectByValue(productsAdmin.product.subscriptionPeriod, product.subscriptionPeriod);
        await this.selectByValue(productsAdmin.product.expireAfter, product.expireAfter);
        await this.type(productsAdmin.product.subscriptionTrialLength, product.subscriptionTrialLength);
        await this.selectByValue(productsAdmin.product.subscriptionTrialPeriod, product.subscriptionTrialPeriod);
        await this.assignCategoryToProduct(product.category);
        await this.assignVendorToProduct(product.storeName);
        await this.scrollToTop();
        await this.publishProduct();
    }

    // admin add variable subscription
    async addVariableSubscription(product: typeof productData.variableSubscription): Promise<void> {
        await this.goIfNotThere(subUrls.backend.wc.addNewProducts);
        await this.addProductNameAndType(product.productName(), product.productType);

        await this.click(productsAdmin.product.subMenus.attributes);

        if (await this.isVisibleLocator(productsAdmin.product.customProductAttribute)) {
            await this.selectByValue(productsAdmin.product.customProductAttribute, `pa_${product.attribute}`);
            await this.click(productsAdmin.product.addAttribute);
        } else {
            await this.clickAndWaitForResponse(subUrls.backend.wc.searchAttribute, productsAdmin.product.addExistingAttribute);
            await this.typeAndWaitForResponse(subUrls.backend.wc.term, productsAdmin.product.addExistingAttributeInput, product.attribute);
            await this.pressAndWaitForResponse(subUrls.ajax, 'Enter');
        }

        await this.clickAndWaitForResponse(subUrls.backend.wc.taxonomyTerms, productsAdmin.product.selectAll);
        await this.check(productsAdmin.product.usedForVariations);
        await this.clickAndWaitForResponse(subUrls.ajax, productsAdmin.product.saveAttributes);

        await this.clickAndWaitForResponse(subUrls.ajax, productsAdmin.product.subMenus.variations);
        await this.clickAndAcceptAndWaitForResponse(subUrls.ajax, productsAdmin.product.subMenus.generateVariations);

        await this.click(productsAdmin.product.addVariationPrice);
        await this.type(productsAdmin.product.variationPriceInput, product.variationPrice());
        await this.clickAndWaitForResponse(subUrls.ajax, productsAdmin.product.addPrice);

        await this.assignCategoryToProduct(product.category);
        await this.assignVendorToProduct(product.storeName);
        await this.scrollToTop();
        await this.publishProduct();
    }

    // admin add external product
    async addExternalProduct(product: typeof productData.external): Promise<void> {
        await this.goIfNotThere(subUrls.backend.wc.addNewProducts);
        await this.addProductNameAndType(product.productName(), product.productType);
        await this.click(productsAdmin.product.subMenus.general);
        await this.type(productsAdmin.product.productUrl, this.getBaseUrl() + product.productUrl);
        await this.type(productsAdmin.product.buttonText, product.buttonText);
        await this.type(productsAdmin.product.regularPrice, product.regularPrice());
        await this.assignCategoryToProduct(product.category);
        await this.assignVendorToProduct(product.storeName);
        await this.scrollToTop();
        await this.publishProduct();
    }

    // admin add dokan subscription
    async addDokanSubscription(product: typeof productData.vendorSubscription): Promise<void> {
        await this.goIfNotThere(subUrls.backend.wc.addNewProducts);
        await this.addProductNameAndType(product.productName(), product.productType);
        await this.click(productsAdmin.product.subMenus.general);
        await this.type(productsAdmin.product.regularPrice, product.regularPrice());
        await this.assignCategoryToProduct(product.category);
        await this.type(productsAdmin.product.numberOfProducts, product.numberOfProducts);
        await this.type(productsAdmin.product.packValidity, product.packValidity);
        await this.type(productsAdmin.product.advertisementSlot, product.advertisementSlot);
        await this.type(productsAdmin.product.expireAfterDays, product.expireAfterDays);
        await this.click(productsAdmin.product.recurringPayment);
        await this.publishProduct();
    }

    // ---- Vendor methods ----

    async vendorProductsRenderProperly(): Promise<void> {
        await this.goIfNotThere(subUrls.frontend.vDashboard.products);
        const { draft, pendingReview, ...menus } = productsVendor.menus;
        await this.multipleElementVisible(menus);
        await this.toBeVisible(productsVendor.addNewProduct);
        if (DOKAN_PRO) await this.multipleElementVisible(productsVendor.importExport);
        const { filterByType, filterByOther, ...filters } = productsVendor.filters;
        await this.multipleElementVisible(filters);
        if (DOKAN_PRO) {
            await this.toBeVisible(filterByType);
            await this.toBeVisible(filterByOther);
        }
        await this.multipleElementVisible(productsVendor.search);
        await this.multipleElementVisible(productsVendor.bulkActions);
        const { productAdvertisementColumn, ...table } = productsVendor.table;
        await this.multipleElementVisible(table);
    }

    async vendorAddNewProductRenderProperly(): Promise<void> {
        await this.goToAddNewProduct();
        await this.page.waitForLoadState('load');
        await this.page.waitForLoadState('load');
        await this.toBeVisible(productsVendor.title);
        if (DOKAN_PRO) await this.toBeVisible(productsVendor.productType);
        await this.toBeVisible(productsVendor.downloadable);
        await this.toBeVisible(productsVendor.virtual);
        await this.toBeVisible(productsVendor.price);
        await this.toBeVisible(productsVendor.earning);
        await this.click(productsVendor.discount.schedule);
        const { schedule, greaterDiscountError, ...discount } = productsVendor.discount;
        await this.multipleElementVisible(discount);
        await this.toBeVisible(productsVendor.category.openCategoryModal);
        await this.toBeVisible(productsVendor.tags.tagInput);
        await this.toBeVisible(productsVendor.image.cover);
        await this.toBeVisible(productsVendor.image.gallery);
        await this.toBeVisible(productsVendor.shortDescription.shortDescriptionIframe);
        await this.toBeVisible(productsVendor.description.descriptionIframe);
        await this.toBeVisible(productsVendor.inventory.stockStatus);
        await this.check(productsVendor.inventory.enableStockManagement);
        const { stockStatus, ...inventory } = productsVendor.inventory;
        await this.multipleElementVisible(inventory);
        await this.multipleElementVisible(productsVendor.otherOptions);
        await this.check(productsVendor.catalogMode.removeAddToCart);
        await this.multipleElementVisible(productsVendor.catalogMode);

        if (DOKAN_PRO) {
            await this.multipleElementVisible(productsVendor.shipping);
            await this.multipleElementVisible(productsVendor.tax);
            await this.uncheck(productsVendor.geolocation.sameAsStore);
            await this.multipleElementVisible(productsVendor.geolocation);
            await this.toBeVisible(productsVendor.linkedProducts.upSells);
            await this.toBeVisible(productsVendor.linkedProducts.crossSells);
            await this.toBeVisible(productsVendor.attribute.customAttribute);
            await this.toBeVisible(productsVendor.attribute.addAttribute);
            await this.toBeVisible(productsVendor.attribute.saveAttribute);
            await this.check(productsVendor.bulkDiscount.enableBulkDiscount);
            await this.multipleElementVisible(productsVendor.bulkDiscount);
            await this.toBeVisible(productsVendor.addon.addField);
            await this.toBeVisible(productsVendor.addon.import);
            await this.toBeVisible(productsVendor.addon.export);
            await this.toBeVisible(productsVendor.addon.excludeAddons);
            await this.check(productsVendor.rma.overrideDefaultRmaSettings);
            const { length, lengthValue, lengthDuration, addonCost, addonDurationLength, addonDurationType, rmaPolicyHtmlBody, refundReasons, ...rma } = productsVendor.rma;
            await this.multipleElementVisible(rma);
            await this.check(productsVendor.wholesale.enableWholesale);
            await this.multipleElementVisible(productsVendor.wholesale);
            await this.multipleElementVisible(productsVendor.minMax);
            await this.toBeVisible(productsVendor.advertisement.needsPublishNotice);
        }
    }

    async goToAddNewProduct(): Promise<void> {
        await this.goIfNotThere(subUrls.frontend.vDashboard.products);
        await this.clickAndWaitForLoadState(productsVendor.addNewProduct);
    }

    async vendorAddSimpleProduct(product: typeof productData.simple): Promise<void> {
        const productName = product.productName();
        const productPrice = product.regularPrice();
        await this.goToAddNewProduct();
        await this.clearAndType(productsVendor.title, productName);
        await this.clearAndType(productsVendor.price, productPrice);
        await this.typeFrameSelector(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
        await this.saveProduct();
        await this.toHaveValue(productsVendor.title, productName);
        await this.toHaveValue(productsVendor.price, productPrice);
        await this.toContainTextFrameLocator(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
    }

    async vendorAddVariableProduct(product: typeof productData.variable): Promise<void> {
        const productName = product.productName();
        await this.goToAddNewProduct();
        await this.clearAndType(productsVendor.title, productName);
        await this.selectByValue(productsVendor.productType, product.productType);
        await this.typeFrameSelector(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
        await this.selectByValue(productsVendor.attribute.customAttribute, `pa_${product.attribute}`);
        await this.click(productsVendor.attribute.addAttribute);
        await this.click(productsVendor.attribute.selectAll);
        await this.click(productsVendor.attribute.usedForVariations);
        await this.click(productsVendor.attribute.saveAttribute);
        await this.selectByValue(productsVendor.attribute.addVariations, product.variations.linkAllVariation);
        await this.click(productsVendor.attribute.go);
        await this.click(productsVendor.attribute.confirmGo);
        await this.click(productsVendor.attribute.okSuccessAlertGo);
        await this.selectByValue(productsVendor.attribute.addVariations, product.variations.variableRegularPrice);
        await this.click(productsVendor.attribute.go);
        await this.type(productsVendor.attribute.variationPrice, product.regularPrice());
        await this.click(productsVendor.attribute.okVariationPrice);
        await this.saveProduct();
        await this.toHaveValue(productsVendor.title, productName);
        await this.toHaveSelectedValue(productsVendor.productType, product.productType);
        await this.toContainTextFrameLocator(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
    }

    async vendorAddSimpleSubscription(product: typeof productData.simpleSubscription): Promise<void> {
        const productName = product.productName();
        await this.goToAddNewProduct();
        await this.clearAndType(productsVendor.title, productName);
        await this.selectByValue(productsVendor.productType, product.productType);
        await this.type(productsVendor.subscriptionPrice, product.subscriptionPrice());
        await this.selectByValue(productsVendor.subscriptionPeriodInterval, product.subscriptionPeriodInterval);
        await this.selectByValue(productsVendor.subscriptionPeriod, product.subscriptionPeriod);
        await this.selectByValue(productsVendor.expireAfter, product.expireAfter);
        await this.type(productsVendor.subscriptionTrialLength, product.subscriptionTrialLength);
        await this.selectByValue(productsVendor.subscriptionTrialPeriod, product.subscriptionTrialPeriod);
        await this.typeFrameSelector(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
        await this.saveProduct();
        await this.toHaveValue(productsVendor.title, productName);
        await this.toHaveSelectedValue(productsVendor.productType, product.productType);
        await this.toContainTextFrameLocator(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
    }

    async vendorAddVariableSubscription(product: typeof productData.variableSubscription): Promise<void> {
        const productName = product.productName();
        await this.goToAddNewProduct();
        await this.clearAndType(productsVendor.title, productName);
        await this.selectByValue(productsVendor.productType, product.productType);
        await this.typeFrameSelector(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
        await this.selectByValue(productsVendor.attribute.customAttribute, `pa_${product.attribute}`);
        await this.click(productsVendor.attribute.addAttribute);
        await this.click(productsVendor.attribute.selectAll);
        await this.click(productsVendor.attribute.usedForVariations);
        await this.click(productsVendor.attribute.saveAttribute);
        await this.selectByValue(productsVendor.attribute.addVariations, product.variations.linkAllVariation);
        await this.click(productsVendor.attribute.go);
        await this.click(productsVendor.attribute.confirmGo);
        await this.click(productsVendor.attribute.okSuccessAlertGo);
        await this.selectByValue(productsVendor.attribute.addVariations, product.variations.variableRegularPrice);
        await this.click(productsVendor.attribute.go);
        await this.type(productsVendor.attribute.variationPrice, product.regularPrice());
        await this.click(productsVendor.attribute.okVariationPrice);
        await this.saveProduct();
        await this.toHaveValue(productsVendor.title, productName);
        await this.toHaveSelectedValue(productsVendor.productType, product.productType);
        await this.toContainTextFrameLocator(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
    }

    async vendorAddExternalProduct(product: typeof productData.external): Promise<void> {
        const productName = product.productName();
        await this.goToAddNewProduct();
        await this.clearAndType(productsVendor.title, productName);
        await this.selectByValue(productsVendor.productType, product.productType);
        await this.type(productsVendor.productUrl, this.getBaseUrl() + product.productUrl);
        await this.type(productsVendor.buttonText, product.buttonText);
        await this.clearAndType(productsVendor.price, product.regularPrice());
        await this.typeFrameSelector(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
        await this.saveProduct();
        await this.toHaveValue(productsVendor.title, productName);
        await this.toHaveSelectedValue(productsVendor.productType, product.productType);
        await this.toContainTextFrameLocator(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
    }

    async vendorAddGroupProduct(product: typeof productData.grouped): Promise<void> {
        const productName = product.productName();
        await this.goToAddNewProduct();
        await this.clearAndType(productsVendor.title, productName);
        await this.selectByValue(productsVendor.productType, product.productType);
        await this.typeFrameSelector(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
        for (const groupedProduct of product.groupedProducts) {
            await this.typeAndWaitForResponse(subUrls.ajax, productsVendor.linkedProducts.groupProducts, groupedProduct);
            await this.click(productsVendor.linkedProducts.searchedResult(groupedProduct));
            await this.toBeVisible(productsVendor.linkedProducts.selectedGroupedProduct(groupedProduct));
        }
        await this.saveProduct();
        await this.toHaveValue(productsVendor.title, productName);
        await this.toHaveSelectedValue(productsVendor.productType, product.productType);
        await this.toContainTextFrameLocator(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
        for (const groupedProduct of product.groupedProducts) {
            await this.toBeVisible(productsVendor.linkedProducts.selectedGroupedProduct(groupedProduct));
        }
    }

    async vendorAddDownloadableProduct(product: typeof productData.downloadable): Promise<void> {
        const productName = product.productName();
        const productPrice = product.regularPrice();
        await this.goToAddNewProduct();
        await this.clearAndType(productsVendor.title, productName);
        await this.clearAndType(productsVendor.price, productPrice);
        await this.check(productsVendor.downloadable);
        await this.click(productsVendor.downloadableOptions.addFile);
        await this.clearAndType(productsVendor.downloadableOptions.fileName, product.downloadableOptions.fileName);
        await this.click(productsVendor.downloadableOptions.chooseFile);
        await this.uploadMedia(product.downloadableOptions.fileUrl);
        await this.clearAndType(productsVendor.downloadableOptions.downloadLimit, product.downloadableOptions.downloadLimit);
        await this.clearAndType(productsVendor.downloadableOptions.downloadExpiry, product.downloadableOptions.downloadExpiry);
        await this.typeFrameSelector(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
        await this.saveProduct();
        await this.toHaveValue(productsVendor.title, productName);
        await this.toHaveValue(productsVendor.price, productPrice);
        await this.toBeChecked(productsVendor.downloadable);
        await this.toHaveValue(productsVendor.downloadableOptions.fileName, product.downloadableOptions.fileName);
        await this.toHaveValue(productsVendor.downloadableOptions.downloadLimit, product.downloadableOptions.downloadLimit);
        await this.toHaveValue(productsVendor.downloadableOptions.downloadExpiry, product.downloadableOptions.downloadExpiry);
        await this.toContainTextFrameLocator(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
    }

    async vendorAddVirtualProduct(product: typeof productData.simple): Promise<void> {
        const productName = product.productName();
        const productPrice = product.regularPrice();
        await this.goToAddNewProduct();
        await this.clearAndType(productsVendor.title, productName);
        await this.clearAndType(productsVendor.price, productPrice);
        await this.check(productsVendor.virtual);
        if (DOKAN_PRO) {
            await this.notToBeVisible(productsVendor.shipping.shippingContainer);
        }
        await this.typeFrameSelector(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
        await this.saveProduct();
        await this.toHaveValue(productsVendor.title, productName);
        await this.toHaveValue(productsVendor.price, productPrice);
        await this.toBeChecked(productsVendor.virtual);
        if (DOKAN_PRO) {
            await this.notToBeVisible(productsVendor.shipping.shippingContainer);
        }
        await this.toContainTextFrameLocator(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
    }

    // search product vendor dashboard
    async searchProduct(productName: string): Promise<void> {
        await this.goIfNotThere(subUrls.frontend.vDashboard.products);
        await this.clearAndType(productsVendor.search.searchInput, productName);
        await this.clickAndWaitForResponse(subUrls.frontend.vDashboard.products, productsVendor.search.searchBtn);
        await expect(this.page.locator(productsVendor.productLink(productName)).first()).toBeVisible();
    }

    // go to product edit
    async goToProductEdit(productName: string): Promise<void> {
        await this.searchProduct(productName);
        await this.removeAttribute(productsVendor.rowActions(productName), 'class');
        await this.hover(productsVendor.productCell(productName));
        await this.clickAndWaitForResponseAndLoadStateUntilNetworkIdle(subUrls.frontend.vDashboard.products, productsVendor.editProduct(productName));
        await this.toHaveValue(productsVendor.title, productName);
    }

    // save product
    async saveProduct(): Promise<void> {
        // The classic product editor binds its form-submit handler asynchronously (RankMath SEO / WooCommerce
        // product init). Clicking "Save Product" before that handler is ready silently no-ops the first submit,
        // so wait for the page to settle, then re-click until the save request actually fires.
        await this.page.waitForLoadState('networkidle');
        await this.toPass(
            async () => {
                const [response] = await Promise.all([
                    this.page.waitForResponse(resp => resp.url().includes(subUrls.frontend.vDashboard.products) && resp.status() === 200, { timeout: 15000 }),
                    this.page.locator(productsVendor.saveProduct).click(),
                ]);
                expect(response.status()).toBe(200);
            },
            { intervals: [1000, 2000, 3000], timeout: 90000 },
        );
        await this.toContainText(productsVendor.updatedSuccessMessage, productData.createUpdateSaveSuccessMessage);
    }

    // filter products
    async filterProducts(filterBy: string, value: string): Promise<void> {
        await this.goIfNotThere(subUrls.frontend.vDashboard.products);

        switch (filterBy) {
            case 'by-date':
                await this.selectByNumber(productsVendor.filters.filterByDate, value);
                break;
            case 'by-category':
                await this.selectByLabel(productsVendor.filters.filterByCategory, value);
                break;
            case 'by-type':
                await this.selectByValue(productsVendor.filters.filterByType, value);
                break;
            case 'by-other':
                await this.selectByValue(productsVendor.filters.filterByOther, value);
                break;
            default:
                break;
        }

        await this.clickAndWaitForResponseAndLoadState(subUrls.frontend.vDashboard.products, productsVendor.filters.filter);
        await this.notToHaveCount(productsVendor.numberOfRowsFound, 0);
    }

    // reset filter
    async resetFilter(): Promise<void> {
        await this.goIfNotThere(subUrls.frontend.vDashboard.products);
        await this.clearAndType(productsVendor.search.searchInput, '.....');
        await this.clickAndWaitForResponse(subUrls.frontend.vDashboard.products, productsVendor.search.searchBtn);
        await this.toBeVisible(productsVendor.noProductsFound);
        await this.clickAndWaitForResponseAndLoadState(subUrls.frontend.vDashboard.products, productsVendor.filters.reset);
        await this.notToHaveCount(productsVendor.numberOfRowsFound, 0);
    }

    // import products
    async importProducts(filePath: string): Promise<void> {
        await this.goIfNotThere(subUrls.frontend.vDashboard.products);
        await this.clickAndWaitForLoadState(productsVendor.importExport.import);
        await this.uploadFile(vendorTools.import.csv.chooseCsv, filePath);
        await this.clickAndWaitForLoadState(vendorTools.import.csv.continue);
        await this.clickAndWaitForResponseAndLoadState(subUrls.frontend.vDashboard.csvImport, vendorTools.import.csv.runTheImporter);
        await this.toContainText(vendorTools.import.csv.completionMessage, 'Import complete!');
        await this.searchProduct('p0_v1');
    }

    // export products
    async exportProducts(): Promise<void> {
        await this.goIfNotThere(subUrls.frontend.vDashboard.products);
        await this.clickAndWaitForLoadState(productsVendor.importExport.export);
        await this.clickAndWaitForDownload(vendorTools.export.csv.generateCsv);
    }

    async addProductWithoutRequiredFields(product: typeof productData.simple): Promise<void> {
        const productName = product.productName();
        const productPrice = product.regularPrice();
        await this.goToAddNewProduct();
        await this.click(productsVendor.saveProduct);
        await this.toContainText(productsVendor.NoTitleError, 'This field is required');
        await this.clearAndType(productsVendor.title, productName);
        await this.clickAndWaitForResponseAndLoadState(subUrls.frontend.vDashboard.products, productsVendor.saveProduct);
        await this.toContainText(productsVendor.dokanErrorMessage, 'Error! Description is a required field..');
        await this.typeFrameSelector(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
        await this.clearAndType(productsVendor.price, productPrice);
        await this.saveProduct();
        await this.toHaveValue(productsVendor.title, productName);
        await this.toHaveValue(productsVendor.price, productPrice);
        await this.toContainTextFrameLocator(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
    }

    // view product
    async viewProduct(productName: string): Promise<void> {
        await this.searchProduct(productName);
        // Reveal CSS-hidden row actions permanently so hover-state races can't lose them mid-click.
        await this.removeAttribute(productsVendor.rowActions(productName), 'class');
        await this.hover(productsVendor.productCell(productName));
        await this.clickAndWaitForLoadState(productsVendor.view(productName));
        await expect(this.page).toHaveURL(subUrls.frontend.productDetails(slugify(productName)) + '/');
        const { quantity, addToCart, viewCart, chatNow, euComplianceData, productAddedSuccessMessage, productWithQuantityAddedSuccessMessage, ...details } = customerProductDetails;
        await this.multipleElementVisible(details);
    }

    // vendor can't buy own product
    async cantBuyOwnProduct(productName: string): Promise<void> {
        await this.goIfNotThere(subUrls.frontend.productDetails(slugify(productName)));
        await this.notToBeVisible(customerProductDetails.quantity);
        await this.notToBeVisible(customerProductDetails.addToCart);
    }

    // duplicate product
    async duplicateProduct(productName: string): Promise<void> {
        await this.searchProduct(productName);
        await this.removeAttribute(productsVendor.rowActions(productName), 'class');
        await this.hover(productsVendor.productCell(productName));
        await this.clickAndAcceptAndWaitForResponseAndLoadState(subUrls.frontend.vDashboard.products, productsVendor.duplicate(productName));
        await this.toContainText(productsVendor.dokanSuccessMessage, 'Product successfully duplicated');
    }

    // permanently delete product
    async permanentlyDeleteProduct(productName: string): Promise<void> {
        await this.searchProduct(productName);
        await this.removeAttribute(productsVendor.rowActions(productName), 'class');
        await this.hover(productsVendor.productCell(productName));
        await this.click(productsVendor.permanentlyDelete(productName));
        await this.clickAndWaitForLoadState(productsVendor.confirmAction);
        await this.toContainText(productsVendor.dokanSuccessMessage, 'Product successfully deleted');
    }

    // edit product
    async editProduct(product: { editProduct: string; regularPrice: () => string }): Promise<void> {
        await this.goToProductEdit(product.editProduct);
        await this.clearAndType(productsVendor.price, product.regularPrice());
        await this.saveProduct();
    }

    // quick edit product
    async quickEditProduct(product: { editProduct: string }): Promise<void> {
        await this.searchProduct(product.editProduct);
        await this.removeAttribute(productsVendor.rowActions(product.editProduct), 'class');
        await this.hover(productsVendor.productCell(product.editProduct));
        await this.click(productsVendor.quickEdit(product.editProduct));
        await this.clearAndType(productsVendor.quickEditProduct.title, product.editProduct);
        await this.clickAndWaitForResponse(subUrls.ajax, productsVendor.quickEditProduct.update);
    }
}
