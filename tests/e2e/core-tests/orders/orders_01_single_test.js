const helpers = require('../../pages/helpers');
Feature('Single order Functionality');
Scenario('@order Customer single Order', ({ I,loginAs }) => {
    loginAs('Customer');
    helpers.SelectSingleProduct();
    helpers.placeOrder();
}).tag('order');