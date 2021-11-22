const helpers = require('../../pages/helpers');
Feature('Dokan tax Functionality From Customer');

Scenario('Customer purchase product with tax', ({
  I,loginAs
}) => {
  loginAs('Customer');
  helpers.productsorting();
  helpers.placeOrder();
}).tag('@tax');
