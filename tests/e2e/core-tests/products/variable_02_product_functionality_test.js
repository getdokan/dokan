const helpers = require('../../pages/helpers');
const locator = require('../../pages/locator');
const cheerio = require('cheerio');
const webdriver = require('webdriverio');
var faker= require('faker');
Feature('Variable product Functional Behaviour');

Scenario('Variable product edit explore test', ({ I,loginAs}) => {
loginAs('Vendor');
helpers.createProduct();
I.selectOption(locator.ProductTypeInput,'Variable');
I.scrollTo(locator.ScrollToAttribute,20,60);
I.wait(3);
I.click(locator.AttributeAddNewButton);
helpers.createvariation();
I.selectOption('#post_status','Online');
I.selectOption('#_visibility','hidden');
I.click('Save Product');
}).tag('@product');