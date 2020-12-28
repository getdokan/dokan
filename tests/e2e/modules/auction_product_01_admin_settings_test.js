Feature('modules/auction_product_01_admin_settings');

Scenario('admin settings for auction', ({ I }) => {
    I.loginAsAdmin();
    I.click('Dokan');
    I.wait(3);
    I.click('Settings');
    I.wait(4);
    I.click('Selling Options');
    I.wait(4);
    I.checkOption('//div[@id="dokan_selling"]/form/table/tbody/tr[20]/td/fieldset/label/input');
    I.wait(2);
    I.click('#dokan_selling #submit');
    I.amOnPage('/wp-admin/admin.php?page=wc-settings');
    I.wait(3);
    I.click('Auctions');

    I.checkOption('#simple_auctions_dont_mix_shop');
    
     I.click('Save changes');
     I.wait(3);
     I.see('Your settings have been saved.');
 
});
