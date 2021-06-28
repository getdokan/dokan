const locator = require('../../pages/locator');
const helpers = require('../../pages/helpers');
const { helper } = require('codeceptjs');
Feature('modules/auction_product_02_order');

Scenario('Order Auction Product', ({ I }) => {
    I.loginAsCustomer();
    helpers.PurchaseAuctionProduct();

});
