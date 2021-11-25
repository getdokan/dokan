var  faker = require('faker');
const helpers = require('../../pages/helpers');
const locator = require('../../pages/locator');
Feature('Group Product Functionality Test');
// Before(({ I }) => { // or Background
//     I.loginAsVendor();
// });
Scenario('Group Product Functional Behaviour Testing', ({ I,loginAs }) => {
    loginAs('Vendor');
    helpers.createProduct();
    I.selectOption(locator.ProductTypeInput,'Group Product');
    //RMA Functionality Test
    helpers.checkrmalimited();
    helpers.clearrma();
    helpers.checkrmalifetime();
    helpers.clearrma();
    helpers.checkrmawarrentyaddon();
    helpers.clearrma();
    //Purchase Notes
    helpers.checknotes();
    // helpers.checkgroup();
    I.see('Success! The product has been saved successfully.', '.dokan-message');
    //Purchase Notes Functionality Test
}).tag('@product');