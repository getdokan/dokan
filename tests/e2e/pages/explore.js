const { ifError, strict } = require("assert");
const { assert } = require("console");
var Factory = require('rosie').Factory;
var faker = require('faker');
const locator = require('./locator');

const { I } = inject();

module.exports = {
    DashboardElements() {
        I.amOnPage('/dashboard');
        I.seeInCurrentUrl('/dashboard/');
        I.waitForElement(locator.VendorContent);
        I.checkError();
        // I.seeElement(locator.ProgressBar);
        tryTo(() => {
            I.seeElement(locator.ProgressBar).then((result) => {
                I.say('Progress Bar: Dokan Pro Functionality', 'yellow');
            }).catch((err) => {
                I.say('Progress Bar: Dokan Pro Deactivate', 'red');
            });
        });
        I.seeElement(locator.LeftDashboard);
        I.seeElement(locator.SaleGraph);
        // I.seeElementInDOM(locator.DashAnnountment);
        tryTo(() => {
            I.seeElementInDOM(locator.DashAnnountment).then((result) => {
                I.say('Annountment: Dokan Pro Functionality', 'yellow');
            }).catch((err) => {
                I.say('Annountment: Dokan Pro Deactivate', 'red');
            });
        });
        I.seeElementInDOM(locator.ProductWidget);
        // I.seeElementInDOM(locator.ReviewsContent);
        tryTo(() => {
            I.seeElementInDOM(locator.ReviewsContent).then((result) => {
                I.say('Reviews: Dokan Pro Functionality', 'yellow');
            }).catch((err) => {
                I.say('Reviews: Dokan Pro Deactivate', 'red');
            });
        });
        //I.dontSeeElementInDOM(locator.ProductWidget)
    },
    ProductPageElements() {
        I.amOnPage('/dashboard');
        I.click('Products');
        I.seeInCurrentUrl('/dashboard/products/');
        I.waitForElement(locator.ProductArea);
        I.checkError();
        I.seeElement('.active');
        I.seeElement('.active', 'All');
        I.see('Online');
        I.seeElement(locator.AddProductSpan, 'Add new Product');
        I.seeElementInDOM(locator.AddProductSpan, 'Import'); //need update
        I.seeElementInDOM(locator.AddProductSpan, 'Export'); //need update
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
    OrderPageElements() {
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
    UserSubscriptionPageElements() {
        I.amOnPage('/dashboard');
        tryTo(() => {
            I.click('User Subscriptions').then((result) => {
                I.say('Product Subscription Module Activated', 'yellow');
            }).catch((err) => {
                I.say('Product Subscription Module Inactivated', 'red');
            });
            I.waitForElement('.dashboard-user-subscription-area');
            I.checkError();
            // I.click('//*[@id="post-5"]/div/div/div[2]/article/table/tbody/tr/td[2]/a/strong');
            // I.checkError();
        });
    },
    CouponPageElements() {
        I.amOnPage('/dashboard');
        tryTo(() => {
            I.click('Coupons').then((result) => {
                I.say('Coupon: Dokan Pro Feature', 'yellow');
            }).catch((err) => {
                I.say('Coupon: Dokan Pro Deactivate', 'red');
            });
            I.waitForElement(locator.CouponArea);
            I.checkError();
        });
    },
    ReportPageElements() {
        I.amOnPage('/dashboard');
        tryTo(() => {
            I.click('Reports').then((result) => {
                I.say('Reports: Dokan Pro Feature', 'yellow');
            }).catch((err) => {
                I.say('Reports: Dokan Pro Deactivate', 'red');
            });
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
        });
        
    },
    ReviewPageElements() {
        I.amOnPage('/dashboard');
        tryTo(() => {
            I.click('Reviews').then((result) => {
                I.say('Reviews: Dokan Pro Feature', 'yellow');
            }).catch((err) => {
                I.say('Reviews: Dokan Pro Deactivate', 'red');
            });
            I.waitForElement(locator.ReviewArea);
            // I.click('Submit');
            // I.checkError();
            I.amOnPage(locator.ReviewhHold);
            I.checkError();
            I.amOnPage(locator.ReviewSpam);
            I.checkError();
            I.amOnPage(locator.ReviewTrash);
            I.checkError();
        });
    },
    WithdrawPageElements() {
        I.amOnPage('/dashboard');
        I.click('Withdraw');
        I.waitForElement(locator.WithdrawArea);
        I.checkError();
        I.click('Approved Requests');
        I.checkError();
        I.click('Cancelled Requests');
        I.checkError();
    },
    ReturnRequestPageElements() {
        I.amOnPage('/dashboard');
        tryTo(() => {
            I.click('Return Request').then((result) => {
                I.say('Return Request: Dokan Pro Feature', 'yellow');
            }).catch((err) => {
                I.say('Return Request: Dokan Pro Deactivate', 'red');
            });
            I.waitForElement(locator.ReturnRequestArea);
            I.checkError();
        });
    },
    StaffPageElements() {
        I.amOnPage('/dashboard');
        tryTo(() => {
            I.click('Staff').then((result) => {
                I.say('Staff: Dokan Pro Feature', 'yellow');
            }).catch((err) => {
                I.say('Staff: Dokan Pro Deactivate', 'red');
            });
            I.waitForElement(locator.StaffArea);
            I.checkError();
        });
    },
    FollowerPageElements() {
        I.amOnPage('/dashboard');
        tryTo(() => {
            I.click('Followers').then((result) => {
                I.say('Followers: Dokan Pro Feature', 'yellow');
            }).catch((err) => {
                I.say('Followers: Dokan Pro Deactivate', 'red');
            });
            I.waitForElement(locator.FollowerArea);
            I.checkError();
        });        
    },
    SubscriptionPageElements() {
        I.amOnPage('/dashboard');
        tryTo(() => {
            I.click('Subscription').then((result) => {
                I.say('Subscription: Dokan Pro Feature', 'yellow');
            }).catch((err) => {
                I.say('Subscription: Dokan Pro Deactivate', 'red');
            });
            I.waitForElement(locator.SubscriptionArea);
            I.checkError();
        });
    },
    BookingPageElements() {
        I.amOnPage('/dashboard');
        tryTo(() => {
            I.click('Booking').then((result) => {
                I.say('Booking: Dokan Pro Feature', 'yellow');
            }).catch((err) => {
                I.say('Booking: Dokan Pro Deactivate', 'red');
            });
            I.waitForElement(locator.BookingArea);
            I.checkError();
            // I.click('//*[@id="post-5"]/div/div/div[2]/div/article/table/tbody/tr/td[2]/p/a');
            // I.checkError();
            I.amOnPage(locator.BookingManage);
            I.waitForElement('.dokan-orders-area');
            I.checkError();
            // I.click('//*[@id="post-5"]/div/div/div[2]/div/article/table/tbody/tr/td[9]');
            // I.checkError();
            I.amOnPage(locator.BookingCalendar);
            I.waitForElement('.wc_bookings_calendar_form');
            I.checkError();
            I.amOnPage(locator.BookingResources);
            I.waitForElement('.dokan-product-listing');
            I.checkError();
        });
    },
    AnalyticsPageElements() {
        I.amOnPage('/dashboard');
        tryTo(() => {
            I.click('Analytics').then((result) => {
                I.say('Vendor Analytics: Dokan Pro Feature', 'yellow');
            }).catch((err) => {
                I.say('Vendor Analytics: Dokan Pro Deactivate', 'red');
            });
            I.waitForElement(locator.AnalyticsArea);
            I.amOnPage(locator.AllAnalytics);
            I.checkError();
            I.amOnPage(locator.CloseAnalytics);
            I.checkError();
        });
    },
    AnnouncementPageElements() {
        I.amOnPage('/dashboard');
        tryTo(() => {
            I.click('Announcements').then((result) => {
                I.say('Announcements: Dokan Pro Feature', 'yellow');
            }).catch((err) => {
                I.say('Announcements: Dokan Pro Deactivate', 'red');
            });
            I.waitForElement('.dokan-notice-listing-area');
            I.checkError();
        });
    },
    ToolPageElements() {
        I.amOnPage('/dashboard');
        tryTo(() => {
            I.click('Tools').then((result) => {
                I.say('Tools: Dokan Pro Feature', 'yellow');
            }).catch((err) => {
                I.say('Tools: Dokan Pro Deactivate', 'red');
            });
            I.waitForElement('#import');
            I.checkError();
            I.amOnPage('/dashboard/tools/#export');
            I.checkError();
        });
    },
    AuctionPageElements() {
        I.amOnPage('/dashboard');
        tryTo(() => {
            I.click('Auction').then((result) => {
                I.say('Auction: Dokan Pro Feature', 'yellow');
            }).catch((err) => {
                I.say('Auction: Dokan Pro Deactivate', 'red');
            });
            I.amOnPage(locator.AuctionOnline);
            I.checkError();
            I.amOnPage(locator.AuctionPending);
            I.checkError();
            I.amOnPage(locator.AuctionDraft);
            I.checkError();
        });
    },
    InboxPageElements() {
        I.amOnPage('/dashboard/inbox/');
        tryTo(() => {
            I.see('Inbox').then((result) => {
                I.say('Inbox: Dokan Pro Feature', 'yellow');
            }).catch((err) => {
                I.say('Inbox: Dokan Pro Deactivate', 'red');
            });
            I.checkError();
        });
    },
    SupportPageElements() {
        I.amOnPage('/dashboard/support/');
        tryTo(() => {
            I.waitForElement('.dokan-support-topics-list').then((result) => {
                I.say('Support: Dokan Pro Feature', 'yellow');
            }).catch((err) => {
                I.say('Support: Dokan Pro Deactivate', 'red');
            });
            I.checkError();
        });
    },
    StoreSettingsPageElements() {
        I.amOnPage('/dashboard');
        I.click('Settings');
        I.waitForElement(locator.SettingArea);
        I.checkError();       
    },
    PaymentPageElemeent() {
        I.amOnPage('dashboard/settings/store/');
        I.click('Payment');
        I.waitForElement(locator.SettingArea);
        I.checkError();
    },
    AddonsPageElements() {
        I.amOnPage('dashboard/settings/store/');
        tryTo(() => {
            I.click('Addons').then((result) => {
                I.say('Addons: Dokan Pro Feature', 'yellow');
            }).catch((err) => {
                I.say('Addons: Dokan Pro Deactivate', 'red');
            });
            I.waitForElement(locator.SettingArea);
            I.checkError();
        });
    },
    VerificationPageElements() {
        I.amOnPage('dashboard/settings/store/');
        tryTo(() => {
            I.click('Verification').then((result) => {
                I.say('Verification: Dokan Pro Feature', 'yellow');
            }).catch((err) => {
                I.say('Verification: Dokan Pro Deactivate', 'red');
            });
            I.waitForElement(locator.SettingArea);
            I.checkError();
        });
    },
    ShippingPageElements() {
        I.amOnPage('dashboard/settings/store/');
        tryTo(() => {
            I.click('Shipping').then((result) => {
                I.say('Shipping: Dokan Pro Feature', 'yellow');
            }).catch((err) => {
                I.say('Shipping: Dokan Pro Deactivate', 'red');
            });
            I.waitForElement(locator.SettingArea);
            I.checkError();
        });
    },
    ShipStationPageElements() {
        I.amOnPage('dashboard/settings/store/');
        tryTo(() => {
            I.click('ShipStation').then((result) => {
                I.say('ShipStation: Dokan Pro Feature', 'yellow');
            }).catch((err) => {
                I.say('ShipStation: Dokan Pro Deactivate', 'red');
            });
            I.waitForElement(locator.SettingArea);
            I.checkError();
        });
    },
    SocialProfilePageElements() {
        I.amOnPage('dashboard/settings/store/');
        tryTo(() => {
            I.click('Social Profile').then((result) => {
                I.say('SocialProfile: Dokan Pro Feature', 'yellow');
            }).catch((err) => {
                I.say('SocialProfile: Dokan Pro Deactivate', 'red');
            });
            I.waitForElement(locator.SettingArea);
            I.checkError();
        });
    },
    RMAPageElements() {
        I.amOnPage('dashboard/settings/store/');
        tryTo(() => {
            I.click('RMA').then((result) => {
                I.say('RMA: Dokan Pro Feature', 'yellow');
            }).catch((err) => {
                I.say('RMA: Dokan Pro Deactivate', 'red');
            });
            I.waitForElement(locator.SettingArea);
            I.checkError();
        });
    },
    StoreSEOElements() {
        I.amOnPage('dashboard/settings/store/');
        tryTo(() => {
            I.click('Store SEO').then((result) => {
                I.say('StoreSEO: Dokan Pro Feature', 'yellow');
            }).catch((err) => {
                I.say('StoreSEO: Dokan Pro Deactivate', 'red');
            });
            I.waitForElement(locator.SettingArea);
            I.checkError();
        });
    },
    MyAccountDashboard() {
        I.amOnPage('/my-account/');
        I.see('Go to Vendor Dashboard');
        I.waitForElement(locator.MyAccountDiv, 5);
        I.checkError();       
    },
    MyAccountOrders() {
        I.amOnPage('/my-account/');
        I.click('Orders');
        I.seeInCurrentUrl('/my-account/orders/');
        I.waitForElement(locator.MyAccountDiv, 5);
        I.checkError();      
    },
    MyAccountSubscriptions() {
        I.amOnPage('/my-account/');
        I.click('Subscriptions');
        I.seeInCurrentUrl('/my-account/subscriptions/');
        I.waitForElement(locator.MyAccountDiv, 5);
        I.checkError();       
    },
    MyAccountDownloads() {
        I.amOnPage('/my-account/');
        I.click('Downloads');
        I.seeInCurrentUrl('/my-account/downloads/');
        I.waitForElement(locator.MyAccountDiv, 5);
        I.checkError();       
    },
    MyAccountAddresses() {
        I.amOnPage('/my-account/');
        I.click('Addresses');
        I.seeInCurrentUrl('/my-account/edit-address/');
        I.waitForElement(locator.MyAccountDiv, 5);
        I.checkError();
        tryTo(() => {
            I.see('Billing address').then((result) => {
                console.log("Visilbe Billing address",);
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
    },
    MyAccountRMARequest() {
        I.amOnPage('/my-account/');
        tryTo(() => {
            I.click('RMA Request').then((result) => {
                I.say('RMA Request: Dokan Pro Feature', 'yellow');
            }).catch((err) => {
                I.say('RMA Request: Dokan Pro Deactivate', 'red');
            });
            I.seeInCurrentUrl('/my-account/rma-requests/');
            I.waitForElement(locator.MyAccountDiv, 5);
            I.checkError(); 
        });              
    },
    MyAccountAccountDetails() {
        I.amOnPage('/my-account/');
        I.click('Account details');
        I.seeInCurrentUrl('/my-account/edit-account/');
        I.waitForElement(locator.MyAccountDiv, 5);
        I.checkError();       
    },
    MyAccountVendors() {
        I.amOnPage('/my-account/');
        tryTo(() => {
            I.click('Vendors').then((result) => {
                I.say('Vendors: Dokan Pro Feature', 'yellow');
            }).catch((err) => {
                I.say('Vendors: Dokan Pro Deactivate', 'red');
            });
            I.seeInCurrentUrl('/my-account/following/');
            I.waitForElement(locator.MyAccountDiv, 5);
            I.checkError(); 
        });        
    },
    MyAccountInbox() {
        I.amOnPage('/my-account/');
        tryTo(() => {
            I.click('Inbox').then((result) => {
                I.say('Inbox: Dokan Pro Feature', 'yellow');
            }).catch((err) => {
                I.say('Inbox: Dokan Pro Deactivate', 'red');
            });
            I.seeInCurrentUrl('/my-account/customer-inbox/');
            I.waitForElement(locator.MyAccountDiv, 5);
            I.checkError(); 
        });       
    },
    MyAccountSellerSupportTickets() {
        I.amOnPage('/my-account/');
        tryTo(() => {
            I.click('Seller Support Tickets').then((result) => {
                I.say('Seller Support Tickets: Dokan Pro Feature', 'yellow');
            }).catch((err) => {
                I.say('Seller Support Tickets: Dokan Pro Deactivate', 'red');
            });
            I.seeInCurrentUrl('/my-account/support-tickets/');
            I.waitForElement(locator.MyAccountDiv, 5);
            I.checkError(); 
        });       
    },
    MyAccountBookings() {
        I.amOnPage('/my-account/');
        I.click('Bookings');
        I.seeInCurrentUrl('/my-account/bookings/');
        I.waitForElement(locator.MyAccountDiv, 5);
        I.checkError();       
    },
    StorePageElements() {
        I.amOnPage('/dashboard/settings/store/');
        I.click(locator.ShopLink);
        I.refreshPage();
        I.waitForElement(locator.StoreContent);
        I.checkError();
        I.click('//*[@id="content"]//div/ul/li[2]/a');
        I.wait(5);
        I.waitForElement(locator.StoreContent);
        I.checkError();
        // I.seeElementInDOM(locator.ReviewBtn, 5);
        // I.waitForClickable(locator.ReviewBtn, 5);
        // I.click(locator.ReviewTab);
        //I.waitForElement(locator.ReviewDiv, 5);
        // I.checkError();
        // I.click('Terms and Conditions');
        // I.moveCursorTo('.dokan-store-tabs');
        // I.click(locator.TermsAndCondition);
        // I.waitForElement('#store-toc-wrapper');
        // tryTo(() => {
        //     I.retry(10).click(locator.TermsAndCondition);
        //     I.waitForElement(locator.StoreContent);
        //     I.checkError();
        // }); 
        // tryTo(() => {
        //     I.click(locator.VendorBioTab);
        //     I.waitForElement(locator.StoreContent);
        //     I.checkError();
        // });  
        // tryTo(() => {
        //     I.click(locator.ReviewTab);
        //     I.waitForElement(locator.StoreContent);
        //     I.checkError();
        // });     
    },
    StoreListPage() {
        I.amOnPage('/store-listing');
        I.waitForElement(locator.Content);
        I.checkError();
        I.selectOption(locator.StoreDropdown, 'Most Popular');
        I.waitForElement(locator.StoreListContent);
        I.selectOption(locator.StoreDropdown, 'Top Rated');
        I.waitForElement(locator.StoreListContent);
        I.selectOption(locator.StoreDropdown, 'Most Reviewed');
        I.waitForElement(locator.StoreListContent);
    },
    ShopPage() {
        I.amOnPage('/shop');
        I.waitForElement(locator.Content);
        I.checkError();       
    },
    CartPage() {
        I.amOnPage('/cart');
        I.waitForElement(locator.Content);
        I.checkError();
    },
    CheckoutPage() {
        I.amOnPage('/checkout');
        I.waitForElement(locator.Content);
        I.checkError();
    },
}