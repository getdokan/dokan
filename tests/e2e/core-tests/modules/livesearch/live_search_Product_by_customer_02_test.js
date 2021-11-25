const helpers = require("../../../pages/helpers");

Feature('LiveSearch Product by customer');

Scenario('Admin settings', (I,loginAs) => {
	loginAs('Customer');
	helpers.SearchProductwithsuggestion();
}).tag('@LiveSearch');

