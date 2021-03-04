Feature('variable_01_product_explore');
var faker = require('faker');
const { fake } = require('faker');

Scenario('test something', ({ I, product }) => {
    I.loginAsVendor();
    product.CreateProduct('Shirt', '100', 'Uncategorized');
    I.selectOption('#product_type', 'variable');
    I.wait(2);
    I.scrollTo({ css: '.add_new_attribute' }, 20, 60);
    I.wait(3);
    I.click('Add attribute');
    I.wait(3);
    I.fillField('attribute_names[0]', 'colour');
    I.fillField('//li/div[2]/div[2]/span/span/span/ul/li/input', 'orang');
    I.pressKey('Enter');
    I.fillField('//li/div[2]/div[2]/span/span/span/ul/li/input', 'green');
    I.pressKey('Enter');
    I.checkOption('attribute_visibility[0]');
    I.checkOption('attribute_variation[0]');
    I.click('Save attribute');
    I.wait(4);
    I.click('Go');
    product.createvariation();
    product.clearvariationproduct();
    I.click('Save Product');
    I.checkOption('//*[@id="_is_lot_discount"]');
    I.fillField('//*[@id="_lot_discount_quantity"]', '10');
    I.fillField('//*[@id="_lot_discount_amount"]', '4');
    I.click('Save Product');
    I.checkOption('//*[@id="_is_lot_discount"]');
    I.clearField('//*[@id="_lot_discount_quantity"]');
    I.clearField('//*[@id="_lot_discount_amount"]');
    I.selectOption('#post_status', 'Online');
    I.selectOption('#_visibility', 'hidden');


}).tag('@product');