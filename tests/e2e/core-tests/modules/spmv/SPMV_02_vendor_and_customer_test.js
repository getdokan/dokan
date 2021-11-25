Feature('SPMV order management');
const helpers = require("../../../pages/helpers");

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
}).tag('@SPMV');

