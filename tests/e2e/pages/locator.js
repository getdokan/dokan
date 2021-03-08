var Factory = require('rosie').Factory;
var faker = require('faker');
const { I } = inject();

module.exports = {
    // Locators for  Registration page
    // Start
    RegisterLocator: 'div.grid-50.tablet-grid-50.reg-form > h2',
    EmailAddress: faker.internet.email(),
    EmailAdressLocator: 'Email address',
    PasswordInput: '#reg_password',
    PasswordValue: 'alvitazwar@54321',
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
    ViewCart: 'div.woocommerce-notices-wrapper > div > a',
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
    AdminBalance: ' div.inside > div > div > ul > li.commission > a > strong > div',
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
    //Analytics
    AnalyticsArea: '.dokan-reports-area',
    AllAnalytics: '/dashboard/support/?ticket_status=all/',
    CloseAnalytics: '/dashboard/support/?ticket_status=closed/',
    //Settings
    SettingArea: '.dokan-settings-area',

















}