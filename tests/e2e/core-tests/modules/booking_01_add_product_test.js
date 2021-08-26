const helpers = require("../../pages/helpers");

Feature('modules/booking Product module');

Scenario('Vendor add booking product', ({ I,loginAs}) => {
    loginAs('Vendor');
    helpers.createBookingProduct();
});

