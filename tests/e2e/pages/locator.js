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






}