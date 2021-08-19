const explore = require('../pages/explore');

Feature('Explore Frontend Functionality');

// Before('Login As vendor',( {I,loginAs} ) => { // or Background
//     loginAs('vendor');
// });
// Before(loginAs => {
//     loginAs('users'); // login using user session
//  });

Scenario('Explore Vendor All Menu Pages',async ({I,loginAs}) => {
    loginAs('Vendor');
    //Explore Vendor Dashboard Elements
    explore.DashboardElements(); 
    explore.ProductPageElements(); 
    explore.OrderPageElements(); 
    explore.UserSubscriptionPageElements(); 
    explore.CouponPageElements();
    explore.ReportPageElements();
    explore.ReviewPageElements();
    explore.WithdrawPageElements();
    explore.ReturnRequestPageElements();
    explore.StaffPageElements();
    explore.FollowerPageElements();
    explore.SubscriptionPageElements();
    explore.BookingPageElements();
    explore.AnalyticsPageElements();
    explore.AnnouncementPageElements();
    explore.ToolPageElements();
    explore.AuctionPageElements();
    explore.InboxPageElements();
    explore.SupportPageElements();
    //Explore Vendor Dashboard All Settings Page Elements
    explore.StoreSettingsPageElements();
    explore.PaymentPageElemeent();
    explore.AddonsPageElements();
    explore.VerificationPageElements();
    explore.ShippingPageElements();
    explore.ShipStationPageElements();
    explore.SocialProfilePageElements();
    explore.RMAPageElements();
    explore.StoreSEOElements();
    //Explore Vendor My Account Page Elements
    explore.MyAccountDashboard();
    explore.MyAccountOrders();
    explore.MyAccountSubscriptions();
    explore.MyAccountDownloads();
    explore.MyAccountAddresses();
    explore.MyAccountRMARequest();
    explore.MyAccountAccountDetails();
    explore.MyAccountVendors();
    explore.MyAccountInbox();
    explore.MyAccountSellerSupportTickets();
    explore.MyAccountBookings();
    //Explore Vendor Store Page, Store List Page, Shop Page, Cart & Checkout Page
    explore.StorePageElements();
    explore.StoreListPage();
    explore.ShopPage();
    explore.CartPage();
    explore.CheckoutPage();
});