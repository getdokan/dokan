Feature('Dokan Shipping Functionality');

Scenario('AdminSettings', ( { I }) => {
    I.loginAsAdmin();
     	I.click('WooCommerce');
     	I.wait(5);
        I.amOnPage('/wp-admin/admin.php?page=wc-settings');
    	I.click('Shipping');
        I.click('Add shipping zone');
        I.wait(4);
        I.fillField('zone_name','Everywhere');
        I.click('Add shipping method');
        I.wait('3');
        I.selectOption('add_method_id','Vendor Shipping');
        I.click('#btn-ok');
        I.wait(4);
        I.click('Save changes');
        I.wait(4);
        I.amOnPage('/wp-admin/admin.php?page=dokan#/settings/');
        I.wait(5);
        // I.click(['link' => 'Selling Options']);
        I.click('Selling Options');
        I.selectOption('dokan_selling[shipping_fee_recipient]','Vendor');
        I.click('#dokan_selling #submit');
        I.waitForElement('#setting-message_updated', 5);
        I.see('Setting has been saved successfully.');

});