const helpers = require('../../pages/helpers');
const config  = require('../../pages/config');
Feature('auction_product_01_admin_settings');

Scenario('admin settings for auction', ({ I,loginAs }) => {
    loginAs('admin');
    config.EnableAuction();

});
   