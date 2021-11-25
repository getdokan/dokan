var  faker = require('faker');
const helper = require('../../pages/helpers');
Feature('refund Request Functionality');

Scenario('Sent Refund Request to Admin', ({ I,loginAs}) => {
        loginAs('Vendor');
    	I.click('Orders');
        helper.SentRefundRequest();
}).tag('@refund');