const helpers = require("../../pages/helpers");

Feature('modules/vacation_02_view_customer');

Scenario('customerviewVendorVacation', ({ I }) => {
    I.loginAs('Customer');
    helpers.Customerviewvacationmessage();
});