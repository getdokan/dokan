const { I } = inject();

module.exports = {
    // Locators for Simple Product Functional Test
    // Start
    SaveProduct: "input.dokan-btn.dokan-btn-theme.dokan-btn-lg.dokan-right",
    CancelLink: "a.cancel_sale_schedule",
    CalenderFrom: "_sale_price_dates_from",
    CaldenderTO: "_sale_price_dates_to",
    Virtual: "#_virtual",
    ShippingDiv: "[data-togglehandler] .hide_if_virtual:nth-child(1)",
    SuccessMsg: "Success! The product has been saved successfully.",
    CategoryContainer: "#select2-product_cat-container",
    CategoryInput: "span > span.select2-search.select2-search--dropdown > input",
    TagField: "div:nth-child(6) > span > span.selection > span",
    TagInput: "div:nth-child(6) > span > span.selection > span > ul > li > input",
    ShortDecLabel: "div > form > div.dokan-product-short-description > label",
    ShortDescFrame: "#post_excerpt_ifr",
    ShortDescInput: '//body[@id="tinymce" and @data-id="post_excerpt"]',
    DescLabel: "div.dokan-product-description > label",
    DescFrame: "#post_content_ifr",
    DescInput: '//body[@id="tinymce" and @data-id="post_content"]',
    WholeSaleDiv: 'div.dokan-wholesale-options.dokan-edit-row.dokan-clearfix.show_if_simple',
    WholeSaleCheck: '//*[@id="wholesale[enable_wholesale]"]',
    WholeSalePrice: '#dokan-wholesale-price',
    WholeSaleQty: '#dokan-wholesale-qty',
    //End
    //Locators Group Product explore 
    ProductLabel: 'span.dokan-label.dokan-label-success.dokan-product-status-label',
    ProductViewBtn: 'h1 > span.dokan-right > a',
    ProductTitleInput: '#post_title',
    ProductTypeInput: '#product_type',
    ProductTypeFavIcon: 'div.content-half-part.dokan-product-meta > div:nth-child(2) > label > i',
    UploadImgDiv: 'div.instruction-inside',
    UploadImgLink: 'div.instruction-inside > a',
    InventoryDiv: 'div.dokan-product-inventory.dokan-edit-row > div.dokan-section-heading',
    InventorySec: 'div.dokan-product-inventory.dokan-edit-row > div.dokan-section-content',
    StockKeeptingInput: '#_sku',
    StockStatusDropdown: '#_stock_status',
    LinkedProductSection: 'div.dokan-linked-product-options.dokan-edit-row.dokan-clearfix > div.dokan-section-heading',
    LinkProductContent: 'div.dokan-linked-product-options.dokan-edit-row.dokan-clearfix > div.dokan-section-content',
    AttributeSectionHeading: 'div.dokan-attribute-variation-options.dokan-edit-row.dokan-clearfix > div.dokan-section-heading',
    AttributeSectionDropdown: '#predefined_attribute#predefined_attribute',
    AttributeAddNewButton: 'a.dokan-btn.dokan-btn-default.add_new_attribute',
    AttirbuteSaveBtn: 'a.dokan-btn.dokan-btn-default.dokan-btn-theme.dokan-save-attribute',
    RmaSectionHeading: 'div.dokan-rma-options.dokan-edit-row.dokan-clearfix > div.dokan-section-heading',
    RmaContentDiv: 'div.dokan-rma-options.dokan-edit-row.dokan-clearfix > div.dokan-section-content',
    OtherOptionDiv: 'div.dokan-other-options.dokan-edit-row.dokan-clearfix > div.dokan-section-heading',
    ProductStatusDropdown: '#post_status',
    ProductVisibilityDropdown: '#_visibility',
    ProductReviewCheckbox: 'div.dokan-section-content > div:nth-child(5) > label',

    //group product Functional 
    RmaCheckBox: '#dokan_rma_product_override',
    RmaLabelInput: '#dokan-rma-label',
    RmaTypeDropdown: '#dokan-warranty-type',
    RmaPolicyIframe: '#warranty_policy_ifr',
    RmaPolicyInput: '//body[@id="tinymce" and @data-id="warranty_policy"]',
    RmaLengthDropdown: '#dokan-warranty-length',
    RmaLengthValue: 'warranty_length_value',
    RmaLengthDuration: '#dokan-warranty-length-duration',
    RmaAddonCostInput: 'warranty_addon_price[]',
    RmaAddonDurationInput: 'warranty_addon_length[]',
    RmaAddonDurationDropdown: '//*[@id="warranty_addon_duration[]"]',
    RmaWarrentyAddonBtn: 'a.dokan-btn.dokan-btn-default.add-item',
    PurchaseNotesInput: '#_purchase_note',
    LinkedProductUpsells: 'div.content-half-part.dokan-form-group.hide_if_variation > span > span.selection > span > ul > li > input',
    LinkedProductCrossSells: 'div.dokan-section-content > div:nth-child(2) > span > span.selection > span > ul > li > input',
    LinkedProductGrouped: 'div.dokan-group-product-content.show_if_grouped > span > span.selection > span > ul > li > input',

=======
   
     //Variable product explore
     ScrollToAttribute:{css:'.add_new_attribute'},
     ProductAttributeName:'attribute_names[0]',
     ProductAttributeValue:'//li/div[2]/div[2]/span/span/span/ul/li/input',
     ProductAttributeVisibility:'attribute_visibility[0]',
     ProductAttributeVariation:'attribute_variation[0]',
     EnableProductDiscount:'//*[@id="_is_lot_discount"]',
     DiscountProductQuantity:'//*[@id="_lot_discount_quantity"]',
     DiscountProductAmount:'//*[@id="_lot_discount_amount"]',

    //ExploreSimpleSubscriptionproduct
    SimpleSubscriptionproductPrice:'#_subscription_price',
    SubscriptionInterval:'#_subscription_period_interval',
    SubscriptionPeriod:'#_subscription_period',
    SubscriptionDiscountPrice:{css:'.content-full-part > div:nth-child(2) > input:nth-child(2)'},
    ExpirationSubscription:'#_subscription_length',
    SignUpfee:'#_subscription_sign_up_fee',
    FreeTrial:'#_subscription_trial_length',
    TrialPeriod:'_subscription_trial_period',


     




}