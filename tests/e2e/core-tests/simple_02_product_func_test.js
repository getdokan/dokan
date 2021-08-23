var Factory = require('rosie').Factory;
var faker = require('faker');
const { loginAsVendor } = require('../pages/helpers');
const helpers = require('../pages/helpers');
Feature('Simple product fucntionality');
// Before(({ I }) => { // or Background
//     I.loginAsVendor();
// });
Scenario('simple product functional', ({ I,loginAs }) => {
    
    loginAs('Vendor');
    I.click('Products');
    I.click('simple_pro_3'); //This product needs to be on dokan site in order to run this test.
    I.wait(3);
    //Product Functionality Check
    //Product functionality Price and schedule
    helpers.setSchedule();
    helpers.cancelschedule();
    helpers.setregularprice();
    helpers.checkWrongPrice();
    // //Virtual Option
    // helpers.checkVirtual();
    // helpers.uncheckVirtual();
    //Category & Tags
    helpers.checksinglecat();
    helpers.checkmulticat();
    helpers.checktags();
    //Short Description + Description
    helpers.shortDesc();
    helpers.desc();
    helpers.clearDesc();
    // helpers.shortDesc();
    helpers.desc();
    //Wholesale product
    helpers.wholesale();
    helpers.clearwholesale();
    helpers.wholesale();

}).tag('@product');