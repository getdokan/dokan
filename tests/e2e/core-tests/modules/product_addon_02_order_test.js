const helpers = require("../../pages/helpers");
Feature('Purchase product with addon ');

Scenario('Purchase Product', ({ I,loginAs}) => {
     session('Customer view',()=>{
        loginAsCustomer();
    })
});
