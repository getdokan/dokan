const helpers = require("../../../pages/helpers");
Feature('modules/Dokan stripe Payments Functionality');


Scenario('Admin settings with dokan stripe setup', ({ I,loginAs }) => {
	
	I.amOnPage('/wp-admin');
	loginAs('admin');
		//admin settings
	helpers.ConfigureStripePayment();
		
		
}).tag('@stripe');
