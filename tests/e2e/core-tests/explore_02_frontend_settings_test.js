const explore = require('../pages/explore');
Feature('Explore Settings');

// Before(({ I }) => { // or Background
//     I.loginAsVend();
// });
Scenario('Preview and Explore Vendor Store Page', ({ I,loginAs}) => {
    loginAs('vendor');
    explore.checkMyAccOrderDetails();
    tryTo(() => {
        I.amOnPage('/my-account');
        I.click('Subscriptions');
        I.waitForElement('.woocommerce_account_subscriptions', 5);
        I.checkError();
    });
    tryTo(() => {
        I.amOnPage('/my-account');
        I.click('Bookings');
        I.waitForElement('.woocommerce-MyAccount-content', 5);
        I.checkError();
    });

    explore.checkStoreSettings(); //Need to work

});