const { helper } = require('codeceptjs');
var faker = require('faker');
const helpers = require('../../pages/helpers.js');
Feature('Vendor Send withdraw Request Functionality');

Scenario('Vendor Sent Withdraw Request', ({ I ,loginAs }) => {
        loginAs('Vendor');
        helpers.SetPaymentInfo();
        helpers.SentWithdrawRequest();      
}).tag('@withdraw');