const helpers = require('../pages/helpers');
Feature('Single order Functionality');
Scenario('Customer single Order', ({ I,loginAs }) => {
    loginAs('customer');
    helpers.SelectSingleProduct();
    helpers.placeOrder();
});