Feature('Congiguration of wholesale product');
const config= require("../../pages/config");

Scenario('Admin Configure Wholesale product', ({ I,loginAs}) => {
    loginAs('admin');
    config.EnableWholesaleProduct();
});
