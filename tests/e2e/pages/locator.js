var Factory = require('rosie').Factory;
var faker = require('faker');
const { I } = inject();

module.exports = {
    // Locators for  Registration page
    // Start
    RegisterLocator: '#customer_login > div.u-column2.col-2',
    CustomerEmailAddress: faker.internet.email(),
    VendorEmailAddress: faker.internet.email(),
    EmailAdressLocator: 'Email address',
    PasswordInput: '#reg_password',
    PasswordValue: faker.internet.password(),
    FirstName: faker.name.firstName(),
    Lastname: faker.name.lastName(),
    Shopname: faker.name.title(),
    PhoneNumberInput: '#shop-phone',
    PhoneNumberValue: faker.phone.phoneNumber(),
    MenuHoverDropdown: '.nav.navbar-nav.nav .dokani-menu-user.dropdown-toggle',
    MyAccount: 'li:nth-of-type(3) > .dropdown-menu > li:nth-of-type(2) > a',
    EditAccount: 'li.woocommerce-MyAccount-navigation-link.woocommerce-MyAccount-navigation-link--edit-account > a',
    // BDD LOCATORS 
    VendorBalance: '//article[@class="dokan-withdraw-area"]/div/div[1]/strong/span[1]',
    //Purchase Checkout Page
    ViewCart: 'div.woocommerce > div > a',
    ProceedCheckout: 'div.cart-collaterals > div > div > a',
    BillingFirstName: '#billing_first_name',
    BillingLastName: '#billing_last_name',
    BillingCompanyName: '#billing_company',
    BillingAddress: '#billing_address_1',
    BillingCity: '#billing_city',
    BillingPhone: '#billing_phone',
    BillingEmail: '#billing_email',
    PlaceOrderBtn: 'woocommerce_checkout_place_order',
    OrderSuccessMsg: 'Thank you. Your order has been received.',
    // Order Page Locators
    FirstOrderRow: 'tr:nth-child(1) strong',
    EditStatusLink: '.dokan-edit-status',
    GeneralDetails: '.dokan - panel - body.general - details',
    CurrentEarning: '.dokan-order-earning > .amount.woocommerce-Price-amount',
    VendorMoveCursor: 'div.dokani-user-menu > ul > li:nth-child(3) > a',
    VendorLogout: 'div.dokani-user-menu > ul > li:nth-child(3) > ul > li:nth-child(7) > a',
    CustomerMoveCursor: 'div.dokani-user-menu > ul > li.dropdown > a',

    //WP-Admin Page Locators
    AdminBalance: 'div.inside > div > div > ul > li.commission > a > strong > div',
    AdminComission: 'tr:nth-child(1) > td.column.commission > div',
    AdminMoveCursor: '#wp-admin-bar-my-account > a',
    AdminLogout: '#wp-admin-bar-logout > a',

    //Vendor Dashboard Elements
    VendorContent: '.dokan-dashboard-content',
    ProgressBar: '.dokan-progress',
    LeftDashboard: 'div.dokan-w6.dokan-dash-left',
    SaleGraph: 'div.dashboard-widget.sells-graph',
    DashAnnountment: 'div.dashboard-widget.dokan-announcement-widget',
    ProductWidget: 'div.dashboard-widget.products',
    ReviewsContent: 'div.dashboard-widget.reviews',
    //VendorProduct Overview Page
    ProductArea: '.dokan-product-listing-area',
    AddProductSpan: '.dokan-add-product-link',

    //Product Order Page
    OrderArea: '.dokan-orders-area',
    CompleteOrder: '/dashboard/orders/?order_status=wc-completed/',
    ProcessingOrder: '/dashboard/orders/?order_status=wc-processing/',
    HoldOrder: '/dashboard/orders/?order_status=wc-on-hold/',
    PendingOrder: '/dashboard/orders/?order_status=wc-pending/',
    CancelOrder: '/dashboard/orders/?order_status=wc-cancelled/',
    RefundOrder: '/dashboard/orders/?order_status=wc-refunded/',
    FailedOrder: '/dashboard/orders/?order_status=wc-failed/',
    //Coupon Page
    CouponArea: '.dashboard-coupons-area',

    //Report Page
    ReportArea: '.dokan-dashboard-content.dokan-reports-content',
    //Review Page
    ReviewArea: 'div.dokan-dashboard-content.dokan-reviews-content',
    ReviewhHold: '/dashboard/reviews/?comment_status=hold/',
    ReviewSpam: '/dashboard/reviews/?comment_status=spam/',
    ReviewTrash: '/dashboard/reviews/?comment_status=trash/',
    //Withdraw Page
    WithdrawArea: '.dokan-withdraw-area',
    //Return Request
    ReturnRequestArea: '.dokan-rma-request-area',
    //Staff
    StaffArea: 'div.dokan-dashboard-content.dokan-staffs-content',
    //Follower
    FollowerArea: '.dashboard-content-area',
    //Subscription
    SubscriptionArea: '.dokan-dashboard-content',
    //Booking
    BookingArea: '.dokan-product-listing',
    BookingManage: '/dashboard/booking/my-bookings/',
    BookingCalendar: '/dashboard/booking/calendar/',
    BookingResources: '/dashboard/booking/resources/',
    //Analytics
    AnalyticsArea: '.dokan-reports-area',
    AllAnalytics: '/dashboard/support/?ticket_status=all/',
    CloseAnalytics: '/dashboard/support/?ticket_status=closed/',
    //Auction
    AuctionOnline: '/dashboard/auction/?post_status=publish',
    AuctionPending: '/dashboard/auction/?post_status=pending',
    AuctionDraft: '/dashboard/auction/?post_status=draft',
    //Settings
    SettingArea: '.dokan-settings-area',
    ShopLink: 'li.dokan-common-links.dokan-clearfix > a:nth-child(1)',
    //Store listing
    StoreListContent: '.seller-listing-content',
    StoreDropdown: 'form select[name=stores_orderby]',
    Content: '#content',
    //My Account Main Page
    MyAccountDiv: '.woocommerce-MyAccount-content',

    // Shop Page Locators
    SortingDropdown: '#post-68 > div > div > form > select',
    ThirdProductLocator: ' li.product.type-product.post-148.status-publish.instock.product_cat-for-multiple.product_tag-gadgets.product_tag-single.shipping-taxable.purchasable.product-type-simple > div > div.item-bar > div.item-button > a',

    //Store Page All Tab & Other Location
    TermsAndCondition:'//*[@id="content"]//div/ul/li[2]/a',
    ReviewTab: '//*[@id="content"]//div/ul/li[3]/a',
    VendorBioTab:'//*[@id="content"]//div/ul/li[4]/a',
    StoreContent: '.content-area',
    ReviewDiv: '#reviews',

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
    TagField: "div:nth-child(7) > span > span.selection > span",
    TagInput: "div:nth-child(7) > span > span.selection > span > ul > li > input",
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

    //Locators Group Product explore 
    ProductLabel: 'span.dokan-label.dokan-label-success.dokan-product-status-label',
    ProductViewBtn: 'h1 > span.dokan-right > a',
    ProductTitleInput:'.dokan-form-control',
    ProductPrice:'_regular_price',
    ProductCategory:'#product_cat',
    ProductTypeInput: '#product_type',
    AddProduct:'#dokan-create-new-product-btn',
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
    ProductAttributeName:'attribute_names[0]',
    ProductAttributeValue:'//li/div[2]/div[2]/span/span/span/ul/li/input',
    ProductAttributeVisibility:'attribute_visibility[0]',
    ProductAttributeVariation:'attribute_variation[0]',
    EnableProductDiscount:'//*[@id="_is_lot_discount"]',
    DiscountProductQuantity:'//*[@id="_lot_discount_quantity"]',
    DiscountProductAmount:'//*[@id="_lot_discount_amount"]',

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

    //Locator for create auction product
    AuctionProductTitle:'post_title',
    AuctionProductCategory:'product_cat',
    AddAuctionProxy:'#_auction_proxy',
    AuctionStartPrice:'_auction_start_price',
    BidAuctionProduct:'_auction_bid_increment',
    ReservePrice:'_auction_reserved_price',
    RegularPrice:'_regular_price',
    StartDate:'//input[@id="_auction_dates_from"]',
    EndDate:'//input[@id="_auction_dates_to"]',

   //Locator for Booking product
    BookingProductTitle:'post_title',
    BookingDurationType:'_wc_booking_duration_type',
    BookingDuration:'_wc_booking_duration',
    BookingDurationUnit:'_wc_booking_duration_unit',
    BookingMinDuration:'_wc_booking_min_duration',
    BookingMaxDuration:'_wc_booking_max_duration',
    BookingCalendarDisplay:'_wc_booking_calendar_display_mode',
    BookingEnableRangePicker:'_wc_booking_enable_range_picker',
    BookingQuantity:'_wc_booking_qty',
    BookingMinDate:'_wc_booking_min_date',
    BookingMinDateUnit:'_wc_booking_min_date_unit',
    BookingMaxDate:'_wc_booking_max_date',
    BookingMaxDateUnit:'_wc_booking_max_date_unit',
    BookingBufferPeriod:'_wc_booking_buffer_period',
    BookingAvailabiltyFromDate:' //*[@name="wc_booking_availability_from_date[]"]',
    BookingAvailabiltyToDate:'wc_booking_availability_to_date',
    BookingAvalability:'wc_booking_availability_bookable',
    BookingAvailabiltyPriority:'wc_booking_availability_priority',
    BookingCost:'_wc_booking_cost',
    BookingBlockCost:'_wc_booking_block_cost',
    BookingDisplayCost:'_wc_display_cost',
    
    //Purchase Booking Product

    DateFilter:'//select[@name="orderby"]',
    BookingButtonClick:{css:'.product:nth-child(1) > .item-content .flaticon'},
    BookingStartTime:'#wc-bookings-form-start-time',
    BookingEndTime:'#wc-bookings-form-end-time',

   //SingleproductMultiplevendor
    SpmvSellItemButton:'dokan_spmv[sell_item_btn]',
    SpmvAvailableVendorListTitle:'dokan_spmv[available_vendor_list_title]',
    SpmvAvailableVendorListPosition:'dokan_spmv[available_vendor_list_position]',
    SpmvShowOrder:'dokan_spmv[show_order]',
    SpmvSettingUpdate:'#setting-message_updated',
    
    //Vendor Set vacation 
     SetVacation:'setting_go_vacation',
     StoreCloseStyle:'settings_closing_style',
     StoreCloseFrom:'dokan_seller_vacation_datewise_from',
     StoreCloseTo:'dokan_seller_vacation_datewise_to',
     SellerVacationMessage:'dokan_seller_vacation_datewise_message',
     SellerVacationSave:'#dokan-seller-vacation-save-edit',
 
     //wholesaleproductlocator
     WholeSalePrice:'#dokan-wholesale-price',
     WholeSaleProductQuantity:'#dokan-wholesale-qty',

     //LiveSeachModulelocator
     SelectSearchwithSuggestionBox:'//select[@id="dokan_live_search_setting[live_search_option]"]',
     LiveSearchWidget:'//div[@id="widget-21_dokna_product_search-__i__"]/div/div[2]/h3',
     DokanSideBarWidget:'//button[contains(.,"Dokan Store Sidebar")]',
     ClickSearchBox:'//input[@name="s"]',
     
     //Locator for subscription product

     EnableSubscription:'dokan_product_subscription[enable_pricing]',
     EnableSubscriptionPack:'dokan_product_subscription[enable_subscription_pack_in_reg]',
     EnableSubscriptionByMail:'dokan_product_subscription[notify_by_email]',
     SubscriptionEndMail:'//*[@id="dokan_product_subscription[no_of_days_before_mail]"]',
     SubscriptionStatus:'dokan_product_subscription[product_status_after_end]',
     SubmitDokanSubscription:{ css : '#dokan_product_subscription #submit'},
     SubscriptionPack:'post_title',
     SubscriptionPrice:'_regular_price',
     NumberOfSubscriptionProduct:'//input[@id="_no_of_product"]',
     SubscriptionPackValidaty:'//input[@id="_no_of_product"]',
     SubscriptionProductCommission:'_subscription_product_admin_commission_type',
     GlobalAdminCommission:'admin_commission',

     //StripePaymentGatewayLocator
     StripePaymentTitle:{css: 'tr:nth-child(7) .wc-payment-gateway-method-title'},
     EnableStripe:'#woocommerce_dokan-stripe-connect_enabled',
     ConnectOnTestMode:'#woocommerce_dokan-stripe-connect_testmode',
     EnableStripeCheckOut:'Enable Stripe Checkout',
     StripeSecretKey:'#woocommerce_dokan-stripe-connect_test_secret_key',
     StripePublicKey:'#woocommerce_dokan-stripe-connect_test_publishable_key',
     StripeClientId:'#woocommerce_dokan-stripe-connect_test_client_id',
     
    //locator for shipping

    EnableSellingLocation:'#woocommerce_allowed_countries',
    EnableShippingLocation:'#woocommerce_ship_to_countries',
    ZoneRegion:{css:'#mainform > table > tbody > tr:nth-child(2) > td > span > span.selection > span > ul > li > input'},
    AddShippingMethod:{css:'#mainform > table > tbody > tr:nth-child(3) > td > table > tfoot > tr > td > button'},
    SelectShippingMethod:{css:'#wc-backbone-modal-dialog > div.wc-backbone-modal > div > section > article > form > div > select'},
   
    
     //locator for refund
     firstOrder:{css:'tr:nth-child(1) strong'},
     EditOrderStatus:{css:'.dokan-edit-status'},
     ChangeOrderStatus:'#order_status',
  
    //Product Create
    AuctionProduct: faker.commerce.productName(),

    //Backend Settings
    ConfirmationMessage:'Setting has been saved successfully.',
    ConfirmationLocator: '#setting-message_updated',


















}