const helpers = require("../../pages/helpers");
Feature('modules/Vendor Subscription Functionality');

Scenario('Admin create Subscription Package', ({ I }) => {
    I.loginAsAdmin();
        I.click('Dokan');
        I.click('Settings');
        I.click('Product Subscription');
           helpers.CreateSubscriptionProduct();      
});
