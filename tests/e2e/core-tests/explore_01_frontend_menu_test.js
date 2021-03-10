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
        I.click('User Subscriptions').then((result) => {
            I.say('Module Activated', 'blue');
        }).catch((err) => {
            //console.log('%cPay attention to me', 'color:firebrick;font-size:40px');
            I.say('Alvi Inactivate', 'megenta');
        });

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