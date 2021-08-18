const helpers = require('../pages/helpers');
Feature('Multiple order Multiple vendor Functionality');
Scenario('test something 1', ({ I,loginAs}) => {
    loginAs('Customer');
    helpers.SelectMultipleProductMultiplrVendor();
    helpers.placeOrder();

});