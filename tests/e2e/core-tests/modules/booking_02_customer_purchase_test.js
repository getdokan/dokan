const helpers = require("../../pages/helpers");

Feature('Purchase booking Product');

Scenario('Customer purchase  Bookable product', ({ I,loginAs }) => {
    loginAs('Customer');
    helpers.PurchaseBookableProduct();
});

