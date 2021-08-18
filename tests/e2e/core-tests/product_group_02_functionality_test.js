var faker = require('faker');
const { fake } = require('faker');
const { loginAsVendor } = require('../pages/helpers');
const helpers = require('../pages/helpers');
Feature('Group Product Functionality Test');
// Before(({ I }) => { // or Background
//     I.loginAsVendor();
// });
Scenario('Group Product Functional Behaviour Testing', ({ I,loginAs }) => {
    loginAs('Vendor');
    I.click('Products');
    I.click('group_product');
    //RMA Functionality Test
    helpers.checkrmalimited();
    helpers.clearrma();
    helpers.checkrmalifetime();
    helpers.clearrma();
    helpers.checkrmawarrentyaddon();
    helpers.clearrma();
    //Purchase Notes
    helpers.checknotes();
    helpers.checkgroup();
    I.see('Success! The product has been saved successfully.', '.dokan-message');
    //Purchase Notes Functionality Test
}).tag('@product');