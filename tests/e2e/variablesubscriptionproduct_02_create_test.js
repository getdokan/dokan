Feature('variablesubscriptionproduct_02_create');
const locator = require('../../pages/product_locator');
 var faker = require('faker');
 const { fake } = require('faker');

Scenario('test something', ({ I, product }) => {
    I.loginAsVendor();
    product.CreateProduct('Erp Online Class','100','Uncategorized');
    I.selectOption(locator.ProductTypeInput,'Variable subscription');
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
    product.CreateVariationforsubscription();
    I.click('Save Product');



});
