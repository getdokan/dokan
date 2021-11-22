const helpers = require('../../pages/helpers');
Feature('Multiple order Multiple vendor Functionality');
Scenario('Customer purchase multiple product from multiple vendors', ({ I,loginAs}) => {
    loginAs('Customer');
    helpers.SelectMultipleProductMultiplrVendor();
    helpers.placeOrder();
}).tag('order');