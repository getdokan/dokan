var Factory = require('rosie').Factory;
var faker = require('faker');
const { loginAsVendor } = require('../pages/helpers');
const helpers = require('../pages/helpers');
const { I } = inject();

Given('Existing balance of Admin will be checked', async(I) => {
    I.loginAsAdmin();
    await helpers.adminBalanceCheck();
    helpers.adminlogout();
});
When('Customer purchase a simple product from multiple vendor ', () => {
    loginAsVendor();
    I.amOnPage('/shop');
    I.click('simple_pro_3');
    //Place A new Order
    helpers.placeOrder();
    helpers.customerlogout();
});
Then('Admin balance and commission will be checked', async(I,loginAs) => {
   loginAsAdmin();
    //Change Order Status
    await helpers.getAdminComission();
    await helpers.checkAdminCalculation();
    helpers.adminlogout();
});

Then('Vendors One Existing Balance', async() => {
    I.loginAsVendor();
    //Check Vendors Existing Balance
    await helpers.checkExistingBalance();
    //Change Order Status
    helpers.updateOrderStatus();
});
Then('Vendors two Existing Balance', async() => {
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
