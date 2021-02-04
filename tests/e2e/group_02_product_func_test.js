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

    // I.selectOption('#dokan-warranty-type', 'Warranty as Add-On')
    // I.fillField('warranty_addon_price[]', '50')
    // I.fillField('warranty_addon_length[]', '1')
    // I.click('//*[@id="main"]/div/div/div[1]/div[2]/div/form/div[12]/div[2]/div[2]/div[7]/table/tbody/tr/td[3]/a[1]')
    // I.fillField('warranty_addon_price[]', '100')
    // I.click('//*[@id="main"]/div/div/div[1]/div[2]/div/form/div[12]/div[2]/div[2]/div[7]/table/tbody/tr[2]/td[3]/a[2]')
    // I.fillField('#_purchase_note', faker.lorem.text())
    // I.click('Save Product');
    helpers.checkrmalimited();
    helpers.clearrma();
    helpers.checkrmalifetime();
    helpers.clearrma();
    helpers.checkrmawarrentyaddon();
    helpers.clearrma();
    I.see('Success! The product has been saved successfully.', '.dokan-message');
});