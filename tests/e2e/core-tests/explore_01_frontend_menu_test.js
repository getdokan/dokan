const { ifError, strict } = require("assert");
const { assert, Console } = require("console");
const explore = require('../pages/explore');
Feature('Explore Menus');

Before(({ I }) => { // or Background
    I.loginAsVendor();
});

Scenario('Explore Vendor All Menu Pages', async({ I }) => {
    
    // explore.DashboardElements(); 
    // explore.ProductPageElements(); 
    // explore.OrderPageElements(); 
    explore.UserSubscriptionPageElements(); 

    // const proFeature = ['User Subscriptions', 'Subscription'];
    // tryTo(() => {
    //     I.click('User Subscriptions').then((result) => {
    //         I.say('Product Subscription Module Activated', 'yellow');
    //     }).catch((err) => {
    //         I.say('Product Subscription Module Inactivated', 'red');
    //     });

    // // It's working only live server
    //     // I.waitForElement('.dashboard-user-subscription-area');
    //     // I.checkError();
    //     // I.click('//*[@id="post-5"]/div/div/div[2]/article/table/tbody/tr/td[2]/a/strong');
    //     // I.checkError();
    // });

    // tryTo(() => {
    //     I.click('Subscription').then((result) => {
    //         I.say('Vendor Subscription Module Activated', 'yellow');
    //     }).catch((err) => {
    //         I.say('Vendor Subscription Module Inactivated', 'red');
    //     });
    // });
    
    explore.CouponPageElements();
    // explore.ReportPageElements();
    // explore.ReviewPageElements();
    // explore.WithdrawPageElements();
    // explore.ReturnRequestPageElements();
    // explore.StaffPageElements();
    // explore.FollowerPageElements();
    // explore.SubscriptionPageElements();
    // explore.BookingPageElements();
    // explore.AnalyticsPageElements();
    // explore.AnnouncementPageElements();
    // explore.ToolPageElements();
    // explore.AuctionPageElements();
    // explore.InboxPageElements();
    // explore.SupportPageElements();
    // explore.SettingsPageElements();
    // explore.checkSettingPage(); //Explore Setting

});