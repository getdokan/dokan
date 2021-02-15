Feature('variable_01_product_explore');
const locator = require('../../pages/product_locator');
 var faker = require('faker');
 const { fake } = require('faker');

Scenario('test something', ({ I,product }) => {
    I.loginAsVendor();
    product.CreateProduct('Shirt','100','Uncategorized');
    I.selectOption(locator.ProductTypeInput,'variable');
    I.wait(2);
    I.scrollTo(locator.ScrollToAttribute,20,60);
    I.wait(3);
    I.click('Add attribute');
    I.wait(3);
    I.fillField(locator.ProductAttributeName,'colour');
    I.fillField(locator.ProductAttributeValue, 'orang');
    I.pressKey('Enter');
    I.fillField(locator.ProductAttributeValue,'green');
    I.pressKey('Enter');
    I.checkOption(locator.ProductAttributeVisibility);
    I.checkOption(locator.ProductAttributeVariation);
    I.click('Save attribute');
    I.wait(4);
    I.click('Go');
    product.createvariation();
    product.clearvariationproduct();
    I.click('Save Product');
    I.checkOption(locator.EnableProductDiscount);
    I.fillField(locator.DiscountProductQuantity,'10');
    I.fillField(locator.DiscountProductAmount,'4');
    I.click('Save Product');
    I.checkOption(locator.EnableProductDiscount);
    I.clearField(locator.DiscountProductQuantity);
    I.clearField(locator.DiscountProductAmount);
    I.selectOption('#post_status','Online');
    I.selectOption('#_visibility','hidden');

    
});
