const { ifError, strict } = require("assert");
const { assert } = require("console");
var Factory = require('rosie').Factory;
var faker = require('faker');
const locator = require('./locator');
var existing_balance;
var current_earnings;
var current_balance;
var actual_balance;
var admin_existing_balance;
var admin_current_commission;
var admin_current_balance;
var admin_actual_balance;


const {
    I
} = inject();
module.exports = {

    pageStatus() {
        I.amOnPage('http://localhost:10003/');
        I.click('Login / Register');
        I.seeElement(locator.RegisterLocator);
    },
    registerSuccess() {

        I.fillField(locator.EmailAdressLocator, locator.EmailAddress);
        I.fillField(locator.PasswordInput, locator.PasswordValue);
        I.checkOption('I am a vendor');
        I.fillField('First Name', locator.FirstName);
        I.fillField('Last Name', locator.Lastname);
        I.fillField('Shop Name', locator.Shopname);
        I.scrollTo(locator.PhoneNumberInput);
        I.click(locator.PhoneNumberInput);
        I.fillField(locator.PhoneNumberInput, locator.PhoneNumberValue);
        I.click('Register');
        //I.see('Welcome to the Marketplace!');
        I.click('Not right now');
        I.seeInCurrentUrl('/dashboard');
    },
    checkVendor() {
        I.amOnPage('/dashboard');
        I.moveCursorTo(locator.MenuHoverDropdown);
        I.click(locator.MyAccount);
        I.click(locator.EditAccount);
        I.seeInField('Email address', locator.EmailAddress);
    },
    loginAsVendor() {
        I.fillField('Username or email address ', 'alvitazwar@wedevs.com');
        I.fillField('Password', 'alvitazwar1122334456');
        I.click('Login');
        I.seeInCurrentUrl('/dashboard');
    },
    async checkExistingBalance() {
        I.amOnPage('/dashboard/withdraw');
        const bal = await I.grabTextFrom(locator.VendorBalance);
        existing_balance = parseInt(bal.replace(/[, \$৳]+/g, ""));
        console.log('Existing Balance:', existing_balance);
    },
    placeOrder() {
        I.click('Add to cart');
        I.click(locator.ViewCart); //View Cart
        I.click(locator.ProceedCheckout); // Proceed To checkout
        I.seeInCurrentUrl('/checkout');
        I.fillField(locator.BillingFirstName, locator.FirstName);
        I.fillField(locator.BillingLastName, locator.Lastname);
        I.fillField(locator.BillingCompanyName, faker.company.companyName());
        I.fillField(locator.BillingAddress, faker.address.streetAddress());
        I.fillField(locator.BillingCity, faker.address.city());
        I.fillField(locator.BillingPhone, faker.phone.phoneNumberFormat());
        I.fillField(locator.BillingEmail, locator.EmailAddress);
        I.checkOption('Direct bank transfer'); // This will be Replaced Soon.
        I.click(locator.PlaceOrderBtn);
        I.waitForText(locator.OrderSuccessMsg, 30, '.woocommerce-order');
    },
    updateOrderStatus() {
        I.amOnPage('/dashboard/orders');
        I.click(locator.FirstOrderRow);
        // I.wait(5);
        I.click(locator.EditStatusLink);
        I.selectOption('#order_status', 'Completed');
        I.click('Update');
        // I.wait('5');
        // I.waitForElement(locator.GeneralDetails, 30);
        I.see('Completed');
    },


    async grabCurrentEarnings() {
        I.amOnPage('/dashboard/orders');
        //I.click('Orders');
        let earning = await I.grabTextFrom(locator.CurrentEarning);
        current_earnings = parseInt(earning.replace(/[, \$৳]+/g, ""));
        console.log('Current Earning ', current_earnings);

    },
    async balanceAssertEqual() {
        // this.grabCurrentEarnings();
        I.amOnPage('/dashboard/withdraw');
        current_balance = existing_balance + current_earnings;
        console.log('Current balance', current_balance);
        const up_bal = await I.grabTextFrom(locator.VendorBalance);
        actual_balance = parseInt(up_bal.replace(/[, \$৳]+/g, ""));
        strict.equal(current_balance, actual_balance);
        I.say('Calculation matched');
        console.log('Existing Balance', existing_balance, '+', 'Current Earning', current_earnings, '=', 'Actual Balance', existing_balance + current_earnings);

    },
    async adminBalanceCheck() {
        I.amOnPage('/wp-admin/admin.php?page=dokan#/reports');
        I.scrollTo(locator.AdminBalance);
        let ad_bal = await I.grabTextFrom(locator.AdminBalance);
        admin_existing_balance = parseInt(ad_bal.replace('৳', "").replace('$', "").trim());
        console.log('Admin Existing Balance:', admin_existing_balance);
    },
    async getAdminComission() {
        I.amOnPage('/wp-admin/admin.php?page=dokan#/reports?tab=logs');
        let ad_com = await I.grabTextFrom(locator.AdminComission);
        admin_current_commission = parseInt(ad_com.replace('৳', "").replace('$', "").trim());
        console.log('Admin Current Commission:', admin_current_commission);
    },
    async checkAdminCalculation() {
        I.amOnPage('/wp-admin/admin.php?page=dokan#/reports');
        I.scrollTo(locator.AdminBalance);
        admin_current_balance = admin_existing_balance + admin_current_commission;
        console.log('Admin Current Balance:', admin_current_balance);
        let ad_actual_bal = await I.grabTextFrom(locator.AdminBalance);
        admin_actual_balance = parseInt(ad_actual_bal.replace('৳', "").replace('$', "").trim());
        strict.equal(admin_current_balance, admin_actual_balance,"Message Done");
        console.log('Admin Existing Balance', admin_existing_balance, '+', 'Current Comission', admin_current_commission, '=', 'Admin Actual Balance', admin_existing_balance + admin_current_commission);
        I.say('Calculation matched');
    },
    vendorlogout() {
        I.moveCursorTo(locator.VendorMoveCursor);
        I.click(locator.VendorLogout);
    },
    customerlogout() {
        I.moveCursorTo(locator.CustomerMoveCursor);
        I.click('Log out');
    },
    adminlogout() {
        I.moveCursorTo(locator.AdminMoveCursor);
        I.wait(1);
        I.click(locator.AdminLogout);
    }
}