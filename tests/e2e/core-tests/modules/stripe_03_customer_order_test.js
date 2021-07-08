const helpers = require("../../pages/helpers");

Feature('modules/stripe_03_customer_order');

Scenario('Customer payment with dokan stripe', ({ I }) => {
    
    I.amOnPage('/my-account/');
      I.loginAsCustomer();
      helpers.CustomerPurchasewithStripe();
  
});

