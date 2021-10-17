Feature('SPMV order management');
const helpers = require("../../pages/helpers");
const config  = require('../../pages/config');

Scenario('single product from multiple vendor & customer view', ({ I,loginAs}) => {
    loginAs('Vendor');
    I.amOnPage('/dashboard/products/');
        helpers.CreateProduct();
        I.see('Online');

    session('Vendor Two', () => {
        I.loginAsVendorTwo();
        helpers.Sellthisproduct();
        
    });

    session('Customer', () => {
        I.loginAsCustomer();
          helpers.customerviewproduct();
    });
});

