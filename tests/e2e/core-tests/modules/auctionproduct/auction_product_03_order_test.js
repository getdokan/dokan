
const helpers = require('../../../pages/helpers');
const { helper } = require('codeceptjs');
Feature('modules/auction_product_02_order');

Scenario('Order Auction Product', ({ I,loginAs }) => {
    loginAs('Customer');
    helpers.PurchaseAuctionProduct();

}).tag('@auction').tag('@auction_order');
