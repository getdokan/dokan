const { ifError, strict } = require("assert");
const { assert, Console } = require("console");
const explore = require('../pages/explore');
Feature('Explore Menus');

Before(({ I }) => { // or Background
    I.loginAsVendor();
});

Scenario('Explore Vendor All Menu Pages', async({ I }) => {
    //Dashboard Element Start
    explore.checkDashboardElements();
    //Dashboard element Finish
    //Vendor Products
    explore.checkProductPage();
    //Order Explore
    explore.checkOrderPage();
    I.click('Subscription');
    tryTo(() => {
        I.click('User Subscriptions');
        I.waitForElement('.dashboard-user-subscription-area');
        I.checkError();
        I.click('//*[@id="post-5"]/div/div/div[2]/article/table/tbody/tr/td[2]/a/strong');
        I.checkError();
    });
    //Explore Coupons Report and Review
    explore.checkCouponReportReview();
    // Explore Withdraw Return
    explore.checkWithdrawReturnStaff();
    //Explore Followe subscription
    explore.checkFollowerSubscriptionAnalytics();
    //Explore Setting
    explore.checkSettingPage();

});


// Scenario('Preview and Explore Vendor Account Page', ({ I }) => {
//     I.amOnPage('/dashboard/settings/store/');
//     I.click('a.tips');
//     // I.waitForElement('.content-area');
//     I.waitForElement('.dokan-single-store');
//     I.checkError();
//     I.click('Reviews');
//     I.waitForElement('#reviews');
//     I.checkError();
//     I.click('Vendor Biography');
//     I.waitForElement('#vendor-biography');
//     I.checkError();
//     // I.switchToPreviousTab();         //Switch prevoius Tab
//     I.closeCurrentTab(); // Close  urrent Tab
//     I.amOnPage('/store-listing');
//     I.waitForElement('#content');
//     I.checkError();
//     I.selectOption('form select[name=stores_orderby]', 'Most Popular');
//     I.waitForElement('.seller-listing-content');
//     I.selectOption('form select[name=stores_orderby]', 'Top Rated');
//     I.waitForElement('.seller-listing-content');
//     I.selectOption('form select[name=stores_orderby]', 'Most Reviewed');
//     I.waitForElement('.seller-listing-content');
//     I.amOnPage('/cart');
//     I.waitForElement('#content');
//     I.checkError();
//     I.amOnPage('/checkout');
//     I.waitForElement('#content');
//     I.checkError();
//     I.amOnPage('/shop');
//     I.waitForElement('#content');
//     // I.checkError();
// });