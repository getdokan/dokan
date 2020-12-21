Feature('modules/01Enable_module');

Scenario('test something', ({ I }) => {
    I.loginAsAdmin();
    	I.click('Dokan');
    	I.wait(3);
    	I.click('Modules');
    	I.wait(5);
    	I.click('#view-switch-list');
    	I.click('//input[@type="checkbox"]');
    	I.selectOption('#bulk-action-selector-top','Activate');
    	I.click('Apply');
        I.wait(5);
});