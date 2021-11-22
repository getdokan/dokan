Feature('SPMV Configuration');
const config  = require('../../../pages/config');


Scenario('Admin set SingleProductMultiplevendor', ({ I,loginAs }) => {
    loginAs('admin');
    config.EnableSpmv();

}).tag('@SPMV');