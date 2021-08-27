const helpers = require("../../pages/helpers");
Feature('Purchase product with addon ');

Scenario('Purchase Product with addon', ({ I,loginAs}) => {
     session('Customer view',()=>{
        loginAsCustomer();
    })
});
