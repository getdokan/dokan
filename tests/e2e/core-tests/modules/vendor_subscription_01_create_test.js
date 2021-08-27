const helpers = require("../../pages/helpers");
Feature('modules/Vendor Subscription Functionality');

Scenario('Admin create Subscription Package', ({ I,loginAs }) => {
    I.loginAs('admin');
        I.click('Dokan');
        I.click('Settings');
        I.click('Product Subscription');
           helpers.CreateSubscriptionProduct();      
});
