const helpers = require("../../../pages/helpers");
Feature('modules/Vendor Subscription Functionality');

Scenario('Admin create Subscription Package', ({ I,loginAs }) => {
      loginAs('admin');
        I.click('Dokan');
        I.click('Settings');
        I.click('Product Subscription');
           helpers.CreateSubscriptionProduct();      
}).tag('@VendorSubscription');
