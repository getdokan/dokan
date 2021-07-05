Feature('vendor create wholesale product');
const helpers = require("../../pages/helpers");

Scenario('test something', ({ I}) => {
    I.loginAsVendor();
    helpers.CreateProduct();
    I.wait(5);
    helpers.CreateWholesaleProduct();
});

