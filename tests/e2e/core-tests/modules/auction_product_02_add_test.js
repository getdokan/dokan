const { helper } = require("codeceptjs");

const locator = require('../../pages/locator');
const helpers = require('../../pages/helpers');
Feature('modules/auction_product_02_add_test');


Scenario('Create Auction Product', ({I}) => {
    I.loginAsVendor();
    helpers.createauctionproduct();
});
