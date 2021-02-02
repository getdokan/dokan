Feature('');

Scenario('test something', ({ I }) => {
    I.loginAsAdmin();
    I.click('Dokan');
    I.wait(3);
    I.click('Settings');
    I.wait(5);
    I.click('Wholesale');
    I.scrollTo('.dokan-settings', 0,0);
    I.checkOption({CSS:'input.radio[name="wholesale_customer"]'});
    //I.checkOption({CSS:'input[name=dokan_wholesale[display_price_in_shop_archieve]'});
    I.click('Save Changes');
    I.waitForElement('#setting-message_updated', 5);
});
