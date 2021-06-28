const helpers = require("../../pages/helpers");
Feature('vendor_subscription_02_buy');

Scenario('vendorBuySubscription', ({ I }) => {
    I.loginAsVendorTwo();
        helpers.PurchaseSubscriptionPackage();

        ///Admin Approver Vendor Subscription Request
        session('Admin Approve', () => {
            I.loginAsAdmin();
              helpers.AdminApproveSubscription();
        });
        helpers.CreateSubscriptionProduct();
       
});
