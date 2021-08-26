const helpers = require("../../pages/helpers");

Feature('Purchase Booking Product');

Scenario('Customer purchase  Bookable product', ({ I,loginAs }) => {
    loginAs('Customer');
    helpers.PurchaseBookableProduct();
});

