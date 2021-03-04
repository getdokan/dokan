var faker = require('faker');
const { fake } = require('faker');
const helpers = require('../../pages/helpers');
Feature('Group Product Functionality Test');
Scenario('Group Product Functional Behaviour Testing', ({ I }) => {

    I.amOnPage('http://dokan-pro.test/');
    I.checkError();
    I.click('Login / Register');
    I.fillField('Username or email address', 'alvitazwar@wedevs.com');
    I.fillField('Password', 'alvitazwar1122334456');
    I.click('.login > p:nth-child(4) > button:nth-child(3)');
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