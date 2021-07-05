const helpers = require("../../pages/helpers");

Feature('Purchase Booking Product');

Scenario('Customer purchase  Bookable product', ({ I }) => {
    I.loginAsCustomer();
    helpers.PurchaseBookableProduct();
});

