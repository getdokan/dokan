const { ifError, strict } = require("assert");
const { assert, Console } = require("console");
const explore = require('../pages/explore');
Feature('explore Frontend Functionality');



Before(({ I }) => { // or Background
    I.loginAsVendor();
});

Scenario('Preview and Explore Vendor Dashboard', ({ I }) => {
    //Dashboard Element Start
    // var possiblePromise = explore.checkDashboardElements();
    // var certainPromise = Promise.resolve(possiblePromise).then((result) => {
    //     console.log(result);
    // }).catch((err) => {
    //     console.log("Error Intest")
    // });
    // console.log(certainPromise);
    explore.checkDashboardElements();
    //Dashboard element Finish
    //Vendor Products
    explore.checkProductPage();

    // I.click('//*[@id="dokan-product-list-table"]/tbody/tr[1]/td[2]/strong/a');
    // I.checkError();
    // //Order Explore
    // I.click('Orders');
    // I.waitForElement('.dokan-orders-area');
    // I.checkError();
    // I.seeElement('form', 'order_date_filter');
    // I.seeElement('form', 'Filter by registered customer');
    // I.seeElement('form', 'Filter');
    // I.seeElement('form', 'Export All');
    // I.seeElement('form', 'Export Filtered');
    // I.seeElement('form', 'Bulk Actions');
    // I.seeElement('form', 'Apply');
    // I.click('//*[@id="order-filter"]/table/tbody/tr[1]/td[1]/a');
    // I.checkError();
    // I.amOnPage('/dashboard/orders/?order_status=wc-completed/');
    // I.checkError();
    // I.amOnPage('/dashboard/orders/?order_status=wc-processing/');
    // I.checkError();
    // I.amOnPage('/dashboard/orders/?order_status=wc-on-hold/');
    // I.checkError();
    // I.amOnPage('/dashboard/orders/?order_status=wc-pending/');
    // I.checkError();
    // I.amOnPage('/dashboard/orders/?order_status=wc-cancelled/');
    // I.checkError();
    // I.amOnPage('/dashboard/orders/?order_status=wc-refunded/');
    // I.checkError();
    // I.amOnPage('/dashboard/orders/?order_status=wc-failed/');
    // I.checkError();
    // I.click('Subscription');
    // tryTo(() => {
    //     I.click('User Subscriptions');
    //     I.waitForElement('.dashboard-user-subscription-area');
    //     I.checkError();
    //     I.click('//*[@id="post-5"]/div/div/div[2]/article/table/tbody/tr/td[2]/a/strong');
    //     I.checkError();
    // });
    // I.waitForElement('div > div.seller_subs_info');
    // I.checkError();
    // // I.click('//*[@id="post-5"]/div/div/div[2]/article/table/tbody/tr/td[2]/a/strong');
    // // I.checkError(); 
    // //Explore Coupons
    // I.click('Coupons');
    // I.waitForElement('.dashboard-coupons-area');
    // I.checkError();
    // //Explore Reports
    // I.click('Reports');
    // I.waitForElement('.dokan-dashboard-content.dokan-reports-content');
    // I.checkError();
    // I.click('Sales by day');
    // I.checkError();
    // I.click('Top selling');
    // I.checkError();
    // I.click('Top earning');
    // I.checkError();
    // I.click('Statement');
    // I.checkError();
    // I.click('Reviews');
    // I.waitForElement('.dokan-comments-wrap');
    // I.checkError();
    // I.click('//*[@id="dokan-comments-table"]/tbody/tr/td[4]/a');
    //     I.checkError();
    //Explore Reviews
    // I.amOnPage('/dashboard/reviews/?comment_status=hold/');
    // I.checkError();
    // I.amOnPage('/dashboard/reviews/?comment_status=spam/');
    // I.checkError();
    // I.amOnPage('/dashboard/reviews/?comment_status=trash/');
    // I.checkError();
    // I.click('Withdraw');
    // I.waitForElement('.dokan-withdraw-area');
    // I.checkError();
    // I.click('Approved Requests');
    // I.checkError();
    // I.click('Cancelled Requests');
    // I.checkError();
    // I.click('Return Request');
    // I.waitForElement('.dokan-rma-request-area');
    // I.checkError();
    // I.checkError();
    // I.click('Staff');
    // I.waitForElement('.dokan-staffs-area');
    // I.checkError();
    // I.click({ css: 'td > a' });
    // I.checkError();

    // I.click('Followers');
    // I.waitForElement('.dashboard-content-area');
    // I.checkError();
    // I.click('Subscription');
    // 	I.waitForElement('.dokan-dashboard-content');
    //     I.checkError();
    // I.click('Analytics');
    // I.waitForElement('.dokan-reports-area');
    // I.amOnPage('/dashboard/support/?ticket_status=all/');
    // I.checkError();
    // I.amOnPage('/dashboard/support/?ticket_status=closed/');
    // I.checkError();
    //////////////////////////////////////////////////////////
    // I.click('Settings');
    // I.waitForElement('.dokan-settings-area');
    // I.checkError();
    // I.click('Addons');
    // I.waitForElement('.dokan-settings-area');
    // I.checkError();
    // I.click('//*[@id="the-list"]/tr/td[1]/a');
    // I.checkError();
    // I.click('Payment');
    // I.waitForElement('.dokan-settings-area');
    // I.checkError();
    // I.click('Verification');
    // I.waitForElement('.dokan-settings-area');
    // I.checkError();
    // I.click('Shipping');
    // I.waitForElement('.dokan-settings-area');
    // I.checkError();
    // I.click('ShipStation');
    // I.waitForElement('.dokan-settings-area');
    // I.checkError();
    // I.click('Social Profile');
    // I.waitForElement('.dokan-settings-area');
    // I.checkError();
    // I.click('RMA');
    // I.waitForElement('.dokan-settings-area');
    // I.checkError();
    // I.click('Store SEO');
    // I.waitForElement('.dokan-settings-area');
    // I.checkError();
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

// Scenario('Preview and Explore Vendor Store Page', ({ I }) => {
//     I.amOnPage('/my-account');
//     I.see('My account');
//     I.waitForElement('div.woocommerce-MyAccount-content');
//     I.checkError();
//     I.click('recent orders');
//     I.seeInCurrentUrl('/my-account/orders/');
//     I.click('Dashboard');
//     // I.click('shipping and billing addresses');
//     //     I.seeInCurrentUrl('/my-account/edit-address/');
//     //     I.click('Dashboard');
//     // I.click('edit your password and account details');
//     //     I.seeInCurrentUrl('/my-account/edit-account/');
//     //     I.click('Dashboard');
//     // I.click('Go to Vendor Dashboard');
//     //     I.seeInCurrentUrl('/dashboard/');
//     //     I.amOnPage('/my-account');
//     I.click('Orders');
//     I.waitForElement('.woocommerce-MyAccount-content', 5);
//     I.checkError();
//     I.click('//*[@id="post-12"]/div/div/div/table/tbody/tr/td[1]/a');
//     I.waitForElement('.woocommerce-MyAccount-content', 5);
//     I.checkError();
//     I.click('Subscriptions');
//     I.waitForElement('.woocommerce_account_subscriptions', 5);
//     I.checkError();
//     I.click('Downloads');
//     I.waitForElement('.woocommerce-MyAccount-content', 5);
//     I.checkError();
//     I.click('Addresses');
//     I.waitForElement('.woocommerce-MyAccount-content', 5);
//     I.checkError();
//     I.see('Billing address');
//     I.see('Shipping address');
//     I.click('RMA Requests');
//     I.waitForElement('.woocommerce-MyAccount-content', 5);
//     I.checkError();
//     I.click('Account details');
//     I.waitForElement('.woocommerce-MyAccount-content', 5);
//     I.checkError();
//     I.click('Vendors');
//     I.waitForElement('.woocommerce-MyAccount-content', 5);
//     I.checkError();
//     I.click('Seller Support Ticket');
//     I.waitForElement('.woocommerce-MyAccount-content', 5);
//     I.checkError();
//     I.click('Bookings');
//     I.waitForElement('.woocommerce-MyAccount-content', 5);
//     I.checkError();
//     I.click('Logout');
// }).tag('@exp');