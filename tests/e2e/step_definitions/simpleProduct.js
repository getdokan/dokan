var Factory = require('rosie').Factory;
var faker = require('faker');
const helpers = require('../pages/helpers');
const features_helper = require('../pages/features_helper');
const { I, loginAs } = inject();

Given('Existing balance of Admin will be checked', () => {
    loginAs('admin');
    features_helper.adminBalanceCheck();
    helpers.adminlogout();
});
When('Customer purchase a simple product', () => {
    loginAs('Customer');
    // I.amOnPage('/shop');
    // I.amOnPage('/store/vendor-one/');
    // I.click('simple_pro_3');
    I.amOnPage('/product/simple_pro_3-5/');
    //Place A new Order
    helpers.placeOrder();
    helpers.customerlogout();
});
Then('Admin balance and commission will be checked', async() => {
    loginAs('admin');
    //Change Order Status
    await features_helper.getAdminComission();
    await features_helper.checkAdminCalculation();
    helpers.adminlogout();
});

Then('Vendors Existing Balance will be checked and approve order status to comeplete', async() => {
    loginAs('Vendor');
    //Check Vendors Existing Balance
    await features_helper.checkExistingBalance();
    //Change Order Status
    helpers.updateOrderStatus();
});
Then('Vendor balance will update with addition of new order earning amount', async() => {
    await features_helper.grabCurrentEarnings();
    //start calculation matching
    await features_helper.balanceAssertEqual();
});