const helpers = require('../pages/helpers');
Feature('Single order Functionality');
Scenario('Customer single Order', ({ I,loginAs }) => {
    loginAs('Customer');
    helpers.SelectSingleProduct();
    helpers.placeOrder();
});