const locators = require('../../pages/locator.js');
const config = require('../../pages/config.js');
var faker = require('faker');
Feature('Environment Setup');

Scenario('@environmentSetup woocommerce dependencies', ({ I,loginAs}) => {
  loginAs('admin');
  //Add shipping
      I.click('WooCommerce');
      I.amOnPage('/wp-admin/admin.php?page=wc-settings');
      I.wait(3);
      I.scrollTo(locators.EnableSellingLocation,5,5);
      I.selectOption(locators.EnableSellingLocation,'Sell to all countries');
      I.selectOption(locators.EnableShippingLocation,'Ship to all countries you sell to');
      I.click({css:'#mainform > p > button'});
      I.seeElementInDOM({css:'#message > p'});
      I.see('Your settings have been saved.');
      I.click('Shipping');
      I.click('Add shipping zone');
      I.fillField('#zone_name','United States');
      I.click(locators.ZoneRegion);
      I.type('United States (US)');
      I.wait(3);
      I.pressKey('Enter');
      I.click(locators.AddShippingMethod);
      I.click({css:'#btn-ok'});
      I.wait(5);
      I.refreshPage();
//Add TAX
      I.amOnPage('/wp-admin/admin.php?page=wc-settings');
      config.configureTax();
});