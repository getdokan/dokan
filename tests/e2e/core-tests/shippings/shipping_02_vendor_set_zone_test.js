var faker = require('faker');
Feature('Vendor add shipping zone & method under a region');

Scenario('vendor add shipping cost', ({ I,loginAs}) => {
  loginAs('Vendor');
  I.amOnPage('/dashboard/settings/shipping/');
  I.click('//div[@id="dokan-shipping-zone"]/div/table/tbody/tr/td/a');
  I.wait(4);
  I.click('//a[contains(text(),"Add Shipping Method")]');
  I.selectOption('//select[@id="shipping_method"]','Flat Rate');
  I.click({css:'button.button'});
  I.moveCursorTo('.dokan-table > tbody:nth-child(2) > tr:nth-child(1) > td:nth-child(1) > div:nth-child(1) > span:nth-child(1) > a:nth-child(1)');
  I.wait(4);
  // I.click('Edit');
  // I.wait(4);


  

});