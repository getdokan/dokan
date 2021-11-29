const { default: pause } = require("webdriverio/build/commands/browser/pause");

Feature('Environment Setup');

Scenario('Run woocommerce setup wizard',async ({ I , loginAs}) => {
loginAs('admin');
    tryTo(() => {
        I.amOnPage('/wp-admin/admin.php?page=wc-admin');
        I.amOnPage('wp-admin/admin.php?page=wc-admin&path=%2Fsetup-wizard');
        I.fillField('//*[@id="inspector-text-control-0"]','Rink store');
        I.fillField('//*[@id="inspector-text-control-1"]','Dhaka');
        I.fillField('//*[@id="woocommerce-select-control-0__control-input"]','Bangladesh — Dhaka');
        I.click('//*[@id="woocommerce-select-control__option-0-BD:BD-13"]');
        I.fillField('//*[@id="inspector-text-control-2"]','Dhaka');
        I.fillField('//*[@id="inspector-text-control-3"]', '1216');
        // I.clearField('//*[@id="inspector-text-control-4"]'),
        // I.fillField('//*[@id="inspector-text-control-4"]', 'rinkychowdhury@wedevs.com');
        I.uncheckOption('//*[@id="inspector-checkbox-control-0"]');
        I.click('Continue');
        I.wait(3);
        I.amOnPage('/wp-admin/admin.php?page=wc-admin&path=%2Fsetup-wizard&step=industry')
        I.checkOption('//*[@id="inspector-checkbox-control-7"]');
        I.click('Continue');
        I.uncheckOption('//*[@id="woocommerce-product-types__pricing-toggle"]');
        I.click('Continue');
        I.click('//*[@id="tab-panel-0-current-tab-view"]/div[2]/div[1]/div[1]/div/div[1]');
        I.click('//*[@id="woocommerce-select-control__option-0-1-10"]');
        I.click('//*[@id="tab-panel-0-current-tab-view"]/div[2]/div[1]/div[2]/div/div[1]');
        I.click('//*[@id="woocommerce-select-control__option-1-no"]');
        I.click('Continue');
        I.uncheckOption('//*[@id="inspector-checkbox-control-16"]');
        I.click('Continue');
        I.click('//*[@id="tab-panel-1-all-view"]/div/div[2]/div[3]/button');
        I.amOnPage('/wp-admin/admin.php?page=wc-admin');
        I.wait(3);
    });
});
