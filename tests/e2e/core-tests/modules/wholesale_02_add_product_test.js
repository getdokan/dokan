Feature('vendor create wholesale product');
const helpers = require("../../pages/helpers");

Scenario('test something', ({ I,loginAs}) => {
    loginAs('Vendor');
    helpers.CreateProduct();
    I.wait(5);
    helpers.CreateWholesaleProduct();
});

