const { ifError, strict } = require("assert");
const { assert } = require("console");
var Factory = require('rosie').Factory;
var faker = require('faker');
const locator = require('./locator');

const { I } = inject();

module.exports = {
    checkDashboardElements() {
        I.amOnPage('/dashboard');
        I.seeInCurrentUrl('/dashboard/');
        I.waitForElement(locator.VendorContent);
        I.checkError();
        I.seeElement(locator.ProgressBar);
        I.seeElement(locator.LeftDashboard);
        I.seeElement(locator.SaleGraph);
        I.seeElementInDOM(locator.DashAnnountment);
        I.seeElementInDOM(locator.ProductWidget);

        //I.dontSeeElementInDOM(locator.ProductWidget)
    },
    checkProductPage() {
        I.amOnPage('/dashboard');
        I.click('Products');
        I.seeInCurrentUrl('/dashboard/products/');
        I.waitForElement(locator.ProductArea);
        I.checkError();
        I.seeElement('.active');
        I.seeElement('.active', 'All');
        I.see('Online');
        I.seeElement(locator.AddProductSpan, 'Add new Product');
        I.seeElement(locator.AddProductSpan, 'Import');
        I.seeElement(locator.AddProductSpan, 'Export');
        I.seeElement('form', 'All dates');
        I.seeElement('form', 'Select a category');
        I.seeElement('form', 'Filter');
        I.seeElement('form', 'Search Products');
        I.seeElement('form', 'Search');
        I.seeElement('form', 'Bulk Actions');
        I.seeElement('form', 'Apply');
        I.seeElement('table', '.dokan-checkbox');
        I.seeElement('table', 'Image');
        I.seeElement('table', 'Name');
        I.seeElement('table', 'Status');
        I.seeElement('table', 'SKU');
        I.seeElement('table', 'Stock');
        I.seeElement('table', 'Price');
        I.seeElement('table', 'Earning');
        I.seeElement('table', 'Type');
        I.seeElement('table', 'Views');
        I.seeElement('table', 'Date');
    },
    checkOrderPage() {
        I.amOnPage('/dashboard');
        I.click('Orders');
        I.waitForElement(locator.OrderArea);
        I.checkError();
        I.seeElement('form', 'order_date_filter');
        I.seeElement('form', 'Filter by registered customer');
        I.seeElement('form', 'Filter');
        I.seeElement('form', 'Export All');
        I.seeElement('form', 'Export Filtered');
        I.seeElement('form', 'Bulk Actions');
        I.seeElement('form', 'Apply');
        I.click(locator.FirstOrderRow);
        I.checkError();
        I.amOnPage(locator.CompleteOrder);
        I.checkError();
        I.amOnPage(locator.HoldOrder);
        I.checkError();
        I.amOnPage(locator.PendingOrder);
        I.checkError();
        I.amOnPage(locator.ProcessingOrder);
        I.checkError();
        I.amOnPage(locator.RefundOrder);
        I.checkError();
        I.amOnPage(locator.CancelOrder);
        I.checkError();

    },
    checkCouponReportReview() {
        I.amOnPage('/dashboard');
        I.click('Coupons');
        I.waitForElement(locator.CouponArea);
        I.checkError();
        //Explore Reports
        I.click('Reports');
        I.waitForElement(locator.ReportArea);
        I.checkError();
        I.click('Sales by day');
        I.checkError();
        I.click('Top selling');
        I.checkError();
        I.click('Top earning');
        I.checkError();
        I.click('Statement');
        I.checkError();
        //Explore Reviews
        I.click('Reviews');
        I.waitForElement(locator.ReviewArea);
        // I.click('Submit');
        // I.checkError();
        I.amOnPage(locator.ReviewhHold);
        I.checkError();
        I.amOnPage(locator.ReviewSpam);
        I.checkError();
        I.amOnPage(locator.ReviewTrash);
        I.checkError();
    },
    checkWithdrawReturnStaff() {
        I.amOnPage('/dashboard');
        I.click('Withdraw');
        I.waitForElement(locator.WithdrawArea);
        I.checkError();
        I.click('Approved Requests');
        I.checkError();
        I.click('Cancelled Requests');
        I.checkError();
        I.click('Return Request');
        I.waitForElement(locator.ReturnRequestArea);
        I.checkError();
        I.click('Staff');
        I.waitForElement(locator.StaffArea);
    },
    checkFollowerSubscriptionAnalytics() {
        I.amOnPage('/dashboard');
        I.click('Followers');
        I.waitForElement(locator.FollowerArea);
        I.checkError();
        I.click('Subscription');
        I.waitForElement(locator.SubscriptionArea);
        I.checkError();
        I.click('Analytics');
        I.waitForElement(locator.AnalyticsArea);
        I.amOnPage(locator.AllAnalytics);
        I.checkError();
        I.amOnPage(locator.CloseAnalytics);
        I.checkError();
    },
    checkSettingPage() {
        I.amOnPage('/dashboard');
        I.click('Settings');
        I.waitForElement(locator.SettingArea);
        I.checkError();
        I.click('Payment');
        I.waitForElement(locator.SettingArea);
        I.checkError();
        I.click('Verification');
        I.waitForElement(locator.SettingArea);
        I.checkError();
        I.checkError();
        I.click('ShipStation');
        I.waitForElement(locator.SettingArea);
        I.checkError();
        I.click('Social Profile');
        I.waitForElement(locator.SettingArea);
        I.checkError();
        I.click('RMA');
        I.waitForElement(locator.SettingArea);
        I.checkError();
        I.click('Store SEO');
        I.waitForElement(locator.SettingArea);
        I.checkError();
    },
    checkMyAccOrderDetails() {
        I.amOnPage('/my-account');
        I.see('My account');
        I.waitForElement(locator.MyAccountDiv);
        I.checkError();
        I.click('Orders');
        I.seeInCurrentUrl('/my-account/orders/');
        I.waitForElement(locator.MyAccountDiv);
        I.checkError();
        I.click('Downloads');
        I.waitForElement(locator.MyAccountDiv, 5);
        I.checkError();
        I.click('Address');
        I.seeInCurrentUrl('/my-account/edit-address/');
        I.waitForElement(locator.MyAccountDiv, 5);
        I.checkError();
        tryTo(() => {
            I.see('Billing address').then((result) => {
                console.log("Visilbe Billing address");
            }).catch((err) => {
                console.log("Invisible Billing address", err)
            });
        });
        tryTo(() => {
            I.see('Shipping address').then((result) => {
                console.log("Visilbe Shipping address");
            }).catch((err) => {
                //I.say('Invisible shipping', 'Red');
                console.log('Invisible Shipping address');
            });
        });

        I.click('RMA Requests');
        I.seeInCurrentUrl('/my-account/rma-requests/');
        I.waitForElement(locator.MyAccountDiv, 5);
        I.checkError();
        I.click('Account details');
        I.seeInCurrentUrl('/my-account/edit-account/');
        I.waitForElement(locator.MyAccountDiv, 5);
        I.checkError();
        I.click('Vendors');
        I.seeInCurrentUrl('/my-account/following/');
        I.waitForElement(locator.MyAccountDiv, 5);
        I.checkError();
        I.click('Seller Support Ticket');
        I.seeInCurrentUrl('/my-account/support-tickets/');
        I.waitForElement(locator.MyAccountDiv, 5);
        I.checkError();

    },
    checkStoreSettings() {
        I.amOnPage('/dashboard/settings/store/');
        I.click(locator.ShopLink);
        I.waitForElement(locator.StoreContent);
        I.checkError();
        I.seeElementInDOM(locator.ReviewBtn, 5);
        I.waitForClickable(locator.ReviewBtn, 5);
        I.click(locator.ReviewBtn);
        //I.waitForElement(locator.ReviewDiv, 5);
        I.checkError();
        tryTo(() => {
            I.click('Vendor Biography');
            I.waitForElement('#vendor-biography');
            I.checkError();
        });
        //I.switchToPreviousTab(); //Switch prevoius Tab
        I.closeCurrentTab(); // Close  urrent Tab
        I.amOnPage('/store-listing');
        I.waitForElement(locator.Content);
        I.checkError();
        I.selectOption(locator.StoreDropdown, 'Most Popular');
        I.waitForElement(locator.StoreContent);
        I.selectOption(locator.StoreDropdown, 'Top Rated');
        I.waitForElement(locator.StoreContent);
        I.selectOption(locator.StoreDropdown, 'Most Reviewed');
        I.waitForElement(locator.StoreContent);
        I.amOnPage('/cart');
        I.waitForElement(locator.Content);
        I.checkError();
        I.amOnPage('/checkout');
        I.waitForElement(locator.Content);
        I.checkError();
        I.amOnPage('/shop');
        I.waitForElement(locator.Content);
    },
}