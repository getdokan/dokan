Feature('Congiguration of wholesale product');
const config= require("../../../pages/config");
const { wholesale } = require("../../../pages/helpers");

Scenario('Admin Configure Wholesale product', ({ I,loginAs}) => {
    loginAs('admin');
    config.EnableWholesaleProduct();
}).tag('@wholesale');
