Feature('modules/Single Product MultipleVendor Functionality');

Scenario('Admin set SingleProductMultiplevendor', ({ I }) => {
    I.loginAsAdmin();
       I.click('Dokan');
       I.wait(3);
       I.click('Settings');
       I.wait(5);
       I.click('Single Product MultiVendor');
    //    I.scrollTo('#wpbody-content', 0,0);
       I.checkOption('#dokan_spmv[enable_pricing]');
    //    if (I.tryToSeeCheckboxIsChecked('#dokan_spmv[enable_pricing]'))
    //         {
    //             I.checkOption('#dokan_spmv[enable_pricing]');
    //         }
       I.fillfield('dokan_spmv[sell_item_btn]','sell this one');
       I.fillfield('dokan_spmv[available_vendor_list_title]','Available');
       I.selectOption('dokan_spmv[available_vendor_list_position]','Above Single Product Tabs');
        I.selectOption('dokan_spmv[show_order]','min_price');
        I.click({ css : '#dokan_spmv #submit'});
        I.waitForElementVisible('#setting-message_updated', 5);

});