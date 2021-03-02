var Factory = require('rosie').Factory;
var faker = require('faker');
const helpers = require('../pages/helpers');
const { I } = inject();

Given('Existing balance of Admin will be checked', async() => {
    I.loginAsAdmin();
    await helpers.adminBalanceCheck();
    helpers.adminlogout();
});
When('Customer purchase a simple product', () => {
    I.loginAsCustomer();
    I.amOnPage('/shop');
    I.click('simple_pro_1');
    //Place A new Order
    helpers.placeOrder();
    helpers.customerlogout();
});
Then('Admin balance and commission will be checked', async() => {
    I.loginAsAdmin();
    //Change Order Status
    await helpers.getAdminComission();
    await helpers.checkAdminCalculation();
    helpers.adminlogout();
});

Then('Vendors Existing Balance will be checked and approve order status to comeplete', async() => {
    I.loginAsVendor();
    //Check Vendors Existing Balance
    await helpers.checkExistingBalance();
    //Change Order Status
    helpers.updateOrderStatus();
});
Then('Vendor balance will update with addition of new order earning amount', async() => {
    await helpers.grabCurrentEarnings();
    //start calculation matching
    await helpers.balanceAssertEqual();
});