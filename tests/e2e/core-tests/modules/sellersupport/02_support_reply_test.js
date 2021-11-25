const helpers = require("../../../pages/helpers");
Feature('Support Ticket reply');

Scenario('Seller Support Ticket Reply', ({ I,loginAs }) => {
    loginAs('Vendor');
    helpers.ReplyTicket();
}).tag("@store_support");
