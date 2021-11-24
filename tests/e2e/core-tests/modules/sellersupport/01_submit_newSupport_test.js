const helpers = require("./../../../pages/helpers");
Feature('Customer Submit Support');

Scenario('Customer Submit New Support From Vendor Store', ({ I,loginAs }) => {
    loginAs('Customer');
    // for (let i = 0; i <= 10; i++) {
        helpers.Getsupport();

    // }
}).tag("@store_support");
   