const helpers = require("../../../pages/helpers");

Feature('modules/stripe_03_customer_order');

Scenario('Customer payment with dokan stripe', ({ I,loginAs }) => {
    
    I.amOnPage('/my-account/');
      loginAs('Customer');
      helpers.CustomerPurchasewithStripe();
  
}).tag('@stripe');

