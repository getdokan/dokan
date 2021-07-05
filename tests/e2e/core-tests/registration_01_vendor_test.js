const helpers = require('../pages/helpers');

Feature('Vendor registration Functionality');

Scenario('Check Vendor Registration Functionality', ({ I }) => {
    helpers.pageStatus();
    helpers.registerSuccess();

    helpers.checkVendor();
});