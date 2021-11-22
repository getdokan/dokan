var faker = require('faker');
const config = require('../../pages/config.js');
Feature('Dokan tax Functionality From Admin');

Scenario('tax configuration from admin', ({ I,loginAs}) => {
  loginAs('admin');
  I.click('WooCommerce');
  I.amOnPage('/wp-admin/admin.php?page=wc-settings');
  config.configureTax();
}).tag('tax');
