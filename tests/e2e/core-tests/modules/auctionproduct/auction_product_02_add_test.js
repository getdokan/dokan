const { helper } = require("codeceptjs");

const helpers = require('../../../pages/helpers');
Feature('modules/auction_product_02_add_test');


Scenario('Create Auction Product', ({I,loginAs}) => {
    loginAs('Vendor');
    helpers.createauctionproduct();
}).tag('@auction');
