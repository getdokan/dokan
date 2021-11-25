const helpers = require("../../../pages/helpers");
Feature('modules/stripe_02_vendor_connect');

Scenario('Vendor connect with dokan stripe', ({ I,loginAs }) => {
	loginAs('Vendor');
	helpers.VendorConnectStripe();
}).tag('@stripe');

