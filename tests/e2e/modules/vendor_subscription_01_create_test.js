Feature('Vendor Subscription Functionality');
/* 
Scenario('Admin create Subscription Package', ({ I }) => {
    I.loginAsAdmin();
        I.click('Dokan');
        I.click('Settings');
        I.click('Product Subscription');
            I.checkOption('dokan_product_subscription[enable_pricing]');
            I.checkOption('dokan_product_subscription[enable_subscription_pack_in_reg]');
            I.checkOption('dokan_product_subscription[notify_by_email]');
            I.fillField('//*[@id="dokan_product_subscription[no_of_days_before_mail]"]','5');
            I.selectOption('dokan_product_subscription[product_status_after_end]','Pending Review');
            I.click({ css : '#dokan_product_subscription #submit'});
            I.waitForElement('#setting-message_updated', 5);
        I.amOnPage('/wp-admin/post-new.php?post_type=product');
            I.fillField('post_title','Bronze Subscription Pack');
            I.pressKey('Tab');
            I.type('This is special pack for all vendor');
            I.selectOption('product-type','Dokan Subscription');
            I.fillField('_regular_price','400');
            // I.wait(3);
            I.appendField('//input[@id="_no_of_product"]','500');
            // I.wait(3);
            I.fillField('_pack_validity','250');
            I.selectOption('_subscription_product_admin_commission_type', 'Flat');
            I.fillField('admin_commission', '15');
            I.scrollTo('#wpbody-content', 0, 0);
            I.click('publish');
            // I.selectOption('dokan_product_author_override', 'Admin');
            // I.wait(3);
            // 
        
});
*/