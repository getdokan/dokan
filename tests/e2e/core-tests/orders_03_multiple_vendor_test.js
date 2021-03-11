const helpers = require('../pages/helpers');
Feature('Multiple order Multiple vendor Functionality');
Scenario('test something 1', ({ I }) => {
    I.loginAsCustomer();
    helpers.SelectMultipleProductMultiplrVendor();
    helpers.placeOrder();

});