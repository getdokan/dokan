var faker = require('faker');
const helpers = require('../../pages/helpers');

Feature('Environment Setup');

Scenario('@environmentSetup Dokan setting configuration', ({ I,loginAs}) => {
    loginAs('admin');
    //Setup Dokan settings
    I.amOnPage('/wp-admin/admin.php?page=dokan#/');
    I.amOnPage('/wp-admin/admin.php?page=dokan#/settings');
    I.click('//*[@id="vue-backend-app"]/div[1]/div[2]//div[1]/a[2]');
    I.fillField('.wc_input_decimal', 'Admin Commission');
    I.fillField('.wc_input_decimal', '10');
    I.checkOption('//*[@id="dokan_selling[new_seller_enable_selling]"]')
    I.checkOption('//*[@id="dokan_selling[order_status_change]"]');
    I.click('.button-primary');
    I.click('//*[@id="vue-backend-app"]//div[1]/a[3]')
    I.click('//*[@id="dokan_withdraw[withdraw_methods][bank]"]');
    I.fillField('Minimum Withdraw Limit' ,'20');
    I.click('.button-primary');
    // Adding product catagory
    helpers.addProductCatagory();
    // Adding product tag
    helpers.addProductTag();
    // Saving permalink
    helpers.savePermalink();
});
