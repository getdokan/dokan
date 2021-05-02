const helpers = require("../../pages/helpers");

Feature('LiveSearch Product by customer');

Scenario('Admin settings', (I) => {
	I.loginAsCustomer();
	helpers.SearchProductwithsuggestion();
});

