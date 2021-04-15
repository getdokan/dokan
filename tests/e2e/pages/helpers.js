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

const { I } = inject();

module.exports = {

    pageStatus() {
        I.amOnPage('/');
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
        I.fillField('Username or email address ', 'vendor-one');
        I.fillField('Password', '123456');
        I.click('Login');
        I.seeInCurrentUrl('/dashboard');
    },
    async checkExistingBalance() {
        I.amOnPage('/dashboard/withdraw');
        const bal = await I.grabTextFrom(locator.VendorBalance);
        existing_balance = parseInt(bal.replace(/[, \$৳]+/g, ""));
        console.log('Existing Balance:', existing_balance);
    },
    SelectSingleProduct() {
        I.amOnPage('/shop/');
        I.click('simple_product');
    },
    SelectMultipleProduct() {
        I.amOnPage('/shop/');
        I.selectOption(locator.SortingDropdown, 'price-desc');
        I.click(locator.ThirdProductLocator);
        I.click('simple_product');
    },
    SelectMultipleProductMultiplrVendor() {
        I.amOnPage('/shop/');
        I.selectOption(locator.SortingDropdown, 'price-desc');
        I.click(locator.ThirdProductLocator);
        I.click('simple_product_2');
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
        console.log('Vendor Current Earning ', current_earnings);

    },
    async balanceAssertEqual() {
        // this.grabCurrentEarnings();
        I.amOnPage('/dashboard/withdraw');
        current_balance = existing_balance + current_earnings;
        console.log('Vendor Current balance', current_balance);
        const up_bal = await I.grabTextFrom(locator.VendorBalance);
        actual_balance = parseInt(up_bal.replace(/[, \$৳]+/g, ""));
        strict.equal(current_balance, actual_balance);
        I.say('Calculation matched');
        console.log('Vendor Existing Balance', existing_balance, '+', 'Vendor Current Earning', current_earnings, '=', 'Vendor Actual Balance', existing_balance + current_earnings);

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
        strict.equal(admin_current_balance, admin_actual_balance, "Message Done");
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
    },
    //Simple Product Functionalities
    setregularprice() {
        I.fillField('Price', '20');
        I.fillField('Discounted Price', '15');
        I.click(locator.SaveProduct);
    },

    cancelschedule() {
        I.seeElement(locator.CancelLink);
        I.click(locator.CancelLink);
        I.click(locator.SaveProduct);

    },
    setSchedule() {
        I.click('Schedule');
        I.fillField(locator.CalenderFrom, '2021-01-01');
        I.fillField(locator.CaldenderTO, '2021-12-31');
        I.wait(3);
        I.click(locator.SaveProduct);

    },
    checkVirtual() {
        I.wait(2);
        I.checkOption(locator.Virtual);
        I.wait(3);
        I.dontSeeElement(locator.ShippingDiv);
        I.click(locator.SaveProduct);

    },
    uncheckVirtual() {
        I.wait(2);
        I.uncheckOption(locator.Virtual);
        I.wait(2);
        I.seeElement(locator.ShippingDiv);
        I.click(locator.SaveProduct);

    },

    checkWrongPrice() {
        I.fillField('Price', '12');
        //this.fillField('Discounted Price','15');
        I.click(locator.SaveProduct);
        I.see(locator.SuccessMsg);
        console.log('Price should not be lower than discount price. Validation neededs');
    },
    checkmulticat() {
        I.refreshPage();
        I.click(locator.CategoryContainer);
        I.click(locator.CategoryInput);
        I.fillField(locator.CategoryInput, 'For multiple');
        I.pressKey('Enter');
        I.click(locator.SaveProduct);
        I.see('For multiple');
    },
    checksinglecat() {

        I.click(locator.CategoryContainer);
        I.click(locator.CategoryInput);
        I.fillField(locator.CategoryInput, 'For single');
        I.pressKey('Enter');
        I.click(locator.SaveProduct);
        I.see('For single');
    },
    checktags() {
        I.refreshPage();
        I.click(locator.TagField);
        I.fillField(locator.TagInput, 'single');
        I.wait(2);
        //I.click('li.select2-results__option.select2-results__option--highlighted');
        I.pressKey('Enter');
        I.click(locator.SaveProduct);
        I.wait(2);
        //I.clearField('div:nth-child(6) > span > span.selection > span > ul > li > input');
        I.click(locator.TagField);
        I.fillField(locator.TagInput, 'gadgets');
        I.wait(2);
        I.pressKey('Enter');
        I.click(locator.SaveProduct);
        I.wait(2);
    },
    shortDesc() {
        var sdesc = faker.lorem.sentences();
        I.scrollTo(locator.ShortDecLabel);
        within({
            frame: locator.ShortDescFrame
        }, () => {
            I.fillField(locator.ShortDescInput, sdesc);
        });
        I.click(locator.SaveProduct);
        I.wait(2);
    },
    desc() {
        var desc = faker.lorem.text();
        I.scrollTo(locator.DescLabel);
        within({
            frame: locator.DescFrame
        }, () => {
            I.fillField(locator.DescInput, desc);
        });
        I.click(locator.SaveProduct);
        I.wait(4);
    },
    clearDesc() {
        I.scrollTo(locator.ShortDecLabel);
        within({
            frame: locator.ShortDescFrame
        }, () => {
            I.wait(2);
            I.click(locator.ShortDescInput);
            I.pressKey(['CommandOrControl', 'A']);
            I.pressKey('Delete');
            I.wait(2);
        });
        within({
            frame: locator.DescFrame
        }, () => {
            I.wait(2);
            I.click(locator.DescInput);
            I.pressKey(['CommandOrControl', 'A']);
            I.pressKey('Delete');
            I.wait(2);
        });
        I.click(locator.SaveProduct);
        I.wait(2);
    },
    wholesale() {
        I.scrollTo(locator.WholeSaleDiv);
        I.checkOption(locator.WholeSaleCheck);
        I.fillField(locator.WholeSalePrice, faker.random.number(10, 20));
        I.fillField(locator.WholeSaleQty, faker.random.number(5, 10));
        I.click(locator.SaveProduct);
        I.wait(3);
    },
    clearwholesale() {
        I.scrollTo(locator.WholeSaleDiv);
        I.clearField(locator.WholeSalePrice);
        I.clearField(locator.WholeSaleQty);
        I.click(locator.SaveProduct);
        I.wait(2);
    },
    // Start of Group product Functionalities
    checkrmalimited() {
        I.checkOption(locator.RmaCheckBox);
        I.fillField(locator.RmaLabelInput, 'New Warranty limited');
        I.selectOption(locator.RmaTypeDropdown, 'Warranty Included');
        I.selectOption(locator.RmaLengthDropdown, 'Limited');
        I.fillField(locator.RmaLengthValue, '10');
        I.selectOption(locator.RmaLengthDuration, 'Months');
        I.scrollTo(locator.RmaContentDiv);
        within({
            frame: locator.RmaPolicyIframe
        }, () => {
            I.fillField(locator.RmaPolicyInput, 'policy added');
        });
        I.click(locator.SaveProduct);
    },
    checkrmalifetime() {
        I.checkOption(locator.RmaCheckBox);
        I.fillField(locator.RmaLabelInput, 'New Warranty Lifetime');
        I.selectOption(locator.RmaTypeDropdown, 'Warranty Included');
        I.selectOption(locator.RmaLengthDropdown, 'Lifetime');
        I.click(locator.SaveProduct);
    },
    checkrmawarrentyaddon() {
        I.checkOption(locator.RmaCheckBox);
        I.fillField(locator.RmaLabelInput, 'New Warranty Addon');
        I.selectOption(locator.RmaTypeDropdown, 'Warranty as Add-On');
        I.fillField(locator.RmaAddonCostInput, '50');
        I.fillField(locator.RmaAddonDurationInput, '1');
        I.selectOption(locator.RmaAddonDurationDropdown, 'Days');
        I.click(locator.RmaWarrentyAddonBtn);
        I.click(locator.SaveProduct);
    },
    clearrma() {
        I.uncheckOption(locator.RmaCheckBox);
        I.click(locator.SaveProduct);
    },
    checknotes() {
        I.fillField(locator.PurchaseNotesInput, faker.lorem.text());
        I.click(locator.SaveProduct);
        I.clearField(locator.PurchaseNotesInput);
    },
    checkgroup() {
        I.scrollTo(locator.LinkedProductSection);
        I.click(locator.LinkedProductUpsells);
        I.fillField(locator.LinkedProductUpsells, 'simple_pro_1');
        I.wait(1);
        I.pressKey('Enter');
        I.wait(1);
        I.fillField(locator.LinkedProductUpsells, 'simple_pro_2');
        I.wait(1);
        I.pressKey('Enter');
        I.clearField(locator.LinkedProductUpsells);
        I.click(locator.LinkedProductCrossSells);
        I.fillField(locator.LinkedProductCrossSells, 'simple_pro_3');
        I.wait(1);
        I.pressKey('Enter');
        I.clearField(locator.LinkedProductCrossSells);
        I.click(locator.LinkedProductGrouped);
        I.fillField(locator.LinkedProductGrouped, 'group_product_2');
        I.wait(1);
        I.pressKey('Enter');
        I.clearField(locator.LinkedProductGrouped);
        I.click(locator.SaveProduct);
    }

}