const helpers = require('../pages/helpers');
Feature('Single order Functionality');
Scenario('Customer single Order', ({ I }) => {
    I.loginAsCustomer();
    helpers.SelectSingleProduct();
    helpers.placeOrder();
});