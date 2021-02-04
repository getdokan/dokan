var Factory = require('rosie').Factory;
var faker = require('faker');
const helpers = require('../../pages/helpers');
//const locator = require('../../pages/product_locator');

//const helper = require('./helpers');
Feature('Simple product fucntionality');

Scenario('simple product functional', ({
    I
}) => {
    I.amOnPage('http://dokan-pro.test/');
    I.click('Login / Register');
    I.fillField('Username or email address', 'alvitazwar@wedevs.com');
    I.fillField('Password', 'alvitazwar1122334456');
    I.click('.login > p:nth-child(4) > button:nth-child(3)');
    I.click('Products');
    I.click('simple_pro_1'); //This product needs to be on dokan site in order to run this test.
    I.wait(3);
    //Product Functionality Check
    //Product functionality Price and schedule
    helpers.setSchedule();
    helpers.cancelschedule();
    helpers.setregularprice();
    helpers.checkWrongPrice();
    //Virtual Option
    helpers.checkVirtual();
    helpers.uncheckVirtual();
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

});