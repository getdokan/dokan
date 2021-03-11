const helpers = require('../pages/helpers');
Feature('Multiple orders From Single Vendor Functionality');
Scenario('Customer Order Multiple Product from signle vendor', ({ I }) => {
    I.loginAsCustomer();
    helpers.SelectMultipleProduct();
    helpers.placeOrder();
});