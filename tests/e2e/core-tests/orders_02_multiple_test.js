const helpers = require('../pages/helpers');
Feature('Multiple orders From Single Vendor Functionality');
Scenario('Customer Order Multiple Product from signle vendor', ({ I ,loginAs}) => {
    loginAs('Customer');
    helpers.SelectMultipleProduct();
    helpers.placeOrder();
});