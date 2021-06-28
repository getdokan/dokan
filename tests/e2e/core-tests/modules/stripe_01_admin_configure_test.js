const helpers = require("../../pages/helpers");
Feature('modules/Dokan stripe Payments Functionality');


Scenario('Admin settings with dokan stripe setup', ({ I }) => {
	I.amOnPage('/wp-admin');
	I.fillField('Username or Email Address', 'Dokan_Admin');
	I.fillField('Password', 'ohjcw6j3mLdN9q7s$f');
	I.checkOption('Remember Me');
	I.click('wp-submit');
		//admin settings
		helpers.ConfigureStripePayment();
		
		
});
