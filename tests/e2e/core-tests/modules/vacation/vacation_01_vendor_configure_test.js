Feature('modules/Vendor Vacation Functionality');
const helpers = require("../../../pages/helpers");
const config  = require('../../../pages/config');

Scenario('vendorsetVacationSetttings', ({ I }) => {
    I.loginAsVendor();
    helpers.vendorsetvacation();
    
});