Feature('admin configure livesearch');
const config = require("../../pages/config");

Scenario('Admin settings', ({ I }) => {
	I.loginAs('Admin');
    config.EnableLiveSearch();
	
});
