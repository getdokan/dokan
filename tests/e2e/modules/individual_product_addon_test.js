Feature('modules/individual_product_addon module');

Scenario('test something', ({ I,product})=> {
    I.loginAsVendor();
    product.CreateProduct('Burger','250','Uncategorized');
    I.wait(5);
    I.click('Add Field');
    I.wait(5);
    I.selectOption('//*[@id="wc-pao-addon-content-type-0"]','Checkboxes');
    I.fillField('#wc-pao-addon-content-name-0','SAusage');
    I.checkOption('#wc-pao-addon-content-title-format','Heading');
    I.checkOption('#wc-pao-addon-description-enable-0');
    I.fillField('#wc-pao-addon-description-0','SAusage');
    I.fillField('product_addon_option_label[0][]','SAusage');
    I.selectOption('.wc-pao-addon-option-price-type','quantity_based');
    I.fillField('product_addon_option_price[0][]','10');
    I.checkOption('_product_addons_exclude_global');
    I.click('Save Product');
});
