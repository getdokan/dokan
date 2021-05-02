Feature('SPMV Configuration');
const helpers = require("../../pages/helpers");
const config  = require('../../pages/config');


Scenario('Admin set SingleProductMultiplevendor', ({ I }) => {
    I.loginAsAdmin();
    config.EnableSpmv();

});