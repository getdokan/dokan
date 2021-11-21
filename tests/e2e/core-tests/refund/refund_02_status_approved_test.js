const helper = require('../../pages/helpers');
Feature('refund request approved');

Scenario('Check Approve Refund request & seach by vendor name', ({ I,loginAs }) => {
        loginAs('admin');
        helper.CheckRefund();
        
}).tag('@refund');
