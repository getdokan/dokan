const helpers = require("../../pages/helpers");
Feature('vendor create productaddon ');

Scenario('Creating Addon', ({ I,loginAs }) => {
    loginAs('Vendor');
    helpers.Productaddoncategory();
    
});
