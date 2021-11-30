Feature('Environment Setup');

Scenario('@environmentSetup Activating Dokan Plugin & running setup wizard',async ({ I , loginAs}) => {
loginAs('admin');
    I.amOnPage('/wp-admin/plugins.php');
    //Activating dokan-lite plugin
    const deactivate = await I.grabNumberOfVisibleElements('#deactivate-dokan-lite');
        if (deactivate >= 1) {
            I.see('Dokan');
        }
        else{
            I.click('#activate-dokan-lite')
        }
    //Running setup wizerd
        tryTo(() => {
            I.amOnPage('/wp-admin/admin.php?page=dokan-setup');
            I.click('.button-primary');
            I.fillField('Vendor Store URL','TechStore');
            I.fillField('Google Map API Key','AIzaSyCiSPh9A7SYaO2sbZQ4qQo11AWyYB3UFvY');
            I.click('.button-primary');
            I.click('.button-primary');
            I.click('.button-primary');
            // Enabling other plugins
            // I.click('/html/body/div[1]/form/ul/li[1]/label');
            // I.click('/html/body/div[1]/form/ul/li[2]/label');
            // I.click('/html/body/div[1]/form/ul/li[3]/label');
            I.click('.button-primary');
            I.click('Return to the WordPress Dashboard');
            I.see('Dokan');          
    });

});