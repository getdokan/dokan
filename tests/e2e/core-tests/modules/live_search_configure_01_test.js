Feature('admin configure livesearch');
const config = require("../../pages/config");

Scenario('Admin settings on live search', ({ I,loginAs}) => {
	loginAs('admin');
    config.EnableLiveSearch();
	
});
