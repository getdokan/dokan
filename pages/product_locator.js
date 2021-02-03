const { I } = inject();

module.exports = {

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

}