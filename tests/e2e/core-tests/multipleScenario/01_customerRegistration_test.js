const helpers = require('../../pages/helpers');

Feature('Customer registration Functionality');

Scenario('Check Customer Registration Functionality', ({ I }) => {
    helpers.pageStatus();
    helpers.customerRegisterSuccess();
    // helpers.checkVendor();
}).tag('@registration').tag('@multipleScenario');