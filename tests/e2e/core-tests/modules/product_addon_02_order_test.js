const helpers = require("../../pages/helpers");
Feature('Purchase product with addon ');

Scenario('Purchase Product', ({ I }) => {
     session('Customer view',()=>{
        I.loginAsCustomer();
    })
});
