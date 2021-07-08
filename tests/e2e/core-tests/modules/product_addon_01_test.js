const helpers = require("../../pages/helpers");
Feature('vendor create productaddon ');

Scenario('Creating Addon', ({ I }) => {
    I.loginAsVendor();
    helpers.Productaddoncategory();
    
});
