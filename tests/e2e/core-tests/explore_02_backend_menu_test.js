// const { ifError, strict } = require("assert");
// const { assert, Console } = require("console");
const explore = require('../pages/explore');

Feature('Explore Backend Functionality');

Before(({ I }) => { // or Background
    I.loginAsAdmin();
});

Scenario('Explore Backedn All Menu', async({ I }) => {
    explore.DokanDashboardElements();
    explore.ModulePageElements();
    explore.VendorsPageElements();
    explore.BackendWithdrawPageElements();
    explore.AbuseReportsPageElements();
    explore.StoreReviewPageElements();
    explore.BackendAnnouncementPageElements();
    explore.RefundPageElements();
    explore.BackendReportsPageElements();
    explore.BackendToolPageElements();
    explore.BackendSubscriptionPageElements();
    explore.BackendVerificationPageElements();
    explore.WholesaleCustomerPageElements();
    explore.HelpPageElements();
    explore.LicensePageElements();
    // Explore Settings Tab Elements
    explore.BackendSettingsPageElements();
    explore.SellingOptionsSettingsTabElements();
    explore.WithdrawOptionsSettingsTabElements();
    explore.PageSettingsTabElements();
    explore.AppearanceSettingsTabElements();
    explore.PrivacyPolicySettingsTabElements();
    explore.SellerVerificationSettingsTabElements();
    explore.VerificationSMSGatewaySettingsTabElements();
    explore.ColorsSettingsTabElements();
    explore.EmailVerificationSettingsTabElements();
    explore.SocialAPISettingsTabElements();
    explore.LiveChatSettingsTabElements();
    explore.RMASettingsTabElements();
    explore.WholesaleSettingsTabElements();
    explore.GeolocationSettingsTabElements();
    explore.ProductReportAbuseSettingsTabElements();
    explore.SingleProductMultivendorSettingsTabElements();
    explore.VendorAnalyticsSettingsTabElements();
    explore.VendorSubscriptionSettingsTabElements();
});
